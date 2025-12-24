import React, { useState } from 'react';
import { ethers } from 'ethers';
import './LazyMint.css';

const LazyMint = ({ contract }) => {
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const voucherData = JSON.parse(e.target.result);
          setVoucher(voucherData);
          setError('');
        } catch (err) {
          setError('Invalid voucher file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const redeemVoucher = async () => {
    if (!voucher || !contract) return;

    setLoading(true);
    setError('');
    setTxHash('');

    try {
      // Prepare the voucher structure for the contract
      const voucherStruct = {
        tokenId: voucher.tokenId,
        minPrice: voucher.minPrice,
        tokenURI: voucher.tokenURI,
        petInfo: {
          name: voucher.petInfo.name,
          species: voucher.petInfo.species,
          nfcId: voucher.petInfo.nfcId,
          microchipId: voucher.petInfo.microchipId,
          birthDate: voucher.petInfo.birthDate,
          breeder: ethers.constants.AddressZero, // Will be set by contract
          has3DPrinting: voucher.petInfo.has3DPrinting,
          hasInsurance: voucher.petInfo.hasInsurance,
        },
        signature: voucher.signature,
      };

      // Call the lazy mint function
      const tx = await contract.lazyMint(voucherStruct, {
        value: voucher.minPrice,
      });

      setTxHash(tx.hash);
      await tx.wait();
      
      alert(`NFT #${voucher.tokenId} minted successfully!`);
      setVoucher(null);
    } catch (err) {
      console.error('Lazy mint error:', err);
      setError(err.message || 'Failed to redeem voucher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lazy-mint-container">
      <div className="cyber-card">
        <h2 className="cyber-title">
          <span className="glitch" data-text="Lazy Mint">Lazy Mint</span>
        </h2>
        
        <div className="upload-section">
          <label htmlFor="voucher-upload" className="upload-label">
            <div className="upload-box">
              <div className="upload-icon">📄</div>
              <p>Upload Voucher File (.json)</p>
              <input
                id="voucher-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="file-input"
              />
            </div>
          </label>
        </div>

        {voucher && (
          <div className="voucher-preview">
            <h3>Voucher Details</h3>
            <div className="voucher-info">
              <div className="info-row">
                <span className="label">Token ID:</span>
                <span className="value">#{voucher.tokenId}</span>
              </div>
              <div className="info-row">
                <span className="label">Pet Name:</span>
                <span className="value">{voucher.petInfo.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Species:</span>
                <span className="value">{voucher.petInfo.species}</span>
              </div>
              <div className="info-row">
                <span className="label">NFC ID:</span>
                <span className="value">{voucher.petInfo.nfcId}</span>
              </div>
              <div className="info-row">
                <span className="label">Min Price:</span>
                <span className="value">
                  {ethers.utils.formatEther(voucher.minPrice)} ETH
                </span>
              </div>
              <div className="info-row">
                <span className="label">3D Printing:</span>
                <span className="value">
                  {voucher.petInfo.has3DPrinting ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Insurance:</span>
                <span className="value">
                  {voucher.petInfo.hasInsurance ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            </div>

            <button
              className="cyber-button redeem-btn"
              onClick={redeemVoucher}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Minting...
                </>
              ) : (
                'Redeem & Mint NFT'
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}

        {txHash && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </div>
        )}

        <div className="info-box">
          <h4>What is Lazy Minting?</h4>
          <p>
            Lazy minting allows NFTs to be created without upfront gas costs. 
            The NFT is only minted when someone purchases it using a signed voucher 
            from an authorized breeder.
          </p>
          <ul>
            <li>No gas fees for creators until sale</li>
            <li>Instant minting upon redemption</li>
            <li>Cryptographically verified authenticity</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LazyMint;
