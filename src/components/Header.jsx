import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './Header.css';

function Header({ onNavigate, activeView }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application!');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setWalletAddress('');
        } else {
          setWalletAddress(accounts[0]);
        }
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section" onClick={() => onNavigate('home')}>
          <svg viewBox="0 0 64 64" width="42" height="42" className="logo-icon">
            <defs>
              <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#ff77ff"/>
                <stop offset="1" stopColor="#77d6ff"/>
              </linearGradient>
            </defs>
            <rect x="6" y="10" width="52" height="44" rx="8" fill="url(#g1)"/>
            <path d="M20 36c4-8 12-8 16 0 4-8 12-8 16 0" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="26" cy="26" r="3" fill="#111"/>
            <circle cx="38" cy="26" r="3" fill="#111"/>
          </svg>
          <h1 className="logo-text">PeshPet</h1>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-btn ${activeView === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            Home
          </button>
          <button 
            className={`nav-btn ${activeView === 'explore' ? 'active' : ''}`}
            onClick={() => onNavigate('explore')}
          >
            Explore
          </button>
          <button 
            className={`nav-btn ${activeView === 'mint' ? 'active' : ''}`}
            onClick={() => onNavigate('mint')}
            disabled={!walletAddress}
          >
            Mint Pet
          </button>
          <button 
            className={`nav-btn ${activeView === 'lazymint' ? 'active' : ''}`}
            onClick={() => onNavigate('lazymint')}
            disabled={!walletAddress}
          >
            Lazy Mint
          </button>
          {walletAddress && (
            <button 
              className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </button>
          )}
        </nav>

        <div className="wallet-section">
          {walletAddress ? (
            <div className="wallet-connected">
              <span className="wallet-address">{formatAddress(walletAddress)}</span>
              <button className="disconnect-btn" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              className="connect-wallet-btn" 
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
