import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';
import * as bip32 from 'bip32';

// Initialize bip32 with ecc
const BIP32Factory = bip32.BIP32Factory(ecc);

export class WalletService {
  private network: bitcoin.Network;

  constructor(isTestnet: boolean = false) {
    this.network = isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
  }

  generateMnemonic(): string {
    return bip39.generateMnemonic();
  }

  mnemonicToSeed(mnemonic: string): Buffer {
    return bip39.mnemonicToSeedSync(mnemonic);
  }

  createWallet(mnemonic: string): {
    address: string;
    publicKey: string;
    privateKey: string;
  } {
    const seed = this.mnemonicToSeed(mnemonic);
    const root = BIP32Factory.fromSeed(seed, this.network);

    // Use BIP84 derivation path for SegWit addresses
    const path = this.network === bitcoin.networks.testnet ? "m/84'/1'/0'/0/0" : "m/84'/0'/0'/0/0";

    const child = root.derivePath(path);

    if (!child.privateKey) {
      throw new Error("Failed to derive private key");
    }

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: this.network,
    });

    return {
      address: address!,
      publicKey: child.publicKey.toString('hex'),
      privateKey: child.privateKey.toString('hex'),
    };
  }
}