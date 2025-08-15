const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri } = await req.json();
    if (!code || !redirect_uri) {
      throw new Error('Missing required parameters: code or redirect_uri');
    }

    // Get environment variables
    const linkedinClientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const linkedinClientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment check:', {
      hasClientId: !!linkedinClientId,
      hasClientSecret: !!linkedinClientSecret,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      clientIdValue: linkedinClientId ? `${linkedinClientId.substring(0, 4)}...` : 'undefined'
    });

    if (!linkedinClientId || !linkedinClientSecret) {
      throw new Error(`Missing LinkedIn credentials: clientId=${!!linkedinClientId}, clientSecret=${!!linkedinClientSecret}`);
    }

    // Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Exchanging code for token with LinkedIn...');
    
    // Exchange authorization code for token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id: linkedinClientId,
        client_secret: linkedinClientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('LinkedIn token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');

    // Fetch basic profile
    const profileRes = await fetch(
      'https://api.linkedin.com/v2/people/~:(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
      {
        headers: { 
          'Authorization': `Bearer ${tokenData.access_token}`,
          'X-Restli-Protocol-Version': '2.0.0'
        },
      }
    );
    
    if (!profileRes.ok) {
      const errorText = await profileRes.text();
      console.error('Profile fetch failed:', errorText);
      throw new Error(`Profile fetch failed: ${errorText}`);
    }
    const profile = await profileRes.json();
    console.log('Profile fetch successful');

    // Fetch email
    const emailRes = await fetch(
      'https://api.linkedin.com/v2/people/~/emailAddress?q=members&projection=(elements*(handle~))',
      {
        headers: { 
          'Authorization': `Bearer ${tokenData.access_token}`,
          'X-Restli-Protocol-Version': '2.0.0'
        },
      }
    );
    
    let email = '';
    if (emailRes.ok) {
      const emailData = await emailRes.json();
      email = emailData.elements?.[0]?.['handle~']?.emailAddress || '';
      console.log('Email fetch successful');
    } else {
      console.warn('Email fetch failed, continuing without email');
    }

    // Store or update in Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          email: email || `${profile.id}@linkedin.temp`,
          linkedin_id: profile.id,
          linkedin_access_token: tokenData.access_token,
          linkedin_refresh_token: tokenData.refresh_token || null,
          profile_data: profile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'linkedin_id' }
      )
      .select();

    if (error) {
      console.error('Supabase upsert error:', error);
      throw error;
    }

    console.log('User data stored successfully');

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
      JSON.stringify({ 
        error: err instanceof Error ? err.message : 'Unknown error',
        details: err instanceof Error ? err.stack : undefined
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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
    if (!code || !redirect_uri) {
      throw new Error('Missing required parameters: code or redirect_uri');
    }

    // Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Exchange authorization code for token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id: Deno.env.get('LINKEDIN_CLIENT_ID')!,
        client_secret: Deno.env.get('LINKEDIN_CLIENT_SECRET')!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${await tokenResponse.text()}`);
    }
    const tokenData: LinkedInTokenResponse = await tokenResponse.json();

    // Fetch basic profile (new API)
    const profileRes = await fetch(
      'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    if (!profileRes.ok) {
      throw new Error(`Profile fetch failed: ${await profileRes.text()}`);
    }
    const profile = await profileRes.json();

    // Fetch email (new API)
    const emailRes = await fetch(
      'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    let email = '';
    if (emailRes.ok) {
      const emailData = await emailRes.json();
      email = emailData.elements?.[0]?.['handle~']?.emailAddress || '';
    }

    // Store or update in Supabase
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
        { onConflict: 'email' }
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
