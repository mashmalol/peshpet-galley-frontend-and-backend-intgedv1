import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <h1 className="logo">NFT Gallery</h1>
      <nav className="nav">
        <button className="nav-button">Home</button>
        <button className="nav-button">Explore</button>
        <button className="nav-button">Mint Pet</button>
        <button className="nav-button connect-wallet">Connect Wallet</button>
      </nav>
    </header>
  );
}

export default Header;