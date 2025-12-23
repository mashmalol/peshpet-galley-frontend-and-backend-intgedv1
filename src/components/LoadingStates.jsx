import React from 'react';
import './LoadingStates.css';

/**
 * Blockchain transaction loading animation
 */
export const BlockchainLoading = ({ message = "Processing transaction..." }) => {
  return (
    <div className="loading-container">
      <div className="blockchain-loading">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="loading-message">{message}</p>
      <div className="loading-progress">
        <div className="progress-bar"></div>
      </div>
    </div>
  );
};

/**
 * Data transmission effect
 */
export const DataStream = ({ children, isActive = true }) => {
  return (
    <div className={`data-stream ${isActive ? 'active' : ''}`}>
      {children}
    </div>
  );
};

/**
 * Glitch effect for errors/warnings
 */
export const GlitchText = ({ children, severity = 'warning' }) => {
  return (
    <div className={`glitch ${severity}`} data-text={children}>
      {children}
    </div>
  );
};

/**
 * Loading spinner with cyber style
 */
export const CyberSpinner = ({ size = 'medium', color = 'cyan' }) => {
  return (
    <div className={`cyber-spinner ${size} ${color}`}>
      <div className="spinner-ring"></div>
      <div className="spinner-ring ring-2"></div>
      <div className="spinner-core"></div>
    </div>
  );
};

/**
 * Uploading progress indicator
 */
export const UploadProgress = ({ progress = 0, fileName = '' }) => {
  return (
    <div className="upload-progress-container">
      <div className="upload-header">
        <span className="upload-icon">📤</span>
        <div className="upload-info">
          <span className="upload-filename">{fileName || 'Uploading to IPFS...'}</span>
          <span className="upload-percentage">{Math.round(progress)}%</span>
        </div>
      </div>
      <div className="upload-bar-wrapper">
        <div className="upload-bar" style={{ width: `${progress}%` }}>
          <div className="bar-shimmer"></div>
        </div>
        <div className="bar-background-grid"></div>
      </div>
      <div className="upload-status">
        {progress < 100 ? 'Transmitting data...' : 'Upload complete!'}
      </div>
    </div>
  );
};

/**
 * Transaction status indicator
 */
export const TransactionStatus = ({ status = 'pending', txHash = '' }) => {
  const statusConfig = {
    pending: { icon: '⏳', text: 'Transaction Pending', color: '#ffa500' },
    confirmed: { icon: '✓', text: 'Transaction Confirmed', color: '#0f0' },
    failed: { icon: '✗', text: 'Transaction Failed', color: '#f00' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className={`transaction-status ${status}`}>
      <div className="status-icon" style={{ color: config.color }}>
        {config.icon}
      </div>
      <div className="status-content">
        <span className="status-text">{config.text}</span>
        {txHash && (
          <code className="tx-hash">{txHash.substring(0, 20)}...</code>
        )}
      </div>
      {status === 'pending' && (
        <div className="status-animation">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Minting animation
 */
export const MintingAnimation = () => {
  return (
    <div className="minting-container">
      <div className="minting-circle">
        <div className="mint-glow"></div>
        <div className="mint-particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="particle" style={{ '--i': i }}></div>
          ))}
        </div>
        <div className="mint-icon">✨</div>
      </div>
      <h3 className="mint-text">MINTING NFT</h3>
      <p className="mint-subtitle">Generating unique token...</p>
    </div>
  );
};

export default {
  BlockchainLoading,
  DataStream,
  GlitchText,
  CyberSpinner,
  UploadProgress,
  TransactionStatus,
  MintingAnimation
};
