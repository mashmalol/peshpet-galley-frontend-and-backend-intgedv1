import axios from 'axios';

// Pinata API configuration
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY || '';
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT || '';

const pinataAxios = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: {
    'pinata_api_key': PINATA_API_KEY,
    'pinata_secret_api_key': PINATA_SECRET_KEY,
    'Authorization': `Bearer ${PINATA_JWT}`
  }
});

/**
 * Upload file to IPFS via Pinata
 */
export const uploadFileToIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', options);

    const response = await pinataAxios.post('/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      ipfsUrl: `ipfs://${response.data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload JSON metadata to IPFS
 */
export const uploadJSONToIPFS = async (jsonData) => {
  try {
    const response = await pinataAxios.post('/pinning/pinJSONToIPFS', jsonData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      ipfsUrl: `ipfs://${response.data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
    };
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create OpenSea compatible metadata
 */
export const createMetadata = ({
  name,
  description,
  imageUrl,
  animationUrl = null,
  externalUrl = null,
  attributes = [],
  properties = {}
}) => {
  return {
    name,
    description,
    image: imageUrl,
    ...(animationUrl && { animation_url: animationUrl }),
    ...(externalUrl && { external_url: externalUrl }),
    attributes,
    properties
  };
};

/**
 * Upload pet NFT with all files
 */
export const uploadPetNFT = async ({
  name,
  species,
  description,
  images,
  model3D,
  medicalRecords,
  nfcId,
  microchipId,
  birthDate,
  has3DPrinting,
  hasInsurance,
  breeder
}) => {
  try {
    const uploadResults = {
      images: [],
      model3D: null,
      medicalRecords: null
    };

    // Upload images
    for (const image of images) {
      const result = await uploadFileToIPFS(image);
      if (result.success) {
        uploadResults.images.push(result);
      }
    }

    // Upload 3D model if provided
    if (model3D) {
      const result = await uploadFileToIPFS(model3D);
      if (result.success) {
        uploadResults.model3D = result;
      }
    }

    // Upload medical records if provided (encrypted recommended)
    if (medicalRecords) {
      const result = await uploadFileToIPFS(medicalRecords);
      if (result.success) {
        uploadResults.medicalRecords = result;
      }
    }

    // Create attributes
    const attributes = [
      { trait_type: 'Species', value: species },
      { trait_type: 'NFC Tag ID', value: nfcId },
      { trait_type: 'Microchip ID', value: microchipId || 'N/A' },
      {
        display_type: 'date',
        trait_type: 'Birth Date',
        value: birthDate ? new Date(birthDate).getTime() / 1000 : 0
      },
      { trait_type: '3D Printing', value: has3DPrinting ? 'Available' : 'Not Available' },
      { trait_type: 'Insurance', value: hasInsurance ? 'Active' : 'Inactive' },
      { trait_type: 'Breeder', value: breeder || 'Unknown' }
    ];

    // Create properties
    const properties = {
      files: [],
      category: 'digital_pet',
      creators: breeder ? [{ address: breeder, share: 100 }] : []
    };

    // Add file references
    if (uploadResults.model3D) {
      properties.files.push({
        uri: uploadResults.model3D.ipfsUrl,
        type: 'model/gltf-binary'
      });
    }

    if (uploadResults.medicalRecords) {
      properties.files.push({
        uri: uploadResults.medicalRecords.ipfsUrl,
        type: 'application/pdf',
        encrypted: true
      });
    }

    // Create metadata
    const metadata = createMetadata({
      name,
      description,
      imageUrl: uploadResults.images[0]?.ipfsUrl || '',
      animationUrl: uploadResults.model3D?.ipfsUrl,
      externalUrl: `https://peshpet.com/pet/${nfcId}`,
      attributes,
      properties
    });

    // Upload metadata to IPFS
    const metadataResult = await uploadJSONToIPFS(metadata);

    return {
      success: true,
      metadataUrl: metadataResult.ipfsUrl,
      metadataGatewayUrl: metadataResult.gatewayUrl,
      uploads: uploadResults,
      metadata
    };
  } catch (error) {
    console.error('Error uploading pet NFT:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetch metadata from IPFS
 */
export const fetchMetadata = async (ipfsUrl) => {
  try {
    const hash = ipfsUrl.replace('ipfs://', '');
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
};
