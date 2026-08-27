// Per-route SSR render mode (Prerender / Server / Client) — see AGENTS.md → SSR.
import { RenderMode, ServerRoute } from '@angular/ssr';

// Default is Server, not Prerender: customer pages read live data via /api/*, and a
// prerendered page would call that API at build time when no server is running.
// Add a `RenderMode.Prerender` entry above the catch-all only for genuinely static pages.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
