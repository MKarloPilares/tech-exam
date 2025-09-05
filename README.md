# Tech Exam - Full-Stack Decentralized Application

## Overview

This is a Full-Stack Decentralized Application project that demonstrates blockchain application development capabilities. The project includes:
- **Frontend**: React with TypeScript and Vite for fast development
- **Backend**: Rust-based API server with Web3 integration
- **Smart Contracts**: Solidity contracts deployed on Sepolia testnet

## Prerequisites

Before running this application locally, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Rust** (latest stable version) with Cargo
- **Git** for version control
- **MetaMask** browser extension (for frontend interaction)

## Dependencies

### Frontend Dependencies
- **React** - UI library for building user interfaces
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Ethers.js** - Ethereum library for blockchain interaction

### Backend Dependencies
- **Axum** - Modern async web framework for Rust
- **Tokio** - Asynchronous runtime for Rust
- **Serde** - Serialization/deserialization framework
- **Web3** - Ethereum integration for Rust
- **Ethers-rs** - Rust Ethereum library
- **Reqwest** - HTTP client library
- **Dotenv** - Environment variable management
- **Anyhow** - Error handling library

### Smart Contract Dependencies
- **Hardhat** - Ethereum development environment
- **OpenZeppelin** - Secure smart contract library
- **Ethers.js** - Ethereum library for deployment scripts
- **Chai** - Testing framework
- **TypeScript** - Type-safe JavaScript development

## Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/MKarloPilares/tech-exam
cd tech-exam
```

### 2. Backend Setup
```bash
cd backend

# Install Rust dependencies
cargo build

# Create environment file
cp .env.example .env
```

Add the following environment variables to `backend/.env`:
```env
ETH_RPC_URL=Your RPC address
ADDRESS=IP address the server should bind to (default: 127.0.0.1)
PORT=Port the server should bind to (default: 3000)
```

### 3. Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install
# or
yarn install

# Create environment file
cp .env.example .env
```

Add the following environment variables to `frontend/.env`:
```env
VITE_ETHERSCAN_API_KEY = Your Etherscan API Key
VITE_ERC20_CONTRACT_ADDRESS = Contract address of ERC20 Contract (default: 0x7d4D8d2a22d5342071a65Cb4F48907B9128BB5Ff)
VITE_ERC721_CONTRACT_ADDRESS = Contract address of ERC721 Contract (default: 0x5243869Cb8ec95E007B2864ECa8b706365d81041)
VITE_BACKEND_URL = Address and port of backend server (default: 127.0.0.1:3000)
```

### 4. Smart Contract Setup
```bash
cd smart_contract

# Install Solidity and Node.js dependencies
npm install

# Create environment file
cp .env.example .env
```

Add the following environment variables to `.env`:
```env
RPC_URL=Your RPC URL
PRIVATE_KEY=Your Ethereum Wallet Address Private Key
ETHERSCAN_API_KEY=Your Etherscan API Key
```

### 5. Compile Smart Contracts
```bash
npx hardhat compile
```

### 6. Run Tests
```bash
# Smart contract tests
npx hardhat test
```

### 7. Start Development Servers

#### Backend Server
```bash
cd backend
cargo run
```

#### Frontend Development Server
```bash
cd frontend
npm run dev
```
## Assumptions and Decisions
- **ERC20 + ERC721**: While instructions stated to pick one, to show understanding and capabilities as a blockchain developer, both were accomplished. In a production environments, requirements will be followed.
- **Permissive Cors**: Opens API endpoints for any URL that calls them for development.
- **Etherscan API For Transaction Data**: Allows checking of transaction data faster than getting block data from Metamask and iterating through it.
- **No Caching + No Database + No Containerization**: Could try and learn while building, however as this is an assessment of current skills, honesty and transparency were the top priorities.

## Known Issues and Limitations

### Current Limitations:
- **Network Dependency**: Requires internet connection for blockchain operations
- **Gas Costs**: Transaction costs on testnets (though minimal)
- **Browser Compatibility**: Requires modern browsers with Web3 support

### Known Issues:
- **Error Handling**: Some edge cases need better user feedback
- **No Caching**: Due to lack of experience with Redis
- **No Database**: Due to lack of experience with PostgresSQL and MongoDB
- **No Containerization**: Due to lack of experience in docker.
