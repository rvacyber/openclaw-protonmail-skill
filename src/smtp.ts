/**
 * SMTP Client for Proton Mail Bridge
 * 
 * Provides email sending capabilities through Bridge's local SMTP server.
 * Connects to 127.0.0.1:1025 by default.
 * 
 * @packageDocumentation
 */

import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';

/**
 * SMTP connection configuration
 */
export interface SMTPConfig {
  /** SMTP host (Bridge runs on localhost) */
  host: string;
  
  /** SMTP port (Bridge default: 1025) */
  port: number;
  
  /** Use TLS from start (false for Bridge) */
  secure: boolean;
  
  /** Bridge authentication credentials */
  auth: {
    /** Bridge account email */
    user: string;
    
    /** Bridge-generated password */
    pass: string;
  };
  
  /** TLS options (set rejectUnauthorized: false for Bridge) */
  tls?: { rejectUnauthorized: boolean };
}

/**
 * Options for sending emails
 */
export interface SendOptions {
  /** CC recipients (comma-separated or array) */
  cc?: string | string[];
  
  /** BCC recipients (comma-separated or array) */
  bcc?: string | string[];
  
  /** HTML version of the email body */
  html?: string;
  
  /** File attachments */
  attachments?: Array<{
    /** Attachment filename */
    filename: string;
    
    /** File path or Buffer */
    content?: Buffer | string;
    
    /** File path */
    path?: string;
  }>;
}

/**
 * SMTP client for sending emails via Proton Mail Bridge
 * 
 * @remarks
 * Uses nodemailer for SMTP operations. Bridge handles encryption
 * and routing to Proton servers.
 */
export class SMTPClient {
  private transporter: Transporter;
  private config: SMTPConfig;

  /**
   * Create a new SMTP client
   * 
   * @param config - SMTP connection settings
   */
  constructor(config: SMTPConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport(config);
  }

  /**
   * Send a new email
   * 
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param body - Plain text email body
   * @param options - Additional options (CC, BCC, HTML, attachments)
   * @returns Send result with messageId
   * 
   * @throws {Error} If sending fails (invalid recipient, Bridge offline, etc.)
   * 
   * @example
   * ```typescript
   * const result = await smtp.send(
   *   'alice@example.com',
   *   'Project Update',
   *   'The project is on track...',
   *   {
   *     cc: 'bob@example.com',
   *     html: '<p>The project is <strong>on track</strong>...</p>'
   *   }
   * );
   * console.log('Sent:', result.messageId);
   * ```
   */
  async send(
    to: string,
    subject: string,
    body: string,
    options?: SendOptions
  ): Promise<any> {
    const mailOptions: SendMailOptions = {
      from: this.config.auth.user,
      to,
      subject,
      text: body,
      html: options?.html,
      cc: options?.cc,
      bcc: options?.bcc,
      attachments: options?.attachments
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reply to an existing email thread
   * 
   * @param originalMessage - Original email (from IMAP readMessage)
   * @param body - Reply text
   * @returns Send result
   * 
   * @throws {Error} If reply fails
   * 
   * @todo Implement full threading headers (In-Reply-To, References)
   * 
   * @remarks
   * This method automatically:
   * - Extracts the original sender from Reply-To or From header
   * - Prepends "Re: " to subject if not already present
   * - Sets In-Reply-To and References headers for proper threading
   * 
   * @example
   * ```typescript
   * const original = await imap.readMessage('1234');
   * await smtp.reply(original, 'Thanks, I'll review this today.');
   * ```
   */
  async reply(originalMessage: any, body: string): Promise<any> {
    // mailparser's ParsedMail shapes From and Reply-To as AddressObject,
    // not as arrays. The address lives at .value[0].address — not [0].address.
    //
    // Wrong (was):  originalMessage.from?.[0]?.address
    // Correct:      originalMessage.from?.value?.[0]?.address
    const replyTo =
      originalMessage.replyTo?.value?.[0]?.address ||
      originalMessage.from?.value?.[0]?.address;

    if (!replyTo) {
      throw new Error(
        'reply: could not determine recipient — original message has no From or Reply-To address'
      );
    }

    const subject = originalMessage.subject?.startsWith('Re: ')
      ? originalMessage.subject
      : `Re: ${originalMessage.subject ?? ''}`;

    // References should be a space-separated string per RFC 5322.
    // mailparser may return it as string[] or string; normalise to string.
    const existingRefs: string = Array.isArray(originalMessage.references)
      ? originalMessage.references.join(' ')
      : originalMessage.references ?? '';

    const references = existingRefs
      ? `${existingRefs} ${originalMessage.messageId}`
      : originalMessage.messageId;

    const mailOptions: SendMailOptions = {
      from: this.config.auth.user,
      to: replyTo,
      subject,
      text: body,
      inReplyTo: originalMessage.messageId,
      references,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
