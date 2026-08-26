import { HttpInterceptorFn } from '@angular/common/http';
import { inject, REQUEST } from '@angular/core';

// Server-only: relative /api/* URLs don't resolve during SSR, so prefix the
// origin of the incoming request (falls back to PORT when there is none,
// e.g. during prerendering). Registered only in app.config.server.ts.
export const apiOriginInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  const request = inject(REQUEST, { optional: true });
  const origin = request
    ? new URL(request.url).origin
    : `http://localhost:${process.env['PORT'] || 4000}`;

  return next(req.clone({ url: `${origin}${req.url}` }));
};
