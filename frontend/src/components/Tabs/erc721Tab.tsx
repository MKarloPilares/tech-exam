import { useState } from 'react';
import ERC721MintButton from '../Buttons/erc721MintButton';

interface ERC721TabProps {
  account: string;
}

interface NFTCollectionDetails {
  name: string;
  symbol: string;
  totalSupply: string;
  balance: string;
}

const ERC721Tab: React.FC<ERC721TabProps> = ({ account }) => {
  const [collectionDetails, setCollectionDetails] = useState<NFTCollectionDetails | null>(null);
  const [tokenURI, setTokenURI] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleMintSuccess = (txHash: string, tokenId: string, recipient: string) => {
    setSuccess(`NFT minted successfully! Token ID: #${tokenId}`);
    setError('');
    setTokenURI('');
  };

  const handleMintError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess('');
  };

  return (
    <div style={{ textAlign: 'left' }}>
    
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffebee', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '15px',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: 'green', 
          backgroundColor: '#e8f5e8', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '15px',
          border: '1px solid #c8e6c9'
        }}>
          {success}
        </div>
      )}

      {collectionDetails && (
        <div style={{ 
          marginBottom: '30px', 
          padding: '15px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h4>NFT Collection Details</h4>
          <div><strong>Collection Name:</strong> {collectionDetails.name}</div>
          <div><strong>Symbol:</strong> {collectionDetails.symbol}</div>
          <div><strong>Total Supply:</strong> {collectionDetails.totalSupply} NFTs</div>
          {account && <div><strong>Your NFT Balance:</strong> {collectionDetails.balance} NFTs</div>}
        </div>
      )}

      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h4>Mint ERC721</h4>

        <ERC721MintButton
          account={account}
          onMintSuccess={handleMintSuccess}
          onMintError={handleMintError}
        />
        
        {!account && (
          <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
            Please connect your wallet to mint NFTs
          </p>
        )}
      </div>
    </div>
  );
};

export default ERC721Tab;