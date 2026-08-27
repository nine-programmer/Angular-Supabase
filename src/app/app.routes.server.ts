// Per-route SSR render mode (Prerender / Server / Client) — see AGENTS.md → SSR.
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
