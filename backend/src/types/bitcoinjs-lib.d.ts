declare module 'bitcoinjs-lib' {
  export namespace payments {
    function p2pkh(options: { pubkey: Buffer; network?: Network }): { address: string | undefined };
    function p2wpkh(options: { pubkey: Buffer; network?: Network }): { address: string | undefined };
  }

  export namespace networks {
    const testnet: Network;
    const bitcoin: Network;
  }

  export interface Network {
    messagePrefix: string;
    bech32: string;
    bip32: {
      public: number;
      private: number;
    };
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
  }

  export class Psbt {
    constructor(options: { network: Network });
    addInput(input: any): void;
    addOutput(output: any): void;
    signAllInputs(keyPair: any): void;
    finalizeAllInputs(): void;
    extractTransaction(): { toHex(): string };
  }

  export namespace script {
    function compile(chunks: any[]): Buffer;
  }

  export namespace opcodes {
    const OP_0: number;
  }

  export namespace crypto {
    function hash160(buffer: Buffer): Buffer;
  }
}