declare module 'app';
declare module 'utils';

declare module 'bip32' {
    export function BIP32Factory(ecc: any): any;
}

declare module 'bitcoinjs-lib' {
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

    export namespace payments {
        function p2wpkh(options: { pubkey: Buffer; network?: Network }): { address: string | undefined };
    }
}