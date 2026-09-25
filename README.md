# Prepbase Frontend

Vite + React + TypeScript UI for the Prepbase interview-prep app.

## Setup

```bash
npm install
npm run dev
```

Dev server proxies `/api` to the backend (default `http://localhost:3000`).

## Free deploy on Vercel

1. Import this repo in [Vercel](https://vercel.com).
2. Set env var `VITE_API_URL` to your backend URL (no trailing slash), e.g. `https://your-backend.vercel.app`.
3. Deploy.

Companion API: [Interview-prep-backend](https://github.com/vishalkumar1007/Interview-prep-backend).
