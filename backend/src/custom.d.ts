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