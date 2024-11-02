import crypto from 'crypto';

export function generateUserId(walletFingerprint: string, passphrase: string): string {
  const data = walletFingerprint + passphrase;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash.substring(0, 16); // Return first 16 characters of the hash
}