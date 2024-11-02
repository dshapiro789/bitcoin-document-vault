import * as bip39 from 'bip39';
import * as CryptoJS from 'crypto-js';

export class ClientWalletService {
  static generateMnemonic(): string {
    return bip39.generateMnemonic();
  }

  static encryptMnemonic(mnemonic: string, password: string): string {
    return CryptoJS.AES.encrypt(mnemonic, password).toString();
  }

  // Add other methods as needed
}