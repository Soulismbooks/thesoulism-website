/*
  SOULISM ADMIN — GITHUB OAUTH WORKER
  ------------------------------------------------------------
  What this file does:
  Decap CMS needs a small "middleman" to safely log you into GitHub
  (a plain website can't do this alone — it needs a secret key that
  must never be visible in the browser). This file IS that middleman,
  and it runs for free on Cloudflare Workers.

  SETUP STEPS (one-time, ~10 minutes):

  1. Create a GitHub OAuth App:
     - Go to https://github.com/settings/developers
     - Click "New OAuth App"
     - Application name: Soulism Admin
     - Homepage URL: https://YOUR-SITE.pages.dev  (your Cloudflare Pages URL)
     - Authorization callback URL: https://YOUR-WORKER-SUBDOMAIN.workers.dev/callback
       (you'll get the exact workers.dev URL in step 3 below — come back and
       fill this in after)
     - Click "Register application"
     - Copy the "Client ID" shown, and click "Generate a new client secret" and copy that too

  2. Come back to this file and paste your Client ID into CLIENT_ID below.
     Do NOT paste your Client Secret directly into this file.

  3. Deploy this Worker on Cloudflare:
     - Go to the Cloudflare dashboard -> Workers & Pages -> Create -> Create Worker
     - Give it a name, e.g. "soulism-oauth"
     - Paste this entire file's code into the Worker editor, replacing the sample code
     - Click "Deploy" — you'll get a URL like https://soulism-oauth.YOURNAME.workers.dev
     - Go to Worker Settings -> Variables -> add an ENVIRONMENT VARIABLE:
         name: GITHUB_CLIENT_SECRET   value: (paste your client secret here)   -> click "Encrypt"
     - Go back to your GitHub OAuth App (step 1) and paste this Worker's real
       URL + "/callback" into the "Authorization callback URL" field, then Save

  4. Update admin/config.yml:
     - base_url: https://soulism-oauth.YOURNAME.workers.dev   (this Worker's URL, no /callback)

  That's it — after this, visiting yoursite.com/admin will show a real
  "Login with GitHub" button.
  ------------------------------------------------------------
*/

const CLIENT_ID = "YOUR_GITHUB_OAUTH_CLIENT_ID"; // <-- paste your GitHub OAuth Client ID here

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const authUrl = new URL("https://github.com/login/oauth/authorize");
      authUrl.searchParams.set("client_id", CLIENT_ID);
      authUrl.searchParams.set("scope", "repo,user");
      authUrl.searchParams.set("redirect_uri", url.origin + "/callback");
      return Response.redirect(authUrl.toString(), 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Missing code", { status: 400 });
      }

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET, // set as an encrypted Worker variable, see step 3
          code
        })
      });
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        return new Response("OAuth error: " + tokenData.error_description, { status: 400 });
      }

      const token = tokenData.access_token;
      const payload = JSON.stringify({ token, provider: "github" });

      const html = `<!DOCTYPE html><html><body>
<script>
  (function() {
    function receiveMessage() {
      window.opener.postMessage(
        'authorization:github:success:${payload}',
        "*"
      );
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  })();
</script>
</body></html>`;

      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("Soulism OAuth Worker is running. Visit /auth to begin login.", { status: 200 });
  }
};
