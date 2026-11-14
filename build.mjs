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
  '--dsw-menu-backdrop-filter': { light: 'blur(12px) saturate(1.2)', dark: 'blur(12px) saturate(1.2)' },
};

/* The runtime contract takes one flat token-name -> { light, dark } map, so the
   generated container (aliases/statics/notes) is flattened before inlining. */
const rawTokenMap = { ...tokens.aliases, ...(tokens.statics ?? {}), ...TOKEN_EXTRA };

/* Black-theme recolor: neutral colors (surfaces, text, borders without hue) are
   desaturated to gray and dark surfaces are pulled toward true black; cyan
   accents turn into dark gold; other accents keep their hue. */
const NEUTRAL_CHROMA = 60;
const DARK_SURFACE_Y = 96;
const DARK_SURFACE_LIFT = 16;
const DARK_SURFACE_SCALE = 0.8;
const GOLD = { r: 201, g: 162, b: 39 };
const GOLD_HUE = 43;
const GOLD_SATURATION = 0.68;

function parseColor(value) {
  const text = value.trim().toLowerCase();
  let match = /^#([0-9a-f]{3,8})$/.exec(text);
  if (match !== null) {
    const hex = match[1];
    const expand = (part) => (part.length === 1 ? parseInt(part + part, 16) : parseInt(part, 16));
    const parts = hex.length === 3 || hex.length === 4
      ? [hex.slice(0, 1), hex.slice(1, 2), hex.slice(2, 3), hex.length === 4 ? hex.slice(3, 4) : 'ff']
      : hex.length === 6 || hex.length === 8
        ? [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6), hex.length === 8 ? hex.slice(6, 8) : 'ff']
        : null;
    if (parts === null) return null;
    return { r: expand(parts[0]), g: expand(parts[1]), b: expand(parts[2]), a: expand(parts[3]) / 255 };
  }
  match = /^rgba?\(([^)]+)\)$/.exec(text);
  if (match === null) return null;
  const nums = match[1].split(',').map((part) => part.trim());
  if (nums.length < 3 || nums.length > 4) return null;
  const channel = (part) => (part.endsWith('%') ? Math.round(parseFloat(part) * 2.55) : Math.round(parseFloat(part)));
  const alpha = nums.length === 4 ? (nums[3].endsWith('%') ? parseFloat(nums[3]) / 100 : parseFloat(nums[3])) : 1;
  const color = { r: channel(nums[0]), g: channel(nums[1]), b: channel(nums[2]), a: alpha };
  if ([color.r, color.g, color.b, color.a].some((n) => !Number.isFinite(n))) return null;
  return color;
}

function formatColor(color) {
  const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));
  if (color.a >= 0.999) {
    return '#' + [color.r, color.g, color.b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  return `rgba(${clamp(color.r)}, ${clamp(color.g)}, ${clamp(color.b)}, ${Number(color.a.toFixed(3))})`;
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s, l };
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return { r: (rgb[0] + m) * 255, g: (rgb[1] + m) * 255, b: (rgb[2] + m) * 255 };
}

function recolor(value, scheme) {
  const color = parseColor(value);
  if (color === null) return value;
  const chroma = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b);
  if (chroma > NEUTRAL_CHROMA) {
    const { h, l } = rgbToHsl(color);
    if (h < 170 || h > 215) return value; // non-cyan accents keep their hue
    if (color.a < 0.999) return formatColor({ ...GOLD, a: color.a });
    const target = scheme === 'dark'
      ? Math.min(0.62, Math.max(0.2, l * 0.78))
      : Math.min(0.45, Math.max(0.12, l * 0.6));
    return formatColor({ ...hslToRgb(GOLD_HUE, GOLD_SATURATION, target), a: 1 });
  }
  let y = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  if (scheme === 'dark') {
    /* Dark surfaces sit on a charcoal ramp instead of true black (pure black is
       harsh to read on); the explicit patch below pins the reading surfaces. */
    if (y < DARK_SURFACE_Y) y = DARK_SURFACE_LIFT + y * DARK_SURFACE_SCALE;
  }
  return formatColor({ r: y, g: y, b: y, a: color.a });
}

