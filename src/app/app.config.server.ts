// Server-side application config: adds SSR rendering and the /api origin interceptor.
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { apiOriginInterceptor } from './core/api-origin.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideHttpClient(withInterceptors([apiOriginInterceptor])),
  ],
};

// Provider order matters: serverConfig is merged LAST, so its HttpClient
// (with the SSR interceptor) overrides the browser-only one from appConfig.
export const config = mergeApplicationConfig(appConfig, serverConfig);
