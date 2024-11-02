import bcrypt from 'bcrypt';

export async function hashPassphrase(passphrase: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(passphrase, salt);
}

export async function comparePassphrase(passphrase: string, hashedPassphrase: string): Promise<boolean> {
  return bcrypt.compare(passphrase, hashedPassphrase);
}