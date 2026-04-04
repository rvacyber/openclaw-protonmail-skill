![RVA Cyber](../assets/branding/rva-cyber-logo-horizontal-v1.png)

# ProtonMail Skill for OpenClaw

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/rvacyber/openclaw-protonmail-skill/releases)
[![CI](https://github.com/rvacyber/openclaw-protonmail-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/rvacyber/openclaw-protonmail-skill/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

Connect OpenClaw to your ProtonMail account via Proton Mail Bridge for fully encrypted, local-only email access. Read, search, and send email directly from your agent — no third-party APIs, no cloud credential exposure.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [CLI Commands](#cli-commands)
- [Output Format](#output-format)
- [Development](#development)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)
- [License](#license)

---

## Overview

Proton Mail Bridge provides local IMAP/SMTP access to your encrypted ProtonMail account while maintaining end-to-end encryption. This skill wraps Bridge to expose email capabilities to your OpenClaw agent through a clean CLI and TypeScript SDK.

All encryption and decryption happens locally via Bridge. No credentials leave your machine, and no third-party services are involved.

## Features

| Feature | Status |
|---|---|
| Read inbox (with IMAP flags — read/unread, flagged, etc.) | ✅ |
| Search emails (from, subject, body, date range) | ✅ |
| Read full email content (plain text + HTML + attachments metadata) | ✅ |
| Send emails (to, cc, bcc, plain text / HTML) | ✅ |
| Reply to emails (auto-sets In-Reply-To/References headers) | ✅ |
| Attachment sending | 🔜 Planned |

## Requirements

- **Proton Mail Bridge** — [Download from proton.me/mail/bridge](https://proton.me/mail/bridge)
- **ProtonMail account** (Free or paid)
- **OpenClaw** v2024.1.0+
- **Node.js** 18+

---

## Installation

### 1. Install Proton Mail Bridge

**macOS (Homebrew):**
```bash
brew install --cask proton-mail-bridge
```

**Linux / Windows:** Download from [proton.me/mail/bridge](https://proton.me/mail/bridge)

### 2. Configure Bridge

1. Launch Proton Mail Bridge and sign in with your ProtonMail credentials
2. Open Bridge settings → select your account → **Mailbox configuration**
3. Click **Show password** to reveal the Bridge-generated IMAP/SMTP password

> ⚠️ The Bridge password is **separate** from your ProtonMail login password. Use the Bridge-generated one.

Default ports (confirm in Bridge UI):
- IMAP: `127.0.0.1:1143`
- SMTP: `127.0.0.1:1025`

### 3. Install the skill

```bash
git clone https://github.com/rvacyber/openclaw-protonmail-skill.git
cd openclaw-protonmail-skill
npm install
npm run install-skill
```

### 4. Configure OpenClaw

Add to `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "protonmail": {
        "enabled": true,
        "env": {
          "PROTONMAIL_ACCOUNT": "your-email@pm.me",
          "PROTONMAIL_BRIDGE_PASSWORD": "bridge-generated-password"
        }
      }
    }
  }
}
```

---

## Configuration

| Environment Variable | Description | Required |
|---|---|---|
| `PROTONMAIL_ACCOUNT` | Your ProtonMail email address | Yes |
| `PROTONMAIL_BRIDGE_PASSWORD` | Bridge-generated IMAP/SMTP password | Yes |

Advanced options (rarely needed; defaults match standard Bridge setup):

| Variable | Default | Description |
|---|---|---|
| `PROTONMAIL_IMAP_HOST` | `127.0.0.1` | Bridge IMAP host |
| `PROTONMAIL_IMAP_PORT` | `1143` | Bridge IMAP port |
| `PROTONMAIL_SMTP_HOST` | `127.0.0.1` | Bridge SMTP host |
| `PROTONMAIL_SMTP_PORT` | `1025` | Bridge SMTP port |

---

## Usage

Once installed, OpenClaw uses the skill automatically in response to natural language email requests:

```
You: Check my ProtonMail inbox
Agent: [lists recent emails with read/unread status]

You: Search ProtonMail for emails from alice@example.com
Agent: [returns matching emails]

You: Send an email to bob@example.com about the project status
Agent: [drafts and sends via ProtonMail]

You: Reply to email 44 — "Thanks, will review by EOD"
Agent: [sends reply with proper threading headers]
```

---

## CLI Commands

All commands accept env vars `PROTONMAIL_ACCOUNT` and `PROTONMAIL_BRIDGE_PASSWORD`.

### List inbox

```bash
protonmail list-inbox [--limit=10] [--unread]
```

Returns recent emails with IMAP flags (read/unread/flagged/etc.).

### Search emails

```bash
protonmail search "<query>" [--limit=10]
```

Supported query syntax:
- `from:alice@example.com` — by sender
- `subject:invoice` — subject contains keyword
- `body:contract` — body contains keyword
- `newer_than:7d` — last N days (`d` = days, `h` = hours)
- Plain text — treated as subject search

### Read email

```bash
protonmail read <uid>
```

Returns full email: headers, plain text body, HTML body, and attachment metadata.

### Send email

```bash
protonmail send --to=<email> --subject=<subject> --body=<body> [--cc=<email>] [--bcc=<email>]
```

### Reply to email

```bash
protonmail reply <uid> --body=<text>
```

Automatically sets `In-Reply-To` and `References` headers for proper email threading.

---

## Output Format

### `list-inbox` / `search`

```json
[
  {
    "uid": "47",
    "from": "\"Proton\" <no-reply@recovery.proton.me>",
    "subject": "Enhance your security",
    "date": "2026-03-26T15:20:56.000Z",
    "flags": ["\\Recent"]
  }
]
```

**`flags` values:**

| Flag | Meaning |
|---|---|
| `\\Seen` | Email has been read |
| `\\Recent` | New since last IMAP session |
| `\\Answered` | Email has been replied to |
| `\\Flagged` | Starred / marked important |
| `\\Deleted` | Marked for deletion |
| `\\Draft` | Draft message |
| *(empty array)* | Unread, no special flags |

### `read`

```json
{
  "from": "\"Alice\" <alice@example.com>",
  "to": "you@pm.me",
  "subject": "Q1 Report",
  "date": "2026-03-15T14:00:00.000Z",
  "text": "Plain text body...",
  "html": "<html>...</html>",
  "attachments": [
    { "filename": "report.pdf", "contentType": "application/pdf", "size": 142352 }
  ]
}
```

---

## Development

### Setup

```bash
git clone https://github.com/rvacyber/openclaw-protonmail-skill.git
cd openclaw-protonmail-skill
npm install
npm run build     # compile TypeScript
npm run dev       # watch mode
npm test          # run test suite
```

### Project Structure

```
openclaw-protonmail-skill/
├── SKILL.md          # OpenClaw skill manifest (agent-facing docs)
├── README.md         # Developer documentation
├── package.json      # Node.js package definition
├── tsconfig.json     # TypeScript config
├── src/
│   ├── index.ts      # ProtonMailSkill class and config loading
│   ├── imap.ts       # IMAP client — list, search, read (with flags)
│   ├── smtp.ts       # SMTP client — send, reply
│   └── tools.ts      # OpenClaw tool registrations
├── bin/
│   └── protonmail    # CLI entry point
├── dist/             # Compiled JavaScript (generated)
├── test/
│   └── integration.test.ts
└── examples/
    └── config-example.json
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-improvement`
3. Commit your changes: `git commit -m 'feat: describe the change'`
4. Push and open a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## Security

- **Local-only**: All IMAP/SMTP traffic stays on `127.0.0.1` — nothing leaves your machine
- **E2E encryption preserved**: Bridge handles all ProtonMail encryption/decryption locally
- **No API keys**: Uses standard IMAP/SMTP protocols with Bridge-managed credentials
- **Credential isolation**: Bridge password is separate from your ProtonMail account password
- **Auditable**: Bridge is open source — review it at [github.com/ProtonMail/proton-bridge](https://github.com/ProtonMail/proton-bridge)
- **Config security**: Never commit `openclaw.json` with real credentials to version control

---

## Troubleshooting

### "Connection refused" / timeout on `list-inbox`

1. Verify Proton Mail Bridge is running (check the system tray or app)
2. In Bridge, confirm IMAP is listening on `127.0.0.1:1143` and SMTP on `127.0.0.1:1025`
3. Bridge must be running before executing any CLI command

### "Authentication failed"

1. Use the **Bridge-generated** password — not your ProtonMail account password
2. Retrieve it from Bridge → select your account → Mailbox configuration → Show password
3. Confirm `PROTONMAIL_ACCOUNT` exactly matches your ProtonMail email (e.g., `user@pm.me`)

### Emails missing / incomplete sync

Bridge indexes your mailbox incrementally after first sign-in. Wait 1–2 minutes and retry.

### "Cannot find module '../dist/index.js'"

Run `npm run install-skill` from the repo root to recompile and re-deploy.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for full version history.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

**Made with 🔐 by [RVA Cyber](https://rvacyber.com) for the OpenClaw community**
