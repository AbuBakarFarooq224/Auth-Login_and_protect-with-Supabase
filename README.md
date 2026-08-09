# Login & Protect — Auth API

A secure authentication API built with **Next.js (App Router)** and **Supabase Auth**. It handles user **sign up**, **log in**, and **log out**, issues JWTs, and verifies those tokens to protect private endpoints. The API is documented and testable in **Swagger UI**.

---

## Features

- 🔐 **Sign up** — create a new user account (email + password)
- 🔑 **Log in** — returns a JWT `access_token` (and a `refresh_token`)
- 🚪 **Log out** — ends the session
- 🛡️ **Protected routes** — `/protected/*` and `/auth/logout` require a valid Bearer JWT
- 🌍 **Public route** — anyone can access `/public/info`
- 📖 **Swagger UI** — interactive API docs at [`http://localhost:3000/docs`](http://localhost:3000/docs)

## Tech stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Framework  | Next.js 16 (App Router, API route handlers) |
| UI library | React 19                                    |
| Auth       | Supabase Auth (`@supabase/supabase-js`)     |
| Tokens     | JWT (issued & verified by Supabase)         |
| Docs       | Swagger UI (`swagger-ui-react`)             |

## Project structure

```text
login_auth/
├── src/
│   ├── api/
│   │   └── client.js              # Supabase client (reads env vars)
│   └── app/
│       ├── auth/
│       │   ├── signup/route.js    # POST /auth/signup
│       │   ├── login/route.js     # POST /auth/login
│       │   └── logout/route.js    # POST /auth/logout
│       ├── protected/
│       │   └── profile/route.js   # GET /protected/profile (protected)
│       ├── public/
│       │   └── info/route.js      # GET /public/info (public)
│       └── docs/page.js           # Swagger UI page
├── middleware.js                  # Verifies the JWT on protected routes
├── public/
│   └── openapi.json               # OpenAPI spec used by Swagger UI
└── package.json
```

## Prerequisites

- **Node.js 20.9 or newer** — [nodejs.org](https://nodejs.org)
- A **free Supabase account** — [supabase.com](https://supabase.com)
- npm (comes with Node.js)

---

## Getting started (step by step)

### 1. Install dependencies

```bash
cd login_auth
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**, pick a name and password, and wait for it to finish provisioning.
3. In your project dashboard, open **Project Settings → API**.
4. Copy two values:
   - **Project URL** (e.g. `https://abcxyz.supabase.co`)
   - **Project API keys → `anon`** (the public key, NOT `service_role`)

### 3. Create your environment file

Next.js reads secrets from a file named `.env.local` in the project root:

```dotenv
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key-here
```

Create the file, paste those two lines, and replace the placeholders with your Supabase values.

> ⚠️ **Never commit `.env.local`** — it's already ignored by `.gitignore`. The app refuses to start without these two variables.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000/docs](http://localhost:3000/docs) for the Swagger UI.

> ℹ️ There is no homepage — visiting `http://localhost:3000/` returns **404** by design. This is an API-only app.

---

## API endpoints

| Method | Endpoint             | Auth required | Description                |
| ------ | -------------------- | ------------- | -------------------------- |
| POST   | `/auth/signup`       | ❌            | Create a user account      |
| POST   | `/auth/login`        | ❌            | Log in, returns JWT tokens |
| POST   | `/auth/logout`       | ✅ Bearer     | Log out                    |
| GET    | `/protected/profile` | ✅ Bearer     | Protected profile          |
| GET    | `/public/info`       | ❌            | Public info                |

### `POST /auth/signup`

Request body:

```json
{ "email": "user@example.com", "password": "password123" }
```

| Status | Meaning                       |
| ------ | ----------------------------- |
| `201`  | User created successfully     |
| `400`  | Missing fields or signup error |

### `POST /auth/login`

Request body:

```json
{ "email": "user@example.com", "password": "password123" }
```

| Status | Meaning           | Response body                 |
| ------ | ----------------- | ----------------------------- |
| `200`  | Login successful  | `access_token`, `refresh_token` |
| `401`  | Invalid credentials | `error` message             |

**Save the `access_token`** — you send it on every protected request as a `Bearer` token.

### `GET /public/info` (no auth)

| Status | Meaning       |
| ------ | ------------- |
| `200`  | Public message |

### `GET /protected/profile` (auth required)

Send the token from login in the `Authorization` header:

```text
Authorization: Bearer <access_token>
```

| Status | Meaning                 |
| ------ | ----------------------- |
| `200`  | Protected profile data  |
| `401`  | Missing or invalid token |

### `POST /auth/logout` (auth required)

Same `Bearer` token required. Returns `204 No Content` on success.

---

## Trying it out with curl

### Sign up

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Log in (save the token)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Copy the `access_token` from the response.

### Access the protected profile

```bash
curl -X GET http://localhost:3000/protected/profile \
  -H "Authorization: Bearer <access_token>"
```

### Public route

```bash
curl -X GET http://localhost:3000/public/info
```

### Log out

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

> **Windows PowerShell users:** `curl` aliases to `Invoke-WebRequest`, and inline JSON quotes get stripped. Use `curl.exe` with a JSON body file instead:
>
> ```powershell
> '{"email":"user@example.com","password":"password123"}' | Out-File -Encoding ascii body.json
> curl.exe -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "@body.json"
> ```

---

## Swagger UI

The interactive API documentation lives at **`http://localhost:3000/docs`**. It loads the OpenAPI spec from `public/openapi.json`, so you can:

- See every endpoint, its request/response schemas, and status codes
- Authorize with the token: click the green **Authorize** button and paste your `access_token` from login
- Try each request directly in the browser (sign up → log in → authorize → hit the protected route)

---

## How the auth flow works

1. **Sign up** → `POST /auth/signup` calls `supabase.auth.signUp()`, which creates the user in Supabase Auth.
2. **Log in** → `POST /auth/login` calls `supabase.auth.signInWithPassword()`. Supabase issues JWTs and the API returns them as `access_token` and `refresh_token`.
3. **Protect** → `middleware.js` (in the project root) runs before the route and checks the `Authorization: Bearer <token>` header. It verifies the token server-side with `supabase.auth.getUser(token)`. If the header is missing or the token is invalid/expired, it returns `401`. Only valid tokens reach the protected route handler.
4. **Log out** → `POST /auth/logout` (also guarded by the middleware) ends the session.

Routes matched by the middleware: `/protected/:path*` and `/auth/logout`.

---

## Publish to GitHub

```bash
# already in the repo? start here; otherwise git init first
git init
git add .
git commit -m "Auth API: signup, login, logout, protected routes + Swagger"

# connect your remote (create an empty repo on github.com first)
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

> Your `SUPABASE_URL` and `SUPABASE_ANON_KEY` stay safe — `.env.local` is gitignored, and a clone of the repo won't include them. Anyone who clones must create their own Supabase project and env file (steps 2–3 above).

---

## Troubleshooting

| Problem                                      | Fix                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `Missing SUPABASE_URL or SUPABASE_ANON_KEY` | Create `.env.local` with the two variables and restart the dev server. |
| Login fails after signup                     | Your Supabase project may require **email confirmation**. Confirm the email in the Supabase dashboard, or disable **Auth → Providers → Email → Confirm email**. |
| `401 Invalid token` on protected routes      | The token is missing, expired, or malformed. Log in again and paste the fresh `access_token`. |
| Root `/` returns 404                          | Expected — there is no homepage, only API routes and `/docs`.        |

## Notes

- `middleware.js` is the (deprecated-in-Next-16, but fully functional) name for route protection; it can be renamed to `proxy.js` with the same exports.
- JWTs from Supabase are **stateless** — logout ends the session on Supabase's side but doesn't blacklist an already-issued token.
