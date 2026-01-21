#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
const errors = [];

// Check @event-calendar packages
if (deps['@event-calendar/core'] && deps['@event-calendar/day-grid']) {
  const coreVersion = deps['@event-calendar/core'].replace(/[\^~]/, '');
  const dayGridPkg = packageLock.packages['node_modules/@event-calendar/day-grid'];
  
  if (dayGridPkg?.dependencies?.['@event-calendar/core']) {
    const requiredCore = dayGridPkg.dependencies['@event-calendar/core'].replace(/[\^~]/, '');
    if (!coreVersion.startsWith(requiredCore.split('.')[0])) {
      errors.push(
        `Version mismatch: @event-calendar/core@${coreVersion} incompatible with @event-calendar/day-grid requirement (${requiredCore})`
      );
    }
  }
}

if (errors.length > 0) {
  console.error('\n❌ Dependency version conflicts detected:\n');
  errors.forEach(err => console.error(`  ${err}`));
  console.error('\n');
  process.exit(1);
}

console.log('✅ Dependency versions are compatible');
