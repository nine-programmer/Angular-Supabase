// SSR-only HTTP interceptor that forwards the incoming cookie header to our own /api/* so a logged-in user stays logged in on refresh.
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, REQUEST } from '@angular/core';
import { ssrApiOrigin } from './api-origin.interceptor';

// During SSR the HttpClient call runs on the server, which has no browser cookies: without this,
// every /api/* call made while rendering would be anonymous and a protected page would bounce
// to /login on every refresh. Runs after apiOriginInterceptor, so the URL is already absolute —
// and the cookie goes ONLY to our own loopback origin, never to a third-party API.
export const ssrCookieInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(`${ssrApiOrigin()}/api/`)) {
    return next(req);
  }
  const cookie = inject(REQUEST, { optional: true })?.headers.get('cookie');
  return cookie ? next(req.clone({ setHeaders: { cookie } })) : next(req);
};
