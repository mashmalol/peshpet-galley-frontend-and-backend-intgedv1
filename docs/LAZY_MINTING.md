# Lazy Minting Feature - PeshPet NFT

## Overview

Lazy minting allows NFT creators to defer the minting cost until the NFT is purchased. Instead of minting all NFTs upfront (which costs gas), creators sign vouchers that can be redeemed later by buyers to mint the NFT on-demand.

## Benefits

1. **Zero Upfront Costs**: Creators don't pay gas fees until the NFT is sold
2. **Scalability**: Create unlimited vouchers without blockchain transactions
3. **Flexibility**: Vouchers can be distributed through various channels
4. **Security**: Cryptographically signed using EIP-712 standard

## How It Works

### 1. Create a Voucher (Off-Chain)

Breeders create and sign vouchers containing:
- Token ID
- Minimum price
- Metadata URI (IPFS)
- Pet information (name, species, NFC ID, etc.)
- Digital signature

```javascript
node scripts/createLazyMintVoucher.js
```

### 2. Distribute Voucher

The signed voucher (JSON file) can be:
- Sent directly to buyers
- Listed on marketplace
- Distributed via email/website
- Stored in database

### 3. Redeem Voucher (On-Chain)

Buyers redeem the voucher by:
- Uploading the JSON file
- Paying the minimum price
- Calling `lazyMint()` function

The contract:
- Verifies the signature
- Checks the signer is authorized
- Mints the NFT to the buyer
- Transfers payment to breeder

## Usage Guide

### For Breeders/Creators

#### Step 1: Prepare Metadata

Upload your NFT metadata to IPFS:
```json
{
  "name": "Fluffy",
  "description": "A friendly Golden Retriever",
  "image": "ipfs://QmImage...",
  "attributes": [...]
}
```

#### Step 2: Create Voucher

Edit `scripts/createLazyMintVoucher.js` with your details:

```javascript
const voucherData = {
  tokenId: 1000,
  minPrice: ethers.parseEther("0.1"), // 0.1 ETH
  tokenURI: "ipfs://QmYourHash...",
  petInfo: {
    name: "Fluffy",
    species: "Golden Retriever",
    nfcId: "NFC-12345",
    microchipId: "CHIP-67890",
    birthDate: 1704067200, // Unix timestamp
    has3DPrinting: true,
    hasInsurance: false,
  }
};
```

Run the script:
```bash
npx hardhat run scripts/createLazyMintVoucher.js --network localhost
```

This generates `voucher-1000.json`.

#### Step 3: Distribute

Send the voucher file to your buyer or upload to your marketplace.

### For Buyers/Collectors

#### Step 1: Obtain Voucher

Receive the `voucher-*.json` file from the creator.

#### Step 2: Redeem on Website

1. Go to the Lazy Mint page
2. Upload the voucher JSON file
3. Review the details
4. Click "Redeem & Mint NFT"
5. Confirm the transaction in MetaMask

#### Step 3: Own Your NFT

Once confirmed, the NFT is minted to your wallet!

## Smart Contract Functions

### `lazyMint(LazyMintVoucher calldata voucher)`

Redeems a voucher and mints the NFT.

**Parameters:**
- `voucher`: Signed voucher structure

**Returns:**
- `tokenId`: The minted token ID

**Events:**
- `PetLazyMinted(tokenId, redeemer, breeder, price)`
- `PetMinted(tokenId, owner, nfcId)`

### Voucher Structure

```solidity
struct LazyMintVoucher {
    uint256 tokenId;
    uint256 minPrice;
    string tokenURI;
    PetInfo petInfo;
    bytes signature;
}
```

## Security Considerations

### Signature Verification

The contract uses EIP-712 typed data signing:
- Domain separator prevents replay attacks across different contracts
- Chain ID prevents cross-chain replay attacks
- Nonce could be added for additional security

### Authorization

- Only authorized breeders can sign valid vouchers
- Contract owner can add/remove breeders
- Signature verification happens on-chain

### Best Practices

1. **Unique Token IDs**: Use sequential or random unique IDs
2. **NFC ID Uniqueness**: Ensure NFC IDs are unique across all vouchers
3. **Secure Storage**: Store voucher files securely
4. **Expiration**: Consider adding expiration dates to vouchers
5. **Price Protection**: Set appropriate minimum prices

## Integration Example

### Frontend Integration

```javascript
import { ethers } from 'ethers';
import LazyMint from './components/LazyMint';

function App() {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initContract = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);
    };
    
    initContract();
  }, []);

  return <LazyMint contract={contract} />;
}
```

### Backend Integration

```javascript
const { createLazyMintVoucher } = require('./scripts/createLazyMintVoucher');

// In your API endpoint
app.post('/api/create-voucher', async (req, res) => {
  const voucher = await createLazyMintVoucher(
    signer,
    contractAddress,
    req.body.voucherData
  );
  
  // Store in database
  await db.vouchers.insert(voucher);
  
  res.json({ voucher });
});
```

## Gas Costs Comparison

### Traditional Minting (100 NFTs)
- Mint 100 NFTs: ~0.15 ETH ($300 @ $2000/ETH)
- If only 10 sell: Lost ~0.135 ETH ($270)

### Lazy Minting (100 NFTs)
- Create 100 vouchers: $0 (off-chain)
- If 10 sell: Gas only paid for 10 mints
- Savings: ~0.135 ETH ($270)

## Troubleshooting

### "Invalid voucher signer"
- Ensure the signer is an authorized breeder
- Check that you're using the correct private key

### "Token already minted"
- Use a unique token ID
- Check if the voucher was already redeemed

### "NFC ID already registered"
- Each NFC ID can only be used once
- Use a unique NFC ID for each pet

### "Insufficient payment"
- Send at least the minimum price specified in voucher
- Account for gas fees in your wallet

## Advanced Features

### Bulk Voucher Creation

```javascript
const vouchers = [];
for (let i = 0; i < 100; i++) {
  const voucher = await createLazyMintVoucher(signer, address, {
    tokenId: 1000 + i,
    // ... other data
  });
  vouchers.push(voucher);
}
// Save all vouchers
fs.writeFileSync('vouchers-bulk.json', JSON.stringify(vouchers));
```

### Voucher Marketplace

Build a marketplace where:
1. Creators list vouchers
2. Buyers browse and purchase
3. Automatic redemption after payment
4. Secondary sales with royalties

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: [repository URL]
- Documentation: [docs URL]
- Discord: [community link]
