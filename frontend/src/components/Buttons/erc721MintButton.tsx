import { useState } from 'react';
import { ethers } from 'ethers';
import { ERC721_ABI } from '../Contracts/erc721ABI';

interface NFTDetails {
  txHash: string;
  recipient: string;
  tokenId: string;
  tokenURI?: string;
  newBalance: string;
  totalSupply: string;
  contractName: string;
  contractSymbol: string;
  timestamp: string;
}

interface ERC721MintButtonProps {
  account: string;
  onMintSuccess?: (txHash: string, tokenId: string, recipient: string) => void;
  onMintError?: (error: string) => void;
}

const ERC721MintButton: React.FC<ERC721MintButtonProps> = ({
  account,
  onMintSuccess,
  onMintError
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const contractAddress = import.meta.env.VITE_ERC721_CONTRACT_ADDRESS;

  const fetchNFTDetails = async (contract: ethers.Contract, txHash: string, recipient: string, tokenId: string) => {
    try {
      const [balance, totalSupply, contractName, contractSymbol] = await Promise.all([
        contract.balanceOf(recipient),
        contract.totalSupply ? contract.totalSupply() : Promise.resolve(0),
        contract.name(),
        contract.symbol()
      ]);

      return {
        txHash,
        recipient,
        tokenId,
        newBalance: balance.toString(),
        totalSupply: totalSupply.toString(),
        contractName,
        contractSymbol,
        timestamp: new Date().toLocaleString()
      };
    } catch (error) {
      console.error('Error fetching NFT details:', error);
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

    setIsLoading(true);
    setNftDetails(null);
    setShowDetails(false);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ERC721_ABI, signer);
      
      let gasEstimate;
      let tx;
      let mintedTokenId;
      
      try {
          try {
            gasEstimate = await contract.mint.estimateGas(account);
            gasEstimate = gasEstimate * BigInt(120) / BigInt(100);
            tx = await contract.mint(account, { gasLimit: gasEstimate });
          } catch (error) {
            gasEstimate = await contract.safeMint.estimateGas(account);
            gasEstimate = gasEstimate * BigInt(120) / BigInt(100);
            tx = await contract.safeMint(account, { gasLimit: gasEstimate });
          }
      } catch (error) {
        console.warn('Gas estimation failed, using default');
        gasEstimate = BigInt(300000);
        
        tx = await contract.mint(account, { gasLimit: gasEstimate });
      }
      
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        const transferEvent = receipt.logs.find((log: any) => {
          try {
            const parsedLog = contract.interface.parseLog(log);
            return parsedLog?.name === 'Transfer';
          } catch {
            return false;
          }
        });

        if (transferEvent) {
          const parsedLog = contract.interface.parseLog(transferEvent);
          mintedTokenId = parsedLog?.args?.tokenId?.toString() || '0';
        } else {
          // Fallback: try to get the latest token ID
          try {
            const totalSupply = await contract.totalSupply();
            mintedTokenId = (totalSupply - BigInt(1)).toString();
          } catch {
            mintedTokenId = '0';
          }
        }
      
        const details = await fetchNFTDetails(contract, tx.hash, account, mintedTokenId);
        if (details) {
          setNftDetails(details);
          setShowDetails(true);
        }
        
        onMintSuccess?.(tx.hash, mintedTokenId, account);
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error: any) {
      console.error('Minting error:', error);
      
      let errorMessage = 'Failed to mint NFT';
      
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
      } else if (error.message?.includes('ERC721: token already minted')) {
        errorMessage = 'Token ID already exists';
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
          disabled={isLoading || !account || !contractAddress}
          style={{
            padding: '10px 20px',
            backgroundColor: (isLoading || !account || !contractAddress) 
              ? '#ccc' : '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (isLoading || !account || !contractAddress) 
              ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Minting NFT...' : 'Mint NFT'}
        </button>

        {nftDetails && (
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

      {showDetails && nftDetails && (
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
            ✅ NFT Minted Successfully!
          </h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Collection:</strong>
              <span>{nftDetails.contractName} ({nftDetails.contractSymbol})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Token ID:</strong>
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                #{nftDetails.tokenId}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Owner:</strong>
              <span 
                onClick={() => copyToClipboard(nftDetails.recipient)}
                style={{ 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  color: '#007bff'
                }}
                title="Click to copy full address"
              >
                {formatAddress(nftDetails.recipient)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Owner's NFT Balance:</strong>
              <span>{nftDetails.newBalance}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Total Supply:</strong>
              <span>{nftDetails.totalSupply}</span>
            </div>

            {nftDetails.tokenURI && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Token URI:</strong>
                <span 
                  onClick={() => copyToClipboard(nftDetails.tokenURI!)}
                  style={{ 
                    cursor: 'pointer', 
                    textDecoration: 'underline',
                    color: '#007bff',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title="Click to copy token URI"
                >
                  {nftDetails.tokenURI.length > 30 ? 
                    `${nftDetails.tokenURI.slice(0, 30)}...` : 
                    nftDetails.tokenURI
                  }
                </span>
              </div>
            )}

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
                onClick={() => copyToClipboard(nftDetails.txHash)}
                style={{ 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  color: '#007bff'
                }}
                title="Click to copy transaction hash"
              >
                {formatAddress(nftDetails.txHash)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Timestamp:</strong>
              <span>{nftDetails.timestamp}</span>
            </div>

            <div style={{ 
              marginTop: '15px', 
              paddingTop: '15px', 
              borderTop: '1px solid #ddd',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${nftDetails.txHash}`, '_blank')}
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

              <button
                onClick={() => window.open(`https://sepolia.etherscan.io/nft/${contractAddress}/${nftDetails.tokenId}`, '_blank')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                View NFT
              </button>

              {nftDetails.tokenURI && (
                <button
                  onClick={() => window.open(nftDetails.tokenURI!, '_blank')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#fd7e14',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  View Metadata
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ERC721MintButton;