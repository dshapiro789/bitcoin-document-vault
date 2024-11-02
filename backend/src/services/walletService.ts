import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { IUser } from '../models/User';
import crypto from 'crypto';
import axios from 'axios';
import { comparePassphrase } from '../utils/crypto';
import { RateLimiter } from 'limiter';

const bip32 = BIP32Factory(ecc);

export class WalletService {
	private network: bitcoin.Network;
	private nodeUrl: string;
	private limiter: RateLimiter;

	constructor() {
		this.network = bitcoin.networks.bitcoin;
		this.nodeUrl = process.env.DEFAULT_NODE_URL || 'https://blockstream.info/api';
		if (!this.nodeUrl) {
			throw new Error('DEFAULT_NODE_URL is not set in the environment variables');
		}
		// Allow 1 request per second
		this.limiter = new RateLimiter({ tokensPerInterval: 1, interval: "second" });
	}

	async createWallet(mnemonic: string, passphrase: string) {
		const seed = mnemonicToSeedSync(mnemonic, passphrase);
		const root = bip32.fromSeed(seed, this.network);
		const account = root.derivePath("m/84'/0'/0'");
		const node = account.derive(0).derive(0);

		const { address } = bitcoin.payments.p2wpkh({
			pubkey: node.publicKey,
			network: this.network,
		});

		return {
			address,
			publicKey: node.publicKey.toString('hex'),
			fingerprint: root.fingerprint.toString('hex'),
		};
	}

	async generateNewAddress(user: IUser): Promise<string> {
		console.log('Generating new address for user:', user);
		if (!user.passphrase) {
			console.log('User passphrase is missing in WalletService');
			throw new Error('User passphrase is missing');
		}

		const seed = mnemonicToSeedSync(user.mnemonic, user.passphrase);
		const root = bip32.fromSeed(seed, this.network);
		const account = root.derivePath("m/84'/0'/0'");
		
		// Use the current addressIndex to derive the next address
		const node = account.derive(0).derive(user.addressIndex);

		const { address } = bitcoin.payments.p2wpkh({
			pubkey: node.publicKey,
			network: this.network,
		});

		console.log('Generated new address:', address);
		return address!;
	}

	async hashDocument(fileBuffer: Buffer): Promise<string> {
		const hash = crypto.createHash('sha256');
		hash.update(fileBuffer);
		return hash.digest('hex');
	}

	private async delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	private async makeRequestWithRetry(url: string, retries = 3): Promise<any> {
		for (let i = 0; i < retries; i++) {
			try {
				await this.limiter.removeTokens(1);
				const response = await axios.get(url);
				return response.data;
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.status === 429) {
					console.log(`Rate limited, retrying in ${(i + 1) * 1000}ms...`);
					await this.delay((i + 1) * 1000);
				} else {
					throw error;
				}
			}
		}
		throw new Error(`Failed after ${retries} retries`);
	}

	async getBalance(address: string): Promise<number> {
		try {
			const utxos = await this.makeRequestWithRetry(`${this.nodeUrl}/address/${address}/utxo`);
			return utxos.reduce((sum: number, utxo: any) => sum + utxo.value, 0) / 1e8;
		} catch (error) {
			console.error('Error fetching balance:', error);
			return 0;
		}
	}

	async getUTXOs(address: string): Promise<any[]> {
		try {
			return await this.makeRequestWithRetry(`${this.nodeUrl}/address/${address}/utxo`);
		} catch (error) {
			console.error('Error fetching UTXOs:', error);
			return [];
		}
	}

	async getTransactions(address: string): Promise<any[]> {
		try {
			return await this.makeRequestWithRetry(`${this.nodeUrl}/address/${address}/txs`);
		} catch (error) {
			console.error('Error fetching transactions:', error);
			return [];
		}
	}

	async getPrivateKey(user: IUser): Promise<string> {
		const seed = mnemonicToSeedSync(user.mnemonic, user.passphrase);
		const root = bip32.fromSeed(seed, this.network);
		const account = root.derivePath("m/84'/0'/0'");
		const node = account.derive(0).derive(user.addressIndex);
		return node.privateKey!.toString('hex');
	}

	async sendTransaction(privateKey: string, toAddress: string, amount: number, fee: number): Promise<string> {
		// Implement transaction sending logic here
		// This is a complex process that involves creating and signing a transaction
		// You may want to use a library like bitcoinjs-lib for this
		throw new Error('Not implemented');
	}

	setNodeUrl(url: string): void {
		this.nodeUrl = url;
	}

	generateFingerprint(mnemonic: string, passphrase: string): string {
		const seed = mnemonicToSeedSync(mnemonic, passphrase);
		const root = bip32.fromSeed(seed, this.network);
		return root.fingerprint.toString('hex');
	}

	async checkNodeConnection(): Promise<boolean> {
		try {
			await this.makeRequestWithRetry(`${this.nodeUrl}/blocks/tip/height`);
			return true;
		} catch (error) {
			console.error('Error checking node connection:', error);
			return false;
		}
	}

	getNodeUrl(): string | null {
		return this.nodeUrl;
	}

	private async makeRequest(endpoint: string): Promise<any> {
		this.ensureNodeUrl();
		try {
			const response = await axios.get(`${this.nodeUrl}${endpoint}`);
			return response.data;
		} catch (error) {
			console.error(`Error making request to ${endpoint}:`, error);
			throw error;
		}
	}

	private ensureNodeUrl(): void {
		if (!this.nodeUrl) {
			this.nodeUrl = process.env.DEFAULT_NODE_URL || 'https://blockstream.info/api';
			if (!this.nodeUrl) {
				throw new Error('DEFAULT_NODE_URL is not set in the environment variables');
			}
		}
	}
}