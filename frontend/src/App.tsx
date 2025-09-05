import { useState } from 'react'
import ethereumLogo from './assets/ethereum-eth-logo.png'
import AccountTab from './components/Tabs/accountTab'
import ERC20Tab from './components/Tabs/erc20Tab'
import ERC721Tab from './components/Tabs/erc721Tab'
import './App.css'

type TabType = 'account' | 'erc20' | 'erc721';

function App() {
  const [account, setAccount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('account');

  const handleConnect = (address: string) => {
    setAccount(address);
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <AccountTab
            account={account}
            setAccount={handleConnect}
          />
        );
      case 'erc20':
        return <ERC20Tab account={account} />;
      case 'erc721':
        return <ERC721Tab account={account} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div>
        <a href="https://ethereum.foundation" target="_blank">
          <img src={ethereumLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Ethereum DApp</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px',
          borderBottom: '1px solid #ccc',
          paddingBottom: '10px'
        }}>
          <button 
            onClick={() => setActiveTab('account')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'account' ? '#646cff' : 'transparent',
              color: activeTab === 'account' ? 'white' : '#646cff',
              border: '1px solid #646cff',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Account Checker
          </button>
          <button 
            onClick={() => setActiveTab('erc20')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'erc20' ? '#646cff' : 'transparent',
              color: activeTab === 'erc20' ? 'white' : '#646cff',
              border: '1px solid #646cff',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ERC20 Minting
          </button>
          <button 
            onClick={() => setActiveTab('erc721')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'erc721' ? '#646cff' : 'transparent',
              color: activeTab === 'erc721' ? 'white' : '#646cff',
              border: '1px solid #646cff',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ERC721 Minting
          </button>
        </div>
      </div>

      <div className="card">
        {renderTabContent()}
      </div>
      
      <p className="read-the-docs">
        Click on the Ethereum logo to learn more
      </p>
    </>
  )
}

export default App
