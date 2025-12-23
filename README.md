# PeshPet NFT Gallery

A React-based NFT marketplace for PeshPet - digital collectible pets with physical NFC integration, 3D printing services, and insurance.

## Features

- 🐾 **Mint NFTs** - Create unique digital pets with physical NFC tags
- 🏪 **Marketplace** - Buy and sell verified digital pets
- 🖨️ **3D Printing** - Order physical replicas of your NFTs
- 🛡️ **Insurance** - Protect your digital assets
- 📱 **NFC Integration** - Link physical pets to on-chain tokens
- 💎 **ERC721 Standard** - OpenSea compatible metadata

## Tech Stack

- **Frontend**: React.js, ethers.js
- **Smart Contracts**: Solidity ^0.8.20, OpenZeppelin
- **Storage**: IPFS (Pinata)
- **Wallet**: MetaMask integration
- **Styling**: Custom CSS with retro vaporwave theme

## Getting Started

### Prerequisites

- Node.js v16+
- MetaMask browser extension
- Pinata account (for IPFS uploads)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd "smartcontract gallery core"
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```env
REACT_APP_CONTRACT_ADDRESS=<your_contract_address>
REACT_APP_PINATA_API_KEY=<your_pinata_api_key>
REACT_APP_PINATA_SECRET_KEY=<your_pinata_secret_key>
REACT_APP_PINATA_JWT=<your_pinata_jwt>
```

4. Start development server
```bash
npm start
```

## Smart Contract Deployment

1. Install Hardhat
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. Initialize Hardhat
```bash
npx hardhat
```

3. Deploy contract
```bash
npx hardhat run scripts/deploy.js --network <network>
```

## Project Structure

```
src/
├── components/
│   ├── Header.jsx              # Navigation header with wallet connection
│   ├── ExploreGallery.jsx      # Browse and filter NFTs
│   ├── MintForm.jsx            # Mint new pet NFTs
│   └── UserDashboard.jsx       # Manage owned NFTs and services
├── utils/
│   ├── web3Handler.js          # Smart contract interactions
│   └── ipfsUploader.js         # IPFS file uploads
├── contracts/
│   └── PeshPetNFT.sol          # ERC721 smart contract
└── App.js                      # Main application component
```

## Smart Contract Functions

### Core NFT Functions
- `mintPet()` - Mint new pet NFT with NFC integration
- `listPetForSale()` - List NFT on marketplace
- `buyPet()` - Purchase listed NFT
- `transferWithNFC()` - Transfer using NFC tag ID

### Marketplace Features
- Integrated marketplace in main contract
- Reentrancy protection on all external functions
- Automatic royalty distribution to breeders
- NFC tag mapping to token IDs

## Security Features

- ✅ ReentrancyGuard on all state-changing functions
- ✅ OpenZeppelin battle-tested contracts
- ✅ Access control for minting (authorized breeders)
- ✅ Royalty system for original creators
- ✅ Safe transfer patterns

## Metadata Standard

NFT metadata follows OpenSea standard with custom attributes:

```json
{
  "name": "Pet Name",
  "description": "Pet description",
  "image": "ipfs://...",
  "animation_url": "ipfs://...3dmodel.glb",
  "attributes": [
    { "trait_type": "Species", "value": "Golden Retriever" },
    { "trait_type": "NFC Tag ID", "value": "NFC-123" },
    { "trait_type": "Insurance", "value": "Active" },
    { "trait_type": "3D Printing", "value": "Available" }
  ]
}
```

## Development Roadmap

- [x] Smart contract with marketplace
- [x] React frontend with wallet connection
- [x] IPFS integration for metadata
- [x] NFT minting interface
- [x] Gallery and filtering
- [x] User dashboard
- [ ] Smart contract deployment
- [ ] 3D model viewer integration
- [ ] NFC mobile scanner
- [ ] Insurance provider integration
- [ ] Breeding functionality
- [ ] Auction system

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: <repository-url>/issues
- Documentation: See `/docs` folder

## Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Pinata for IPFS infrastructure
- React community for excellent tooling
