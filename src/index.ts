/**
 * ProtonMail Skill for OpenClaw
 * 
 * Provides secure email integration through Proton Mail Bridge.
 * Bridge runs locally and provides IMAP/SMTP access to your ProtonMail account
 * while maintaining end-to-end encryption.
 * 
 * @packageDocumentation
 * 
 * @example
 * ```typescript
 * import ProtonMailSkill from 'openclaw-protonmail-skill';
 * 
 * const skill = new ProtonMailSkill({
 *   account: 'user@pm.me',
 *   bridgePassword: 'bridge-generated-password'
 * });
 * 
 * await skill.initialize();
 * const inbox = await skill.listInbox(10);
 * await skill.cleanup();
 * ```
 */

import { IMAPClient } from './imap';
import { SMTPClient } from './smtp';
import { registerTools } from './tools';

/**
 * Configuration options for ProtonMail skill
 */
export interface ProtonMailConfig {
  /** ProtonMail account email (e.g., user@pm.me or user@protonmail.com) */
  account: string;
  
  /** Bridge-generated password (NOT your ProtonMail password) */
  bridgePassword: string;
  
  /** IMAP host (default: 127.0.0.1) */
  imapHost?: string;
  
  /** IMAP port (default: 1143) */
  imapPort?: number;
  
  /** SMTP host (default: 127.0.0.1) */
  smtpHost?: string;
  
  /** SMTP port (default: 1025) */
  smtpPort?: number;
}

/**
 * Main skill class for ProtonMail integration
 * 
 * Manages IMAP and SMTP connections to Proton Mail Bridge and provides
 * high-level email operations for OpenClaw.
 */
export class ProtonMailSkill {
  private imap: IMAPClient;
  private smtp: SMTPClient;

  /**
   * Create a new ProtonMail skill instance
   * 
   * @param config - Configuration with account credentials and Bridge connection details
   * 
   * @remarks
   * The Bridge password is separate from your ProtonMail password. Get it from
   * Proton Mail Bridge → Account Settings → Mailbox Configuration.
   */
  constructor(config: ProtonMailConfig) {
    const imapConfig = {
      user: config.account,
      password: config.bridgePassword,
      host: config.imapHost || '127.0.0.1',
      port: config.imapPort || 1143,
      tls: true,
      tlsOptions: { rejectUnauthorized: false } // Bridge uses self-signed cert
    };

    const smtpConfig = {
      host: config.smtpHost || '127.0.0.1',
      port: config.smtpPort || 1025,
      secure: false,
      auth: {
        user: config.account,
        pass: config.bridgePassword
      },
      tls: { rejectUnauthorized: false }
    };

    this.imap = new IMAPClient(imapConfig);
    this.smtp = new SMTPClient(smtpConfig);
  }

  /**
   * Initialize the skill and register tools with OpenClaw
   * 
   * @throws {Error} If Bridge is not running or credentials are invalid
   * 
   * @remarks
   * Ensure Proton Mail Bridge is running before calling this method.
   */
  async initialize(): Promise<void> {
    await this.imap.connect();
    registerTools(this);
  }

  /**
   * Cleanup and disconnect from Bridge
   * 
   * @remarks
   * Always call this when shutting down to cleanly close connections.
   */
  async cleanup(): Promise<void> {
    await this.imap.disconnect();
  }

  // ========================================
  // Public methods for OpenClaw tool calls
  // ========================================

  /**
   * List recent emails from inbox
   * 
   * @param limit - Maximum number of emails to return (default: 10)
   * @param unreadOnly - Only return unread emails (default: false)
   * @returns Array of email metadata (sender, subject, date, etc.)
   * 
   * @example
   * ```typescript
   * const recent = await skill.listInbox(5, true); // 5 unread emails
   * ```
   */
  async listInbox(limit = 10, unreadOnly = false): Promise<any[]> {
    return this.imap.listInbox(limit, unreadOnly);
  }

  /**
   * Search emails by query
   * 
   * @param query - Search query (sender, subject, body keywords)
   * @param limit - Maximum results to return (default: 10)
   * @returns Matching emails
   * 
   * @example
   * ```typescript
   * const results = await skill.searchEmails('from:alice@example.com', 20);
   * ```
   */
  async searchEmails(query: string, limit = 10): Promise<any[]> {
    return this.imap.search(query, limit);
  }

  /**
   * Read a specific email by ID
   * 
   * @param messageId - Message UID or sequence number
   * @returns Full email content (headers, body, attachments)
   * 
   * @throws {Error} If message ID is invalid or email doesn't exist
   */
  async readEmail(messageId: string): Promise<any> {
    return this.imap.readMessage(messageId);
  }

  /**
   * Send a new email via ProtonMail
   * 
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param body - Email body (plain text)
   * @param options - Optional settings (CC, BCC, HTML, attachments)
   * @returns Send result
   * 
   * @example
   * ```typescript
   * await skill.sendEmail(
   *   'alice@example.com',
   *   'Meeting Follow-up',
   *   'Thanks for the meeting today...',
   *   { cc: 'bob@example.com' }
   * );
   * ```
   */
  async sendEmail(to: string, subject: string, body: string, options?: any): Promise<any> {
    return this.smtp.send(to, subject, body, options);
  }

  /**
   * Reply to an existing email thread
   * 
   * @param messageId - Original message ID to reply to
   * @param body - Reply text
   * @returns Send result
   * 
   * @remarks
   * Automatically sets Reply-To, In-Reply-To, and References headers
   * to maintain threading.
   */
  async replyToEmail(messageId: string, body: string): Promise<any> {
    const original = await this.imap.readMessage(messageId);
    return this.smtp.reply(original, body);
  }
}

export default ProtonMailSkill;
