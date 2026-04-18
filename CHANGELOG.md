![RVA Cyber](../assets/branding/rva-cyber-logo-horizontal-v1.png)

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-04-18

### Fixed
- Restored `SKILL.md` frontmatter to the first line of the file so ClawHub/OpenClaw registry parsers can reliably detect required environment variables and install metadata.
- Rebuilt `dist/` from the hardened TypeScript source so published runtime artifacts match the security fixes already present in `src/`.
- Synchronized package version metadata after discovering `package.json` and `package-lock.json` were out of sync.

### Changed
- Updated skill version references to `1.0.1` for this patch release.
- Documented this registry/parser compatibility patch release.

## [1.0.0] - 2026-04-04

### Fixed
- **Critical bug: `read` command hanged indefinitely on invalid message UID** — `readMessage()` in `imap.ts` previously never resolved or rejected when the requested UID was not found in INBOX (no `end` event handler). Added `messageFound` tracking and a `fetch.end` handler that rejects with a clear error: `Message UID <id> not found in INBOX`. Before this fix, `protonmail read <invalid-uid>` would hang forever until Node.js timeout or user interrupt.

### Changed
- Promoted to stable v1.0.0 release
- Full CLI tests passing against Proton Mail Bridge (list-inbox, read with valid UID, read with invalid UID fails fast)

## [Unreleased]

### Changed
- Security hardening following ClawHub scanner feedback:
  - Removed insecure TLS bypass configuration
  - Enforced localhost-only Bridge host policy
  - Hardened IMAP search query parsing and input sanitization
- README now includes a clear Security Feedback Response section with remediation details

### Added
- Initial project structure
- IMAP client foundation for reading ProtonMail emails
- SMTP client foundation for sending emails via Bridge
- Tool definitions for OpenClaw integration
- Comprehensive documentation (README, SKILL.md, CONTRIBUTING)
- Security policy (SECURITY.md)
- Code of Conduct
- MIT License
- TypeScript build configuration
- Example configuration files
- Environment variable support (PROTONMAIL_ACCOUNT, PROTONMAIL_BRIDGE_PASSWORD)
- Proper OpenClaw skill config format (`skills.entries.protonmail`)

### Changed
- Updated nodemailer to v8.0.1 (security fixes)
- Installation script now copies files instead of symlinking
- Config reads from environment variables (OpenClaw standard pattern)
- Made config parameter optional (reads from env vars)
- Metadata in SKILL.md now single-line JSON (OpenClaw requirement)

### Fixed
- Added missing @types/mailparser dependency
- Security vulnerabilities in nodemailer
- Installation path (now uses ~/.openclaw/skills/protonmail)
- Config format (now uses skills.entries.* structure)
- Build errors due to missing type definitions

### Notes
- This is a pre-release version
- Core IMAP/SMTP implementations are in progress
- Not yet ready for production use

## [0.1.1] - 2026-02-26

### Security
- Removed insecure TLS override behavior
- Enforced localhost-only Bridge host policy
- Hardened IMAP search query parsing/sanitization

### Documentation
- Added explicit Security Feedback Response details in README
- Added security advisory (`docs/SECURITY-ADVISORY-2026-02-26.md`)
- Added upgrade notice directing `0.1.0` users to patch release

## [0.1.0] - 2026-02-16

### Initial Release
- Project created and published to GitHub
- Foundation laid for ProtonMail integration via Proton Mail Bridge
- Community-driven development begins

---

## Versioning Guide

- **MAJOR** version when making incompatible API changes
- **MINOR** version when adding functionality in a backwards compatible manner
- **PATCH** version when making backwards compatible bug fixes

## Links

- [Latest Release](https://github.com/rvacyber/openclaw-protonmail-skill/releases/latest)
- [All Releases](https://github.com/rvacyber/openclaw-protonmail-skill/releases)
- [Issue Tracker](https://github.com/rvacyber/openclaw-protonmail-skill/issues)
