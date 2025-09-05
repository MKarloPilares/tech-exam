import { useState } from 'react';
import ConnectButton from '../Buttons/connectButton';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
}

interface AccountTabProps {
  account: string;
  balance: string;
  onConnect: (address: string) => void;
  onGetBalance: (balance: string) => void;
}

const AccountTab: React.FC<AccountTabProps> = ({
  account,
  balance,
  onConnect,
  onGetBalance
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleSetTransactions = (transactions: Transaction[]) => {
    setTransactions(transactions);
  }

  return (
    <>
      {account && transactions.length > 0 && (
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <h3>Last 10 Transactions</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {transactions.map((tx, index) => (
              <div key={tx.hash} style={{ 
                border: '1px solid #ccc', 
                padding: '10px', 
                margin: '5px 0', 
                borderRadius: '5px',
                fontSize: '12px'
              }}>
                <div><strong>#{index + 1}</strong></div>
                <div><strong>Hash:</strong> {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}</div>
                <div><strong>From:</strong> {tx.from ? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}` : 'N/A'}</div>
                <div><strong>To:</strong> {tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : 'N/A'}</div>
                <div><strong>Value:</strong> {tx.value} ETH</div>
                <div><strong>Block:</strong> {tx.blockNumber}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConnectButton
        setAccount={onConnect}
        account={account}
        setBalance={onGetBalance}
        setTransactions={handleSetTransactions}
      />
      <p>{balance}</p>
    </>
  );
};

export default AccountTab;