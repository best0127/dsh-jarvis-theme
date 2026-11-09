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

const BALANCE_PATH = '/api/jarvis-theme/balance';
const BALANCE_CACHE_MS = 20_000;
let balanceCache = null;

/**
 * Build the Platform request identity for one signed balance read.
 * @returns the metadata the account service forwards to Platform.
 */
function accountMetadata() {
  return {
    version: process.env.DSH_CLIENT_VERSION || process.env.DSH_VERSION || '0.0.0',
    locale: 'zh',
    // Date.getTimezoneOffset reports minutes west of UTC; Platform wants seconds east.
    timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
  };
}

/**
 * Read the signed account's recharge and bonus wallets without exposing the credential.
 * @param ctx - Host plugin context.
 * @returns a JSON-safe summary; failures carry a reason instead of a zero balance.
 */
async function readBalance(ctx) {
  const account = ctx.get('deepseekAccount');
  if (account === undefined) return { ok: false, reason: 'account-unavailable' };
  try {
    const state = await account.getState();
    if (state.status !== 'credential-stored') return { ok: true, signedOut: true };
    const balance = await account.getBalance(accountMetadata());
    if (balance === null) return { ok: false, reason: 'signed-out' };
    if (balance.status !== 'ready') return { ok: false, reason: 'read-failed' };
    return { ok: true, wallets: balance.value, bonusWallets: balance.bonusWallets };
  } catch (error) {
    return { ok: false, reason: 'error' };
  }
}

export const inject = ['webServer', 'connection'];

/**
 * Push the boot overlay rows, serve the font assets, and expose the account balance.
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

  ctx.effect(() => {
    const dispose = ctx.connection.fetch.register({
      path: BALANCE_PATH,
      methods: ['GET'],
      requestBody: 'buffered',
      fetch: async () => {
        const now = Date.now();
        if (balanceCache === null || now - balanceCache.at > BALANCE_CACHE_MS) {
          balanceCache = { at: now, payload: await readBalance(ctx) };
        }
        return new Response(JSON.stringify(balanceCache.payload), {
          status: 200,
          headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
        });
      },
    });
    return () => { void dispose(); };
  }, 'jarvis-theme: balance route');
}
