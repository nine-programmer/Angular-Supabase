// Verifies the SSR URL rewriting: /api/* gets an absolute origin, other URLs are left alone.
import { Provider, REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { apiOriginInterceptor } from './api-origin.interceptor';

// Returns the URL the interceptor forwarded to the next handler.
function forwardedUrl(url: string, providers: Provider[] = []): string {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers });

  let seen = '';
  const next: HttpHandlerFn = (req) => {
    seen = req.url;
    return of({} as HttpEvent<unknown>);
  };

  TestBed.runInInjectionContext(() => {
    apiOriginInterceptor(new HttpRequest('GET', url), next).subscribe();
  });

  return seen;
}

// The incoming request is only read for its .url, so a minimal stub is enough.
function incomingRequest(url: string): Provider {
  return { provide: REQUEST, useValue: { url } as unknown as Request };
}

describe('apiOriginInterceptor', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('leaves non-/api URLs untouched', () => {
    expect(forwardedUrl('/assets/logo.svg')).toBe('/assets/logo.svg');
    expect(forwardedUrl('https://example.com/api/health')).toBe('https://example.com/api/health');
  });

  it('prefixes the origin of the incoming request', () => {
    const providers = [incomingRequest('https://shop.example.com/booking?x=1')];
    expect(forwardedUrl('/api/bookings', providers)).toBe('https://shop.example.com/api/bookings');
  });

  it('falls back to localhost:PORT when there is no incoming request (prerendering)', () => {
    vi.stubEnv('PORT', '5555');
    expect(forwardedUrl('/api/health')).toBe('http://localhost:5555/api/health');
  });

  it('falls back to port 4000 when PORT is unset', () => {
    vi.stubEnv('PORT', '');
    expect(forwardedUrl('/api/health')).toBe('http://localhost:4000/api/health');
  });
});
