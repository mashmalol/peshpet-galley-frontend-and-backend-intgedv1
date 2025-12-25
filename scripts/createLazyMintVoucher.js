const { ethers } = require("hardhat");

/**
 * Create a lazy mint voucher for PeshPet NFT
 * This voucher can be redeemed later to mint the NFT on-demand
 */

// EIP-712 Domain
const SIGNING_DOMAIN = "PeshPet-Voucher";
const SIGNATURE_VERSION = "1";

/**
 * LazyMintVoucher structure
 */
const LazyMintVoucherType = {
  LazyMintVoucher: [
    { name: "tokenId", type: "uint256" },
    { name: "minPrice", type: "uint256" },
    { name: "tokenURI", type: "string" },
    { name: "name", type: "string" },
    { name: "species", type: "string" },
    { name: "nfcId", type: "string" },
    { name: "microchipId", type: "string" },
    { name: "birthDate", type: "uint256" },
    { name: "has3DPrinting", type: "bool" },
    { name: "hasInsurance", type: "bool" },
    { name: "deadline", type: "uint256" },
  ],
};

/**
 * Create and sign a lazy mint voucher
 * @param {Object} signer - Ethers.js signer (must be authorized breeder)
 * @param {string} contractAddress - Address of the deployed PeshPetNFT contract
 * @param {Object} voucherData - Voucher data
 * @returns {Object} Signed voucher
 */
async function createLazyMintVoucher(signer, contractAddress, voucherData) {
  const {
    tokenId,
    minPrice,
    tokenURI,
    petInfo,
    deadline,
  } = voucherData;

  // Get chain ID
  const network = await signer.provider.getNetwork();
  const chainId = network.chainId;

  // Create the domain
  const domain = {
    name: SIGNING_DOMAIN,
    version: SIGNATURE_VERSION,
    verifyingContract: contractAddress,
    chainId: chainId,
  };

  // Flatten the voucher for signing
  const voucher = {
    tokenId: tokenId,
    minPrice: minPrice,
    tokenURI: tokenURI,
    name: petInfo.name,
    species: petInfo.species,
    nfcId: petInfo.nfcId,
    microchipId: petInfo.microchipId,
    birthDate: petInfo.birthDate,
    has3DPrinting: petInfo.has3DPrinting,
    hasInsurance: petInfo.hasInsurance,
    deadline: deadline,
  };

  // Sign the voucher
  const signature = await signer._signTypedData(domain, LazyMintVoucherType, voucher);

  return {
    tokenId: tokenId,
    minPrice: minPrice,
    tokenURI: tokenURI,
    petInfo: petInfo,
    deadline: deadline,
    signature: signature,
  };
}

/**
 * Example usage
 */
async function main() {
  const [breeder] = await ethers.getSigners();
  
  // Replace with your deployed contract address
  const contractAddress = "0xYourContractAddressHere";

  // Example voucher data
  const voucherData = {
    tokenId: 1000, // Use a unique token ID (can be sequential or random)
    minPrice: ethers.parseEther("0.1"), // Minimum price in ETH
    tokenURI: "ipfs://QmYourIPFSHashHere", // IPFS URI for metadata
    deadline: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
    petInfo: {
      name: "Fluffy",
      species: "Golden Retriever",
      nfcId: "NFC-12345",
      microchipId: "CHIP-67890",
      birthDate: Math.floor(Date.now() / 1000), // Current timestamp
      breeder: ethers.ZeroAddress, // Will be set to signer during minting
      has3DPrinting: true,
      hasInsurance: false,
    },
  };

  const signedVoucher = await createLazyMintVoucher(
    breeder,
    contractAddress,
    voucherData
  );

  console.log("Lazy Mint Voucher Created:");
  console.log(JSON.stringify(signedVoucher, null, 2));
  
  // Save to file
  const fs = require("fs");
  fs.writeFileSync(
    `voucher-${voucherData.tokenId}.json`,
    JSON.stringify(signedVoucher, null, 2)
  );
  
  console.log(`\nVoucher saved to voucher-${voucherData.tokenId}.json`);
}

// Export for use in other scripts
module.exports = { createLazyMintVoucher };

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
