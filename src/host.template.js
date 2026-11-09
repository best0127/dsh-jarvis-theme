/* J.A.R.V.I.S. HUD — Host half of the bundle.
   Injects the boot overlay (style + markup + controller) into every rendered
   index page before the client entry runs, and serves the self-hosted display
   fonts the overlay and brand artwork use. */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SPLASH_CSS = __SPLASH_CSS__;
const SPLASH_HTML = __SPLASH_HTML__;
const SPLASH_JS = __SPLASH_JS__;

const FONTS_DIR = fileURLToPath(new URL('./fonts/', import.meta.url));
const FONT_ROUTE = '/jarvis-theme/fonts/';
const FONT_TYPES = {
  'orbitron-latin.woff2': 'font/woff2',
  'rajdhani-500-latin.woff2': 'font/woff2',
  'rajdhani-600-latin.woff2': 'font/woff2',
};

export const inject = ['webServer'];

/**
 * Push the boot overlay rows and serve the font assets.
 * @param ctx - Host plugin context.
 */
export function apply(ctx) {
  ctx.effect(() => ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'style', text: SPLASH_CSS });
    table.push({ kind: 'html', placement: 'body', html: SPLASH_HTML });
    table.push({ kind: 'script', placement: 'body', text: SPLASH_JS });
  }), 'jarvis-theme: boot overlay rows');

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: FONT_ROUTE,
    async handler(req, res) {
      const path = new URL(req.url ?? '/', 'http://jarvis-theme.invalid').pathname;
      const name = path.slice(FONT_ROUTE.length);
      const type = FONT_TYPES[name];
      if (type === undefined) {
        res.statusCode = 404;
        res.end();
        return;
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.statusCode = 405;
        res.setHeader('allow', 'GET, HEAD');
        res.end();
        return;
      }
      try {
        const body = await readFile(join(FONTS_DIR, name));
        res.statusCode = 200;
        res.setHeader('content-type', type);
        res.setHeader('cache-control', 'public, max-age=31536000, immutable');
        res.end(req.method === 'HEAD' ? undefined : body);
      } catch (error) {
        res.statusCode = 500;
        res.end();
      }
    },
  }), 'jarvis-theme: font route');
}
