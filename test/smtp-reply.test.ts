/**
 * Tests for SMTPClient.reply() — verifies correct mailparser AddressObject
 * shape handling and threading header construction.
 *
 * Regression coverage for:
 *   https://github.com/rvacyber/openclaw-protonmail-skill/issues/3
 *
 * Root cause: reply() was accessing `from?.[0]?.address` but mailparser's
 * ParsedMail exposes From as AddressObject ({ value: EmailAddress[] }),
 * not as EmailAddress[]. The correct path is `from?.value?.[0]?.address`.
 */

import { SMTPClient } from '../src/smtp';

// ---------------------------------------------------------------------------
// Minimal nodemailer transporter mock — captures sendMail calls
// ---------------------------------------------------------------------------
const mockSendMail = jest.fn().mockResolvedValue({ messageId: '<sent@test>' });

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeSmtp() {
  return new SMTPClient({
    host: '127.0.0.1',
    port: 1025,
    secure: false,
    auth: { user: 'bucky@pm.me', pass: 'bridge-pw' },
  });
}

/** Build a minimal mailparser-shaped ParsedMail object */
function parsedMail(overrides: Record<string, any> = {}) {
  return {
    from: { value: [{ address: 'alice@example.com', name: 'Alice' }], text: 'Alice <alice@example.com>' },
    replyTo: undefined,
    subject: 'Original subject',
    messageId: '<original-msg-id@example.com>',
    references: undefined,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('SMTPClient.reply()', () => {
  beforeEach(() => {
    mockSendMail.mockClear();
  });

  it('extracts recipient from from.value[0].address (mailparser shape)', async () => {
    const smtp = makeSmtp();
    const original = parsedMail();

    await smtp.reply(original, 'Hello back');

    const sent = mockSendMail.mock.calls[0][0];
    expect(sent.to).toBe('alice@example.com');
  });

  it('prefers replyTo.value[0].address over from when present', async () => {
    const smtp = makeSmtp();
    const original = parsedMail({
      replyTo: { value: [{ address: 'noreply@lists.example.com', name: '' }] },
    });

    await smtp.reply(original, 'Hello back');

    const sent = mockSendMail.mock.calls[0][0];
    expect(sent.to).toBe('noreply@lists.example.com');
  });

  it('prepends "Re: " to subject when not already present', async () => {
    const smtp = makeSmtp();
    await smtp.reply(parsedMail(), 'Hello back');
    expect(mockSendMail.mock.calls[0][0].subject).toBe('Re: Original subject');
  });

  it('does not double-prefix "Re: " when already present', async () => {
    const smtp = makeSmtp();
    await smtp.reply(parsedMail({ subject: 'Re: Already prefixed' }), 'Hi');
    expect(mockSendMail.mock.calls[0][0].subject).toBe('Re: Already prefixed');
  });

  it('sets inReplyTo to original messageId', async () => {
    const smtp = makeSmtp();
    await smtp.reply(parsedMail(), 'Hi');
    expect(mockSendMail.mock.calls[0][0].inReplyTo).toBe('<original-msg-id@example.com>');
  });

  it('builds references string from existing refs + original messageId', async () => {
    const smtp = makeSmtp();
    const original = parsedMail({
      references: ['<first@example.com>', '<second@example.com>'],
    });

    await smtp.reply(original, 'Hi');

    const sent = mockSendMail.mock.calls[0][0];
    expect(sent.references).toBe(
      '<first@example.com> <second@example.com> <original-msg-id@example.com>'
    );
  });

  it('builds references string when references is a string (not array)', async () => {
    const smtp = makeSmtp();
    const original = parsedMail({
      references: '<first@example.com>',
    });

    await smtp.reply(original, 'Hi');

    const sent = mockSendMail.mock.calls[0][0];
    expect(sent.references).toBe('<first@example.com> <original-msg-id@example.com>');
  });

  it('uses only messageId as references when no prior chain', async () => {
    const smtp = makeSmtp();
    await smtp.reply(parsedMail(), 'Hi');
    expect(mockSendMail.mock.calls[0][0].references).toBe('<original-msg-id@example.com>');
  });

  it('throws when no From or Reply-To address is available', async () => {
    const smtp = makeSmtp();
    const broken = parsedMail({ from: { value: [] }, replyTo: undefined });

    await expect(smtp.reply(broken, 'Hi')).rejects.toThrow(
      'could not determine recipient'
    );
  });

  it('does not call sendMail when recipient extraction fails', async () => {
    const smtp = makeSmtp();
    const broken = parsedMail({ from: undefined, replyTo: undefined });

    await expect(smtp.reply(broken, 'Hi')).rejects.toThrow();
    expect(mockSendMail).not.toHaveBeenCalled();
  });
});
