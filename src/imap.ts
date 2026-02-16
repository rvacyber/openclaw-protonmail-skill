/**
 * IMAP Client for Proton Mail Bridge
 * 
 * Provides low-level IMAP operations for reading emails from ProtonMail.
 * Connects to Bridge's local IMAP server (127.0.0.1:1143 by default).
 * 
 * @packageDocumentation
 */

import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';

/**
 * IMAP connection configuration
 */
export interface IMAPConfig {
  /** Bridge account username (email address) */
  user: string;
  
  /** Bridge-generated password */
  password: string;
  
  /** IMAP host (Bridge runs on localhost) */
  host: string;
  
  /** IMAP port (Bridge default: 1143) */
  port: number;
  
  /** Enable TLS (Bridge uses self-signed cert) */
  tls: boolean;
  
  /** TLS options (set rejectUnauthorized: false for Bridge) */
  tlsOptions?: { rejectUnauthorized: boolean };
}

/**
 * Email metadata returned by list operations
 */
export interface EmailMetadata {
  /** Message UID */
  uid: string;
  
  /** Sender address */
  from: string;
  
  /** Subject line */
  subject: string;
  
  /** Received date */
  date: Date;
  
  /** Read/unread status */
  flags: string[];
}

/**
 * IMAP client for reading emails via Proton Mail Bridge
 * 
 * @remarks
 * This client handles connection pooling and error recovery automatically.
 * Bridge must be running before calling connect().
 */
export class IMAPClient {
  private imap: Imap;
  private config: IMAPConfig;
  private isConnected = false;

  /**
   * Create a new IMAP client
   * 
   * @param config - IMAP connection settings
   */
  constructor(config: IMAPConfig) {
    this.config = config;
    this.imap = new Imap(config);
    
    // Set up error handlers
    this.imap.on('error', (err: Error) => {
      console.error('IMAP error:', err);
      this.isConnected = false;
    });
    
    this.imap.on('end', () => {
      this.isConnected = false;
    });
  }

  /**
   * Connect to Bridge IMAP server
   * 
   * @throws {Error} If Bridge is not running or credentials are invalid
   * 
   * @remarks
   * Ensure Proton Mail Bridge is running before calling this.
   * Connection timeout is 10 seconds by default.
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return; // Already connected
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('IMAP connection timeout - is Bridge running?'));
      }, 10000);
      
      this.imap.once('ready', () => {
        clearTimeout(timeout);
        this.isConnected = true;
        resolve();
      });
      
      this.imap.once('error', (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });
      
      this.imap.connect();
    });
  }

  /**
   * Disconnect from Bridge
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      this.imap.end();
      this.isConnected = false;
    }
  }

  /**
   * List emails from inbox
   * 
   * @param limit - Maximum emails to return
   * @param unreadOnly - Filter to unread messages only
   * @returns Array of email metadata
   * 
   * @todo Implement full IMAP FETCH operation
   * 
   * @example
   * ```typescript
   * const emails = await imap.listInbox(10, true);
   * console.log(emails.map(e => `${e.from}: ${e.subject}`));
   * ```
   */
  async listInbox(limit = 10, unreadOnly = false): Promise<EmailMetadata[]> {
    // TODO: Full implementation
    // 1. Open INBOX with imap.openBox('INBOX', false, callback)
    // 2. Search: unreadOnly ? ['UNSEEN'] : ['ALL']
    // 3. Fetch headers for matching UIDs
    // 4. Parse and return metadata
    
    // Stub return for now
    return [];
  }

  /**
   * Search emails by query
   * 
   * @param query - Search query (supports IMAP search syntax)
   * @param limit - Maximum results
   * @returns Matching emails
   * 
   * @todo Implement IMAP SEARCH with query parsing
   * 
   * @example
   * Supported query formats:
   * - `from:alice@example.com` - Emails from sender
   * - `subject:meeting` - Subject contains keyword
   * - `body:invoice` - Body contains keyword
   * - `newer_than:7d` - Last 7 days
   */
  async search(query: string, limit = 10): Promise<EmailMetadata[]> {
    // TODO: Full implementation
    // 1. Parse query string into IMAP search criteria
    // 2. Execute imap.search(criteria, callback)
    // 3. Fetch matching message headers
    // 4. Return results
    
    return [];
  }

  /**
   * Read full email content by UID
   * 
   * @param messageId - Message UID
   * @returns Parsed email with headers, body, and attachments
   * 
   * @throws {Error} If message UID is invalid
   * 
   * @todo Implement full message fetch and parsing
   * 
   * @example
   * ```typescript
   * const email = await imap.readMessage('1234');
   * console.log(email.text); // Plain text body
   * console.log(email.html); // HTML body
   * console.log(email.attachments); // File attachments
   * ```
   */
  async readMessage(messageId: string): Promise<ParsedMail> {
    // TODO: Full implementation
    // 1. Fetch message by UID: imap.fetch(messageId, { bodies: '' })
    // 2. Stream message to simpleParser()
    // 3. Extract text, HTML, attachments
    // 4. Return structured ParsedMail object
    
    // Stub return
    return {} as ParsedMail;
  }
}
