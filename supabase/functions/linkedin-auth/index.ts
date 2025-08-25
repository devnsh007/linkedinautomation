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
    const { code, redirect_uri } = await req.json();
    
    if (!code || !redirect_uri) {
      throw new Error('Missing required parameters: code or redirect_uri');
    }

    // Get environment variables - these should match your Supabase secret names exactly
    const linkedinClientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const linkedinClientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
    
    // These are the standard Supabase environment variables available in edge functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseServiceKey: !!supabaseServiceKey,
      hasLinkedInClientId: !!linkedinClientId,
      hasLinkedInClientSecret: !!linkedinClientSecret,
      envKeys: Object.keys(Deno.env.toObject()).filter(key => key.includes('LINKEDIN'))
    });

    if (!linkedinClientId || !linkedinClientSecret) {
      const availableEnvVars = Object.keys(Deno.env.toObject()).filter(key => 
        key.includes('LINKEDIN') || key.includes('CLIENT')
      );
      throw new Error(`Missing LinkedIn credentials. Available env vars: ${availableEnvVars.join(', ')}. Expected: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET`);
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(`Missing Supabase credentials: url=${!!supabaseUrl}, serviceKey=${!!supabaseServiceKey}`);
    }

    // Exchange authorization code for token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id: linkedinClientId,
      client_secret: linkedinClientSecret,
    });

    console.log('Token exchange request to LinkedIn...');

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('LinkedIn token response error:', errorText);
      throw new Error(`LinkedIn token exchange failed: ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData);
      throw new Error('No access token received from LinkedIn');
    }

    console.log('Token received, fetching profile...');

    // Fetch LinkedIn profile using OpenID Connect
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      },
    });
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Profile fetch error:', errorText);
      throw new Error(`Profile fetch failed: ${errorText}`);
    }
    
    const profileData = await profileResponse.json();
    console.log('Profile data received:', Object.keys(profileData));

    // Extract user information
    const email = profileData.email || `${profileData.sub}@linkedin.temp`;
    const firstName = profileData.given_name || '';
    const lastName = profileData.family_name || '';
    const linkedinId = profileData.sub;

    // Initialize Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Storing user data in Supabase...');

    // Store or update in Supabase
    const userData = {
      email: email,
      linkedin_id: linkedinId,
      linkedin_access_token: tokenData.access_token,
      linkedin_refresh_token: tokenData.refresh_token || null,
      profile_data: profileData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'linkedin_id' })
      .select();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Authentication successful');

    const responseData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_in: tokenData.expires_in,
      user_data: {
        id: linkedinId,
        firstName: firstName,
        lastName: lastName,
        email: email,
      },
      supabase_user: data?.[0],
    };

    return new Response(
      JSON.stringify(responseData),
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
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});