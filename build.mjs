/* Generate the shipped Host/Client artifacts from the sources:
   - index.js  = host.template.js with the splash CSS/HTML/JS inlined
   - client.js = client.template.js with the token map and theme CSS inlined
   Run: node build.mjs */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const read = (path) => readFile(join(root, path), 'utf8');

const [hostTemplate, clientTemplate, splashCss, splashHtml, splashJs, themeCss, tokensJson] = await Promise.all([
  read('src/host.template.js'),
  read('src/client.template.js'),
  read('src/splash.css'),
  read('src/splash.html'),
  read('src/splash.js'),
  read('src/theme.css'),
  read('tokens.json'),
]);

const tokens = JSON.parse(tokensJson);

/* Corrections applied on top of the generated map:
   - dimming masks stay black-alpha in both schemes (the generated light values
     would lighten instead of dim);
   - the tooltip key cap follows the mapped tooltip surface;
   - scrollbar thumbs need a little more presence than a 16% wash. */
const TOKEN_FIXES = {
  '--dsw-alias-bg-mask-1': { light: 'rgba(3, 6, 10, 0.24)', dark: 'rgba(3, 6, 10, 0.5)' },
  '--dsw-alias-bg-mask-2': { light: 'rgba(3, 6, 10, 0.12)', dark: 'rgba(3, 6, 10, 0.2)' },
  '--dsw-alias-bg-mask-3': { light: 'rgba(3, 6, 10, 0.48)', dark: 'rgba(3, 6, 10, 0.48)' },
  '--dsw-alias-bg-mask-photo': { light: 'rgba(3, 6, 10, 0.88)', dark: 'rgba(3, 6, 10, 0.88)' },
  '--dsw-alias-tooltip-key-bg': { light: '#36414A', dark: '#3D4856' },
  '--dsw-alias-scrollbar-bg-l1': { light: 'rgba(10, 138, 166, 0.28)', dark: 'rgba(120, 226, 255, 0.24)' },
  '--dsw-alias-scrollbar-bg-l2': { light: 'rgba(10, 138, 166, 0.28)', dark: 'rgba(120, 226, 255, 0.24)' },
  '--dsw-alias-scrollbar-hover-l1': { light: 'rgba(10, 138, 166, 0.44)', dark: 'rgba(120, 226, 255, 0.4)' },
  '--dsw-alias-scrollbar-hover-l2': { light: 'rgba(10, 138, 166, 0.44)', dark: 'rgba(120, 226, 255, 0.4)' },
};
for (const [name, value] of Object.entries(TOKEN_FIXES)) {
  if (!tokens.aliases[name]) throw new Error(`token fix targets an unknown alias: ${name}`);
  tokens.aliases[name] = value;
}

const tokenCount = Object.keys(tokens.aliases).length + Object.keys(tokens.statics ?? {}).length;

/* Tokens outside the alias/static layers that components still paint surfaces
   with: the app frame/sidebar and title rows, the composer, menus, user
   bubbles, selectors and tooltips. Without these the shell keeps the shipped
   neutral gray while the content column turns navy. */
const TOKEN_EXTRA = {
  '--dsw-specific-sidebar-fill': { light: '#F5F9FC', dark: '#0A121B' },
  '--dsw-specific-sidebar-nav-item-active': { light: 'rgba(10, 138, 166, 0.10)', dark: 'rgba(56, 225, 255, 0.14)' },
  '--dsw-specific-sidebar-nav-item-active-accent': { light: 'rgba(10, 138, 166, 0.14)', dark: 'rgba(56, 225, 255, 0.18)' },
  '--dsw-specific-bubble': { light: '#E8F4F8', dark: '#132130' },
  '--dsw-specific-bubble-highlight': { light: 'rgba(10, 138, 166, 0.12)', dark: 'rgba(56, 225, 255, 0.18)' },
  '--dsw-specific-input-major': { light: '#FFFFFF', dark: '#0E1822' },
  '--dsw-specific-login-input': { light: '#FFFFFF', dark: '#0A121B' },
  '--dsw-specific-menu': { light: 'rgba(255, 255, 255, 0.94)', dark: 'rgba(14, 24, 34, 0.94)' },
  '--dsw-specific-selector': { light: 'rgba(10, 138, 166, 0.12)', dark: 'rgba(56, 225, 255, 0.16)' },
  '--dsw-specific-tip': { light: '#EDF3F9', dark: '#132130' },
  '--dsw-menu-surface-fill': { light: 'rgba(255, 255, 255, 0.7)', dark: 'rgba(14, 24, 34, 0.64)' },
};

/* The runtime contract takes one flat token-name -> { light, dark } map, so the
   generated container (aliases/statics/notes) is flattened before inlining. */
const tokenMap = { ...tokens.aliases, ...(tokens.statics ?? {}), ...TOKEN_EXTRA };

function inline(template, values) {
  let out = template;
  for (const [marker, value] of Object.entries(values)) {
    if (!out.includes(marker)) throw new Error(`template is missing ${marker}`);
    out = out.split(marker).join(JSON.stringify(value));
  }
  return out;
}

const index = inline(hostTemplate, {
  __SPLASH_CSS__: splashCss,
  __SPLASH_HTML__: splashHtml,
  __SPLASH_JS__: splashJs,
});
const client = inline(clientTemplate, {
  __TOKENS__: tokenMap,
  __THEME_CSS__: themeCss,
});

for (const [name, source] of [['index.js', index], ['client.js', client]]) {
  if (/<\/script/i.test(source)) throw new Error(`${name} contains a closing script tag sequence`);
  await writeFile(join(root, name), source, 'utf8');
}

console.log(`built index.js (${index.length} bytes) and client.js (${client.length} bytes), ${Object.keys(tokenMap).length} tokens`);

