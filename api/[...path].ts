// The production build bundles the Express app to dist/server.cjs. Importing
// that artifact avoids Vercel's function runtime trying to load a raw .ts file.
import { app } from '../dist/server.cjs';

// Vercel routes /api/* requests to this catch-all function. Preserve the
// /api prefix so the existing Express route definitions continue to match.
export default function handler(req: any, res: any) {
  const requestPath = req.url || '/';
  if (!requestPath.startsWith('/api/')) {
    req.url = '/api' + (requestPath.startsWith('/') ? requestPath : '/' + requestPath);
  }
  return app(req, res);
}
