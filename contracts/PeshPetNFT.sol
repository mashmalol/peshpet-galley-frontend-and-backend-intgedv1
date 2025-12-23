// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PeshPetNFT
 * @dev ERC721 NFT contract for PeshPet digital pets with marketplace and NFC integration
 */
contract PeshPetNFT is ERC721, ERC721URIStorage, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Royalty percentage (basis points, e.g., 1000 = 10%)
    uint256 public royaltyBasisPoints = 1000;

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

    // Events
    event PetMinted(uint256 indexed tokenId, address indexed owner, string nfcId);
    event PetListed(uint256 indexed tokenId, uint256 price, address indexed seller);
    event PetUnlisted(uint256 indexed tokenId);
    event PetSold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    event NFCTransfer(string indexed nfcId, uint256 indexed tokenId, address indexed newOwner);
    event BreederAuthorized(address indexed breeder);
    event BreederRevoked(address indexed breeder);

    constructor() ERC721("PeshPet", "PESH") Ownable(msg.sender) {
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
    ) public onlyBreeder returns (uint256) {
        require(bytes(_petInfo.nfcId).length > 0, "NFC ID required");
        require(nfcToTokenId[_petInfo.nfcId] == 0, "NFC ID already registered");

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
    function listPetForSale(uint256 _tokenId, uint256 _price) external nonReentrant {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_price > 0, "Price must be greater than 0");
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
    function buyPet(uint256 _tokenId) external payable nonReentrant {
        Listing memory listing = listings[_tokenId];
        require(listing.active, "Pet not for sale");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own pet");

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
}