const tokenMap = Object.fromEntries(Object.entries(rawTokenMap).map(([name, pair]) => [name, {
  light: recolor(pair.light, 'light'),
  dark: recolor(pair.dark, 'dark'),
}]));

/* Holo Ice reading surfaces: a glacier-slate ramp (#0B1118 → #1F2B3A) in dark
   and a cool paper ramp in light. Text sits at the official contrast level. */
const DARK_PATCH = {
  '--dsw-alias-bg-base': '#0B1118',
  '--dsw-alias-bg-layer-1': '#121A24',
  '--dsw-alias-bg-layer-2': '#18222F',
  '--dsw-alias-bg-layer-3': '#1F2B3A',
  '--dsw-alias-bg-overlay': '#243245',
  '--dsw-alias-bg-document-preview': '#0B1118',
  '--dsw-alias-bg-multi-select': '#121A24',
  '--dsw-alias-bg-module-platform': '#18222F',
  '--dsw-alias-bg-skeleton': 'rgba(154, 216, 255, 0.08)',
  '--dsw-specific-sidebar-fill': '#0E151D',
  '--dsw-specific-input-major': '#151E29',
  '--dsw-specific-bubble': '#18222F',
  '--dsw-specific-tip': '#1F2B3A',
  '--dsw-specific-menu': 'rgba(22, 32, 44, 0.72)',
  '--dsw-menu-surface-fill': 'rgba(16, 24, 34, 0.6)',
  '--dsw-alias-toast-bg': '#1F2B3A',
  '--dsw-alias-tooltip-bg': '#1F2B3A',
  '--dsw-alias-button-elevated-fill': '#18222F',
  '--dsw-alias-button-floating-fill': '#18222F',
  '--dsw-alias-button-floating-hover': '#1F2B3A',
  '--dsw-alias-button-ghost-active-fill': '#1F2B3A',
  '--dsw-alias-markdown-code-block': '#0E151D',
  '--dsw-alias-markdown-code-block-banner': '#121A24',
  '--dsw-alias-markdown-code-segment-selected': '#18222F',
  '--dsw-alias-markdown-code-segment-unselected': '#0E151D',
  '--dsw-alias-markdown-inline-code': '#121A24',
  '--dsw-alias-markdown-tag': '#121A24',
  '--dsw-alias-markdown-placeholder': '#121A24',
  '--dsw-alias-markdown-citation': '#121A24',
  '--dsw-alias-label-primary': '#E8F0F7',
  '--dsw-alias-label-primary-bluish': '#E8F0F7',
  '--dsw-alias-label-secondary': '#ADC0D2',
  '--dsw-alias-label-tertiary': '#7E90A4',
  '--dsw-alias-label-caption': '#7E90A4',
  '--dsw-alias-label-document-preview': '#ADC0D2',
  '--dsw-alias-menu-icon': '#D2E2F0',
  '--dsw-alias-switch-thumb': '#F2F8FF',
};
for (const [name, value] of Object.entries(DARK_PATCH)) {
  if (tokenMap[name] === undefined) throw new Error(`DARK_PATCH names an unknown token: ${name}`);
  tokenMap[name] = { ...tokenMap[name], dark: value };
}

