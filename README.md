# CampusFind Frontend

React + Vite frontend for the CampusFind campus Lost & Found Portal.

## Included
- Responsive landing page and item board
- Search by title, description, location, or category
- Filter reports by LOST/FOUND and category
- Submit a lost/found report
- Submit an ownership claim with a proof message
- Separate API client in `src/api.js`

## Requirements
- Node.js 18 or newer
- CampusFind backend running on port 8080 or a deployed API URL

## Run locally
```bash
npm install
```

Create a file named `.env.local` in the repository root:
```env
VITE_API_URL=http://localhost:8080/api
```

Start the frontend:
```bash
npm run dev
```
Open the local URL Vite prints, usually http://localhost:5173.

## API deployment
When you deploy the backend, set `VITE_API_URL` in your frontend hosting provider to:
```
https://YOUR-BACKEND-DOMAIN/api
```
Replace the placeholder with your actual backend URL and redeploy the frontend.

## Deploy on Vercel
- Import this repository into Vercel.
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Add environment variable `VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api`

The backend must allow your Vercel domain via its `FRONTEND_URL` setting.

## Related repository
Backend: https://github.com/nsks2509-coder/campusfind-backend

## API used
- `GET /api/health`
- `GET /api/items?q=&type=&category=`
- `POST /api/items`
- `POST /api/items/{id}/claims`

This is a college-project MVP. It does not yet include registration/login or role-based claim approval.