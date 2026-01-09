import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Version increment script
 * Usage: node scripts/version.js [patch|minor|major]
 * Default: patch
 */

const args = process.argv.slice(2);
const versionType = args[0] || 'patch';

// Read current version
const versionPath = join(__dirname, '..', 'src', 'lib', 'version.ts');
const versionContent = fs.readFileSync(versionPath, 'utf-8');

// Extract current version
const versionMatch = versionContent.match(/export const APP_VERSION = '(\d+)\.(\d+)\.(\d+)'/);
if (!versionMatch) {
  console.error('Could not find APP_VERSION in version.ts');
  process.exit(1);
}

let [major, minor, patch] = versionMatch.slice(1).map(Number);

// Increment version based on type
switch (versionType) {
  case 'major':
    major++;
    minor = 0;
    patch = 0;
    break;
  case 'minor':
    minor++;
    patch = 0;
    break;
  case 'patch':
  default:
    patch++;
    break;
}

const newVersion = `${major}.${minor}.${patch}`;

// Update version.ts
const updatedContent = versionContent.replace(
  /export const APP_VERSION = '[\d.]+'/,
  `export const APP_VERSION = '${newVersion}'`
);

fs.writeFileSync(versionPath, updatedContent, 'utf-8');

// Update package.json
const packagePath = join(__dirname, '..', 'package.json');
const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
packageContent.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2) + '\n', 'utf-8');

console.log(`✅ Version updated to ${newVersion} (${versionType})`);
console.log(`📝 Updated files: src/lib/version.ts, package.json`);
console.log(`\n💡 Don't forget to update CHANGELOG.md with the changes!`);

