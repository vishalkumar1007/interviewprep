# Prepbase Frontend

Vite + React + TypeScript UI for the Prepbase interview-prep app.

## Live

- **App:** https://vishalkumar1007.github.io/Interview-prep-frontend/
- **API:** https://interview-prep-backend-teal.vercel.app/

## Setup

```bash
npm install
npm run dev
```

Dev server proxies `/api` to the backend (default `http://localhost:3000`).

For a production-like local build against the live API:

```bash
VITE_BASE_PATH=/Interview-prep-frontend/ VITE_API_URL=https://interview-prep-backend-teal.vercel.app npm run build
```

## Deploy (GitHub Pages)

Push to `main` — the Actions workflow builds with the live API URL and deploys to Pages.

Companion API: [Interview-prep-backend](https://github.com/vishalkumar1007/Interview-prep-backend).
