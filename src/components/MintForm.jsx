import React, { useState } from 'react';
import './MintForm.css';

function MintForm() {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    description: '',
    nfcId: '',
    birthDate: '',
    microchipId: '',
    price: '',
    royalty: '10',
    include3DPrinting: false,
    includeInsurance: false,
  });

  const [files, setFiles] = useState({
    images: [],
    model3D: null,
    medicalRecords: null,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, type) => {
    const selectedFiles = e.target.files;
    if (type === 'images') {
      setFiles(prev => ({ ...prev, images: Array.from(selectedFiles) }));
    } else {
      setFiles(prev => ({ ...prev, [type]: selectedFiles[0] }));
    }
  };

  const removeFile = (type, index = null) => {
    if (type === 'images' && index !== null) {
      setFiles(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setFiles(prev => ({ ...prev, [type]: null }));
    }
  };

  const uploadToIPFS = async () => {
    // Simulate IPFS upload
    setUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock IPFS hash
    return 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.species || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    if (files.images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    try {
      // Upload to IPFS
      const ipfsHash = await uploadToIPFS();
      
      // Here you would call the smart contract mint function
      console.log('Minting NFT with data:', {
        formData,
        files,
        ipfsHash
      });

      alert(`Success! NFT minted with IPFS hash: ${ipfsHash}`);
      
      // Reset form
      setFormData({
        name: '',
        species: '',
        description: '',
        nfcId: '',
        birthDate: '',
        microchipId: '',
        price: '',
        royalty: '10',
        include3DPrinting: false,
        includeInsurance: false,
      });
      setFiles({ images: [], model3D: null, medicalRecords: null });
      setUploadProgress(0);
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Failed to mint NFT. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mint-container">
      <div className="mint-header">
        <h2>Mint Your PeshPet NFT</h2>
        <p className="muted">Create a unique digital pet with physical NFC integration</p>
      </div>

      <form className="mint-form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <section className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Pet Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter pet name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="species">Species/Breed *</label>
            <input
              type="text"
              id="species"
              name="species"
              value={formData.species}
              onChange={handleInputChange}
              placeholder="e.g., Golden Retriever, Persian Cat"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your pet's unique characteristics..."
              rows="4"
            />
          </div>
        </section>

        {/* Physical Details */}
        <section className="form-section">
          <h3>Physical Details (NFC Integration)</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nfcId">NFC Tag ID</label>
              <input
                type="text"
                id="nfcId"
                name="nfcId"
                value={formData.nfcId}
                onChange={handleInputChange}
                placeholder="NFC-XXXXXXXXX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="microchipId">Microchip ID</label>
              <input
                type="text"
                id="microchipId"
                name="microchipId"
                value={formData.microchipId}
                onChange={handleInputChange}
                placeholder="Enter microchip ID"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="birthDate">Birth Date</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="medicalRecords">Medical Records (PDF)</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="medicalRecords"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'medicalRecords')}
              />
              {files.medicalRecords && (
                <div className="file-preview">
                  <span>📄 {files.medicalRecords.name}</span>
                  <button type="button" onClick={() => removeFile('medicalRecords')}>✕</button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* NFT Configuration */}
        <section className="form-section">
          <h3>NFT Configuration</h3>
          
          <div className="form-group">
            <label htmlFor="images">Images (PNG, JPG, WebP) *</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, 'images')}
              />
              <div className="file-previews">
                {files.images.map((file, index) => (
                  <div key={index} className="file-preview">
                    <span>🖼️ {file.name}</span>
                    <button type="button" onClick={() => removeFile('images', index)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="model3D">3D Model (GLB, GLTF)</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="model3D"
                accept=".glb,.gltf"
                onChange={(e) => handleFileChange(e, 'model3D')}
              />
              {files.model3D && (
                <div className="file-preview">
                  <span>🎨 {files.model3D.name}</span>
                  <button type="button" onClick={() => removeFile('model3D')}>✕</button>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Initial Price (ETH) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.5"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="royalty">Royalty Percentage (5-15%)</label>
              <input
                type="number"
                id="royalty"
                name="royalty"
                value={formData.royalty}
                onChange={handleInputChange}
                min="5"
                max="15"
                step="1"
              />
            </div>
          </div>
        </section>

        {/* Service Options */}
        <section className="form-section">
          <h3>Service Options</h3>
          
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="include3DPrinting"
                checked={formData.include3DPrinting}
                onChange={handleInputChange}
              />
              <span>🖨️ Include 3D printing service</span>
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="includeInsurance"
                checked={formData.includeInsurance}
                onChange={handleInputChange}
              />
              <span>🛡️ Include insurance package</span>
            </label>
          </div>
        </section>

        {/* Upload Progress */}
        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p>Uploading to IPFS... {uploadProgress}%</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="mint-btn" disabled={uploading}>
            {uploading ? 'Minting...' : 'Mint NFT'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MintForm;
