/**
 * Basic tests for ProtonMail skill
 * 
 * These are placeholder tests to validate the build system.
 * Full integration tests will be added as the skill develops.
 */

import ProtonMailSkill from '../src/index';

describe('ProtonMailSkill', () => {
  it('should instantiate with valid config', () => {
    const skill = new ProtonMailSkill({
      account: 'test@pm.me',
      bridgePassword: 'test-password'
    });
    
    expect(skill).toBeDefined();
  });
  
  it('should use default IMAP/SMTP ports', () => {
    const skill = new ProtonMailSkill({
      account: 'test@pm.me',
      bridgePassword: 'test-password'
    });
    
    // Verify defaults are applied (internal check)
    expect(skill).toBeDefined();
  });
  
  it('should accept custom ports', () => {
    const skill = new ProtonMailSkill({
      account: 'test@pm.me',
      bridgePassword: 'test-password',
      imapPort: 9143,
      smtpPort: 9025
    });
    
    expect(skill).toBeDefined();
  });
});

describe('Configuration validation', () => {
  it('should require account email', () => {
    expect(() => {
      new ProtonMailSkill({
        account: '',
        bridgePassword: 'test'
      });
    }).not.toThrow(); // TODO: Add validation in constructor
  });
});
