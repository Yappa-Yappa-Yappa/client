# Yappa Client

The Yappa frontend is a React 19 single-page application powered by Vite, Tailwind CSS, and React Router.

## Requirements

- Node.js 18 or newer
- The Yappa server running locally or at a deployed API URL

## Setup

Install dependencies from this folder:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure the values in `.env`:

```env
VITE_BACKEND_URL=http://localhost:6969
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

Only variables prefixed with `VITE_` are available to browser code. Never place private keys or client secrets in this file.

## Development

Start the Vite development server:

```bash
npm run dev
```

Vite will print the local frontend URL, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The build output is generated in `dist/`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Source structure

```text
src/
├── api/         # HTTP API helpers
├── assets/      # Fonts, icons, and static images
├── components/  # Reusable UI and layout components
├── contexts/    # Shared application state and theme
├── errors/      # Error and fallback views
├── hooks/       # Reusable React hooks
├── pages/       # Route-level screens
├── utils/       # Shared frontend helpers
├── App.jsx      # Application routes
└── main.jsx     # React entry point
```

## Backend connection

The frontend uses `VITE_BACKEND_URL` for API requests. Start the backend separately from the `server/` folder:

```bash
cd ../server
npm run dev
```

The backend also provides Socket.IO for real-time chat updates. Make sure the backend CORS configuration allows the frontend origin.

## Google login

`VITE_GOOGLE_CLIENT_ID` is a public Google OAuth client ID and may be used by the frontend. Google client secrets must remain in the backend environment only.
