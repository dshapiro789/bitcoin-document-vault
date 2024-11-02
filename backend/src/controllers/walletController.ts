import { Request, Response } from 'express';
import { WalletService } from '../services/walletService';
import { User } from '../models/User';

export class WalletController {
  private static walletService: WalletService;

  static initialize(walletService: WalletService) {
    WalletController.walletService = walletService;
  }

  static async getWalletInfo(req: Request, res: Response) {
    try {
      const user = await User.findOne({ fingerprint: (req as any).user.id });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const balance = await WalletController.walletService.getBalance(user.bitcoinAddress);
      const utxos = await WalletController.walletService.getUTXOs(user.bitcoinAddress);
      const transactions = await WalletController.walletService.getTransactions(user.bitcoinAddress);

      res.json({
        balance,
        address: user.bitcoinAddress,
        utxos,
        transactions
      });
    } catch (error) {
      console.error('Failed to fetch wallet info:', error);
      res.status(500).json({ 
        error: 'Failed to fetch wallet info', 
        details: error instanceof Error ? error.message : 'Unknown error',
        retryAfter: 5000 // Suggest client to retry after 5 seconds
      });
    }
  }

  static async generateNewAddress(req: Request, res: Response) {
    try {
      const userFingerprint = (req as any).user.id;
      const user = await User.findOne({ fingerprint: userFingerprint });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const walletService = new WalletService();
      const newAddress = await walletService.generateNewAddress(user);

      // Increment the address index
      user.addressIndex += 1;
      await user.save();

      res.json({ address: newAddress });
    } catch (error) {
      console.error('Failed to generate new address:', error);
      res.status(500).json({ error: 'Failed to generate new address' });
    }
  }

  static async sendTransaction(req: Request, res: Response) {
    try {
      const { amount, address } = req.body;
      const user = await User.findById((req as any).user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const walletService = new WalletService();
      // Note: You'll need to implement a method to get the private key securely
      const privateKey = await walletService.getPrivateKey(user);
      const txid = await walletService.sendTransaction(privateKey, address, amount, 1000); // Add a default fee of 1000 satoshis
      res.json({ txid });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send transaction' });
    }
  }

  static async getNodeStatus(req: Request, res: Response) {
    try {
      const nodeUrl = WalletController.walletService.getNodeUrl();
      const isConnected = await WalletController.walletService.checkNodeConnection();
      res.json({ isConnected, nodeUrl });
    } catch (error) {
      console.error('Error getting node status:', error);
      res.status(500).json({ error: 'Failed to check node status', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  static async connectToNode(req: Request, res: Response) {
    try {
      const { nodeUrl } = req.body;
      if (!nodeUrl) {
        return res.status(400).json({ error: 'Node URL is required' });
      }

      WalletController.walletService.setNodeUrl(nodeUrl);
      const isConnected = await WalletController.walletService.checkNodeConnection();
      
      if (isConnected) {
        res.json({ message: "Connected to node successfully", nodeUrl });
      } else {
        res.status(400).json({ error: 'Failed to connect to the node' });
      }
    } catch (error) {
      console.error('Node connection error:', error);
      res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}