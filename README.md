# Prepbase Frontend

Vite + React + TypeScript UI for the Prepbase interview-prep app.

## Setup

```bash
npm install
npm run dev
```

Dev server proxies `/api` to the backend (default `http://localhost:3000`).

## Deploy on GitHub Pages

Site URL: [https://vishalkumar1007.github.io/Interview-prep-frontend/](https://vishalkumar1007.github.io/Interview-prep-frontend/)

1. In the GitHub repo go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. (Optional) **Settings → Secrets and variables → Actions → Variables** — add `VITE_API_URL` (no trailing slash), e.g. your backend URL.
4. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually). The pipeline builds and publishes `dist/`.

Companion API: [Interview-prep-backend](https://github.com/vishalkumar1007/Interview-prep-backend).
