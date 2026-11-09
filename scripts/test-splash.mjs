/* Offline smoke test for the injected splash controller. Run: node scripts/test-splash.mjs
   Stubs the page surface the controller touches, then checks the three exit paths:
   policy-off (removed immediately), user skip, and app-shell timeout. */
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(join(rootDir, 'src', 'splash.js'), 'utf8');

function harness(options) {
  const clock = { now: 0, timers: [], nextId: 1 };
  const store = new Map(Object.entries(options.storage ?? {}));
  const root = {
    attrs: {},
    style: {},
    parentNode: null,
    isConnected: true,
    handlers: {},
    setAttribute(name, value) { this.attrs[name] = String(value); },
    getAttribute(name) { return Object.hasOwn(this.attrs, name) ? this.attrs[name] : null; },
    addEventListener(name, fn) { this.handlers[name] = fn; },
    querySelector() { return { textContent: '' }; },
  };
  const body = { hasAttribute: (name) => name === 'data-ds-dark-theme' && options.dark === true };
  const mount = { childElementCount: options.mountChildren ?? 1 };
  const container = {
    removeChild(child) { child.isConnected = false; root.parentNode = null; this.removed = true; },
  };
  root.parentNode = container;
  const doc = {
    body,
    documentElement: { style: { colorScheme: options.colorScheme ?? 'dark' } },
    getElementById: (id) => (id === 'dsh-jarvis-boot' ? root : id === 'root' ? mount : null),
    addEventListener() {},
  };
  const sandbox = {
    console,
    document: doc,
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => { store.set(key, String(value)); },
      removeItem: (key) => { store.delete(key); },
    },
    navigator: { hardwareConcurrency: 8 },
    performance: { now: () => clock.now },
    requestAnimationFrame(fn) { clock.timers.push({ id: clock.nextId++, at: clock.now + 16, fn }); return clock.nextId; },
    setTimeout(fn, delay) { clock.timers.push({ id: clock.nextId++, at: clock.now + (delay || 0), fn }); return clock.nextId; },
    setInterval(fn, delay) { clock.timers.push({ id: clock.nextId++, at: clock.now + (delay || 0), fn, interval: delay || 16 }); return clock.nextId; },
    clearTimeout() {},
    clearInterval() {},
    matchMedia: () => ({ matches: options.prefersDark === true }),
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.window.addEventListener = () => {};
  vm.createContext(sandbox);

  return {
    sandbox,
    root,
    store,
    container,
    advance(ms) {
      const target = clock.now + ms;
      while (true) {
        const due = clock.timers
          .filter((timer) => timer.at <= target)
          .sort((left, right) => left.at - right.at || left.id - right.id)[0];
        if (due === undefined) break;
        clock.now = due.at;
        if (due.interval) due.at = clock.now + due.interval;
        else clock.timers = clock.timers.filter((timer) => timer !== due);
        due.fn();
      }
      clock.now = target;
    },
    run() { vm.runInContext(source, sandbox, { filename: 'splash.js' }); },
  };
}

const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };

// 1. Policy off: the overlay is removed and never shown.
{
  const bench = harness({ storage: { 'dsh.jarvis.enabled': '0' }, mountChildren: 1 });
  bench.run();
  check(bench.root.style.display === undefined, 'disabled: overlay must not be shown');
  check(bench.root.isConnected === false, 'disabled: overlay must be removed');
}

// 2. Playing, user skips: hidden promptly.
{
  const bench = harness({ storage: { 'dsh.jarvis.enabled': '1' } });
  bench.run();
  check(bench.root.style.display === 'flex', 'playing: overlay must be shown');
  check(bench.root.getAttribute('data-mode') === 'dark', 'playing: dark scheme detected');
  bench.root.handlers.pointerdown();
  bench.advance(600);
  check(bench.root.isConnected === false, 'skip: overlay removed after fade');
}

// 3. Playing, shell never mounts: the wait deadline still ends the splash.
{
  const bench = harness({ storage: { 'dsh.jarvis.enabled': '1', 'dsh.jarvis.boot.pace': 'fast' }, mountChildren: 0 });
  bench.run();
  // fast pace (1.15x) puts the 4.2s timeline at ~3.65s
  bench.advance(3700);
  check(bench.root.getAttribute('data-complete') === '1', 'timeout: animation reached 100%');
  bench.advance(7130);
  bench.advance(600);
  check(bench.root.isConnected === false, 'timeout: overlay removed after wait deadline');
}

// 4. Replay flag forces a play even in "once" mode, and is cleared afterwards.
{
  const bench = harness({
    storage: { 'dsh.jarvis.enabled': '1', 'dsh.jarvis.boot': 'once', 'dsh.jarvis.boot.played': '1', 'dsh.jarvis.boot.replay': '1' },
  });
  bench.run();
  check(bench.root.style.display === 'flex', 'replay: overlay plays');
  check(bench.store.get('dsh.jarvis.boot.replay') === undefined, 'replay: flag cleared');
}

console.log(JSON.stringify({ ok: failures.length === 0, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
