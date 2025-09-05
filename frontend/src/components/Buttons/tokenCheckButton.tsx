import React from 'react';

interface TokenCheckButtonProps {
  address: string;
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
}

const TokenCheckButton: React.FC<TokenCheckButtonProps> = ({
  address,
  onSuccess,
  onError
}) => {
  const handleTokenCheck = async () => {
    if (!address.trim()) {
      onError('Please enter an address');
      return;
    }
    
    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(`http://${backendURL}/api/token/${address}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          onError('Please input a valid address');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      onSuccess(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('400')) {
        onError('Please input a valid address');
      } else {
        onError(`Token check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  return (
    <button 
      onClick={handleTokenCheck}
      style={{
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      Token Check
    </button>
  );
};

export default TokenCheckButton;
