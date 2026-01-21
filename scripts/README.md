# Dependency Version Check

This pre-commit hook prevents version mismatches between related packages.

## What it does

- Checks that `@event-calendar/core` and `@event-calendar/day-grid` versions are compatible
- Runs automatically when `package.json` is modified
- Prevents commits with incompatible dependency versions

## Dependabot Configuration

The `.github/dependabot.yml` file groups `@event-calendar/*` packages together, ensuring they're updated as a unit to prevent version mismatches.

## Testing

To test the version check manually:
```bash
node scripts/check-dependency-versions.cjs
```
