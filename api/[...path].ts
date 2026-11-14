import { app } from '../server';

// Vercel routes /api/* requests to this catch-all function. Preserve the
// /api prefix so the existing Express route definitions continue to match.
export default function handler(req: any, res: any) {
  const requestPath = req.url || '/';
  if (!requestPath.startsWith('/api/')) {
    req.url = `/api${requestPath.startsWith('/') ? requestPath : `/${requestPath}`}`;
  }
  return app(req, res);
}
