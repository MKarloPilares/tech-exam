import { useState } from 'react'
import ethereumLogo from './assets/ethereum-eth-logo.png'
import ConnectButton from './components/connectButton'
import './App.css'

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
}

function App() {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleConnect = (address: string) => {
    setAccount(address);
  }

  const handleGetBalance = (balance: string) => {
    setBalance(balance);
  }

  const handleSetTransactions = (transactions: Transaction[]) => {
    setTransactions(transactions);
  }

  return (
    <>
      <div>
        <a href="https://ethereum.foundation" target="_blank">
          <img src={ethereumLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Ethereum Balance Checker</h1>
      <div className="card">

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
          setAccount={handleConnect}
          account={account}
          setBalance={handleGetBalance}
          setTransactions={handleSetTransactions}
        />
        <p>
          {balance}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Ethereum logo to learn more
      </p>
    </>
  )
}

export default App
