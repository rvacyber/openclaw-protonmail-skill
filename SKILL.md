---
name: protonmail
description: ProtonMail integration via Proton Mail Bridge for reading and sending encrypted emails.
homepage: https://github.com/YOUR-USERNAME/openclaw-protonmail-skill
metadata:
  {
    "openclaw":
      {
        "emoji": "🔐",
        "requires": { "apps": ["Proton Mail Bridge"] },
        "install":
          [
            {
              "id": "brew-bridge",
              "kind": "brew",
              "formula": "proton-mail-bridge",
              "bins": [],
              "label": "Install Proton Mail Bridge (macOS)",
              "cask": true
            },
          ],
      },
  }
---

# ProtonMail Skill

Use ProtonMail for secure email via Proton Mail Bridge.

## Setup (once)

1. **Install Proton Mail Bridge:**
   ```bash
   brew install --cask proton-mail-bridge
   ```

2. **Launch Bridge and sign in:**
   - Open Proton Mail Bridge app
   - Sign in with your ProtonMail credentials
   - Bridge will generate local IMAP/SMTP credentials

3. **Configure the skill:**
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

   **Get Bridge credentials:**
   - In Bridge, click your account → Mailbox configuration
   - Copy the IMAP password (NOT your ProtonMail password)

## Common Commands

- **List inbox:** "Check my ProtonMail inbox"
- **Search emails:** "Search ProtonMail for emails from alice@example.com"
- **Read email:** "Read ProtonMail email ID 12345"
- **Send email:** "Send an email via ProtonMail to bob@example.com about the project"
- **Reply:** "Reply to ProtonMail email ID 12345"

## How It Works

1. Proton Mail Bridge runs locally and connects to your ProtonMail account
2. Bridge provides local IMAP (read) and SMTP (send) servers
3. This skill connects to Bridge's local servers
4. All encryption/decryption happens locally via Bridge
5. No third-party services — direct ProtonMail integration

## Security

- ✅ Official Proton software (audited, open-source Bridge)
- ✅ End-to-end encryption maintained
- ✅ Credentials stored locally only
- ✅ No API keys or tokens — uses standard IMAP/SMTP
- ✅ Bridge password is separate from your ProtonMail password

## Tool Functions

The skill provides these tools to OpenClaw:

### protonmail-list-inbox
List recent emails from inbox.

**Parameters:**
- `limit` (number, optional) — Max emails to return (default: 10)
- `unreadOnly` (boolean, optional) — Only unread emails (default: false)

**Example:**
```json
{
  "tool": "protonmail-list-inbox",
  "params": { "limit": 5, "unreadOnly": true }
}
```

### protonmail-search
Search emails by query.

**Parameters:**
- `query` (string, required) — Search query (sender, subject, body)
- `limit` (number, optional) — Max results (default: 10)

**Example:**
```json
{
  "tool": "protonmail-search",
  "params": { "query": "from:alice@example.com", "limit": 20 }
}
```

### protonmail-read
Read a specific email by ID.

**Parameters:**
- `messageId` (string, required) — Message ID or UID

**Example:**
```json
{
  "tool": "protonmail-read",
  "params": { "messageId": "1234" }
}
```

### protonmail-send
Send a new email.

**Parameters:**
- `to` (string, required) — Recipient email
- `subject` (string, required) — Email subject
- `body` (string, required) — Email body (plain text)
- `cc` (string, optional) — CC recipients
- `bcc` (string, optional) — BCC recipients

**Example:**
```json
{
  "tool": "protonmail-send",
  "params": {
    "to": "alice@example.com",
    "subject": "Meeting Follow-up",
    "body": "Thanks for the meeting today. Next steps: ..."
  }
}
```

### protonmail-reply
Reply to an email thread.

**Parameters:**
- `messageId` (string, required) — Original message ID
- `body` (string, required) — Reply text

**Example:**
```json
{
  "tool": "protonmail-reply",
  "params": {
    "messageId": "1234",
    "body": "Sounds good, I'll send the report by Friday."
  }
}
```

## Troubleshooting

### "Connection refused" errors
- **Check Bridge is running:** Open Proton Mail Bridge app
- **Verify ports:** Bridge should show 127.0.0.1:1143 (IMAP) and 127.0.0.1:1025 (SMTP)

### "Authentication failed"
- **Use Bridge password, not ProtonMail password:** Get it from Bridge → Account → Mailbox configuration
- **Check account email:** Must match exactly (e.g., `user@pm.me` or `user@protonmail.com`)

### "Skill not found"
- **Reinstall skill:** Run `npm run install-skill` in the skill directory
- **Check OpenClaw config:** Ensure `skills.protonmail.enabled: true`

## Development

See [README.md](README.md) for development setup and testing.

## License

MIT — See [LICENSE](LICENSE)
