// Browser-side application config: router, hydration, HttpClient, Thai locale and timezone for pipes.
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DATE_PIPE_DEFAULT_OPTIONS, registerLocaleData } from '@angular/common';
import localeTh from '@angular/common/locales/th';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

// DatePipe / DecimalPipe render Thai month names and formats everywhere (browser and SSR alike).
registerLocaleData(localeTh);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    // FetchBackend is the default HttpBackend in this Angular version, so no
    // withFetch() feature is needed (it is deprecated — see http.d.ts).
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'th' },
    // The SSR server runs in UTC while browsers in Thailand run at +07:00; pinning the pipe
    // timezone keeps server-rendered and client-rendered times identical (no hydration mismatch).
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { timezone: '+0700' } },
  ],
};
