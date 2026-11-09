/* J.A.R.V.I.S. boot overlay controller — injected as an index <script> row by the
   Host half. Decides whether to play (localStorage policy), arms the overlay,
   drives the progress counter, waits for the app shell, then fades out.
   Any failure must leave the app boot untouched and must never cover the app
   indefinitely (bail-out + watchdog). */
(function () {
  var DURATION = 4200;
  var MAX_WAIT = 8200;
  var WATCHDOG = 12000;
  var KEY_ENABLED = 'dsh.jarvis.enabled';
  var KEY_BOOT = 'dsh.jarvis.boot';
  var KEY_LAST = 'dsh.jarvis.boot.last';
  var KEY_PLAYED = 'dsh.jarvis.boot.played';
  var KEY_REPLAY = 'dsh.jarvis.boot.replay';
  var KEY_PACE = 'dsh.jarvis.boot.pace';
  var PACE_RATES = { fast: 1.15, normal: 0.9, slow: 0.7 };

  function read(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  }
  function write(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (error) { /* storage unavailable: policy falls back to the defaults */ }
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  var root = document.getElementById('dsh-jarvis-boot');
  if (!root) return;

  var replay = read(KEY_REPLAY) === '1';
  if (replay) write(KEY_REPLAY, null);
  var enabled = read(KEY_ENABLED) !== '0';
  var mode = read(KEY_BOOT) || 'always';
  var play = false;
  if (enabled) {
    if (replay || mode === 'always') play = true;
    else if (mode === 'daily') play = read(KEY_LAST) !== today();
    else if (mode === 'once') play = read(KEY_PLAYED) !== '1';
  }
  if (!play) {
    if (root.parentNode) root.parentNode.removeChild(root);
    return;
  }
  write(KEY_LAST, today());
  write(KEY_PLAYED, '1');

  var rate = PACE_RATES[read(KEY_PACE) || 'normal'] || PACE_RATES.normal;
  var watchdog = window.setTimeout(function () { hideNow(); }, WATCHDOG / rate);

  function hideNow() {
    try {
      window.clearTimeout(watchdog);
      if (root.parentNode) root.parentNode.removeChild(root);
    } catch (error) { /* nothing left to hide */ }
  }

  try {
    var scheme = document.documentElement.style.colorScheme;
    var dark = scheme === 'dark'
      || (scheme !== 'light' && document.body.hasAttribute('data-ds-dark-theme'))
      || (scheme === '' && !document.body.hasAttribute('data-ds-dark-theme')
        && !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));
    root.setAttribute('data-mode', dark ? 'dark' : 'light');
    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (reduced) root.setAttribute('data-reduced', '1');
    if ((navigator.hardwareConcurrency || 8) <= 4) root.setAttribute('data-lite', '1');
    root.style.display = 'flex';

    /* One playback rate scales every declared animation and its delay, so the
       stored pace needs no duplicated timelines. */
    requestAnimationFrame(function () {
      try {
        var animations = root.getAnimations({ subtree: true });
        for (var index = 0; index < animations.length; index += 1) {
          animations[index].playbackRate = rate;
        }
      } catch (error) { /* older engines keep the default pace */ }
    });

    var started = performance.now();
    var finished = false;
    var pct = root.querySelector('.jv-pct');
    var probe = 0;
    var budget = reduced ? 900 : DURATION / rate;

    function finish() {
      if (finished) return;
      finished = true;
      try { window.clearInterval(probe); } catch (error) { /* already stopped */ }
      root.setAttribute('data-state', 'out');
      root.setAttribute('aria-hidden', 'true');
      window.setTimeout(function () { hideNow(); }, 430);
    }

    function skip() { finish(); }
    root.addEventListener('pointerdown', skip, { passive: true });
    window.addEventListener('keydown', skip, true);
    root.addEventListener('contextmenu', function (event) { event.preventDefault(); });

    probe = window.setInterval(function () {
      var mount = document.getElementById('root');
      if (mount && mount.childElementCount > 0) window.clearInterval(probe);
    }, 120);

    function drawProgress(now) {
      var t = Math.min(1, Math.max(0, (now - started) / budget));
      if (pct) {
        var value = Math.round(t * 100);
        pct.textContent = (value < 10 ? '0' : '') + value + '%';
      }
      if (t < 1 && !finished) requestAnimationFrame(drawProgress);
    }
    requestAnimationFrame(drawProgress);

    function waitForShell(deadline) {
      if (finished) return;
      var mount = document.getElementById('root');
      if (mount && mount.childElementCount > 0) {
        window.clearInterval(probe);
        window.setTimeout(finish, 220);
        return;
      }
      if (performance.now() >= deadline) {
        window.clearInterval(probe);
        window.setTimeout(finish, 220);
        return;
      }
      window.setTimeout(function () { waitForShell(deadline); }, 140);
    }

    window.setTimeout(function () {
      if (!reduced) {
        if (pct) pct.textContent = '100%';
        root.setAttribute('data-complete', '1');
      }
      waitForShell(started + MAX_WAIT / rate);
    }, budget);

    window.__dshJarvisBoot = Object.freeze({
      finish: finish,
      state: function () { return root.isConnected ? root.getAttribute('data-state') : 'removed'; },
      startedAt: started,
    });
  } catch (error) {
    if (window.console) console.error('[jarvis-theme] boot overlay', error);
    hideNow();
  }
})();
