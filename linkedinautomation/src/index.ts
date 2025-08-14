export interface Env {
	LINKEDIN_CLIENT_ID: string;
	LINKEDIN_CLIENT_SECRET: string;
	REDIRECT_URI: string; // e.g. https://your-worker.yourdomain.workers.dev/callback
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Step 1: Redirect user to LinkedIn Auth Page
		if (url.pathname === "/login") {
			const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.REDIRECT_URI)}&state=123456&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
			return Response.redirect(linkedinAuthUrl, 302);
		}

		// Step 2: Handle LinkedIn Callback
		if (url.pathname === "/callback") {
			const code = url.searchParams.get("code");
			const state = url.searchParams.get("state");

			if (!code) {
				return new Response("Missing code parameter", { status: 400 });
			}

			// Step 3: Exchange code for access token
			const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					grant_type: "authorization_code",
					code: code,
					redirect_uri: env.REDIRECT_URI,
					client_id: env.LINKEDIN_CLIENT_ID,
					client_secret: env.LINKEDIN_CLIENT_SECRET,
				}),
			});

			const tokenData = await tokenResponse.json();

			return new Response(JSON.stringify(tokenData, null, 2), {
				headers: { "Content-Type": "application/json" },
			});
		}

		// Default route
		return new Response(
			`<h1>LinkedIn OAuth Worker</h1>
			<p>Go to <a href="/login">/login</a> to start OAuth flow</p>`,
			{ headers: { "Content-Type": "text/html" } }
		);
	},
};
