import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import config from '../lighthouserc.ts';

// LHCI cannot load .ts configs. Pass a temporary JSON copy to its normal CLI;
// inherited stdio and exit status preserve the existing local and CI behaviour.
const require = createRequire(import.meta.url);
const directory = mkdtempSync(join(tmpdir(), 'web-a11y-lighthouse-'));
try {
  const configPath = join(directory, 'lighthouserc.json');
  writeFileSync(configPath, JSON.stringify(config));
  const result = spawnSync(process.execPath, [
    require.resolve('@lhci/cli/src/cli.js'),
    'autorun',
    `--config=${configPath}`,
    ...process.argv.slice(2),
  ], { stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(directory, { recursive: true, force: true });
}
