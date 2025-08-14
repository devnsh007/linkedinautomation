// index.ts — LinkedIn → Supabase OAuth Worker

export interface Env {
  LINKEDIN_CLIENT_ID: string;
  LINKEDIN_CLIENT_SECRET: string;
  LINKEDIN_REDIRECT_URI: string; // e.g. "https://linkedin-oauth-worker.yourdomain.workers.dev/callback"
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string; // Service Role Key for admin actions
  FRONTEND_REDIRECT_URL: string; // Where to send the user after login, e.g. "https://yourapp.com"
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Step 1 — Start LinkedIn login
    if (url.pathname === "/login") {
      const state = crypto.randomUUID();
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        env.LINKEDIN_REDIRECT_URI
      )}&scope=openid%20profile%20email&state=${state}`;

      return Response.redirect(authUrl, 302);
    }

    // Step 2 — Handle LinkedIn callback
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        return new Response(`LinkedIn OAuth error: ${error}`, { status: 400 });
      }
      if (!code) {
        return new Response("Missing code", { status: 400 });
      }

      // Step 3 — Exchange code for access token
      const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: env.LINKEDIN_REDIRECT_URI,
          client_id: env.LINKEDIN_CLIENT_ID,
          client_secret: env.LINKEDIN_CLIENT_SECRET,
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        return new Response(`Error getting token: ${errText}`, { status: 500 });
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // Step 4 — Get LinkedIn profile
      const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!profileRes.ok) {
        return new Response("Failed to fetch LinkedIn profile", { status: 500 });
      }

      const profile = await profileRes.json();

      // Step 5 — Create user in Supabase
      const supabaseRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apiKey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          email: profile.email,
          user_metadata: {
            name: profile.name,
            picture: profile.picture,
            linkedin_id: profile.sub,
          },
        }),
      });

      if (!supabaseRes.ok) {
        const errText = await supabaseRes.text();
        return new Response(`Supabase error: ${errText}`, { status: 500 });
      }

      // Step 6 — Redirect to frontend
      return Response.redirect(env.FRONTEND_REDIRECT_URL, 302);
    }

    // Default route
    return new Response("LinkedIn OAuth Worker running", { status: 200 });
  },
};
