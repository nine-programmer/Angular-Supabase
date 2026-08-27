// SSR-only HTTP interceptor that turns relative /api/* URLs into absolute ones.
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, REQUEST } from '@angular/core';

// Relative /api/* URLs don't resolve during SSR, so prefix the origin of the
// incoming request (falls back to PORT when there is none, e.g. during
// prerendering). Registered only in app.config.server.ts. Reading process.env
// here is the one allowed exception to "only env.ts reads process.env":
// src/app/ must not import from src/server/, and this code only runs on Node.
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
