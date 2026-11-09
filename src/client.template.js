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

    const TOKENS = __TOKENS__;
    const THEME_CSS = __THEME_CSS__;

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

