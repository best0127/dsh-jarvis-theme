# Jarvis HUD

A J.A.R.V.I.S.-style skin and arc-reactor boot sequence for the DeepSeek Harness web client, delivered as a profile bundle.

## 安装

**方式一：Discover（推荐）** — 在 DSH 的 **Plugins → Discover → Index sources** 里添加市场索引 URL：

```
https://cdn.jsdelivr.net/gh/best0127/dsh-jarvis-theme@main/market/index.json
```

然后安装 **Jarvis HUD**；从 Git 安装的副本会在 Discover 里提示新版本。

**方式二：本地目录** — 克隆后作为本地插件包安装（**Plugins → Add plugin**，或让 Agent 用 `plugin_manager` 的 `install_bundle` 指向该目录）：

```sh
gh repo clone best0127/dsh-jarvis-theme
```

皮肤与品牌替换即时生效；启动动画在下次打开应用时播放（每次启动、可点击或按键跳过）。卸载或禁用该 bundle 即恢复原生主题，不会残留样式。

## 版本规则

从 `0.1.0` 起按语义化版本维护：

- **问题修复**：修订号 +1（`0.1.0 → 0.1.1`）
- **功能更新**：次版本号 +1、修订号归零（`0.1.0 → 0.2.0`）
- **不兼容调整**：在 `0.x` 阶段仍按功能更新递增，并在更新日志中明确标注
- 每次发布同步更新 [CHANGELOG.md](CHANGELOG.md)，并打 `v<版本号>` 标签

当前版本：`0.6.2`

## 特性

- **Skin**: 138 design tokens (108 `--dsw-alias-*` + 19 directly consumed `--dsw-static-*` + 11 `--dsw-specific-*` / menu surface tokens) remapped to a charcoal / dark-gold palette in dark (the light scheme is a neutral light-gray variant), plus a material layer (1px luminous strokes, HUD radii, a HUD window bezel with a slow top-edge sweep, Arc-reactor brand marks). Dark-mode reading surfaces follow the official dark theme's separation — base `#161616`, panels `#232323` / `#2C2C2C` / `#353535` — with label contrast at the official level (`#F2F4F5` / `#CFD3D6` / `#9AA1A8`); the UI keeps the system font, so only brand marks and the boot overlay use the display faces.
- **Boot sequence**: a ~4.2s arc-reactor ignition overlay injected into the rendered `index` page by the Host half through `webserver/index-inject`. It appears before the React shell mounts, drives a progress counter, waits for the shell, then fades. Click or any key skips it; a watchdog removes it after 12s no matter what.
- **Settings**: Settings → General → **Jarvis HUD** — skin on/off (live), boot-sequence policy (every launch / daily / first time / off), tempo (fast / standard / slow), and Replay (reloads the page with a one-shot flag).
- **Balance readout**: the signed Platform account's recharge balance (`余额 ¥123.45`, plus any granted bonus `+¥10.00`) renders as the last item of the composer status row, beside the turn, token and context readings. The Host half serves it from `/api/jarvis-theme/balance` over the authenticated connection and never exposes the credential; failures show `--`, a signed-out account shows `未登录`, and the value refreshes every 60 seconds.

## 发布规范（DSH bundle）

一个可发布的 bundle 需要满足：

- `package.json` 声明 `dsh.bundle.patch`（Host 行）与可选的 `dsh.client`（浏览器半），并声明 `engines.dsh` 兼容范围；市场按该范围判断安装资格。
- `locale/en.json`、`locale/zh.json` 提供 `meta.title` / `meta.description`；`meta.description` 写清功能、入口（精确的界面路径）与限制。
- 插件详情页：`meta.detail` 指向 `docs/DETAIL.md`（中文 `docs/DETAIL.zh.md`），文档只包含一行功能图 `![alt](preview.svg)`；图片为 640×300、无文字、自包含 SVG。
- 图标遵守 [artwork 规范](https://github.com/best0127/dsh-jarvis-theme)：`viewBox="0 0 36 36"`、透明背景、扁平几何、无发光/阴影/文字；由 Plugin Manager 负责外框与尺寸。
- `files` 包含全部运行时产物、patch、locale、`docs`、icon、字体；发布前用 `npm pack --dry-run` 检查打包清单。

### 分发渠道

**Git + 插件市场索引（当前采用）**：仓库根部的 `market/index.json` 是格式 1 的市场索引，`scripts/build-market-index.mjs` 从 `package.json`、locale、图标与一个 Git commit 生成它（图标以 32 KiB 以内的内联 data URL 提供，版本指向 commit-pinned 的 Git 源）。发布流程：

```sh
# 1. 改版本号并更新 CHANGELOG
node build.mjs && node scripts/verify.mjs && node scripts/test-splash.mjs
git add -A && git commit -m "发布 vX.Y.Z"
# 2. 用刚提交的 commit 生成索引，再提交索引
node scripts/build-market-index.mjs
git add market/index.json && git commit -m "更新市场索引"
git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin main --tags
```

**npm（暂未启用）**：npm 渠道要求把包名从 `@local/...` 改成可公开的包名（例如 `dsh-jarvis-theme` 或自己的 npm scope），删除 `private` 并登录 npm。改包名会改变已安装副本的身份，需要卸载旧包再安装；同时要把 `client.js` 的模块 id、patch 行名同步改名后重新构建。

## Layout

| Path | Role |
|---|---|
| `index.js` | Host half (built): pushes the splash `style` + `html` + `script` rows on every index render, serves the self-hosted display fonts at `/jarvis-theme/fonts/*`, and answers `GET /api/jarvis-theme/balance` from the signed Platform wallet. |
| `client.js` | Client half (built): applies the token override layer, injects the material stylesheet, registers the brand marks, the settings row and the balance readout. |
| `src/client.template.js`, `src/host.template.js` | Sources for the two built artifacts (markers are replaced by `build.mjs`). |
| `src/splash.{css,html,js}` | Boot overlay styling, markup, and controller. |
| `src/theme.css` | Material, settings-row, and brand-artwork styles (scoped to `body[data-dsh-jarvis]` where it is skin material). |
| `tokens.json` | Generated token map (`aliases` / `statics` / `notes`); `build.mjs` flattens it, applies a small corrections table, and adds the surface tokens in `TOKEN_EXTRA`. |
| `fonts/` | Orbitron + Rajdhani woff2 subsets with their OFL license texts. |
| `docs/` | Plugin detail document (`DETAIL.md`, `DETAIL.zh.md`) and its single feature image (`preview.svg`). |
| `market/index.json` | Format-1 plugin market index listing this bundle with its pinned Git commit. |
| `scripts/verify.mjs`, `scripts/test-splash.mjs`, `scripts/build-market-index.mjs` | Artifact checks, a stubbed splash-controller smoke test, and the market index generator. |

## Build

```sh
node build.mjs
node scripts/verify.mjs
node scripts/test-splash.mjs
```

`build.mjs` inlines `tokens.json`, `src/theme.css`, and `src/splash.*` into the two artifacts and refuses to write a file containing a closing script/style tag sequence. After a release also regenerate the market index and verify the packed file list:

```sh
node scripts/build-market-index.mjs
npm pack --dry-run
```

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
- The market index is Git-sourced; Discover updates those copies from Git, while an npm-published copy would update through npm instead. npm publishing is not configured for this repository yet.
- Visual verification is manual: run the app, inspect the skin in light and dark, restart to see the boot sequence.



