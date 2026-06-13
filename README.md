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
| `/booking` | Canonical creator booking form |
| `/book` | Backward-compatible booking alias |
| `/booking/success` | Booking confirmation and private tracking token |
| `/track` | Privacy-safe booking tracking |
| `/privacy` | Public MVP privacy placeholder |
| `/terms` | Public MVP terms placeholder |
| `/refund` | Public MVP refund and dispute placeholder |
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

Set the local public configuration in `.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_WHATSAPP_NUMBER=COUNTRY_CODE_AND_NUMBER
VITE_SITE_URL=http://localhost:5173
VITE_OG_IMAGE_URL=
VITE_SUPPORT_EMAIL=support@your-domain.example
VITE_MOTHERSHIP_URL=https://your-mothership.example
VITE_MERCH_URL=https://your-merch-store.example
VITE_INSTAGRAM_URL=https://instagram.com/your-profile
```

The API origin is required in production. `VITE_SITE_URL` controls canonical
URLs and should match the final custom domain. WhatsApp and other public
destinations use safe disabled or hidden states when absent. Configuration
warnings are logged only during development.

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
5. Add the public Railway and contact configuration:

```env
VITE_API_URL=https://your-api.up.railway.app
VITE_WHATSAPP_NUMBER=COUNTRY_CODE_AND_NUMBER
VITE_SITE_URL=https://your-domain.example
VITE_SUPPORT_EMAIL=support@your-domain.example
```

6. Deploy.
7. Copy the production Vercel domain.
8. Update the Railway backend variable `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=https://your-domain.vercel.app
```

For preview deployments, either add the specific preview origin to the backend allowlist or use a stable custom staging domain.

The included `vercel.json` sends client-side routes back to `index.html`, so direct visits to dashboard and tracking routes work.

The `public` directory includes the launch favicon, social-preview placeholder,
`robots.txt`, and `sitemap.xml`. The sitemap currently uses the expected
NerdyFren canonical hostname; update its URLs and the robots sitemap line if the
purchased domain differs.

### Vercel CLI

```bash
npm install -g vercel
vercel
vercel env add VITE_API_URL production
vercel --prod
```

## API Integration

The Axios client lives in `src/lib/api.js`. Authentication tokens are stored separately by workspace:

- `nerdyfren_user_token`
- `nerdyfren_editor_token`
- `nerdyfren_admin_token`
- `nerdyfren_super_admin_token`

Tokens are never logged or included in public links. Because the current API
uses bearer tokens, browser storage remains sensitive to cross-site scripting;
keep the script and CMS surface narrow and move to secure, HTTP-only cookies if
server-managed sessions are introduced.

The frontend never sends service prices or payment claims during booking creation. Prices are loaded from the backend, and payments are confirmed only from the protected admin dashboard.

`VITE_API_URL` is the backend origin. The centralized client appends `/api/v1` to every endpoint. For backward compatibility, a value that already ends in `/api/v1` is normalized and also works.

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
