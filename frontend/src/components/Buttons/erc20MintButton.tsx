import { useState } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI } from '../Contracts/erc20ABI'


interface TokenDetails {
  txHash: string;
  recipient: string;
  amount: string;
  newBalance: string;
  totalSupply: string;
  tokenName: string;
  tokenSymbol: string;
  decimals: number;
  timestamp: string;
}

interface ERC20MintButtonProps {
  account: string;
  mintAmount: string;
  onMintSuccess?: (txHash: string, amount: string, recipient: string) => void;
  onMintError?: (error: string) => void;
}

const ERC20MintButton: React.FC<ERC20MintButtonProps> = ({
  account,
  mintAmount,
  onMintSuccess,
  onMintError
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const contractAddress = import.meta.env.VITE_ERC20_CONTRACT_ADDRESS;

  const fetchTokenDetails = async (contract: ethers.Contract, txHash: string, recipient: string, amount: string) => {
    try {
      const [balance, totalSupply, tokenName, tokenSymbol, decimals] = await Promise.all([
        contract.balanceOf(recipient),
        contract.totalSupply(),
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);

      return {
        txHash,
        recipient,
        amount,
        newBalance: ethers.formatUnits(balance, decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        tokenName,
        tokenSymbol,
        decimals: Number(decimals),
        timestamp: new Date().toLocaleString()
      };
    } catch (error) {
      console.error('Error fetching token details:', error);
      return null;
    }
  };
  
  const handleMint = async () => {
    if (!window.ethereum) {
      const error = 'Please install MetaMask to interact with the contract';
      onMintError?.(error);
      return;
    }

    if (!account) {
      const error = 'Please connect your wallet first';
      onMintError?.(error);
      return;
    }

    if (!contractAddress) {
        const error = 'Contract address not configured';
        onMintError?.(error);
        setIsLoading(false);
        return;
    }

    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      const error = 'Please enter a valid mint amount';
      onMintError?.(error);
      return;
    }

    setIsLoading(true);
    setTokenDetails(null);
    setShowDetails(false);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
      
      let decimals = 18;
      try {
        decimals = await contract.decimals();
      } catch (error) {
        console.warn('Could not fetch decimals, using default 18');
      }
      
      const amountInWei = ethers.parseUnits(mintAmount, decimals);
      
      let gasEstimate;
      try {
        gasEstimate = await contract.mint.estimateGas(account, amountInWei);
        gasEstimate = gasEstimate * BigInt(120) / BigInt(100);
      } catch (error) {
        console.warn('Gas estimation failed, using default');
        gasEstimate = BigInt(200000);
      }
      
      const tx = await contract.mint(account, amountInWei, {
        gasLimit: gasEstimate
      });
      
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Fetch updated token details after successful mint
        const details = await fetchTokenDetails(contract, tx.hash, account, mintAmount);
        if (details) {
          setTokenDetails(details);
          setShowDetails(true);
        }
        
        onMintSuccess?.(tx.hash, mintAmount, account);
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error: any) {
      console.error('Minting error:', error);
      
      let errorMessage = 'Failed to mint tokens';
      
      if (error.code === 4001) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for gas fees';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      } else if (error.message?.includes('execution reverted')) {
        errorMessage = 'Transaction reverted - check contract permissions or parameters';
      } else if (error.message?.includes('invalid address')) {
        errorMessage = 'Invalid recipient address';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error - please try again';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      onMintError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={handleMint}
          disabled={isLoading || !account || !contractAddress || !mintAmount}
          style={{
            padding: '10px 20px',
            backgroundColor: (isLoading || !account || !contractAddress || !mintAmount) 
              ? '#ccc' : '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (isLoading || !account || !contractAddress || !mintAmount) 
              ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Minting...' : 'Mint'}
        </button>

        {tokenDetails && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        )}
      </div>

      {showDetails && tokenDetails && (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#242424',
          marginTop: '10px'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: '#28a745',
            fontSize: '18px' 
          }}>
            ✅ Mint Successful!
          </h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Token:</strong>
              <span>{tokenDetails.tokenName} ({tokenDetails.tokenSymbol})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Amount Minted:</strong>
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                {tokenDetails.amount} {tokenDetails.tokenSymbol}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Recipient:</strong>
              <span 
                onClick={() => copyToClipboard(tokenDetails.recipient)}
                style={{ 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  color: '#007bff'
                }}
                title="Click to copy full address"
              >
                {formatAddress(tokenDetails.recipient)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>New Balance:</strong>
              <span>{parseFloat(tokenDetails.newBalance).toLocaleString()} {tokenDetails.tokenSymbol}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Total Supply:</strong>
              <span>{parseFloat(tokenDetails.totalSupply).toLocaleString()} {tokenDetails.tokenSymbol}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Contract Address:</strong>
              <span 
                onClick={() => copyToClipboard(contractAddress)}
                style={{ 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  color: '#007bff'
                }}
                title="Click to copy contract address"
              >
                {formatAddress(contractAddress)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Transaction Hash:</strong>
              <span 
                onClick={() => copyToClipboard(tokenDetails.txHash)}
                style={{ 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  color: '#007bff'
                }}
                title="Click to copy transaction hash"
              >
                {formatAddress(tokenDetails.txHash)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Timestamp:</strong>
              <span>{tokenDetails.timestamp}</span>
            </div>

            <div style={{ 
              marginTop: '15px', 
              paddingTop: '15px', 
              borderTop: '1px solid #ddd',
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${tokenDetails.txHash}`, '_blank')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'none'
                }}
              >
                View on Etherscan
              </button>

              <button
                onClick={() => window.open(`https://sepolia.etherscan.io/address/${contractAddress}`, '_blank')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                View Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ERC20MintButton;