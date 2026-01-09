# Version Management Guide

This application includes an automatic version management system that tracks app versions and updates.

## 📋 How It Works

### Version Components

1. **Version File** (`src/lib/version.ts`)
   - Stores the current app version
   - Manages build numbers automatically
   - Tracks update dates

2. **Build Number System**
   - Automatically increments when version changes
   - Stored in localStorage per browser
   - Tracks deployment/build history

3. **Version Display**
   - Shown in footer (public pages)
   - Shown in admin header (admin pages)
   - Format: `v1.0.0 (Build 1)`

## 🔄 Updating Version

### Method 1: Using NPM Scripts (Recommended)

```bash
# Patch version (1.0.0 → 1.0.1) - Bug fixes
npm run version:patch

# Minor version (1.0.0 → 1.1.0) - New features
npm run version:minor

# Major version (1.0.0 → 2.0.0) - Breaking changes
npm run version:major

# Default (patch)
npm run version
```

This will:
- ✅ Update `src/lib/version.ts`
- ✅ Update `package.json`
- ⚠️ **You still need to update `CHANGELOG.md` manually**

### Method 2: Manual Update

1. Edit `src/lib/version.ts`:
   ```typescript
   export const APP_VERSION = '1.0.1'; // Update version here
   ```

2. Update `package.json`:
   ```json
   "version": "1.0.1"
   ```

3. Update `CHANGELOG.md` with your changes

## 📝 Changelog Management

Always update `CHANGELOG.md` when making version changes:

```markdown
## [1.0.1] - 2024-12-20

### Added
- New feature description

### Fixed
- Bug fix description

### Changed
- Change description
```

## 🎯 Version Display Locations

- **Footer**: All public pages show version at bottom
- **Admin Header**: Admin pages show version next to logo
- **Format**: `v1.0.0 (Build 1)`

## 🔢 Build Number Behavior

- **Build number** increments automatically when version changes
- Each user's browser tracks their own build number
- When version updates, build number resets to 1
- Build number persists across page refreshes

## 📊 Version Tracking

The system tracks:
- ✅ Version string (e.g., "1.0.0")
- ✅ Build number (auto-incremented)
- ✅ Last update date
- ✅ Changelog entries

All stored in localStorage keys:
- `app_version` - Current version
- `app_build_number` - Build number
- `app_last_update` - Last update timestamp

## 🚀 Best Practices

1. **Update version before deploying**:
   ```bash
   npm run version:patch  # or minor/major
   ```

2. **Update CHANGELOG.md** with all changes

3. **Test after version update** to ensure display works

4. **Use semantic versioning**:
   - **Patch** (1.0.0 → 1.0.1): Bug fixes
   - **Minor** (1.0.0 → 1.1.0): New features (backward compatible)
   - **Major** (1.0.0 → 2.0.0): Breaking changes

## 🔍 Version Info API

```typescript
import { getVersionString, getVersionInfo } from './lib/version';

// Get formatted string: "v1.0.0 (Build 1)"
const versionString = getVersionString();

// Get full version info object
const versionInfo = getVersionInfo();
// Returns: { version, buildDate, buildNumber, changelog }
```

