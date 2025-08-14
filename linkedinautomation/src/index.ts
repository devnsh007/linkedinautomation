export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  LINKEDIN_CLIENT_ID: string;
  LINKEDIN_CLIENT_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth/linkedin") {
      // Step 1: Redirect to LinkedIn's OAuth
      const state = crypto.randomUUID();
      const redirectUri = `https://linkedinautomation.pages.dev/auth/linkedin/callback`;
      const linkedInAuthUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
      linkedInAuthUrl.searchParams.set("response_type", "code");
      linkedInAuthUrl.searchParams.set("client_id", env.LINKEDIN_CLIENT_ID);
      linkedInAuthUrl.searchParams.set("redirect_uri", redirectUri);
      linkedInAuthUrl.searchParams.set("scope", "openid profile email w_member_social");
      linkedInAuthUrl.searchParams.set("state", state);

      return Response.redirect(linkedInAuthUrl.toString(), 302);
    }

    if (url.pathname === "/auth/linkedin/callback") {
      // Step 2: Handle LinkedIn redirect
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        return new Response(`LinkedIn Error: ${error}`, { status: 400 });
      }

      if (!code) {
        return new Response("Missing code parameter", { status: 400 });
      }

      const redirectUri = `https://linkedinautomation.pages.dev/auth/linkedin/callback`;

      // Step 3: Exchange code for access token
      const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: Deno.env.get('LINKEDIN_CLIENT_ID'),
          client_secret: Deno.env.get('LINKEDIN_CLIENT_SECRET'),
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        return new Response(JSON.stringify(tokenData), { status: 400 });
      }

      // Step 4: Store token in Supabase
      await fetch(`${env.SUPABASE_URL}/rest/v1/linkedin_tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": env.SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          access_token: tokenData.access_token,
          expires_in: tokenData.expires_in,
          created_at: new Date().toISOString(),
        }),
      });

      return new Response("LinkedIn connected successfully! You can close this window.", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  }
};
