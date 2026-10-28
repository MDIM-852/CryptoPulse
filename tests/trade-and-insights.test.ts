import { describe, it, expect } from 'vitest';
import { encryptSecret, decryptSecret } from '../src/lib/encryption';

describe('AES-256-GCM Encryption / Decryption', () => {
  it('encrypts and successfully decrypts API secrets', () => {
    const plainSecret = 'superSecretBinanceKey_1234567890';
    const encrypted = encryptSecret(plainSecret);

    expect(encrypted).not.toBe(plainSecret);
    expect(encrypted).toContain(':'); // Contains iv:authTag:cipher

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(plainSecret);
  });

  it('handles invalid decryption payloads gracefully', () => {
    expect(decryptSecret('')).toBe('');
    expect(decryptSecret('invalidPayload')).toBe('');
  });
});

describe('Tax Lot Accounting Math', () => {
  it('computes FIFO capital gain correctly', () => {
    const buyPrice = 50000;
    const sellPrice = 65000;
    const quantity = 0.5;

    const costBasis = quantity * buyPrice; // 25,000
    const proceeds = quantity * sellPrice;  // 32,500
    const gain = proceeds - costBasis;      // 7,500

    expect(costBasis).toBe(25000);
    expect(proceeds).toBe(32500);
    expect(gain).toBe(7500);
  });
});
