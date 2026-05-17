# PantryPal

PantryPal is a mobile-first pantry, grocery, and meal planning app built with React, Vite, and TypeScript. It helps users track food they already have, reduce waste, build grocery lists, and find meal ideas from pantry ingredients.

The current app runs as a web app and is structured so it can later be packaged for mobile with Capacitor.

## Tech Stack

- React 18
- Vite
- TypeScript
- Supabase auth and cloud sync
- Vitest
- CSS design tokens

## Local Setup

Install dependencies:

```powershell
npm install
```

Create a local `.env` file from the example:

```powershell
Copy-Item .env.example .env
```

Fill in the Supabase values:

```text
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The `.env` file is ignored by git. Do not commit real Supabase keys.

## Run The App

Start the dev server:

```powershell
npm run dev
```

Open the local URL Vite prints, usually:

```text
http://127.0.0.1:5173/
```

## Quality Checks

Run tests:

```powershell
npm test
```

Run TypeScript checks:

```powershell
npm run typecheck
```

Build production assets:

```powershell
npm run build
```

The production output is written to `dist/`.

## Release Checklist

Before deploying a web MVP:

- Confirm `.env` is configured locally.
- Confirm the deployment host has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set.
- Run `npm test`.
- Run `npm run typecheck`.
- Run `npm run build`.
- Test the guest flow in the browser.
- Test account creation and login if Supabase auth is enabled.
- Confirm import/export works from Settings.
- Confirm no real credentials are committed.

## Deploy As A Web App

The repo includes `vercel.json` and `netlify.toml` so either host can deploy the app directly from GitHub.

For Vercel or Netlify:

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

Both configs include a single-page-app fallback so deep links serve `index.html`.

### GitHub Pages

The repo also includes `.github/workflows/deploy-pages.yml`. To use it:

1. In GitHub, open the repo settings.
2. Go to `Pages`.
3. Set `Build and deployment` source to `GitHub Actions`.
4. Add repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Push to `main` or run the `Deploy to GitHub Pages` workflow manually.

The GitHub Pages URL will be:

```text
https://whittm211.github.io/PantryPal/
```

## Mobile Packaging Later

After the web MVP is stable, package the existing React app with Capacitor:

```powershell
npm install @capacitor/core @capacitor/cli
npx cap init PantryPal com.whittm211.pantrypal
npm run build
npx cap add android
npx cap sync
```

iOS packaging requires macOS and Xcode.
