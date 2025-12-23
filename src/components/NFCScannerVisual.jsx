import React, { useState } from 'react';
import './NFCScannerVisual.css';

/**
 * Visual NFC scanner interface with animated scanning effect
 */
const NFCScannerVisual = ({ onScan, isScanning }) => {
  return (
    <div className="nfc-scanner-container">
      <div className={`nfc-scanner ${isScanning ? 'scanning' : ''}`}>
        <div className="scanner-ring"></div>
        <div className="scanner-ring ring-2"></div>
        <div className="scanner-ring ring-3"></div>
        
        <div className="nfc-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            <path d="M12 11v6M9 12l3-3 3 3"/>
          </svg>
        </div>
        
        {isScanning && (
          <div className="scan-line"></div>
        )}
      </div>
      
      <div className="scanner-status">
        {isScanning ? (
          <>
            <span className="status-text scanning">Scanning for NFC tag...</span>
            <div className="scanning-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </>
        ) : (
          <span className="status-text idle">Tap to scan NFC tag</span>
        )}
      </div>

      <div className="nfc-details">
        <div className="detail-line">
          <span className="label">Protocol:</span>
          <span className="value">ISO 14443A</span>
        </div>
        <div className="detail-line">
          <span className="label">Frequency:</span>
          <span className="value">13.56 MHz</span>
        </div>
        <div className="detail-line">
          <span className="label">Status:</span>
          <span className={`value ${isScanning ? 'active' : 'idle'}`}>
            {isScanning ? 'ACTIVE' : 'READY'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NFCScannerVisual;
