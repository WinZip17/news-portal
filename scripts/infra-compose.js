#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { monitoringEnabled } = require('../config/infrastructure.js');

const rootDir = path.resolve(__dirname, '..');
const baseServices = ['postgres', 'redis'];
const monitoringServices = ['prometheus', 'grafana'];

function getInfraServices() {
  return monitoringEnabled ? [...baseServices, ...monitoringServices] : baseServices;
}

function getComposeProfileArgs() {
  return monitoringEnabled ? ['--profile', 'monitoring'] : [];
}

function runInfraUp() {
  const args = [...getComposeProfileArgs(), 'up', '-d', ...getInfraServices()];
  const result = spawnSync('docker', ['compose', ...args], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (!monitoringEnabled) {
    spawnSync('docker', ['compose', 'stop', 'prometheus', 'grafana'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
  }

  process.exit(result.status ?? 1);
}

const command = process.argv[2];

switch (command) {
  case 'services':
    console.log(getInfraServices().join(' '));
    break;
  case 'profiles':
    console.log(getComposeProfileArgs().join(' '));
    break;
  case 'enabled':
    console.log(monitoringEnabled ? 'true' : 'false');
    break;
  case 'up-infra':
    runInfraUp();
    break;
  default:
    console.error('Usage: node scripts/infra-compose.js <services|profiles|enabled|up-infra>');
    process.exit(1);
}
