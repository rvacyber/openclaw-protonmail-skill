/**
 * ProtonMail Skill for OpenClaw
 * 
 * Connects OpenClaw to ProtonMail via Proton Mail Bridge (local IMAP/SMTP).
 */

import { IMAPClient } from './imap';
import { SMTPClient } from './smtp';
import { registerTools } from './tools';

export interface ProtonMailConfig {
  account: string;
  bridgePassword: string;
  imapHost?: string;
  imapPort?: number;
  smtpHost?: string;
  smtpPort?: number;
}

export class ProtonMailSkill {
  private imap: IMAPClient;
  private smtp: SMTPClient;

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
   */
  async initialize() {
    await this.imap.connect();
    registerTools(this);
  }

  /**
   * Cleanup and disconnect
   */
  async cleanup() {
    await this.imap.disconnect();
  }

  // Public methods for tools
  async listInbox(limit = 10, unreadOnly = false) {
    return this.imap.listInbox(limit, unreadOnly);
  }

  async searchEmails(query: string, limit = 10) {
    return this.imap.search(query, limit);
  }

  async readEmail(messageId: string) {
    return this.imap.readMessage(messageId);
  }

  async sendEmail(to: string, subject: string, body: string, options?: any) {
    return this.smtp.send(to, subject, body, options);
  }

  async replyToEmail(messageId: string, body: string) {
    const original = await this.imap.readMessage(messageId);
    return this.smtp.reply(original, body);
  }
}

export default ProtonMailSkill;
