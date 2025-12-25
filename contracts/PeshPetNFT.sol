// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title PeshPetNFT
 * @dev ERC721 NFT contract for PeshPet digital pets with marketplace, NFC integration, and lazy minting
 */
contract PeshPetNFT is ERC721, ERC721URIStorage, EIP712, ReentrancyGuard, Pausable, Ownable {
    using Counters for Counters.Counter;
    using ECDSA for bytes32;
    
    Counters.Counter private _tokenIds;

    // EIP712 domain separator
    string private constant SIGNING_DOMAIN = "PeshPet-Voucher";
    string private constant SIGNATURE_VERSION = "1";

    // Royalty percentage (basis points, e.g., 1000 = 10%)
    uint256 public royaltyBasisPoints = 1000;

    // Price validation constants
    uint256 public constant MIN_PRICE = 0.001 ether;
    uint256 public constant MAX_PRICE = 1000 ether;

    // Rate limiting
    mapping(address => uint256) public lastMintTime;
    uint256 public constant MINT_COOLDOWN = 1 minutes;

    // Lazy minting voucher structure
    struct LazyMintVoucher {
        uint256 tokenId;
        uint256 minPrice;
        string tokenURI;
        PetInfo petInfo;
        uint256 deadline;
        bytes signature;
    }

    // Marketplace listings
    struct Listing {
        uint256 price;
        address seller;
        bool active;
    }

    // Pet metadata
    struct PetInfo {
        string name;
        string species;
        string nfcId;
        string microchipId;
        uint256 birthDate;
        address breeder;
        bool has3DPrinting;
        bool hasInsurance;
    }

    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => PetInfo) public petInfo;
    mapping(string => uint256) public nfcToTokenId;
    mapping(uint256 => string) public tokenIdToNFC;
    mapping(address => bool) public authorizedBreeders;
    mapping(uint256 => bool) public lazyMinted; // Track which tokens were lazy minted
    mapping(bytes32 => bool) private _usedVouchers; // Prevent voucher replay attacks

    // Events
    event PetMinted(uint256 indexed tokenId, address indexed owner, string nfcId);
    event PetLazyMinted(uint256 indexed tokenId, address indexed redeemer, address indexed breeder, uint256 price);
    event PetListed(uint256 indexed tokenId, uint256 price, address indexed seller);
    event PetUnlisted(uint256 indexed tokenId);
    event PetSold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    event NFCTransfer(string indexed nfcId, uint256 indexed tokenId, address indexed newOwner);
    event BreederAuthorized(address indexed breeder);
    event BreederRevoked(address indexed breeder);
    event SecurityAlert(string message, address indexed actor, uint256 timestamp);
    event LargeTransaction(uint256 indexed tokenId, uint256 amount, address indexed from, address indexed to);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);

    constructor() ERC721("PeshPet", "PESH") EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) Ownable(msg.sender) {
        authorizedBreeders[msg.sender] = true;
    }

    // Modifier for authorized breeders
    modifier onlyBreeder() {
        require(authorizedBreeders[msg.sender] || msg.sender == owner(), "Not authorized breeder");
        _;
    }

    /**
     * @dev Mint a new PeshPet NFT
     * @param _to Address to mint the NFT to
     * @param _tokenURI IPFS URI containing metadata
     * @param _petInfo Pet information struct
     */
    function mintPet(
        address _to,
        string memory _tokenURI,
        PetInfo memory _petInfo
    ) public onlyBreeder whenNotPaused returns (uint256) {
        require(_to != address(0), "Cannot mint to zero address");
        require(block.timestamp >= lastMintTime[msg.sender] + MINT_COOLDOWN, "Minting too fast");
        require(bytes(_petInfo.nfcId).length > 0, "NFC ID required");
        require(nfcToTokenId[_petInfo.nfcId] == 0, "NFC ID already registered");

        lastMintTime[msg.sender] = block.timestamp;

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(_to, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        // Store pet info
        petInfo[newTokenId] = _petInfo;
        petInfo[newTokenId].breeder = msg.sender;

        // Map NFC ID to token
        nfcToTokenId[_petInfo.nfcId] = newTokenId;
        tokenIdToNFC[newTokenId] = _petInfo.nfcId;

        emit PetMinted(newTokenId, _to, _petInfo.nfcId);
        return newTokenId;
    }

    /**
     * @dev List a pet for sale
     * @param _tokenId Token ID to list
     * @param _price Price in wei
     */
    function listPetForSale(uint256 _tokenId, uint256 _price) external nonReentrant whenNotPaused {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_price >= MIN_PRICE, "Price too low");
        require(_price <= MAX_PRICE, "Price too high");
        require(!listings[_tokenId].active, "Already listed");

        listings[_tokenId] = Listing({
            price: _price,
            seller: msg.sender,
            active: true
        });

        emit PetListed(_tokenId, _price, msg.sender);
    }

    /**
     * @dev Unlist a pet from sale
     * @param _tokenId Token ID to unlist
     */
    function unlistPet(uint256 _tokenId) external nonReentrant {
        require(listings[_tokenId].seller == msg.sender, "Not the seller");
        require(listings[_tokenId].active, "Not listed");

        delete listings[_tokenId];
        emit PetUnlisted(_tokenId);
    }

    /**
     * @dev Buy a listed pet
     * @param _tokenId Token ID to purchase
     */
    function buyPet(uint256 _tokenId) external payable nonReentrant whenNotPaused {
        Listing memory listing = listings[_tokenId];
        require(listing.active, "Pet not for sale");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own pet");

        // Monitor large transactions
        if (msg.value > 10 ether) {
            emit LargeTransaction(_tokenId, msg.value, listing.seller, msg.sender);
        }

        address seller = listing.seller;
        uint256 salePrice = listing.price;

        // Calculate royalty
        uint256 royaltyAmount = (salePrice * royaltyBasisPoints) / 10000;
        uint256 sellerAmount = salePrice - royaltyAmount;

        // Clear listing
        delete listings[_tokenId];

        // Transfer NFT
        _transfer(seller, msg.sender, _tokenId);

        // Transfer payments
        (bool sentToSeller, ) = payable(seller).call{value: sellerAmount}("");
        require(sentToSeller, "Failed to send to seller");

        // Send royalty to breeder
        address breeder = petInfo[_tokenId].breeder;
        if (royaltyAmount > 0 && breeder != address(0)) {
            (bool sentToBreeder, ) = payable(breeder).call{value: royaltyAmount}("");
            require(sentToBreeder, "Failed to send royalty");
        }

        // Refund excess payment
        if (msg.value > salePrice) {
            (bool refunded, ) = payable(msg.sender).call{value: msg.value - salePrice}("");
            require(refunded, "Failed to refund excess");
        }

        emit PetSold(_tokenId, seller, msg.sender, salePrice);
    }

    /**
     * @dev Update pet metadata (only owner)
     * @param _tokenId Token ID
     * @param _tokenURI New IPFS URI
     */
    function updatePetMetadata(uint256 _tokenId, string memory _tokenURI) external {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        _setTokenURI(_tokenId, _tokenURI);
    }

    /**
     * @dev Get complete pet information
     * @param _tokenId Token ID
     */
    function getPetInfo(uint256 _tokenId) external view returns (PetInfo memory) {
        require(_ownerOf(_tokenId) != address(0), "Pet does not exist");
        return petInfo[_tokenId];
    }

    /**
     * @dev Transfer using NFC ID
     * @param _nfcId NFC tag ID
     * @param _newOwner New owner address
     */
    function transferWithNFC(string memory _nfcId, address _newOwner) external nonReentrant {
        uint256 tokenId = nfcToTokenId[_nfcId];
        require(tokenId != 0, "NFC ID not registered");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(_newOwner != address(0), "Invalid new owner");

        _transfer(msg.sender, _newOwner, tokenId);
        emit NFCTransfer(_nfcId, tokenId, _newOwner);
    }

    /**
     * @dev Authorize a breeder
     * @param _breeder Breeder address
     */
    function authorizeBreeder(address _breeder) external onlyOwner {
        authorizedBreeders[_breeder] = true;
        emit BreederAuthorized(_breeder);
    }

    /**
     * @dev Revoke breeder authorization
     * @param _breeder Breeder address
     */
    function revokeBreeder(address _breeder) external onlyOwner {
        authorizedBreeders[_breeder] = false;
        emit BreederRevoked(_breeder);
    }

    /**
     * @dev Set royalty percentage
     * @param _basisPoints Royalty in basis points (e.g., 1000 = 10%)
     */
    function setRoyalty(uint256 _basisPoints) external onlyOwner {
        require(_basisPoints <= 1500, "Royalty too high"); // Max 15%
        royaltyBasisPoints = _basisPoints;
    }

    /**
     * @dev Get total minted pets
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @dev Lazy mint - Redeem a voucher and mint NFT on-demand
     * @param voucher The lazy mint voucher signed by an authorized breeder
     */
    function lazyMint(LazyMintVoucher calldata voucher) 
        external 
        payable 
        nonReentrant
        whenNotPaused
        returns (uint256) 
    {
        require(msg.value >= voucher.minPrice, "Insufficient payment");
        require(voucher.minPrice >= MIN_PRICE, "Min price too low");
        require(voucher.minPrice <= MAX_PRICE, "Min price too high");
        require(block.timestamp <= voucher.deadline, "Voucher expired");
        
        // Prevent voucher replay attacks
        bytes32 voucherHash = _hashVoucher(voucher);
        require(!_usedVouchers[voucherHash], "Voucher already used");
        _usedVouchers[voucherHash] = true;
        
        // Verify the signature and get the signer
        address signer = _verifyVoucher(voucher);
        require(authorizedBreeders[signer] || signer == owner(), "Invalid voucher signer");
        
        // Check if token was already minted
        require(!_exists(voucher.tokenId), "Token already minted");
        
        // Ensure tokenId doesn't conflict with regular minting
        require(voucher.tokenId > _tokenIds.current(), "Token ID must be higher than current supply");
        
        // Verify NFC ID is unique
        require(bytes(voucher.petInfo.nfcId).length > 0, "NFC ID required");
        require(nfcToTokenId[voucher.petInfo.nfcId] == 0, "NFC ID already registered");

        // Mint the NFT to the redeemer
        _safeMint(msg.sender, voucher.tokenId);
        _setTokenURI(voucher.tokenId, voucher.tokenURI);

        // Store pet info
        petInfo[voucher.tokenId] = voucher.petInfo;
        petInfo[voucher.tokenId].breeder = signer;

        // Map NFC ID to token
        nfcToTokenId[voucher.petInfo.nfcId] = voucher.tokenId;
        tokenIdToNFC[voucher.tokenId] = voucher.petInfo.nfcId;
        
        // Mark as lazy minted
        lazyMinted[voucher.tokenId] = true;
        
        // Update counter to prevent ID collision
        if (voucher.tokenId > _tokenIds.current()) {
            while (_tokenIds.current() < voucher.tokenId) {
                _tokenIds.increment();
            }
        }

        // Calculate and send payment to breeder (minus royalty kept by contract/owner)
        uint256 royaltyAmount = (msg.value * royaltyBasisPoints) / 10000;
        uint256 breederAmount = msg.value - royaltyAmount;

        if (breederAmount > 0) {
            (bool sentToBreeder, ) = payable(signer).call{value: breederAmount}("");
            require(sentToBreeder, "Failed to send payment to breeder");
        }

        // Royalty goes to contract owner
        if (royaltyAmount > 0) {
            (bool sentToOwner, ) = payable(owner()).call{value: royaltyAmount}("");
            require(sentToOwner, "Failed to send royalty");
        }

        emit PetLazyMinted(voucher.tokenId, msg.sender, signer, msg.value);
        emit PetMinted(voucher.tokenId, msg.sender, voucher.petInfo.nfcId);

        return voucher.tokenId;
    }

    /**
     * @dev Get the chain ID for EIP712
     */
    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

    /**
     * @dev Verify a lazy mint voucher signature
     * @param voucher The voucher to verify
     * @return The address that signed the voucher
     */
    function _verifyVoucher(LazyMintVoucher calldata voucher) 
        internal 
        view 
        returns (address) 
    {
        bytes32 digest = _hashVoucher(voucher);
        return digest.recover(voucher.signature);
    }

    /**
     * @dev Hash a voucher for signature verification
     * @param voucher The voucher to hash
     * @return The hash of the voucher
     */
    function _hashVoucher(LazyMintVoucher calldata voucher) 
        internal 
        view 
        returns (bytes32) 
    {
        return _hashTypedDataV4(keccak256(abi.encode(
            keccak256("LazyMintVoucher(uint256 tokenId,uint256 minPrice,string tokenURI,string name,string species,string nfcId,string microchipId,uint256 birthDate,bool has3DPrinting,bool hasInsurance,uint256 deadline)"),
            voucher.tokenId,
            voucher.minPrice,
            keccak256(bytes(voucher.tokenURI)),
            keccak256(bytes(voucher.petInfo.name)),
            keccak256(bytes(voucher.petInfo.species)),
            keccak256(bytes(voucher.petInfo.nfcId)),
            keccak256(bytes(voucher.petInfo.microchipId)),
            voucher.petInfo.birthDate,
            voucher.petInfo.has3DPrinting,
            voucher.petInfo.hasInsurance,
            voucher.deadline
        )));
    }

    /**
     * @dev Check if a token exists
     * @param tokenId The token ID to check
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // Override required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev Pause all token transfers and minting (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
        emit SecurityAlert("Contract paused", msg.sender, block.timestamp);
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
        emit SecurityAlert("Contract unpaused", msg.sender, block.timestamp);
    }

    /**
     * @dev Emergency withdrawal in case funds get stuck
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool sent, ) = payable(owner()).call{value: balance}("");
        require(sent, "Withdrawal failed");
        
        emit EmergencyWithdrawal(owner(), balance);
        emit SecurityAlert("Emergency withdrawal executed", msg.sender, block.timestamp);
    }
}
