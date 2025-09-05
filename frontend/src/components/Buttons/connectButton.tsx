import React, { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';

interface EthereumRequestArgs {
    method: string;
    params?: unknown[];
}

declare global {
    interface Window {
        ethereum?: {
            request: (args: EthereumRequestArgs) => Promise<unknown>;
            send: (method: string, params: unknown[]) => Promise<unknown>;
            listAccounts: () => Promise<string[]>;
        };
    }
}

interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: string;
}

interface ConnectButtonProps {
    setAccount: (account: string) => void;
    account: string;
    setBalance: (balance: string) => void;
    setTransactions: (transactions: Transaction[]) => void;
}

interface EtherscanTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: string;
}

interface EtherscanResponse {
    status: string;
    result: EtherscanTransaction[];
    message?: string;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({setAccount, account, setBalance, setTransactions}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const getBalance = async (address: string) => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const balance = await provider.getBalance(address);
                return parseFloat(ethers.formatEther(balance)).toFixed(4);
            } catch (error) {
                console.error('Error getting balance:', error);
                return '0';
            }
        }
        return '0';
    };

    const getTransactions = async (address: string): Promise<Transaction[]> => {
        try {
            const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;

            if (!apiKey) {
                throw new Error('Etherscan API key not found');
            }

            const response = await fetch(
                `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`
            );

            const data: EtherscanResponse = await response.json();

            if (data.status === '1' && data.result) {
                return data.result.map((tx: EtherscanTransaction) => ({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: tx.value,
                    blockNumber: tx.blockNumber
                }));
            }

            return [];
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    };

    const checkConnection = useCallback(async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();
                
                if (accounts.length > 0) {
                    const address = accounts[0].address;
                    setAccount(address);
                    const balance = await getBalance(address);
                    setBalance(balance);
                    const transactions = await getTransactions(address);
                    setTransactions(transactions);
                }
            } catch (error) {
                console.error('Error checking connection:', error);
            }
        }
    }, [setAccount, setBalance, setTransactions]);

    useEffect(() => {
        checkConnection();
    }, [checkConnection]);

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError('MetaMask is not installed!');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            
            setAccount(address);
            const balance = await getBalance(address);
            setBalance(balance);
            const transactions = await getTransactions(address);
            setTransactions(transactions);
        } catch (error) {
            setError('Failed to connect wallet');
            console.error('Error connecting wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = () => {
        setAccount('');
        setBalance('0');
        setTransactions([]);
    };

    return (
        <div>
            <button
                onClick={account ? disconnectWallet : connectWallet}
                disabled={loading}
                className={`px-4 py-2 rounded transition-colors ${
                    loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
            >
                {loading ? 'Connecting...' : 
                 account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 
                 'Connect MetaMask'}
            </button>
            
            {error && (
                <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ConnectButton;