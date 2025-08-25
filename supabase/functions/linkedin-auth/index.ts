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
    console.log('=== LinkedIn Auth Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    const requestBody = await req.json();
    console.log('Request body received:', { 
      hasCode: !!requestBody.code, 
      hasRedirectUri: !!requestBody.redirect_uri,
      redirectUri: requestBody.redirect_uri 
    });
    
    const { code, redirect_uri } = requestBody;
    
    if (!code || !redirect_uri) {
      console.error('Missing required parameters:', { code: !!code, redirect_uri: !!redirect_uri });
      throw new Error('Missing required parameters: code or redirect_uri');
    }

    // Get environment variables
    const linkedinClientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const linkedinClientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment variables check:', {
      hasClientId: !!linkedinClientId,
      hasClientSecret: !!linkedinClientSecret,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      clientIdValue: linkedinClientId || 'undefined',
      clientSecretValue: linkedinClientSecret ? `${linkedinClientSecret.substring(0, 6)}...` : 'undefined',
      supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined'
    });

    // Check for missing, empty, or "false" string values
    const isValidClientId = linkedinClientId && linkedinClientId !== '' && linkedinClientId !== 'false' && linkedinClientId !== 'undefined';
    const isValidClientSecret = linkedinClientSecret && linkedinClientSecret !== '' && linkedinClientSecret !== 'false' && linkedinClientSecret !== 'undefined';
    
    if (!isValidClientId || !isValidClientSecret) {
      console.error('LinkedIn credentials not configured in edge function environment');
      console.error('Client ID value:', linkedinClientId);
      console.error('Client Secret value:', linkedinClientSecret ? `${linkedinClientSecret.substring(0, 10)}...` : 'undefined');
      return new Response(
        JSON.stringify({ 
          error: 'LinkedIn credentials are missing or invalid', 
          message: `Environment variables status: LINKEDIN_CLIENT_ID=${!!isValidClientId}, LINKEDIN_CLIENT_SECRET=${!!isValidClientSecret}`,
          setup_instructions: 'Go to Supabase Dashboard → Edge Functions → Settings → Environment Variables and ensure both LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET are set with valid values (not empty or "false")',
          debug_info: {
            clientId: linkedinClientId || 'not_set',
            clientIdValid: isValidClientId,
            clientSecretSet: !!linkedinClientSecret,
            clientSecretValid: isValidClientSecret
          }
        }),
        { 
          status: 501, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('=== Starting LinkedIn Token Exchange ===');
    
    // Prepare token exchange request
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id: linkedinClientId,
      client_secret: linkedinClientSecret,
    });

    console.log('Token exchange parameters:', {
      grant_type: 'authorization_code',
      code: `${code.substring(0, 10)}...`,
      redirect_uri,
      client_id: linkedinClientId,
      client_secret: `${linkedinClientSecret.substring(0, 10)}...`
    });

    // Exchange authorization code for token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenParams.toString(),
    });

    console.log('LinkedIn token response status:', tokenResponse.status);
    console.log('LinkedIn token response headers:', Object.fromEntries(tokenResponse.headers.entries()));

    const tokenResponseText = await tokenResponse.text();
    console.log('LinkedIn token response body:', tokenResponseText);

    if (!tokenResponse.ok) {
      console.error('LinkedIn token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: tokenResponseText
      });
      throw new Error(`LinkedIn token exchange failed (${tokenResponse.status}): ${tokenResponseText}`);
    }
    
    let tokenData;
    try {
      tokenData = JSON.parse(tokenResponseText);
    } catch (parseError) {
      console.error('Failed to parse token response:', parseError);
      throw new Error(`Invalid JSON response from LinkedIn: ${tokenResponseText}`);
    }

    console.log('Token data received:', {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type
    });

    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData);
      throw new Error('No access token received from LinkedIn');
    }

    console.log('=== Fetching LinkedIn Profile using OpenID Connect ===');
    
    // Use OpenID Connect userinfo endpoint instead of deprecated v2 API
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      },
    });
    
    console.log('Profile response status:', profileResponse.status);
    
    const profileResponseText = await profileResponse.text();
    console.log('Profile response body:', profileResponseText);
    
    if (!profileResponse.ok) {
      console.error('Profile fetch failed:', {
        status: profileResponse.status,
        body: profileResponseText
      });
      throw new Error(`Profile fetch failed (${profileResponse.status}): ${profileResponseText}`);
    }
    
    let profileData;
    try {
      profileData = JSON.parse(profileResponseText);
    } catch (parseError) {
      console.error('Failed to parse profile response:', parseError);
      throw new Error(`Invalid JSON response from LinkedIn profile API: ${profileResponseText}`);
    }

    console.log('Profile data received:', {
      sub: profileData.sub,
      name: profileData.name,
      given_name: profileData.given_name,
      family_name: profileData.family_name,
      email: profileData.email,
      email_verified: profileData.email_verified
    });

    // Extract user information from OpenID Connect response
    const email = profileData.email || `${profileData.sub}@linkedin.temp`;
    const firstName = profileData.given_name || '';
    const lastName = profileData.family_name || '';
    const linkedinId = profileData.sub; // This is the LinkedIn user ID

    console.log('=== Storing User Data in Supabase ===');

    // Initialize Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Store or update in Supabase
    const userData = {
      email: email,
      linkedin_id: linkedinId,
      linkedin_access_token: tokenData.access_token,
      linkedin_refresh_token: tokenData.refresh_token || null,
      profile_data: profileData,
      updated_at: new Date().toISOString(),
    };

    console.log('Upserting user data:', {
      email: userData.email,
      linkedin_id: userData.linkedin_id,
      hasAccessToken: !!userData.linkedin_access_token,
      hasRefreshToken: !!userData.linkedin_refresh_token
    });

    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'linkedin_id' })
      .select();

    if (error) {
      console.error('Supabase upsert error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('User data stored successfully:', { userId: data?.[0]?.id });

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

    console.log('=== Success! Returning response ===');

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (err) {
    console.error('=== LinkedIn Auth Error ===');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    const errorResponse = { 
      error: err instanceof Error ? err.message : 'Unknown error',
      details: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString()
    };
    
    console.error('Returning error response:', errorResponse);
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});