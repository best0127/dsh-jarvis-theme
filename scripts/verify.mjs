/* Local verification for the built Jarvis HUD bundle. Run: node scripts/verify.mjs */
import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };

const [pkgJson, indexSource, clientSource, tokensJson] = await Promise.all([
  readFile(join(root, 'package.json'), 'utf8'),
  readFile(join(root, 'index.js'), 'utf8'),
  readFile(join(root, 'client.js'), 'utf8'),
  readFile(join(root, 'tokens.json'), 'utf8'),
]);

const pkg = JSON.parse(pkgJson);
const tokens = JSON.parse(tokensJson);
check(pkg.dsh?.bundle?.patch === './cordis.patch.yml', 'manifest: dsh.bundle.patch');
check(pkg.dsh?.client?.platform === 'web', 'manifest: dsh.client.platform');
check(pkg.dsh?.client?.immediately === true, 'manifest: dsh.client.immediately');
for (const [name, target] of Object.entries(pkg.exports ?? {})) {
  if (name.includes('*')) continue;
  await access(join(root, target)).catch(() => failures.push(`export target missing: ${name} -> ${target}`));
}
for (const file of ['cordis.patch.yml', 'index.js', 'client.js', 'icon.svg', 'locale/en.json', 'locale/zh.json',
  'fonts/orbitron-latin.woff2', 'fonts/rajdhani-500-latin.woff2', 'fonts/rajdhani-600-latin.woff2',
  'fonts/OFL-Orbitron.txt', 'fonts/OFL-Rajdhani.txt']) {
  await access(join(root, file)).catch(() => failures.push(`missing file: ${file}`));
}

check(!/<\/script/i.test(indexSource), 'index.js contains </script');
check(!/<\/style/i.test(indexSource), 'index.js contains </style');
check(indexSource.includes('webserver/index-inject'), 'index.js listens to webserver/index-inject');
check(indexSource.includes('/jarvis-theme/fonts/'), 'index.js serves the font route');
check(indexSource.includes('dsh-jarvis-boot'), 'index.js embeds the splash markup');
check(indexSource.includes('jv-reactor'), 'index.js embeds the reactor markup');
check(/export function apply/.test(indexSource), 'index.js exports apply');
check(/export const inject = \['webServer'\]/.test(indexSource), 'index.js declares webServer injection');

const aliases = Object.keys(tokens.aliases).length;
const statics = Object.keys(tokens.statics ?? {}).length;
check(aliases >= 100, `alias count too low: ${aliases}`);
for (const [name, value] of Object.entries(tokens.aliases)) {
  for (const mode of ['light', 'dark']) {
    check(typeof value?.[mode] === 'string' && value[mode].length > 0, `alias ${name} missing ${mode}`);
    check(!String(value?.[mode]).includes('var('), `alias ${name} still contains var()`);
  }
}

const embedded = clientSource.match(/const TOKENS = (\{[\s\S]*?\});\r?\n\s*const THEME_CSS/);
check(embedded !== null, 'client.js exposes the embedded token object');
if (embedded) {
  const parsed = JSON.parse(embedded[1]);
  check(Object.keys(parsed).length >= aliases + statics, 'embedded token count is below tokens.json');
  for (const [name, value] of Object.entries(parsed)) {
    check(name.startsWith('--dsw-'), `embedded token name is not a --dsw-* property: ${name}`);
    check(typeof value?.light === 'string' && typeof value?.dark === 'string',
      `embedded token ${name} must be a { light, dark } pair`);
  }
}

const sandbox = { window: { __ModuleLoader__: { load(options) { sandbox.loaded = options; } } }, console };
sandbox.globalThis = sandbox;
sandbox.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
sandbox.document = { body: { setAttribute() {}, removeAttribute() {} }, head: { appendChild() {} }, createElement: () => ({ dataset: {}, remove() {} }) };
sandbox.location = { reload() {} };
sandbox.setTimeout = setTimeout;
vm.createContext(sandbox);
vm.runInContext(clientSource, sandbox, { filename: 'client.js' });
check(sandbox.loaded?.id === '@local/jarvis-theme', 'client module id');
const fakeReact = () => null;
const plugin = sandbox.loaded.factory((specifier) => {
  if (specifier === 'react') return { createElement: fakeReact, useState: () => [null, () => {}] };
  throw new Error(`unexpected require: ${specifier}`);
});
check(typeof plugin.apply === 'function', 'client plugin exports apply');
check(Array.isArray(plugin.inject) && plugin.inject.includes('theme') && plugin.inject.includes('slots'),
  'client plugin injects theme and slots');
check(clientSource.includes("overrideTokens('jarvis'"), 'client applies the token override layer');
check(clientSource.includes('data-dsh-jarvis'), 'client scopes the skin to body[data-dsh-jarvis]');
check(clientSource.includes('settings.general.item'), 'client registers the settings row');

console.log(JSON.stringify({
  ok: failures.length === 0,
  aliases,
  statics,
  indexBytes: indexSource.length,
  clientBytes: clientSource.length,
  failures,
}, null, 2));
if (failures.length > 0) process.exitCode = 1;
