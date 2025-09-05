import { useState } from 'react';
import ERC20MintButton from '../Buttons/erc20MintButton';

interface ERC20TabProps {
  account: string;
}

interface TokenDetails {
  name: string;
  symbol: string;
  totalSupply: string;
  balance: string;
  decimals: number;
}

const ERC20Tab: React.FC<ERC20TabProps> = ({ account }) => {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [mintAmount, setMintAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

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

      {/* Token Details Display */}
      {tokenDetails && (
        <div style={{ 
          marginBottom: '30px', 
          padding: '15px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h4>Token Details</h4>
          <div><strong>Name:</strong> {tokenDetails.name}</div>
          <div><strong>Symbol:</strong> {tokenDetails.symbol}</div>
          <div><strong>Decimals:</strong> {tokenDetails.decimals}</div>
          <div><strong>Total Supply:</strong> {tokenDetails.totalSupply}</div>
          {account && <div><strong>Your Balance:</strong> {tokenDetails.balance}</div>}
        </div>
      )}

      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h4>Mint Tokens</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Amount to Mint:
          </label>
          <input
            type="number"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
            step="0.000001"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <ERC20MintButton
            account={account}
            mintAmount={mintAmount}
            onMintSuccess={setSuccess}
            onMintError={setError}
        />
        
        {!account && (
          <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
            Please connect your wallet to mint tokens
          </p>
        )}
      </div>
    </div>
  );
};

export default ERC20Tab;