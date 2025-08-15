const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('LinkedIn auth function called');
    
    const { code, redirect_uri } = await req.json();
    console.log('Received parameters:', { code: !!code, redirect_uri });
    
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

    // Fetch basic profile using the correct LinkedIn API
    const profileRes = await fetch(
      'https://api.linkedin.com/v2/me',
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

    // Fetch email using the correct LinkedIn API
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
      // Use LinkedIn ID as fallback email
      email = `${profile.id}@linkedin.temp`;
    }

    // Initialize Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Store or update in Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          email: email,
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
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (err) {
    console.error('LinkedIn auth error:', err);
    return new Response(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : 'Unknown error',
        details: err instanceof Error ? err.stack : undefined
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});