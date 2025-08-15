// linkedin-auth.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for API calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const clientId = Deno.env.get("LINKEDIN_CLIENT_ID");
const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET");
const redirectUri = "https://yourdomain.com/auth/linkedin/callback";

// Helper to handle CORS preflight
function handleOptions(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const url = new URL(req.url);

  if (url.pathname === "/auth/linkedin/login") {
    // Step 1: Redirect to LinkedIn Auth Page
    const scope = encodeURIComponent("openid profile email w_member_social");
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}`;

    return new Response(JSON.stringify({ authUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/auth/linkedin/callback") {
    // Step 2: Exchange authorization code for access token
    const code = url.searchParams.get("code");
    if (!code) {
      return new Response(JSON.stringify({ error: "Missing code" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId || "",
        client_secret: clientSecret || "",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return new Response(JSON.stringify({ error: tokenData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: tokenRes.status,
      });
    }

    const accessToken = tokenData.access_token;

    // Step 3: Fetch OpenID Profile
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();

    // Step 4: Return access token + profile
    return new Response(
      JSON.stringify({ accessToken, profile }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 404,
  });
});
