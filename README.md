# Prepbase Frontend

Vite + React + TypeScript UI for the Prepbase interview-prep app.

## Live

- **App:** https://vishalkumar1007.github.io/interviewprep/
- **API:** https://interview-prep-backend-teal.vercel.app/

## Setup

```bash
npm install
npm run dev
```

Dev server proxies `/api` to the backend (default `http://localhost:3000`).

For a production-like local build against the live API:

```bash
VITE_BASE_PATH=/interviewprep/ VITE_API_URL=https://interview-prep-backend-teal.vercel.app npm run build
```

## Deploy (GitHub Pages)

Repo name must be **`interviewprep`** so Pages is served at `/interviewprep/`.

Push to `main` — the Actions workflow builds with the live API URL and deploys to Pages.

Companion API: [Interview-prep-backend](https://github.com/vishalkumar1007/Interview-prep-backend).
