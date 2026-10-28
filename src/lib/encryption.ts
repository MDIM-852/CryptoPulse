import crypto from 'crypto';

// AES-256-GCM Server-side Key Encryption
// Requires a strong 32-byte secret key (at least 32 characters)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_SECRET;

  if (envKey) {
    if (envKey.length < 32 && process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_SECRET must be at least 32 characters long in production.');
    }
    return crypto.createHash('sha256').update(envKey).digest();
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_SECRET environment variable is required in production.');
  }

  // Deterministic fallback key strictly for local development and offline demo testing
  return crypto.createHash('sha256').update('cryptopulse-development-local-key-32chars-min').digest();
}

/**
 * Encrypts a plaintext secret string using AES-256-GCM.
 * Output format: <iv_hex>:<authTag_hex>:<encrypted_hex>
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted payload and verifies authentication tag.
 */
export function decryptSecret(encryptedPayload: string): string {
  if (!encryptedPayload || !encryptedPayload.includes(':')) return '';

  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) return '';

    const [ivHex, tagHex, dataHex] = parts;
    if (!ivHex || !tagHex || !dataHex) return '';

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');

    if (iv.length !== IV_LENGTH || authTag.length !== TAG_LENGTH) {
      return '';
    }

    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(dataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    // Never log secret details or sensitive payloads
    return '';
  }
}
