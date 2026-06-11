# NerdyFren Web

Production frontend for the NerdyFren managed creator marketplace.

## Stack

- React 18
- Vite 6
- Tailwind CSS 3
- React Router
- Axios
- Lucide icons

## Pages

| Route | Page |
|---|---|
| `/` | Landing page |
| `/services` | Live service catalog and pricing |
| `/book` | Creator booking form |
| `/booking/success` | Booking confirmation and private tracking token |
| `/track` | Privacy-safe booking tracking |
| `/editor/login` | Editor login |
| `/editor` | Protected editor dashboard |
| `/editor/projects/:id` | Protected project details and status updates |
| `/admin/login` | Admin login |
| `/admin` | Protected operations dashboard |

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Set the backend API URL in `.env`:

```env
VITE_API_URL=http://localhost:3001/api/v1
```

The backend must include the frontend origin in `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=http://localhost:5173
```

## Production Build

```bash
npm run lint
npm run build
npm run preview
```

## Vercel Deployment

### Git Integration

1. Import the `nerdyfren-web` GitHub repository in Vercel.
2. Keep the detected framework preset as **Vite**.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. Add `VITE_API_URL` with the public Railway backend URL:

```env
VITE_API_URL=https://your-api.up.railway.app/api/v1
```

6. Deploy.
7. Copy the production Vercel domain.
8. Update the Railway backend variable `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=https://your-domain.vercel.app
```

For preview deployments, either add the specific preview origin to the backend allowlist or use a stable custom staging domain.

The included `vercel.json` sends client-side routes back to `index.html`, so direct visits to dashboard and tracking routes work.

### Vercel CLI

```bash
npm install -g vercel
vercel
vercel env add VITE_API_URL production
vercel --prod
```

## API Integration

The Axios client lives in `src/lib/api.js`. Authentication tokens are stored separately for editor and admin workspaces:

- `nerdyfren_editor_token`
- `nerdyfren_admin_token`

The frontend never sends service prices or payment claims during booking creation. Prices are loaded from the backend, and payments are confirmed only from the protected admin dashboard.

## Folder Structure

```text
src/
  components/    Shared navigation, layout and UI states
  hooks/         Data-loading helpers
  lib/           API client and formatting utilities
  pages/         Public, editor and admin route screens
  styles/        Tailwind design system and global styles
  App.jsx        Application routes
  main.jsx       Browser entry point
```
