#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const IGNORED_DIRS = new Set(['node_modules', '.git']);

async function readJson(file) {
  const txt = await fs.readFile(file, 'utf8');
  return JSON.parse(txt);
}

async function writeJson(file, obj) {
  const txt = JSON.stringify(obj, null, 2) + '\n';
  await fs.writeFile(file, txt, 'utf8');
}

async function findPackageJsons(dir) {
  const results = [];
  async function walk(cur) {
    const entries = await fs.readdir(cur, { withFileTypes: true });
    for (const e of entries) {
      if (IGNORED_DIRS.has(e.name)) continue;
      const full = path.join(cur, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && e.name === 'package.json') {
        results.push(full);
      }
    }
  }
  await walk(dir);
  return results;
}

function replaceWorkspaceDeps(pkgJson, versionMap) {
  let changed = false;
  const sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
  for (const s of sections) {
    const sec = pkgJson[s];
    if (!sec) continue;
    for (const [name, ver] of Object.entries(sec)) {
      if (ver === 'workspace:*' || (typeof ver === 'string' && ver.startsWith('workspace:')) ) {
        const target = versionMap[name];
        if (target) {
          sec[name] = target;
          changed = true;
        } else {
          console.warn(`Warning: no version found for ${name} referenced from workspace in package ${pkgJson.name || '<unknown>'}`);
        }
      }
    }
  }
  return changed;
}

async function main() {
  const root = process.cwd();
  console.log('prepare-npm: scanning workspace packages...');
  const packagesDir = path.join(root, 'packages');

  // gather versions from packages/*
  const versionMap = {};
  try {
    const pkgDirs = await fs.readdir(packagesDir, { withFileTypes: true });
    for (const d of pkgDirs) {
      if (!d.isDirectory()) continue;
      const pj = path.join(packagesDir, d.name, 'package.json');
      try {
        const p = await readJson(pj);
        if (p && p.name && p.version) versionMap[p.name] = p.version;
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // no packages dir
  }

  // also include root package if it has a version (rare for private monorepos), and any other discovered packages
  const all = await findPackageJsons(root);

  const changedFiles = [];
  for (const pj of all) {
    // skip the lockfile directory area
    if (pj.includes('node_modules')) continue;
    let pkg;
    try {
      pkg = await readJson(pj);
    } catch (e) {
      console.warn(`Skipping unreadable ${pj}`);
      continue;
    }

    const changed = replaceWorkspaceDeps(pkg, versionMap);
    if (changed) {
      await writeJson(pj, pkg);
      changedFiles.push(pj);
      console.log(`Updated ${pj}`);
    }
  }

  if (changedFiles.length === 0) {
    console.log('No workspace:* references replaced. Nothing to do.');
  } else {
    console.log('\nReplaced workspace:* with concrete versions in the files listed above.');
    console.log('TIP: These changes were written in-place. If you want to revert, run:');
    console.log('  git restore ' + changedFiles.map(f => '"' + path.relative(root, f).replace(/\\/g,'/') + '"').join(' '));
  }
  console.log('\nNext steps:');
  console.log('  1) Run your build step (e.g. `pnpm run build` or `pnpm -w build`) to ensure built artifacts exist.');
  console.log('  2) Run `node prepare-npm.js` (or `npm run prepare-npm`) before creating a tarball or publishing.');
  console.log('  3) Create a tarball with `npm pack` or publish with `npm publish` from the package directory you want to distribute.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
