import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri } = await req.json();
    if (!code || !redirect_uri) throw new Error('Missing required parameters');

    // Supabase client (service role for insert/update)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Exchange code for LinkedIn token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
        client_id: Deno.env.get('LINKEDIN_CLIENT_ID')!,
        client_secret: Deno.env.get('LINKEDIN_CLIENT_SECRET')!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${await tokenResponse.text()}`);
    }

    const tokenData: LinkedInTokenResponse = await tokenResponse.json();

    // Fetch profile using LinkedIn v2 API
    const profileRes = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
    });
    if (!profileRes.ok) throw new Error(`Profile fetch failed: ${await profileRes.text()}`);
    const profile = await profileRes.json();

    // Fetch email separately
    const emailRes = await fetch('https://api.linkedin.com/v2/people/~/emailAddress', {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
    });
    
    let email = '';
    if (emailRes.ok) {
      const emailData = await emailRes.json();
      email = emailData.emailAddress || '';
    }

    // Upsert into Supabase users table
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          email,
          linkedin_id: profile.id,
          linkedin_access_token: tokenData.access_token,
          linkedin_refresh_token: tokenData.refresh_token || null,
          profile_data: profile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' } // prevents duplicates
      )
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_in: tokenData.expires_in,
        user_data: {
          id: profile.id,
          firstName: profile.localizedFirstName || '',
          lastName: profile.localizedLastName || '',
          email,
        },
        supabase_user: data[0],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('LinkedIn auth error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
