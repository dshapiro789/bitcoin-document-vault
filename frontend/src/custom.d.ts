declare module 'bitcoinjs-lib' {
    export namespace bip32 {
      function fromSeed(seed: Buffer, network?: networks.Network): BIP32Interface;
    }
    
    export namespace networks {
      const testnet: Network;
    }
  
    interface Network {
      // Add network properties if needed
    }
  
    interface BIP32Interface {
      derivePath(path: string): BIP32Interface;
      publicKey: Buffer;
      privateKey: Buffer | undefined;
    }
  }
  
  declare module 'bip32' {
    import { BIP32API, BIP32Factory } from 'bip32';
    const bip32: BIP32API;
    export = bip32;
  }
  
  declare module 'bip39' {
    export function generateMnemonic(): string;
    export function mnemonicToSeedSync(mnemonic: string): Buffer;
  }