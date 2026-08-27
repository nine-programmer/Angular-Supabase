// Browser-side application config: router, hydration, HttpClient.
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    // FetchBackend is the default HttpBackend in this Angular version, so no
    // withFetch() feature is needed (it's deprecated — see http.d.ts).
    provideHttpClient(),
  ],
};
