'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import NodeStatus from '../../components/NodeStatus';

interface UTXO {
  txid: string;
  vout: number;
  amount: number;
}

interface Transaction {
  txid: string;
  amount: number;
  confirmations: number;
  timestamp: number;
}

interface NodeStatus {
  isConnected: boolean;
  nodeUrl: string;
}

const WalletPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [address, setAddress] = useState<string>('');
  const [utxos, setUTXOs] = useState<UTXO[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sendAmount, setSendAmount] = useState<string>('');
  const [sendAddress, setSendAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nodeStatus, setNodeStatus] = useState<NodeStatus | null>(null);
  const [currentNodeUrl, setCurrentNodeUrl] = useState<string>('https://blockstream.info/api');

  const fetchWalletInfo = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/info`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
        setAddress(data.address);
        setUTXOs(data.utxos);
        setTransactions(data.transactions);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch wallet info:', errorData);
        setError(`Failed to fetch wallet info: ${errorData.error || 'Unknown error'}`);
        if (errorData.retryAfter) {
          setTimeout(() => fetchWalletInfo(), errorData.retryAfter);
        }
      }
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      setError(`Error fetching wallet info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const fetchNodeStatus = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/node-status`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setNodeStatus(data);
        if (data.nodeUrl) {
          setCurrentNodeUrl(data.nodeUrl);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch node status:', errorData);
        setError(`Failed to fetch node status: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching node status:', error);
      setError(`Error fetching node status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchWalletInfo();
    fetchNodeStatus();
  }, [fetchWalletInfo, fetchNodeStatus]);

  useEffect(() => {
    if (!loading && user) {
      refreshData();

      // Set up periodic polling (every 30 seconds)
      const intervalId = setInterval(refreshData, 30000);

      // Clean up the interval on component unmount
      return () => clearInterval(intervalId);
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, router, loading, refreshData]);

  const generateNewAddress = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/new-address`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAddress(data.address);
      } else {
        setError('Failed to generate new address');
      }
    } catch (error) {
      console.error('Error generating new address:', error);
      setError('Error generating new address');
    }
  };

  const sendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: sendAmount, address: sendAddress }),
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Transaction sent: ${data.txid}`);
        fetchWalletInfo();
      } else {
        setError('Failed to send transaction');
      }
    } catch (error) {
      setError('Error sending transaction');
    }
  };

  if (loading || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary-orange mb-6">Bitcoin Wallet</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Node Status section */}
      <div className="bg-white shadow-md rounded-lg p-3 mb-6 inline-block">
        <h2 className="text-sm font-semibold text-primary-orange mb-2">Node Status</h2>
        <div className="flex flex-col items-center">
          <NodeStatus currentNodeUrl={currentNodeUrl} />
          <button 
            onClick={refreshData}
            className="bg-primary-orange text-white px-3 py-1 rounded text-sm hover:bg-orange-600 mt-2 w-full"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-primary-orange mb-4">Wallet Information</h2>
        <p><strong>Balance:</strong> {balance} BTC</p>
        <p><strong>Current Address:</strong> {address}</p>
        <div className="mt-2 mb-4">
          <QRCodeSVG value={address} />
        </div>
        <button onClick={generateNewAddress} className="bg-primary-orange text-white px-4 py-2 rounded">
          Generate New Address
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-primary-orange mb-4">Send Bitcoin</h2>
        <form onSubmit={sendTransaction}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
              Amount (BTC)
            </label>
            <input
              type="text"
              id="amount"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
              Recipient Address
            </label>
            <input
              type="text"
              id="address"
              value={sendAddress}
              onChange={(e) => setSendAddress(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <button type="submit" className="bg-primary-orange text-white px-4 py-2 rounded">
            Send
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-primary-orange mb-4">UTXOs</h2>
        {Array.isArray(utxos) && utxos.length > 0 ? (
          <ul>
            {utxos.map((utxo) => (
              <li key={`${utxo.txid}-${utxo.vout}`}>
                TXID: {utxo.txid}, Vout: {utxo.vout}, Amount: {utxo.amount} BTC
              </li>
            ))}
          </ul>
        ) : (
          <p>No UTXOs available.</p>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-primary-orange mb-4">Recent Transactions</h2>
        {Array.isArray(transactions) && transactions.length > 0 ? (
          <ul>
            {transactions.map((tx) => (
              <li key={tx.txid}>
                TXID: {tx.txid}, Amount: {tx.amount} BTC, Confirmations: {tx.confirmations}, Date: {new Date(tx.timestamp * 1000).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent transactions.</p>
        )}
      </div>
    </div>
  );
};

export default WalletPage;