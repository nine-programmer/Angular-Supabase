// Server-side application config: adds SSR rendering and the two SSR-only /api interceptors.
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { apiOriginInterceptor } from './core/api-origin.interceptor';
import { ssrCookieInterceptor } from './core/ssr-cookie.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // Order matters: origin first (makes the URL absolute), then the cookie forwarder.
    provideHttpClient(withInterceptors([apiOriginInterceptor, ssrCookieInterceptor])),
  ],
};

// Interceptors are additive, not replaced: any interceptor a project registers in appConfig
// (e.g. an auth interceptor) also runs during SSR, BEFORE these two. Such an interceptor must
// pass the request through untouched when inject(REQUEST, { optional: true }) is set.
export const config = mergeApplicationConfig(appConfig, serverConfig);
