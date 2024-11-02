import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { BIP32Factory } from 'bip32';
import * as bip39 from 'bip39';

// Initialize BIP32 with the required elliptic curve implementation
const bip32 = BIP32Factory(ecc);

export function generateWallet(mnemonic: string) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const path = "m/84'/0'/0'/0/0"; // BIP84 for native SegWit
  const child = root.derivePath(path);
  const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey });

  return {
    address,
    privateKey: child.privateKey ? child.privateKey.toString('hex') : '',
    publicKey: child.publicKey.toString('hex'),
  };
}