import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { apiOriginInterceptor } from './core/api-origin.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // Registered after appConfig's provideHttpClient (see mergeApplicationConfig below),
    // so this server-only instance — with apiOriginInterceptor — wins during SSR.
    provideHttpClient(withInterceptors([apiOriginInterceptor])),
  ],
};

// Provider order matters: serverConfig is merged LAST, so its HttpClient
// (with the SSR interceptor) overrides the browser-only one from appConfig.
export const config = mergeApplicationConfig(appConfig, serverConfig);
