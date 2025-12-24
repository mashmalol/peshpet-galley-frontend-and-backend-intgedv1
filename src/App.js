import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import ExploreGallery from './components/ExploreGallery';
import MintForm from './components/MintForm';
import UserDashboard from './components/UserDashboard';
import LazyMint from './components/LazyMint';

function DigitalRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const columns = Math.floor(width / 16);
    const drops = Array(columns).fill(1);
    const chars = 'あアｱｳﾍɸ♥♪★mehrnosh<3adnan＊％&$0123456789';

    function draw() {
      ctx.fillStyle = 'rgba(5,6,10,0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0F0';
      ctx.font = '16px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 16, drops[i] * 16);

        if (drops[i] * 16 > height && Math.random() > 0.95) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      requestAnimationFrame(draw);
    }

    draw();

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

function App() {
  const [activeView, setActiveView] = useState('home');
  const [walletAddress, setWalletAddress] = useState('');

  const handleNavigate = (view) => {
    setActiveView(view);
  };

  return (
    <div className="App">
      <DigitalRain />
      <Header onNavigate={handleNavigate} activeView={activeView} />
      
      <main className="main-content">
        {activeView === 'home' && (
          <section className="hero-section">
            <h1 className="hero-title">Welcome to PeshPet NFT Gallery</h1>
            <p className="hero-subtitle">
              Digital collectible pets with physical NFC integration, 3D printing, and insurance
            </p>
            <div className="hero-features">
              <div className="feature-card">
                <span className="feature-emoji">🐾</span>
                <h3>Mint Your Pet</h3>
                <p>Create unique NFTs with physical NFC tags</p>
              </div>
              <div className="feature-card">
                <span className="feature-emoji">🏪</span>
                <h3>Marketplace</h3>
                <p>Buy and sell verified digital pets</p>
              </div>
              <div className="feature-card">
                <span className="feature-emoji">🖨️</span>
                <h3>3D Printing</h3>
                <p>Physical replicas of your NFTs</p>
              </div>
              <div className="feature-card">
                <span className="feature-emoji">🛡️</span>
                <h3>Insurance</h3>
                <p>Protect your digital assets</p>
              </div>
            </div>
          </section>
        )}

        {activeView === 'explore' && <ExploreGallery />}
        {activeView === 'mint' && <MintForm />}
        {activeView === 'dashboard' && <UserDashboard />}
        {activeView === 'lazymint' && <LazyMint />}
      </main>
    </div>
  );
}

export default App;