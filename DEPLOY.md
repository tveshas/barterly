# Deploying Barterly (easy mode)

> **All-on-Vercel option** (two Vercel projects + Atlas): see the last section. Chat then updates by polling every few seconds instead of live WebSockets.

Three free services, about 15 minutes. The backend no longer needs Redis, RabbitMQ or an email provider.

| Part | Where | Why |
| --- | --- | --- |
| Database | MongoDB Atlas (free M0) | managed MongoDB |
| Backend API + chat sockets | Render (free web service) | supports WebSockets |
| Frontend | Vercel (free) | static React/Vite build |

## 1. Accounts / keys you need first

1. **MongoDB Atlas**: create a free cluster, a database user, and allow access from anywhere (`0.0.0.0/0`). Copy the connection string and add `/barterly` as the database name.
2. **Google sign-in**: https://console.cloud.google.com/apis/credentials
   - Create credentials, then **OAuth client ID**, type **Web application**.
   - *Authorized JavaScript origins*: `http://localhost:5173` and (after step 3) your Vercel URL, e.g. `https://barterly.vercel.app`.
   - No redirect URI is needed. Copy the **Client ID**.
   - (First time only: configure the OAuth consent screen as External and add yourself as a test user.)
3. **Groq** (AI fair-trade moderator): create a key at https://console.groq.com/keys. Optional. Without it the calculator uses level-based estimates.
4. **Cloudinary** (profile photos): free account; copy cloud name, API key and secret.

## 2. Backend on Render

1. Push this repo to GitHub.
2. Render dashboard, **New**, **Blueprint**, pick the repo. It reads `render.yaml`.
3. Fill in the prompted env vars:
   - `MONGODB_URI`: from Atlas
   - `GOOGLE_CLIENT_ID`: from Google
   - `ADMIN_EMAILS`: your Google email (comma-separate more). You become admin on first sign-in.
   - `GROQ_API_KEY`, `CLOUDINARY_*`
   - `FRONTEND_URL`: leave a placeholder for now, set it in step 4. No trailing slash.
   (`JWT_*` secrets are generated for you.)
4. Deploy. Check `https://<your-service>.onrender.com/health`.

## 3. Frontend on Vercel

1. **Add New Project**, import the repo, set **Root Directory** to `barterly-frontend`.
2. Environment variables:
   - `VITE_API_URL` = `https://<your-service>.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID` = the same Client ID
   - `VITE_DEV_LOGIN` = `true` only if you want the test-user login box on the deployed site (see "Testing with seeded users" below). Leave it out for a public launch.
3. Deploy. `vercel.json` already handles SPA routing.

## 4. Connect them

- Render: set `FRONTEND_URL` to your Vercel URL (e.g. `https://barterly.vercel.app`) and redeploy.
- Google Cloud: add the Vercel URL to **Authorized JavaScript origins**.
- Seed the data once, from `barterly-backend`, with the production `MONGODB_URI` in your shell:

  ```bash
  MONGODB_URI="mongodb+srv://..." npm run seed:categories
  MONGODB_URI="mongodb+srv://..." npm run seed:demo      # optional: test users, skills, requests, ratings
  MONGODB_URI="mongodb+srv://..." npm run migrate:wallet-inr   # gives every user a fake-money wallet (INR); safe to re-run
  ```

## Testing with seeded users on the deployed site

1. On Render set `DEV_LOGIN=true` and `DEV_LOGIN_KEY=<a secret of 8+ characters>`. On Vercel set `VITE_DEV_LOGIN=true`.
2. Run `npm run seed:demo` against the production database (above).
3. On `/login`, pick a test user, type your test key and click "Dev sign in".

The test login only works for the seeded test accounts (never real users or admins) and always needs the key. To switch it off, delete `DEV_LOGIN` and `DEV_LOGIN_KEY` on Render. Test users (all rated 4.0 to 4.8, with skills, completed swaps and reviews):

| Email | Who |
| --- | --- |
| `alice@test.com`, `bob@test.com` | main test users (Alice has incoming requests) |
| `priya@demo.com` | React mentor |
| `marco@demo.com` | Italian cooking and language |
| `aisha@demo.com` | design and illustration |
| `liam@demo.com` | guitar and music production |
| `sofia@demo.com` | Spanish and marketing |
| `daniel@demo.com` | Python and photography |
| `emma@demo.com` | fitness and yoga |
| `rahul@demo.com` | video editing |

There are no passwords: these accounts are reachable only through the test login above.

## Notes

- **Free Render sleeps** after ~15 min idle; the first request takes ~30s to wake.
- **Sessions**: the refresh cookie is cross-site (`vercel.app` to `onrender.com`). Some browsers block third-party cookies, in which case users just sign in with Google again when the 15-minute access token expires. A custom domain for both (`app.you.com` / `api.you.com`) fixes this.
- **Test login**: opt-in only (see above). Real users and admins can never be signed into this way.
- **Single instance**: rate limits and the logout blacklist are in memory, which is fine for one server instance.
- **Payments**: the equalizer only *proposes* a cash top-up, and Barterly doesn't move money.

## All on Vercel (backend and frontend)

Vercel runs the API as serverless functions (`barterly-backend/api/index.js`), so there is no always-on server.

**What changes vs Render**
- Live WebSocket chat can't run on serverless, so the chat page polls (about every 4s for the open chat). Everything else is unchanged.
- In-memory rate limits and the logout blacklist are per serverless instance, so they are best-effort only.
- Avatar uploads are limited to about 4.5 MB by Vercel (the app already caps them at 2 MB).

**Backend project** (Root Directory `barterly-backend`), env vars:
`NODE_ENV=production`, `TRUST_PROXY=1`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, `ADMIN_EMAILS`, `GROQ_API_KEY`, `GROQ_MODEL`, `CLOUDINARY_*`, `FRONTEND_URL` (the frontend's URL), and optionally `DEV_LOGIN=true` + `DEV_LOGIN_KEY`.

**Frontend project** (Root Directory `barterly-frontend`):
- Env: `VITE_API_URL=/api`, `VITE_GOOGLE_CLIENT_ID`, `VITE_DISABLE_SOCKETS=true`, and optionally `VITE_DEV_LOGIN=true`.
- In `barterly-frontend/vercel.json`, add a rewrite so `/api/*` is proxied to the backend project. This keeps cookies first-party and avoids CORS:
  `{ "source": "/api/:path*", "destination": "https://<backend-project>.vercel.app/api/:path*" }` (placed before the SPA catch-all rewrite).
- Add the frontend URL to Google "Authorized JavaScript origins".
