/* Generate the plugin market index (format 1) for this bundle.
   The index is a single JSON file that Discover reads after the user adds its
   URL. It pins one Git commit per version, so regenerate and commit it for
   every release:

     node scripts/build-market-index.mjs [commit]

   Without a commit argument the current HEAD is used. Publishing the file at
   an https URL (for example through jsDelivr or GitHub raw) is enough for
   Discover to install the bundle with `git+<repository>#<commit>`. */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const en = JSON.parse(await readFile(join(root, 'locale', 'en.json'), 'utf8')).meta;
const zh = JSON.parse(await readFile(join(root, 'locale', 'zh.json'), 'utf8')).meta;
const icon = await readFile(join(root, 'icon.svg'));

const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const commit = process.argv[2] ?? git('rev-parse', 'HEAD');
if (!/^[0-9a-f]{40}$/u.test(commit)) throw new Error(`not a full Git commit: ${commit}`);

const enginesDsh = pkg.engines?.dsh;
if (typeof enginesDsh !== 'string' || enginesDsh.trim() === '') {
  throw new Error('package.json must declare engines.dsh for market compatibility');
}
const timestamp = Number(git('show', '-s', '--format=%ct', commit));
if (!Number.isInteger(timestamp) || timestamp < 0) throw new Error(`no commit timestamp for ${commit}`);

const repositoryUrl = String(pkg.repository?.url ?? '').replace(/^git\+/u, '').replace(/\.git$/u, '');
if (!/^https:\/\//u.test(repositoryUrl)) throw new Error('package.json repository.url must be an https URL');
const iconData = `data:image/svg+xml;base64,${icon.toString('base64')}`;
if (icon.length > 32 * 1024) throw new Error('icon exceeds the 32 KiB inline limit');

const index = {
  format: 1,
  title: { en: 'Jarvis HUD', zh: 'Jarvis 界面' },
  description: {
    en: 'Community DSH bundles published by best0127.',
    zh: 'best0127 发布的社区 DSH 插件。',
  },
  plugins: [
    {
      name: pkg.name,
      title: { en: en.title, zh: zh.title },
      description: { en: en.description, zh: zh.description },
      icon: iconData,
      author: 'best0127',
      homepage: pkg.homepage,
      repository: { url: repositoryUrl },
      metadata: { keywords: pkg.keywords ?? [] },
      'dist-tags': { latest: pkg.version },
      versions: [
        {
          version: pkg.version,
          publishTimestamp: timestamp,
          source: { type: 'git', url: repositoryUrl, commit },
          engines: { dsh: enginesDsh },
        },
      ],
    },
  ],
};

const target = join(root, 'market', 'index.json');
await mkdir(dirname(target), { recursive: true });
await writeFile(target, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
console.log(`market/index.json: ${pkg.name} ${pkg.version} -> ${repositoryUrl}#${commit}`);
