# ProtonMail Skill for OpenClaw

[![CI](https://github.com/YOUR-USERNAME/openclaw-protonmail-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR-USERNAME/openclaw-protonmail-skill/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

Connect your OpenClaw agent to ProtonMail via Proton Mail Bridge.

> ⚠️ **Status:** Early development (v0.1.0) — Core functionality in progress. Contributions welcome!

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Development](#development)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Overview

This skill enables OpenClaw to read, send, and manage emails through your ProtonMail account using the official Proton Mail Bridge. Bridge provides local IMAP/SMTP access to your encrypted ProtonMail account while maintaining end-to-end encryption.

## Features

- ✉️ Read emails (inbox, sent, folders)
- 📤 Send emails (plain text and HTML)
- 💬 Reply to emails
- 🔍 Search emails
- 📎 Handle attachments (coming soon)
- 🔒 Secure: Uses official Proton Bridge, credentials stored locally

## Requirements

- **Proton Mail Bridge** — [Download from Proton](https://proton.me/mail/bridge)
- **ProtonMail account** (Free or paid)
- **OpenClaw** v2024.1.0+
- **Node.js** 18+ (for development)

## Installation

### 1. Install Proton Mail Bridge

#### macOS (Homebrew)
```bash
brew install --cask proton-mail-bridge
```

#### Linux / Windows
Download from https://proton.me/mail/bridge

### 2. Configure Proton Mail Bridge

1. Launch Proton Mail Bridge
2. Sign in with your ProtonMail account
3. Note the IMAP/SMTP credentials Bridge generates
   - IMAP: `127.0.0.1:1143`
   - SMTP: `127.0.0.1:1025`
   - Username: `your-email@pm.me`
   - Password: Bridge-generated password (NOT your ProtonMail password)

### 3. Install the Skill

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/openclaw-protonmail-skill.git
cd openclaw-protonmail-skill

# Install dependencies
npm install

# Link to OpenClaw skills directory
npm run install-skill
```

### 4. Configure OpenClaw

Add to your OpenClaw config (`~/.openclaw/openclaw.json`):

```json
{
  "skills": {
    "protonmail": {
      "enabled": true,
      "account": "your-email@pm.me",
      "bridgePassword": "bridge-generated-password"
    }
  }
}
```

**Security Note:** Credentials are stored locally. Never commit your config with real credentials to version control.

## Usage

Once installed, OpenClaw can use ProtonMail commands:

```
You: Check my ProtonMail inbox
Agent: [uses protonmail skill to fetch recent emails]

You: Send an email to alice@example.com about the meeting
Agent: [drafts and sends email via ProtonMail]
```

## Commands

The skill provides these tool functions to OpenClaw:

- `protonmail-list-inbox` — List recent inbox messages
- `protonmail-search` — Search emails by query
- `protonmail-read` — Read a specific email by ID
- `protonmail-send` — Send a new email
- `protonmail-reply` — Reply to an email thread

## Development

### Setup

```bash
git clone https://github.com/YOUR-USERNAME/openclaw-protonmail-skill.git
cd openclaw-protonmail-skill
npm install
npm run dev
```

### Testing

```bash
npm test
```

### Project Structure

```
openclaw-protonmail-skill/
├── SKILL.md          # OpenClaw skill manifest
├── README.md         # This file
├── package.json      # Node.js dependencies
├── src/
│   ├── index.ts      # Main skill entry point
│   ├── imap.ts       # IMAP client for reading emails
│   ├── smtp.ts       # SMTP client for sending emails
│   └── tools.ts      # Tool definitions for OpenClaw
├── test/
│   └── integration.test.ts
└── examples/
    └── config-example.json
```

## Security

- **Proton Bridge runs locally** — No third-party services involved
- **End-to-end encryption maintained** — Bridge decrypts locally, encrypted in transit to Proton servers
- **Credentials never leave your machine** — Stored in OpenClaw config, never logged or transmitted
- **Open source** — Audit the code yourself

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Created by **Jim Staley** ([@YOUR-GITHUB-USERNAME](https://github.com/YOUR-USERNAME)) for the OpenClaw community.

Inspired by the [gog](https://github.com/steipete/gog) skill for Google Workspace.

## Support

- 🐛 **Issues:** https://github.com/YOUR-USERNAME/openclaw-protonmail-skill/issues
- 💬 **Discussions:** https://github.com/openclaw/openclaw/discussions
- 📖 **OpenClaw Docs:** https://docs.openclaw.ai

---

**Made with 🔐 for the OpenClaw community**
