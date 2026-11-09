/* J.A.R.V.I.S. HUD — client half of the bundle.
   Owns the token override layer, the material stylesheet, the brand artwork and
   the "Jarvis HUD" settings row. The boot sequence itself is injected by the
   Host half; both halves share the localStorage policy keys below. */
window.__ModuleLoader__.load({
  id: '@local/jarvis-theme',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    let ReactDOM = null;
    try { ReactDOM = require('react-dom'); } catch (error) { /* overlay degrades to nothing */ }

    const TOKENS = {"--dsw-alias-bg-base":{"light":"#EEF3F8","dark":"#060B12"},"--dsw-alias-bg-document-preview":{"light":"#EDF3F9","dark":"#0A121B"},"--dsw-alias-bg-document-selection":{"light":"rgba(10,138,166,0.18)","dark":"rgba(56,225,255,0.18)"},"--dsw-alias-bg-layer-1":{"light":"#FFFFFF","dark":"#0A121B"},"--dsw-alias-bg-layer-2":{"light":"#F7FAFD","dark":"#0E1822"},"--dsw-alias-bg-layer-3":{"light":"#EDF3F9","dark":"#132130"},"--dsw-alias-bg-mask-1":{"light":"rgba(3, 6, 10, 0.24)","dark":"rgba(3, 6, 10, 0.5)"},"--dsw-alias-bg-mask-2":{"light":"rgba(3, 6, 10, 0.12)","dark":"rgba(3, 6, 10, 0.2)"},"--dsw-alias-bg-mask-3":{"light":"rgba(3, 6, 10, 0.48)","dark":"rgba(3, 6, 10, 0.48)"},"--dsw-alias-bg-mask-drop":{"light":"rgba(231,237,244,0.7)","dark":"rgba(3,6,10,0.7)"},"--dsw-alias-bg-mask-photo":{"light":"rgba(3, 6, 10, 0.88)","dark":"rgba(3, 6, 10, 0.88)"},"--dsw-alias-bg-module-platform":{"light":"#EDF3F9","dark":"#132130"},"--dsw-alias-bg-multi-select":{"light":"#EDF3F9","dark":"#0E1822"},"--dsw-alias-bg-overlay":{"light":"#E7EDF4","dark":"#132130"},"--dsw-alias-bg-skeleton":{"light":"#EDF3F9","dark":"#132130"},"--dsw-alias-border-inverted":{"light":"rgba(0,0,0,0)","dark":"rgba(120,226,255,0.1)"},"--dsw-alias-border-inverted2":{"light":"rgba(0,0,0,0)","dark":"rgba(120,226,255,0.1)"},"--dsw-alias-border-l1":{"light":"rgba(10,138,166,0.14)","dark":"rgba(120,226,255,0.1)"},"--dsw-alias-border-l2":{"light":"rgba(10,138,166,0.2)","dark":"rgba(120,226,255,0.16)"},"--dsw-alias-border-l2-darkmode-thin":{"light":"rgba(10,138,166,0.14)","dark":"rgba(120,226,255,0.1)"},"--dsw-alias-border-l3":{"light":"rgba(10,138,166,0.26)","dark":"rgba(120,226,255,0.22)"},"--dsw-alias-border-l4":{"light":"rgba(10,138,166,0.34)","dark":"rgba(120,226,255,0.3)"},"--dsw-alias-brand-primary":{"light":"#0A8AA6","dark":"#38E1FF"},"--dsw-alias-brand-primary-invert":{"light":"#04141B","dark":"#04141B"},"--dsw-alias-brand-primary-new-colorprimary-new-color":{"light":"#0A8AA6","dark":"#38E1FF"},"--dsw-alias-brand-text":{"light":"#00687D","dark":"#38E1FF"},"--dsw-alias-button-contrast-fill":{"light":"#3C5566","dark":"#EAF7FF"},"--dsw-alias-button-elevated-fill":{"light":"#FFFFFF","dark":"#132130"},"--dsw-alias-button-floating-fill":{"light":"#FFFFFF","dark":"#132130"},"--dsw-alias-button-floating-hover":{"light":"#EDF3F9","dark":"#0E1822"},"--dsw-alias-button-ghost-active-border":{"light":"rgba(10,138,166,0.26)","dark":"rgba(120,226,255,0.22)"},"--dsw-alias-button-ghost-active-fill":{"light":"#EDF3F9","dark":"#132130"},"--dsw-alias-button-ghost-active-hover":{"light":"#E7EDF4","dark":"#0E1822"},"--dsw-alias-button-info-fill":{"light":"#0A8AA6","dark":"#38E1FF"},"--dsw-alias-button-info-hover":{"light":"#0F7F97","dark":"#6BEDFF"},"--dsw-alias-button-primary-dimmed":{"light":"#EDF3F9","dark":"#0E1822"},"--dsw-alias-button-primary-fill":{"light":"#0A8AA6","dark":"#38E1FF"},"--dsw-alias-button-primary-hover":{"light":"#0F7F97","dark":"#6BEDFF"},"--dsw-alias-button-tool-bar-fill":{"light":"rgba(255,255,255,0.5)","dark":"rgba(14,24,34,0.5)"},"--dsw-alias-button-tool-bar-fill-invisible":{"light":"rgba(255,255,255,0.36)","dark":"rgba(14,24,34,0.36)"},"--dsw-alias-button-tool-bar-hover":{"light":"rgba(255,255,255,0.6)","dark":"rgba(14,24,34,0.6)"},"--dsw-alias-code-diff-added":{"light":"rgba(11,110,79,0.08)","dark":"rgba(46,230,168,0.12)"},"--dsw-alias-code-diff-deleted":{"light":"rgba(179,38,30,0.08)","dark":"rgba(255,77,94,0.12)"},"--dsw-alias-file-diff-added-bg":{"light":"rgba(11,110,79,0.1)","dark":"rgba(46,230,168,0.12)"},"--dsw-alias-file-diff-added-gutter":{"light":"rgba(11,110,79,0.06)","dark":"rgba(46,230,168,0.06)"},"--dsw-alias-file-diff-added-marker":{"light":"#0B6E4F","dark":"#2EE6A8"},"--dsw-alias-file-diff-deleted-bg":{"light":"rgba(179,38,30,0.1)","dark":"rgba(255,77,94,0.12)"},"--dsw-alias-file-diff-deleted-gutter":{"light":"rgba(179,38,30,0.06)","dark":"rgba(255,77,94,0.06)"},"--dsw-alias-file-diff-deleted-marker":{"light":"#B3261E","dark":"#FF4D5E"},"--dsw-alias-illustration-background":{"light":"#F7FAFD","dark":"#0A121B"},"--dsw-alias-illustration-backing":{"light":"#A8C2D4","dark":"#7E97A8"},"--dsw-alias-illustration-detail":{"light":"#4F6776","dark":"#A8C2D4"},"--dsw-alias-illustration-inset":{"light":"#EDF3F9","dark":"#132130"},"--dsw-alias-illustration-shadow":{"light":"#EDF3F9","dark":"#132130"},"--dsw-alias-illustration-surface":{"light":"#EDF3F9","dark":"#132130"},"--dsw-alias-interactive-bg-active":{"light":"rgba(10,138,166,0.14)","dark":"rgba(56,225,255,0.14)"},"--dsw-alias-interactive-bg-hover":{"light":"rgba(10,138,166,0.08)","dark":"rgba(56,225,255,0.08)"},"--dsw-alias-interactive-bg-hover-accent":{"light":"rgba(10,138,166,0.14)","dark":"rgba(56,225,255,0.14)"},"--dsw-alias-interactive-bg-hover-danger":{"light":"rgba(179,38,30,0.08)","dark":"rgba(255,77,94,0.14)"},"--dsw-alias-interactive-bg-hover-solid":{"light":"#EDF3F9","dark":"#0E1822"},"--dsw-alias-label-caption":{"light":"#4F6776","dark":"#7E97A8"},"--dsw-alias-label-deep-diving":{"light":"#00687D","dark":"#6BEDFF"},"--dsw-alias-label-deep-diving-shimmer":{"light":"rgba(0,104,125,0.55)","dark":"rgba(107,237,255,0.55)"},"--dsw-alias-label-dimmed":{"light":"rgba(60,85,102,0.55)","dark":"rgba(126,151,168,0.55)"},"--dsw-alias-label-document-preview":{"light":"#3C5566","dark":"#A8C2D4"},"--dsw-alias-label-primary":{"light":"#0B1C26","dark":"#EAF7FF"},"--dsw-alias-label-primary-bluish":{"light":"#00687D","dark":"#EAF7FF"},"--dsw-alias-label-primary-dimmed":{"light":"#0B1C26","dark":"#EAF7FF"},"--dsw-alias-label-primary-foreground":{"light":"#FFFFFF","dark":"#04141B"},"--dsw-alias-label-primary-inverted":{"light":"#FFFFFF","dark":"#04141B"},"--dsw-alias-label-secondary":{"light":"#3C5566","dark":"#A8C2D4"},"--dsw-alias-label-shimmer":{"light":"rgba(11,28,38,0.3)","dark":"rgba(234,247,255,0.45)"},"--dsw-alias-label-tertiary":{"light":"#4F6776","dark":"#7E97A8"},"--dsw-alias-link":{"light":"#00687D","dark":"#38E1FF"},"--dsw-alias-markdown-citation":{"light":"#EDF3F9","dark":"#0E1822"},"--dsw-alias-markdown-code-block":{"light":"#F7FAFD","dark":"#0A121B"},"--dsw-alias-markdown-code-block-banner":{"light":"#F7FAFD","dark":"#0E1822"},"--dsw-alias-markdown-code-segment-selected":{"light":"#FFFFFF","dark":"#0E1822"},"--dsw-alias-markdown-code-segment-unselected":{"light":"#EDF3F9","dark":"#0A121B"},"--dsw-alias-markdown-inline-code":{"light":"#F7FAFD","dark":"#0E1822"},"--dsw-alias-markdown-placeholder":{"light":"#F7FAFD","dark":"#0E1822"},"--dsw-alias-markdown-tag":{"light":"#EDF3F9","dark":"#0E1822"},"--dsw-alias-menu-group-header-fill":{"light":"rgba(255,255,255,0.94)","dark":"rgba(14,24,34,0.94)"},"--dsw-alias-menu-icon":{"light":"#3C5566","dark":"#EAF7FF"},"--dsw-alias-scrollbar-bg-l1":{"light":"rgba(10, 138, 166, 0.28)","dark":"rgba(120, 226, 255, 0.24)"},"--dsw-alias-scrollbar-bg-l2":{"light":"rgba(10, 138, 166, 0.28)","dark":"rgba(120, 226, 255, 0.24)"},"--dsw-alias-scrollbar-hover-l1":{"light":"rgba(10, 138, 166, 0.44)","dark":"rgba(120, 226, 255, 0.4)"},"--dsw-alias-scrollbar-hover-l2":{"light":"rgba(10, 138, 166, 0.44)","dark":"rgba(120, 226, 255, 0.4)"},"--dsw-alias-state-business-primary":{"light":"#0A8AA6","dark":"#38E1FF"},"--dsw-alias-state-business-tertiary":{"light":"#E7EDF4","dark":"#132130"},"--dsw-alias-state-done-primary":{"light":"#0B6E4F","dark":"#2EE6A8"},"--dsw-alias-state-error-primary":{"light":"#B3261E","dark":"#FF4D5E"},"--dsw-alias-state-error-secondary":{"light":"#B3261E","dark":"#FF4D5E"},"--dsw-alias-state-idle-primary":{"light":"#4F6776","dark":"#7E97A8"},"--dsw-alias-state-success-primary":{"light":"#0B6E4F","dark":"#2EE6A8"},"--dsw-alias-state-success-secondary":{"light":"#0B6E4F","dark":"#2EE6A8"},"--dsw-alias-state-success-tertiary":{"light":"rgba(11,110,79,0.1)","dark":"rgba(46,230,168,0.12)"},"--dsw-alias-state-warn-label":{"light":"#8A5300","dark":"#FFB020"},"--dsw-alias-state-warn-primary":{"light":"#8A5300","dark":"#FFB020"},"--dsw-alias-state-warn-secondary":{"light":"#7A4A00","dark":"#FFD166"},"--dsw-alias-state-warn-tertiary":{"light":"rgba(138,83,0,0.1)","dark":"rgba(255,176,32,0.12)"},"--dsw-alias-switch-thumb":{"light":"#FFFFFF","dark":"#EAF7FF"},"--dsw-alias-toast-bg":{"light":"#0A121B","dark":"#132130"},"--dsw-alias-toast-label":{"light":"#FFFFFF","dark":"#EAF7FF"},"--dsw-alias-tooltip-bg":{"light":"#0A121B","dark":"#132130"},"--dsw-alias-tooltip-key-bg":{"light":"#36414A","dark":"#3D4856"},"--dsw-alias-turn-trigger-bg":{"light":"#F7FAFD","dark":"rgba(56,225,255,0.08)"},"--dsw-alias-turn-trigger-bg-hover":{"light":"rgba(10,138,166,0.14)","dark":"rgba(56,225,255,0.14)"},"--dsw-static-amber-400":{"light":"#7A4A00","dark":"#FFD166"},"--dsw-static-amber-500":{"light":"#8A5300","dark":"#FFB020"},"--dsw-static-blue-450":{"light":"#0A8AA6","dark":"#38E1FF"},"--dsw-static-blue-500":{"light":"#0A8AA6","dark":"#38E1FF"},"--dsw-static-deepseek-400":{"light":"#0A8AA6","dark":"#38E1FF"},"--dsw-static-deepseek-450":{"light":"#0A8AA6","dark":"#38E1FF"},"--dsw-static-deepseek-500":{"light":"#0A8AA6","dark":"#38E1FF"},"--dsw-static-green-500":{"light":"#0B6E4F","dark":"#2EE6A8"},"--dsw-static-neutral-00":{"light":"#FFFFFF","dark":"#EAF7FF"},"--dsw-static-neutral-100":{"light":"#EEF3F8","dark":"#EAF7FF"},"--dsw-static-neutral-200":{"light":"#E7EDF4","dark":"#EAF7FF"},"--dsw-static-neutral-50":{"light":"#F7FAFD","dark":"#EAF7FF"},"--dsw-static-neutral-700":{"light":"#0B1C26","dark":"#132130"},"--dsw-static-neutral-800":{"light":"#0B1C26","dark":"#132130"},"--dsw-static-neutral-850":{"light":"#0B1C26","dark":"#132130"},"--dsw-static-neutral-bluish-00":{"light":"#FFFFFF","dark":"#EAF7FF"},"--dsw-static-neutral-bluish-300":{"light":"#A8C2D4","dark":"#A8C2D4"},"--dsw-static-neutral-bluish-400":{"light":"#A8C2D4","dark":"#A8C2D4"},"--dsw-static-red-600":{"light":"#B3261E","dark":"#FF4D5E"},"--dsw-specific-sidebar-fill":{"light":"#F5F9FC","dark":"#0A121B"},"--dsw-specific-sidebar-nav-item-active":{"light":"rgba(10, 138, 166, 0.10)","dark":"rgba(56, 225, 255, 0.14)"},"--dsw-specific-sidebar-nav-item-active-accent":{"light":"rgba(10, 138, 166, 0.14)","dark":"rgba(56, 225, 255, 0.18)"},"--dsw-specific-bubble":{"light":"#E8F4F8","dark":"#132130"},"--dsw-specific-bubble-highlight":{"light":"rgba(10, 138, 166, 0.12)","dark":"rgba(56, 225, 255, 0.18)"},"--dsw-specific-input-major":{"light":"#FFFFFF","dark":"#0E1822"},"--dsw-specific-login-input":{"light":"#FFFFFF","dark":"#0A121B"},"--dsw-specific-menu":{"light":"rgba(255, 255, 255, 0.94)","dark":"rgba(14, 24, 34, 0.94)"},"--dsw-specific-selector":{"light":"rgba(10, 138, 166, 0.12)","dark":"rgba(56, 225, 255, 0.16)"},"--dsw-specific-tip":{"light":"#EDF3F9","dark":"#132130"},"--dsw-menu-surface-fill":{"light":"rgba(255, 255, 255, 0.7)","dark":"rgba(14, 24, 34, 0.64)"}};
    const THEME_CSS = "/* J.A.R.V.I.S. HUD skin — client-injected stylesheet.\n   Material and typography rules are scoped to body[data-dsh-jarvis]; the\n   settings row and brand artwork use host tokens and stay available while the\n   skin is switched off. */\n\n/* ---------- typography + material layer ---------- */\n\nbody[data-dsh-jarvis] {\n  --dsh-font-family-text: 'Jarvis Rajdhani', 'Microsoft YaHei', 'PingFang SC',\n    -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n  --jv-display-family: 'Jarvis Orbitron', 'Jarvis Rajdhani', 'Microsoft YaHei', sans-serif;\n\n  /* tighter HUD geometry */\n  --dsw-radius-xs: 3px;\n  --dsw-radius-sm: 5px;\n  --dsw-radius-md: 7px;\n  --dsw-radius-lg: 9px;\n  --dsw-radius-xl: 11px;\n  --dsw-radius-panel: 14px;\n}\n\n/* 1px luminous stroke instead of the 0.25px hairline; values are redeclared per\n   element so surfaces can keep re-binding --dsw-elevation-stroke-color.\n   The hover-card surface is declared locally by the primitive as #2C2C2E; a\n   per-element reset keeps that always-dark card on the HUD navy in both\n   schemes (its literal light-gray labels assume a dark card). */\nbody[data-dsh-jarvis],\nbody[data-dsh-jarvis] * {\n  --dsw-elevation-stroke: 0 0 0 1px var(--dsw-elevation-stroke-color);\n  --dsw-elevation-panel:\n    var(--dsw-elevation-stroke), 0 0 18px -6px var(--jv-glow-soft, rgba(56, 225, 255, 0.16));\n  --dsw-elevation-prominent:\n    var(--dsw-elevation-stroke), 0 6px 22px -10px rgba(0, 0, 0, 0.55),\n    0 0 26px -8px var(--jv-glow-soft, rgba(56, 225, 255, 0.16));\n  --dsw-elevation-soft:\n    var(--dsw-elevation-stroke), 0 0 22px -10px var(--jv-glow-soft, rgba(56, 225, 255, 0.14));\n  --dsw-hovercard-bg: #0e1822;\n}\n\nbody[data-dsh-jarvis]:not([data-ds-dark-theme]) {\n  --jv-glow-soft: rgba(10, 138, 166, 0.12);\n}\n\nbody[data-dsh-jarvis][data-ds-dark-theme] {\n  --jv-glow-soft: rgba(56, 225, 255, 0.18);\n}\n\n/* screen-space grid + static scanlines; never intercepts pointer input */\nbody[data-dsh-jarvis]::after {\n  content: '';\n  position: fixed;\n  inset: 0;\n  z-index: 2147482000;\n  pointer-events: none;\n  background-image:\n    linear-gradient(to right, rgba(56, 225, 255, 0.045) 1px, transparent 1px),\n    linear-gradient(to bottom, rgba(56, 225, 255, 0.045) 1px, transparent 1px),\n    repeating-linear-gradient(to bottom, rgba(56, 225, 255, 0.016) 0 1px, transparent 1px 3px);\n  background-size: 44px 44px, 44px 44px, 100% 3px;\n  -webkit-mask-image: radial-gradient(ellipse 92% 84% at 50% 42%, #000 32%, transparent 100%);\n  mask-image: radial-gradient(ellipse 92% 84% at 50% 42%, #000 32%, transparent 100%);\n}\nbody[data-dsh-jarvis]:not([data-ds-dark-theme])::after {\n  background-image:\n    linear-gradient(to right, rgba(10, 138, 166, 0.05) 1px, transparent 1px),\n    linear-gradient(to bottom, rgba(10, 138, 166, 0.05) 1px, transparent 1px),\n    repeating-linear-gradient(to bottom, rgba(10, 138, 166, 0.02) 0 1px, transparent 1px 3px);\n}\n\nbody[data-dsh-jarvis] ::selection {\n  background: rgba(56, 225, 255, 0.26);\n  color: var(--dsw-alias-label-primary);\n}\nbody[data-dsh-jarvis]:not([data-ds-dark-theme]) ::selection {\n  background: rgba(10, 138, 166, 0.22);\n}\n\n/* HUD-adjacent chrome that reads only literals keeps the skin's line language */\nbody[data-dsh-jarvis] [data-menu-material] {\n  border-color: var(--dsw-alias-border-l2);\n}\n\n@media (prefers-contrast: more) {\n  body[data-dsh-jarvis]::after { display: none; }\n  body[data-dsh-jarvis],\n  body[data-dsh-jarvis] * {\n    --dsw-elevation-panel: var(--dsw-elevation-stroke);\n    --dsw-elevation-prominent: var(--dsw-elevation-stroke);\n    --dsw-elevation-soft: var(--dsw-elevation-stroke);\n  }\n}\n\n/* ---------- settings row ---------- */\n\n.jv-row {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  padding: 16px 0;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n}\n.jv-row-main {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 24px;\n}\n.jv-title {\n  font-size: 14px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-primary);\n}\n.jv-desc {\n  margin-top: 4px;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n}\n.jv-controls {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n\n.jv-switch {\n  position: relative;\n  flex: none;\n  width: 40px;\n  height: 22px;\n  padding: 0;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 11px;\n  background: var(--dsw-alias-bg-layer-2);\n  cursor: pointer;\n  transition: background-color 0.18s ease, border-color 0.18s ease;\n}\n.jv-switch[aria-checked='true'] {\n  border-color: var(--dsw-alias-brand-primary);\n  background: var(--dsw-alias-brand-primary);\n}\n.jv-switch:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: 2px;\n}\n.jv-knob {\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  background: var(--dsw-alias-label-secondary);\n  transition: transform 0.18s ease, background-color 0.18s ease;\n}\n.jv-switch[aria-checked='true'] .jv-knob {\n  transform: translateX(18px);\n  background: var(--dsw-alias-bg-base);\n}\n\n.jv-pill,\n.jv-btn {\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  padding: 4px 10px;\n  border-radius: 6px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n  transition: color 0.16s ease, border-color 0.16s ease;\n}\n.jv-pill:hover,\n.jv-btn:hover {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-border-l2);\n}\n.jv-pill[data-active='true'] {\n  color: var(--dsw-alias-brand-primary);\n  border-color: var(--dsw-alias-brand-primary);\n}\n.jv-pill:focus-visible,\n.jv-btn:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: 2px;\n}\n.jv-hint {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n}\n\n/* ---------- thinking scan ---------- */\n\nbody[data-dsh-jarvis] .jv-scan {\n  position: fixed;\n  inset: 0;\n  z-index: 2147482500;\n  pointer-events: none;\n  overflow: hidden;\n}\nbody[data-dsh-jarvis] .jv-scan-line {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  height: 2px;\n  opacity: 0;\n  background: linear-gradient(\n    90deg,\n    transparent,\n    color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent) 18%,\n    color-mix(in srgb, var(--dsw-alias-brand-primary) 85%, transparent) 50%,\n    color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent) 82%,\n    transparent\n  );\n  box-shadow: 0 0 18px color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, transparent);\n  animation: jv-scan-sweep 3.6s linear infinite;\n}\n@keyframes jv-scan-sweep {\n  0% { transform: translateY(-2vh); opacity: 0; }\n  8% { opacity: 0.55; }\n  92% { opacity: 0.55; }\n  100% { transform: translateY(102vh); opacity: 0; }\n}\nbody[data-dsh-jarvis] .jv-scan-top {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 1px;\n  background: linear-gradient(\n    90deg,\n    transparent,\n    color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, transparent),\n    transparent\n  );\n  animation: jv-scan-pulse 1.8s ease-in-out infinite;\n}\n@keyframes jv-scan-pulse {\n  0%, 100% { opacity: 0.15; }\n  50% { opacity: 0.5; }\n}\n@media (prefers-reduced-motion: reduce) {\n  body[data-dsh-jarvis] .jv-scan-line { display: none; }\n  body[data-dsh-jarvis] .jv-scan-top { animation: none; opacity: 0.35; }\n}\n\n/* ---------- brand artwork ---------- */\n\n.jv-brand-mark,\n.jv-hero-mark {\n  display: inline-flex;\n  color: var(--dsw-alias-brand-primary);\n}\n.jv-hero-mark {\n  filter: drop-shadow(0 0 16px var(--dsw-alias-brand-primary));\n}\nbody:not([data-ds-dark-theme]) .jv-hero-mark {\n  filter: drop-shadow(0 0 10px rgba(10, 138, 166, 0.35));\n}\n.jv-brand-spin {\n  transform-origin: center;\n  animation: jv-brand-spin 48s linear infinite;\n}\n.jv-brand-pulse {\n  transform-origin: center;\n  animation: jv-brand-pulse 3.6s ease-in-out infinite;\n}\n@keyframes jv-brand-spin {\n  to { transform: rotate(360deg); }\n}\n@keyframes jv-brand-pulse {\n  0%, 100% { opacity: 0.55; }\n  50% { opacity: 1; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .jv-brand-spin,\n  .jv-brand-pulse { animation: none; }\n}\n\n.jv-brand-name {\n  display: inline-flex;\n  align-items: center;\n  gap: 7px;\n  font-family: 'Jarvis Orbitron', 'Microsoft YaHei', sans-serif;\n  font-weight: 600;\n  font-size: 12.5px;\n  line-height: 1;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n  color: var(--dsw-alias-brand-primary);\n  white-space: nowrap;\n}\n.jv-brand-name small {\n  font-family: 'Jarvis Rajdhani', 'Microsoft YaHei', sans-serif;\n  font-size: 9px;\n  letter-spacing: 0.18em;\n  color: var(--dsw-alias-label-secondary);\n}\n";

    const KEY = {
      enabled: 'dsh.jarvis.enabled',
      boot: 'dsh.jarvis.boot',
      last: 'dsh.jarvis.boot.last',
      played: 'dsh.jarvis.boot.played',
      replay: 'dsh.jarvis.boot.replay',
      pace: 'dsh.jarvis.boot.pace',
    };
    const BOOT_MODES = ['always', 'daily', 'once', 'off'];
    const PACES = ['fast', 'normal', 'slow'];

    const DICT = {
      en: {
        'row.title': 'Jarvis HUD',
        'row.desc': 'Naval-blue and arc-cyan skin with an arc-reactor boot sequence.',
        'row.theme': 'Skin',
        'row.boot': 'Boot sequence',
        'row.mode.always': 'Every launch',
        'row.mode.daily': 'Daily',
        'row.mode.once': 'First time',
        'row.mode.off': 'Off',
        'row.replay': 'Replay',
        'row.pace': 'Pace',
        'row.pace.fast': 'Fast',
        'row.pace.normal': 'Standard',
        'row.pace.slow': 'Slow',
        'row.note': 'The boot sequence plays on the next application launch.',
      },
      zh: {
        'row.title': 'Jarvis 界面',
        'row.desc': '深海军蓝 + 电弧青的科技风皮肤，附电弧反应堆启动动画。',
        'row.theme': '皮肤',
        'row.boot': '启动动画',
        'row.mode.always': '每次启动',
        'row.mode.daily': '每天首次',
        'row.mode.once': '仅首次',
        'row.mode.off': '关闭',
        'row.replay': '重播',
        'row.pace': '节奏',
        'row.pace.fast': '快',
        'row.pace.normal': '标准',
        'row.pace.slow': '慢',
        'row.note': '启动动画将在下次打开应用时播放。',
      },
    };

    function read(key) {
      try { return localStorage.getItem(key); } catch (error) { return null; }
    }
    function write(key, value) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch (error) { /* storage unavailable: keep the in-memory behaviour */ }
    }
    function readEnabled() { return read(KEY.enabled) !== '0'; }
    function readBoot() {
      const mode = read(KEY.boot);
      return BOOT_MODES.indexOf(mode) >= 0 ? mode : 'always';
    }
    function readPace() {
      const pace = read(KEY.pace);
      return PACES.indexOf(pace) >= 0 ? pace : 'normal';
    }

    function Reactor({ size }) {
      const coils = [];
      for (let index = 0; index < 6; index += 1) {
        coils.push(h('g', { key: index, transform: `rotate(${index * 60} 20 20)` },
          h('rect', { x: 18.4, y: 2.6, width: 3.2, height: 3.6, rx: 0.9 })));
      }
      return h('svg', {
        viewBox: '0 0 40 40', width: size, height: size, fill: 'currentColor',
        role: 'img', 'aria-label': 'J.A.R.V.I.S.',
      },
      h('g', { className: 'jv-brand-spin', fill: 'none', stroke: 'currentColor' },
        h('circle', { cx: 20, cy: 20, r: 17.2, strokeWidth: 1.3, strokeOpacity: 0.55 }),
        h('circle', { cx: 20, cy: 20, r: 13.2, strokeWidth: 1, strokeDasharray: '2.4 2.2', strokeOpacity: 0.9 })),
      h('g', { className: 'jv-brand-pulse' },
        coils,
        h('circle', { cx: 20, cy: 20, r: 4.2 }),
        h('circle', { cx: 20, cy: 20, r: 1.6, fillOpacity: 0.35, fill: '#ffffff' })));
    }

    function SidebarMark({ size }) {
      return h('span', { className: 'jv-brand-mark' }, h(Reactor, { size: size || 24 }));
    }

    function SidebarName() {
      return h('span', { className: 'jv-brand-name' }, 'J.A.R.V.I.S.', h('small', null, 'MK VII'));
    }

    function HeroMark({ size, className }) {
      return h('span', { className: className ? className + ' jv-hero-mark' : 'jv-hero-mark' },
        h(Reactor, { size: size || 34 }));
    }

    function Switch({ checked, label, onChange }) {
      return h('button', {
        type: 'button', className: 'jv-switch', role: 'switch',
        'aria-checked': checked, 'aria-label': label,
        onClick: () => { onChange(!checked); },
      }, h('span', { className: 'jv-knob' }));
    }

    /* A scan line sweeps the viewport only while the bound Session is running.
       It portals to body so the docked composer cannot clip it. */
    function ThinkingScan({ useSession }) {
      const running = typeof useSession === 'function'
        ? useSession((snapshot) => snapshot.running === true)
        : false;
      if (ReactDOM === null || !running || typeof document === 'undefined') return null;
      if (!document.body.hasAttribute('data-dsh-jarvis')) return null;
      return ReactDOM.createPortal(
        h('div', { className: 'jv-scan', 'aria-hidden': 'true' },
          h('div', { className: 'jv-scan-top' }),
          h('div', { className: 'jv-scan-line' })),
        document.body,
      );
    }

    function SettingsRow(props) {
      const [enabled, setEnabled] = React.useState(() => props.getEnabled());
      const [boot, setBoot] = React.useState(() => props.getBoot());
      const [pace, setPace] = React.useState(() => props.getPace());
      const t = typeof props.t === 'function' ? props.t : (key) => DICT.en[key] || key;
      function toggle(next) {
        setEnabled(next);
        props.setEnabled(next);
      }
      function pick(mode) {
        setBoot(mode);
        props.setBoot(mode);
      }
      function pickPace(next) {
        setPace(next);
        props.setPace(next);
      }
      const pills = BOOT_MODES.map((mode) => h('button', {
        key: mode, type: 'button', className: 'jv-pill',
        'data-active': boot === mode ? 'true' : 'false',
        'aria-pressed': boot === mode,
        onClick: () => { pick(mode); },
      }, t('row.mode.' + mode)));
      const pacePills = PACES.map((value) => h('button', {
        key: value, type: 'button', className: 'jv-pill',
        'data-active': pace === value ? 'true' : 'false',
        'aria-pressed': pace === value,
        onClick: () => { pickPace(value); },
      }, t('row.pace.' + value)));
      return h('div', { className: 'jv-row' },
        h('div', { className: 'jv-row-main' },
          h('div', null,
            h('div', { className: 'jv-title' }, t('row.title')),
            h('div', { className: 'jv-desc' }, t('row.desc'))),
          h(Switch, { checked: enabled, label: t('row.theme'), onChange: toggle })),
        h('div', {
          className: 'jv-controls',
          style: { opacity: enabled ? 1 : 0.45 },
        },
        h('span', { className: 'jv-hint' }, t('row.boot') + ':' ),
        pills,
        h('span', { className: 'jv-hint' }, t('row.pace') + ':' ),
        pacePills,
        h('button', {
          type: 'button', className: 'jv-btn', disabled: !enabled,
          onClick: () => { props.replay(); },
        }, t('row.replay'))),
        h('div', { className: 'jv-hint' }, t('row.note')));
    }

    function logError(stage, error) {
      try {
        console.error('[jarvis-theme]', stage, error);
      } catch (ignored) { /* logging must never break the plugin */ }
    }

    function apply(ctx) {
      function step(name, run) {
        try {
          return run();
        } catch (error) {
          logError(name, error);
          return undefined;
        }
      }

      step('stylesheet', () => {
        ctx.effect(() => {
          const tag = document.createElement('style');
          tag.dataset.plugin = '@local/jarvis-theme';
          tag.dataset.pluginCss = '@local/jarvis-theme/theme.css';
          tag.textContent = THEME_CSS;
          document.head.appendChild(tag);
          return () => { tag.remove(); };
        }, 'jarvis-theme: stylesheet');
      });

      step('locale', () => {
        ctx.effect(() => {
          try {
            return ctx.locale.register('jarvis', { en: DICT.en, zh: DICT.zh });
          } catch (error) {
            logError('locale', error);
            return () => {};
          }
        }, 'jarvis-theme: dictionaries');
      });

      let enabled = readEnabled();
      let themeLayerStop = null;
      const brandStops = [];
      let revision = 0;

      function setBodyFlag(on) {
        if (on) document.body.setAttribute('data-dsh-jarvis', '');
        else document.body.removeAttribute('data-dsh-jarvis');
      }

      function syncBrand() {
        while (brandStops.length > 0) {
          const stop = brandStops.pop();
          try { stop(); } catch (error) { /* disposer already released */ }
        }
        if (!enabled) return;
        brandStops.push(ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register({
          name: 'sidebar.brand.mark', priority: -1,
        }, SidebarMark)));
        brandStops.push(ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register({
          name: 'sidebar.brand.name', priority: -1,
        }, SidebarName)));
        brandStops.push(ctx.slots.inject('conversation.hero.brand.mark', () => ctx.slots.register({
          name: 'conversation.hero.brand.mark', priority: -1,
        }, HeroMark)));
      }

      function applySkin(next) {
        enabled = next;
        write(KEY.enabled, next ? '1' : '0');
        setBodyFlag(next);
        if (themeLayerStop !== null) {
          try { themeLayerStop(); } catch (error) { /* layer already replaced */ }
          themeLayerStop = null;
        }
        if (next) themeLayerStop = ctx.theme.overrideTokens('jarvis', TOKENS);
        revision += 1;
        syncBrand();
      }

      step('skin', () => {
        ctx.effect(() => {
          setBodyFlag(enabled);
          if (enabled) themeLayerStop = ctx.theme.overrideTokens('jarvis', TOKENS);
          syncBrand();
          return () => {
            if (themeLayerStop !== null) {
              try { themeLayerStop(); } catch (error) { /* released with the fiber */ }
              themeLayerStop = null;
            }
            while (brandStops.length > 0) {
              const stop = brandStops.pop();
              try { stop(); } catch (error) { /* released with the fiber */ }
            }
            document.body.removeAttribute('data-dsh-jarvis');
          };
        }, 'jarvis-theme: skin layer');
      });

      step('settings', () => {
        ctx.slots.inject('settings.general.item', () => ctx.slots.register({
          name: 'settings.general.item', id: 'jarvis-hud', order: 12, locale: 'jarvis',
          inject: () => ({
            getEnabled: () => enabled,
            setEnabled: (next) => { applySkin(next); },
            getBoot: () => readBoot(),
            setBoot: (mode) => {
              if (BOOT_MODES.indexOf(mode) < 0) return;
              write(KEY.boot, mode);
              revision += 1;
            },
            getPace: () => readPace(),
            setPace: (pace) => {
              if (PACES.indexOf(pace) < 0) return;
              write(KEY.pace, pace);
              revision += 1;
            },
            replay: () => {
              write(KEY.replay, '1');
              location.reload();
            },
          }),
        }, SettingsRow));
      });

      step('scanline', () => {
        if (ReactDOM === null) return;
        ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register({
          name: 'conversation.input.overlay', id: 'jarvis-thinking', order: 40,
        }, ThinkingScan));
      });

      void revision;
    }

    return { inject: ['slots', 'theme', 'locale'], apply: apply };
  },
});

