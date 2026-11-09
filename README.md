# Jarvis HUD

A J.A.R.V.I.S.-style skin and arc-reactor boot sequence for the DeepSeek Harness web client, delivered as a profile bundle.

## 安装

1. 克隆仓库到本地任意目录：

   ```sh
   gh repo clone best0127/dsh-jarvis-theme
   ```

2. 把目录作为本地插件包安装到 DSH profile（Plugin Manager 的本地 bundle 安装入口，或让 Agent 使用 `plugin_manager` 的 `install_bundle` 指向该目录）。
3. 皮肤与品牌替换即时生效；启动动画在下次打开应用时播放（每次启动、可点击或按键跳过）。
4. 卸载或禁用该 bundle 即恢复原生主题，不会残留样式。

## 特性

- **Skin**: 138 design tokens (108 `--dsw-alias-*` + 19 directly consumed `--dsw-static-*` + 11 `--dsw-specific-*` / menu surface tokens) remapped to a naval-blue / arc-cyan palette in both light and dark schemes, plus a material layer (1px luminous strokes, HUD radii, screen-space grid + scanlines, Rajdhani UI type, Arc-reactor brand marks).
- **Boot sequence**: a ~4.2s arc-reactor ignition overlay injected into the rendered `index` page by the Host half through `webserver/index-inject`. It appears before the React shell mounts, drives a progress counter, waits for the shell, then fades. Click or any key skips it; a watchdog removes it after 12s no matter what.
- **Settings**: Settings → General → **Jarvis HUD** — skin on/off (live), boot-sequence policy (every launch / daily / first time / off), tempo (fast / standard / slow), and Replay (reloads the page with a one-shot flag).
- **Balance chip**: a small HUD readout in the lower-right corner shows the signed Platform account's recharge balance (`余额 ¥123.45`) plus any granted bonus (`+¥10.00`); the Host half serves it from `/api/jarvis-theme/balance` over the authenticated connection and never exposes the credential. Failures show `--`, a signed-out account shows `未登录`, and the value refreshes every 60 seconds.

## Layout

| Path | Role |
|---|---|
| `index.js` | Host half (built): pushes the splash `style` + `html` + `script` rows on every index render, serves the self-hosted display fonts at `/jarvis-theme/fonts/*`, and answers `GET /api/jarvis-theme/balance` from the signed Platform wallet. |
| `client.js` | Client half (built): applies the token override layer, injects the material stylesheet, registers the brand marks and the settings row. |
| `src/client.template.js`, `src/host.template.js` | Sources for the two built artifacts (markers are replaced by `build.mjs`). |
| `src/splash.{css,html,js}` | Boot overlay styling, markup, and controller. |
| `src/theme.css` | Material, settings-row, and brand-artwork styles (scoped to `body[data-dsh-jarvis]` where it is skin material). |
| `tokens.json` | Generated token map (`aliases` / `statics` / `notes`); `build.mjs` flattens it, applies a small corrections table, and adds the surface tokens in `TOKEN_EXTRA`. |
| `fonts/` | Orbitron + Rajdhani woff2 subsets with their OFL license texts. |
| `scripts/verify.mjs`, `scripts/test-splash.mjs` | Artifact checks and a stubbed splash-controller smoke test. |

## Build

```sh
node build.mjs
node scripts/verify.mjs
node scripts/test-splash.mjs
```

`build.mjs` inlines `tokens.json`, `src/theme.css`, and `src/splash.*` into the two artifacts and refuses to write a file containing a closing script/style tag sequence. Publishing (change `version`, then install the directory) follows the Plugin Manager bundle install path.

## Storage keys

| Key | Meaning |
|---|---|
| `dsh.jarvis.enabled` | `0` disables the skin and the boot sequence; anything else enables them (default on). |
| `dsh.jarvis.boot` | `always` \| `daily` \| `once` \| `off`. |
| `dsh.jarvis.boot.last` | Last local play date used by `daily`. |
| `dsh.jarvis.boot.played` | Set after the first play used by `once`. |
| `dsh.jarvis.boot.replay` | One-shot flag set by the Replay button; consumed on the next page load. |
| `dsh.jarvis.boot.pace` | Boot-sequence tempo: `fast` \| `normal` \| `slow` (default `normal`, 0.9× playback so the sequence runs slightly longer). |

## Known limitations

- The token map targets the 0.2.2 token sheet. A DSH upgrade that renames alias tokens degrades those tokens to the shipped palette; rebuild `tokens.json` from the new `design-platform.css` and re-run the checks.
- The boot overlay is a page-load effect: it plays when the application window loads, not on session switches.
- Visual verification is manual: run the app, inspect the skin in light and dark, restart to see the boot sequence.


