import { ethers } from 'ethers';
import PeshPetNFT from '../contracts/PeshPetNFT.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0x...'; // Add your deployed contract address

/**
 * Get Web3 provider from MetaMask
 */
export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  throw new Error('MetaMask not installed');
};

/**
 * Get signer (current account)
 */
export const getSigner = async () => {
  const provider = getProvider();
  return provider.getSigner();
};

/**
 * Get contract instance
 */
export const getContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, PeshPetNFT.abi, signer);
};

/**
 * Connect wallet
 */
export const connectWallet = async () => {
  try {
    const provider = getProvider();
    const accounts = await provider.send('eth_requestAccounts', []);
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

/**
 * Get current account
 */
export const getCurrentAccount = async () => {
  try {
    const provider = getProvider();
    const accounts = await provider.send('eth_accounts', []);
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

/**
 * Mint a new pet NFT
 */
export const mintPet = async (to, tokenURI, petInfo) => {
  try {
    const contract = await getContract();
    const tx = await contract.mintPet(to, tokenURI, petInfo);
    const receipt = await tx.wait();
    
    // Find PetMinted event
    const event = receipt.events?.find(e => e.event === 'PetMinted');
    const tokenId = event?.args?.tokenId;
    
    return { tokenId, txHash: receipt.transactionHash };
  } catch (error) {
    console.error('Error minting pet:', error);
    throw error;
  }
};

/**
 * List pet for sale
 */
export const listPetForSale = async (tokenId, priceInEth) => {
  try {
    const contract = await getContract();
    const priceInWei = ethers.utils.parseEther(priceInEth.toString());
    const tx = await contract.listPetForSale(tokenId, priceInWei);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error listing pet:', error);
    throw error;
  }
};

/**
 * Unlist pet from sale
 */
export const unlistPet = async (tokenId) => {
  try {
    const contract = await getContract();
    const tx = await contract.unlistPet(tokenId);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error unlisting pet:', error);
    throw error;
  }
};

/**
 * Buy a pet
 */
export const buyPet = async (tokenId, priceInEth) => {
  try {
    const contract = await getContract();
    const priceInWei = ethers.utils.parseEther(priceInEth.toString());
    const tx = await contract.buyPet(tokenId, { value: priceInWei });
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error buying pet:', error);
    throw error;
  }
};

/**
 * Get pet information
 */
export const getPetInfo = async (tokenId) => {
  try {
    const contract = await getContract();
    const info = await contract.getPetInfo(tokenId);
    return info;
  } catch (error) {
    console.error('Error getting pet info:', error);
    throw error;
  }
};

/**
 * Get listing information
 */
export const getListing = async (tokenId) => {
  try {
    const contract = await getContract();
    const listing = await contract.listings(tokenId);
    return {
      price: ethers.utils.formatEther(listing.price),
      seller: listing.seller,
      active: listing.active
    };
  } catch (error) {
    console.error('Error getting listing:', error);
    throw error;
  }
};

/**
 * Get all pets owned by an address
 */
export const getOwnedPets = async (ownerAddress) => {
  try {
    const contract = await getContract();
    const totalSupply = await contract.totalSupply();
    const ownedPets = [];

    for (let i = 1; i <= totalSupply; i++) {
      try {
        const owner = await contract.ownerOf(i);
        if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
          const tokenURI = await contract.tokenURI(i);
          const petInfo = await contract.getPetInfo(i);
          const listing = await contract.listings(i);
          
          ownedPets.push({
            tokenId: i,
            tokenURI,
            petInfo,
            listing: {
              price: ethers.utils.formatEther(listing.price),
              active: listing.active
            }
          });
        }
      } catch (err) {
        // Token might not exist or be burned
        continue;
      }
    }

    return ownedPets;
  } catch (error) {
    console.error('Error getting owned pets:', error);
    throw error;
  }
};

/**
 * Get all listed pets
 */
export const getAllListedPets = async () => {
  try {
    const contract = await getContract();
    const totalSupply = await contract.totalSupply();
    const listedPets = [];

    for (let i = 1; i <= totalSupply; i++) {
      try {
        const listing = await contract.listings(i);
        if (listing.active) {
          const owner = await contract.ownerOf(i);
          const tokenURI = await contract.tokenURI(i);
          const petInfo = await contract.getPetInfo(i);
          
          listedPets.push({
            tokenId: i,
            tokenURI,
            petInfo,
            owner,
            price: ethers.utils.formatEther(listing.price)
          });
        }
      } catch (err) {
        continue;
      }
    }

    return listedPets;
  } catch (error) {
    console.error('Error getting listed pets:', error);
    throw error;
  }
};

/**
 * Transfer pet using NFC
 */
export const transferWithNFC = async (nfcId, newOwner) => {
  try {
    const contract = await getContract();
    const tx = await contract.transferWithNFC(nfcId, newOwner);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error transferring with NFC:', error);
    throw error;
  }
};
