#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function readPackageJson() {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

function getElectronVersion(pkg) {
  const fromDeps = (pkg.devDependencies && pkg.devDependencies.electron) || (pkg.dependencies && pkg.dependencies.electron);
  if (fromDeps) return fromDeps.replace(/^[^\d]*/, '');
  try {
    // if electron is installed, prefer its actual package.json
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const epkg = require('electron/package.json');
    return epkg.version;
  } catch (err) {
    return null;
  }
}

function markerPath() {
  return path.join(__dirname, '..', '.native-rebuilt.json');
}

function readMarker() {
  try {
    return JSON.parse(fs.readFileSync(markerPath(), 'utf8'));
  } catch (err) {
    return null;
  }
}

function writeMarker(data) {
  fs.writeFileSync(markerPath(), JSON.stringify(data, null, 2), 'utf8');
}

function runElectronRebuild(electronVersion) {
  console.log('[ensure-native] Running electron-rebuild for better-sqlite3 (this may take a few minutes)...');
  // Use a shell-invoked command string to avoid spawnSync npx.cmd EINVAL errors on some Windows setups.
  // This will prefer the locally-installed electron-rebuild if available, otherwise fallback to npx.
  const cmdString = `npx electron-rebuild -f -v ${electronVersion} -w better-sqlite3`;
  try {
    const res = spawnSync(cmdString, { stdio: 'inherit', shell: true });
    if (res.error) {
      console.error('[ensure-native] Failed to run electron-rebuild:', res.error);
      return false;
    }
    if (res.status !== 0) {
      console.error('[ensure-native] electron-rebuild exited with code', res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[ensure-native] Exception while running electron-rebuild:', err);
    return false;
  }
}

function main() {
  const pkg = readPackageJson();
  const electronVersion = getElectronVersion(pkg);
  if (!electronVersion) {
    console.warn('[ensure-native] Could not determine Electron version. Skipping native rebuild.');
    return process.exitCode = 0;
  }

  const marker = readMarker();
  if (marker && marker.electronVersion === electronVersion) {
    console.log('[ensure-native] native modules already rebuilt for electron@' + electronVersion);
    return process.exitCode = 0;
  }

  const ok = runElectronRebuild(electronVersion);
  if (ok) {
    writeMarker({ electronVersion, rebuiltAt: new Date().toISOString() });
    console.log('[ensure-native] native rebuild completed');
  } else {
    console.warn('[ensure-native] native rebuild failed. If you are on Windows, ensure "Desktop development with C++" (Visual Studio Build Tools) is installed.');
    console.warn('[ensure-native] Build will continue, but Electron may fail to load native modules until the toolchain is installed.');
  }

  // Important: never fail the parent npm script here. The rebuild attempt is best-effort.
  process.exitCode = 0;
}

main();
