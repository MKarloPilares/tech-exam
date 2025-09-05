import React from 'react';

interface AccountCheckButtonProps {
  address: string;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

const AccountCheckButton: React.FC<AccountCheckButtonProps> = ({
  address,
  onSuccess,
  onError
}) => {
  const handleAccountCheck = async () => {
    if (!address.trim()) {
      onError('Please enter an address');
      return;
    }

    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(`http://${backendURL}/api/eth/${address}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          onError('Please input a valid address');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      onSuccess(`Account check successful: ${JSON.stringify(data)}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('400')) {
        onError('Please input a valid address');
      } else {
        onError(`Account check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  return (
    <button 
      onClick={handleAccountCheck}
      style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      Account Check
    </button>
  );
};

export default AccountCheckButton;
