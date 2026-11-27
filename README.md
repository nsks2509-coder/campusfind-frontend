# CampusFind

A responsive React and Vite interface for a campus lost-and-found board. Students can browse reports, search by item or location, filter by type and category, and submit a report or ownership claim.

## Project

- **Frontend:** React, Vite, plain CSS
- **Backend:** [CampusFind API](https://github.com/nsks2509-coder/campusfind-backend), Spring Boot and Java 17
- **Live preview:** [campusfind-frontend-chi.vercel.app](https://campusfind-frontend-chi.vercel.app)

## Run locally

Requirements: Node.js 18+ and a running CampusFind API.

```bash
npm install
```

Create `.env.local` in the project root:

```env
VITE_API_URL=http://localhost:8080/api
```

Start the dev server:

```bash
npm run dev
```

Vite prints the local URL, usually [http://localhost:5173](http://localhost:5173).

Create a production build with:

```bash
npm run build
```

## Deploy

For Vercel, import this repository and use the Vite defaults:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://YOUR-API-DOMAIN/api`

Set `FRONTEND_URL` on the backend to the deployed frontend origin, then redeploy the API.

## API calls

The interface uses `GET /api/health`, `GET /api/items`, `POST /api/items`, and `POST /api/items/{id}/claims`.

## Current scope

This is a portfolio MVP. It does not yet include sign-in, claim review, or reporter notifications. The companion API hides reporter contact details from public responses, but do not submit real personal information until authentication, moderation, abuse protection, and a complete claim workflow are in place.
