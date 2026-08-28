// SSR-only HTTP interceptor that turns relative /api/* URLs into absolute loopback ones.
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, REQUEST } from '@angular/core';

/**
 * Origin the SSR process calls its own API on. Always loopback: the Express host serving this
 * render also serves /api, so going out through the public domain (proxy, TLS, redirects,
 * host allowlist) would only add latency and, behind Render, strip cookies on the https redirect.
 * Port comes from the incoming request (4200 under `ng serve`) and otherwise from PORT.
 * Reading process.env here is the one allowed exception: src/app/ must not import src/server/env.ts.
 */
export function ssrApiOrigin(): string {
  const request = inject(REQUEST, { optional: true });
  const port = (request && new URL(request.url).port) || process.env['PORT'] || '4000';
  return `http://localhost:${port}`;
}

export const apiOriginInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }
  return next(req.clone({ url: `${ssrApiOrigin()}${req.url}` }));
};