const LIGHT_PATCH = {
  '--dsw-alias-bg-base': '#F3F7FB',
  '--dsw-alias-bg-layer-1': '#FFFFFF',
  '--dsw-alias-bg-layer-2': '#FAFCFE',
  '--dsw-alias-bg-layer-3': '#EBF1F7',
  '--dsw-alias-bg-overlay': '#FFFFFF',
  '--dsw-alias-bg-document-preview': '#F3F7FB',
  '--dsw-alias-bg-multi-select': '#EBF1F7',
  '--dsw-alias-bg-module-platform': '#FFFFFF',
  '--dsw-alias-bg-skeleton': 'rgba(11, 106, 143, 0.08)',
  '--dsw-specific-sidebar-fill': '#EEF3F9',
  '--dsw-specific-input-major': '#FFFFFF',
  '--dsw-specific-bubble': '#E9F1F7',
  '--dsw-specific-tip': '#FFFFFF',
  '--dsw-specific-menu': 'rgba(255, 255, 255, 0.72)',
  '--dsw-menu-surface-fill': 'rgba(255, 255, 255, 0.6)',
  '--dsw-alias-toast-bg': '#FFFFFF',
  '--dsw-alias-tooltip-bg': '#FFFFFF',
  '--dsw-alias-button-elevated-fill': '#FFFFFF',
  '--dsw-alias-button-floating-fill': '#FFFFFF',
  '--dsw-alias-button-floating-hover': '#EBF1F7',
  '--dsw-alias-button-ghost-active-fill': '#EBF1F7',
  '--dsw-alias-markdown-code-block': '#F0F5FA',
  '--dsw-alias-markdown-code-block-banner': '#E7EFF6',
  '--dsw-alias-markdown-code-segment-selected': '#FFFFFF',
  '--dsw-alias-markdown-code-segment-unselected': '#F0F5FA',
  '--dsw-alias-markdown-inline-code': '#EBF1F7',
  '--dsw-alias-markdown-tag': '#EBF1F7',
  '--dsw-alias-markdown-placeholder': '#EBF1F7',
  '--dsw-alias-markdown-citation': '#EBF1F7',
  '--dsw-alias-label-primary': '#0D1620',
  '--dsw-alias-label-primary-bluish': '#0D1620',
  '--dsw-alias-label-secondary': '#405464',
  '--dsw-alias-label-tertiary': '#6C8092',
  '--dsw-alias-label-caption': '#6C8092',
  '--dsw-alias-label-document-preview': '#405464',
  '--dsw-alias-menu-icon': '#3E5165',
  '--dsw-alias-switch-thumb': '#FFFFFF',
};
for (const [name, value] of Object.entries(LIGHT_PATCH)) {
  if (tokenMap[name] === undefined) throw new Error(`LIGHT_PATCH names an unknown token: ${name}`);
  tokenMap[name] = { ...tokenMap[name], light: value };
}

/* Structural borders stay neutral like the official themes; the ice accent is
   reserved for brand, links, focus, selection and key figures. */
const BORDER_PATCH = {
  '--dsw-alias-border-inverted': { light: 'rgba(0, 0, 0, 0)', dark: 'rgba(255, 255, 255, 0.06)' },
  '--dsw-alias-border-inverted2': { light: 'rgba(0, 0, 0, 0)', dark: 'rgba(255, 255, 255, 0.08)' },
  '--dsw-alias-border-l1': { light: 'rgba(0, 0, 0, 0.04)', dark: 'rgba(255, 255, 255, 0.06)' },
  '--dsw-alias-border-l2-darkmode-thin': { light: 'rgba(0, 0, 0, 0.1)', dark: 'rgba(255, 255, 255, 0.06)' },
  '--dsw-alias-border-l2': { light: 'rgba(0, 0, 0, 0.1)', dark: 'rgba(255, 255, 255, 0.12)' },
  '--dsw-alias-border-l3': { light: 'rgba(0, 0, 0, 0.12)', dark: 'rgba(255, 255, 255, 0.16)' },
  '--dsw-alias-border-l4': { light: 'rgba(0, 0, 0, 0.16)', dark: 'rgba(255, 255, 255, 0.2)' },
  '--dsw-alias-button-ghost-active-border': { light: 'rgba(0, 0, 0, 0.16)', dark: 'rgba(255, 255, 255, 0.2)' },
};
for (const [name, pair] of Object.entries(BORDER_PATCH)) {
  if (tokenMap[name] === undefined) throw new Error(`BORDER_PATCH names an unknown token: ${name}`);
  tokenMap[name] = { ...tokenMap[name], light: pair.light, dark: pair.dark };
}

/* Replace every accent token the palette generator tinted gold with the Holo
   Ice ramp: glacier cyan for text/accent roles, translucent ice for washes,
   deep teal in light mode so text still clears AA on white. */
