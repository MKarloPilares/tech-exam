import React, { useState } from 'react';
import AccountCheckButton from '../Buttons/accountCheckButton';
import TokenCheckButton from '../Buttons/tokenCheckButton';

interface AccountData {
  address: string;
  balance: string;
  // Add other account fields as needed
}

interface TokenData {
  // Add token balance fields as needed
  [key: string]: any;
}

const AddressTab: React.FC = () => {
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  const handleAccountSuccess = (message: string) => {
    try {
      // Extract JSON from the success message
      const jsonStart = message.indexOf('{');
      if (jsonStart !== -1) {
        const jsonString = message.substring(jsonStart);
        const data = JSON.parse(jsonString);
        setAccountData(data);
      }
      setTokenData(null);
      setSuccess('Account check successful');
      setError('');
    } catch (error) {
      setSuccess(message);
      setError('');
    }
  };

  const handleAccountError = (error: string) => {
    setError(error);
    setSuccess('');
    setAccountData(null);
  };

  const handleTokenSuccess = (data: any) => {
    setTokenData(data);
    setAccountData(null);
    setError('');
    setSuccess('Token check successful');
  };

  const handleTokenError = (error: string) => {
    setError(error);
    setSuccess('');
    setTokenData(null);
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

      {/* Account Details Display */}
      {accountData && (
        <div style={{ 
          marginBottom: '30px', 
          padding: '15px', 
          backgroundColor: '#242424', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h4>Account Details</h4>
          {Object.entries(accountData).map(([key, value]) => (
            <div key={key}>
              <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}
            </div>
          ))}
        </div>
      )}

      {/* Token Data Display */}
      {tokenData && (
        <div style={{ 
          marginBottom: '30px', 
          padding: '15px', 
          backgroundColor: '#242424', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h4>Token Information</h4>
          {Object.entries(tokenData).map(([key, value]) => (
            <div key={key}>
              <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h4>Address Lookup</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Ethereum Address:
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Ethereum address (0x...)"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <AccountCheckButton
            address={address}
            onSuccess={handleAccountSuccess}
            onError={handleAccountError}
          />
          <TokenCheckButton
            address={address}
            onSuccess={handleTokenSuccess}
            onError={handleTokenError}
          />
        </div>
        
        <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
          Enter a valid Ethereum address to check account details or token balances
        </p>
      </div>
    </div>
  );
};

export default AddressTab;
