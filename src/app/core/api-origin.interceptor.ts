// SSR-only HTTP interceptor that turns relative /api/* URLs into absolute ones.
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, REQUEST } from '@angular/core';

// Relative /api/* URLs don't resolve during SSR, so prefix the incoming request's
// origin (PORT fallback when there is none, e.g. prerendering). Reading process.env
// here is the one allowed exception: src/app/ must not import src/server/env.ts.
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