const ICE_ACCENT_PATCH = {
  '--dsw-alias-bg-document-selection': { light: 'rgba(11, 106, 143, 0.12)', dark: 'rgba(154, 216, 255, 0.16)' },
  '--dsw-alias-brand-primary': { light: '#0B6A8F', dark: '#9AD8FF' },
  '--dsw-alias-brand-primary-new-colorprimary-new-color': { light: '#0B6A8F', dark: '#9AD8FF' },
  '--dsw-alias-brand-text': { light: '#085570', dark: '#A8DFFF' },
  '--dsw-alias-button-info-fill': { light: '#0B6A8F', dark: '#9AD8FF' },
  '--dsw-alias-button-info-hover': { light: '#085570', dark: '#C2E8FF' },
  '--dsw-alias-button-primary-fill': { light: '#0B6A8F', dark: '#9AD8FF' },
  '--dsw-alias-button-primary-hover': { light: '#085570', dark: '#C2E8FF' },
  '--dsw-alias-interactive-bg-active': { light: 'rgba(11, 106, 143, 0.12)', dark: 'rgba(154, 216, 255, 0.16)' },
  '--dsw-alias-interactive-bg-hover': { light: 'rgba(11, 106, 143, 0.08)', dark: 'rgba(154, 216, 255, 0.08)' },
  '--dsw-alias-interactive-bg-hover-accent': { light: 'rgba(11, 106, 143, 0.12)', dark: 'rgba(154, 216, 255, 0.14)' },
  '--dsw-alias-label-deep-diving': { light: '#085570', dark: '#C2E8FF' },
  '--dsw-alias-label-deep-diving-shimmer': { light: 'rgba(11, 106, 143, 0.5)', dark: 'rgba(154, 216, 255, 0.55)' },
  '--dsw-alias-link': { light: '#085570', dark: '#A8DFFF' },
  '--dsw-alias-scrollbar-bg-l1': { light: 'rgba(11, 106, 143, 0.26)', dark: 'rgba(154, 216, 255, 0.22)' },
  '--dsw-alias-scrollbar-bg-l2': { light: 'rgba(11, 106, 143, 0.26)', dark: 'rgba(154, 216, 255, 0.22)' },
  '--dsw-alias-scrollbar-hover-l1': { light: 'rgba(11, 106, 143, 0.44)', dark: 'rgba(154, 216, 255, 0.4)' },
  '--dsw-alias-scrollbar-hover-l2': { light: 'rgba(11, 106, 143, 0.44)', dark: 'rgba(154, 216, 255, 0.4)' },
  '--dsw-alias-state-business-primary': { light: '#0B6A8F', dark: '#9AD8FF' },
  '--dsw-alias-turn-trigger-bg': { light: '#FAFCFE', dark: 'rgba(154, 216, 255, 0.08)' },
  '--dsw-alias-turn-trigger-bg-hover': { light: 'rgba(11, 106, 143, 0.12)', dark: 'rgba(154, 216, 255, 0.14)' },
  '--dsw-static-blue-450': { light: '#0B6A8F', dark: '#7CC8F0' },
  '--dsw-static-blue-500': { light: '#0B6A8F', dark: '#9AD8FF' },
  '--dsw-static-deepseek-400': { light: '#0B6A8F', dark: '#C2E8FF' },
  '--dsw-static-deepseek-450': { light: '#085570', dark: '#A8DFFF' },
  '--dsw-static-deepseek-500': { light: '#0B6A8F', dark: '#9AD8FF' },
  '--dsw-specific-sidebar-nav-item-active': { light: 'rgba(11, 106, 143, 0.1)', dark: 'rgba(154, 216, 255, 0.14)' },
  '--dsw-specific-sidebar-nav-item-active-accent': { light: 'rgba(11, 106, 143, 0.14)', dark: 'rgba(154, 216, 255, 0.2)' },
  '--dsw-specific-bubble-highlight': { light: 'rgba(11, 106, 143, 0.1)', dark: 'rgba(154, 216, 255, 0.14)' },
  '--dsw-specific-selector': { light: 'rgba(11, 106, 143, 0.1)', dark: 'rgba(154, 216, 255, 0.14)' },
};
for (const [name, pair] of Object.entries(ICE_ACCENT_PATCH)) {
  if (tokenMap[name] === undefined) throw new Error(`ICE_ACCENT_PATCH names an unknown token: ${name}`);
  tokenMap[name] = { ...tokenMap[name], light: pair.light, dark: pair.dark };
}

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


