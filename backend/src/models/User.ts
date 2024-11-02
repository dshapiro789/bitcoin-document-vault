import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fingerprint: string; // This will be our primary identifier
  mnemonic: string;
  bitcoinAddress: string;
  publicKey: string;
  theme: 'light' | 'dark';
  passphrase: string;
  addressIndex: number;
}

const UserSchema: Schema = new Schema({
  fingerprint: { type: String, required: true, unique: true },
  mnemonic: { type: String, required: true },
  bitcoinAddress: { type: String, required: true },
  publicKey: { type: String, required: true },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  passphrase: { type: String, required: true },
  addressIndex: { type: Number, default: 0 },
});

export const User = mongoose.model<IUser>('User', UserSchema);

export async function createUser(mnemonic: string, bitcoinAddress: string, publicKey: string, fingerprint: string, hashedPassphrase: string): Promise<IUser> {
  const user = new User({
    fingerprint,
    mnemonic,
    bitcoinAddress,
    publicKey,
    passphrase: hashedPassphrase,
  });

  await user.save();
  return user;
}