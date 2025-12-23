import React, { useState, useEffect } from 'react';
import './UserDashboard.css';

function UserDashboard() {
  const [activeTab, setActiveTab] = useState('myPets');
  const [myPets, setMyPets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [services, setServices] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // Mock data - replace with actual contract calls
    const mockMyPets = [
      {
        id: 1,
        name: 'Golden Max',
        species: 'Golden Retriever',
        price: '0.5',
        listed: true,
        nfcId: 'NFC-001',
        insurance: true
      },
      {
        id: 4,
        name: 'Fluffy',
        species: 'Persian Cat',
        price: '0.3',
        listed: false,
        nfcId: 'NFC-004',
        insurance: false
      }
    ];

    const mockActivities = [
      {
        id: 1,
        type: 'purchase',
        petName: 'Golden Max',
        price: '0.5',
        date: '2025-12-20',
        txHash: '0xabc...123'
      },
      {
        id: 2,
        type: 'mint',
        petName: 'Fluffy',
        price: '0.3',
        date: '2025-12-15',
        txHash: '0xdef...456'
      }
    ];

    const mockServices = [
      {
        id: 1,
        type: '3D Printing',
        petName: 'Golden Max',
        status: 'Processing',
        orderDate: '2025-12-18'
      },
      {
        id: 2,
        type: 'Insurance',
        petName: 'Golden Max',
        status: 'Active',
        orderDate: '2025-12-10'
      }
    ];

    const mockWallet = {
      balance: '2.45',
      royalties: '0.12',
      transactions: 5
    };

    setTimeout(() => {
      setMyPets(mockMyPets);
      setActivities(mockActivities);
      setServices(mockServices);
      setWallet(mockWallet);
      setLoading(false);
    }, 1000);
  };

  const unlistPet = (petId) => {
    setMyPets(prev => prev.map(pet => 
      pet.id === petId ? { ...pet, listed: false } : pet
    ));
    alert(`Pet #${petId} unlisted from marketplace`);
  };

  const listPet = (petId) => {
    const price = prompt('Enter listing price in ETH:');
    if (price) {
      setMyPets(prev => prev.map(pet => 
        pet.id === petId ? { ...pet, listed: true, price } : pet
      ));
      alert(`Pet #${petId} listed for ${price} ETH`);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>My Dashboard</h2>
        <p className="muted">Manage your PeshPet NFTs and services</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'myPets' ? 'active' : ''}`}
          onClick={() => setActiveTab('myPets')}
        >
          🐾 My Pets
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📊 Activity
        </button>
        <button 
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          🛠️ Services
        </button>
        <button 
          className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          💰 Wallet
        </button>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-state">
            <CyberSpinner size="large" color="cyan" />
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {activeTab === 'myPets' && (
              <div className="tab-content">
                <div className="pets-grid">
                  {myPets.map(pet => (
                    <div key={pet.id} className="dashboard-pet-card">
                      <div className="pet-image-small">
                        <span className="pet-emoji">🐾</span>
                      </div>
                      <div className="pet-details">
                        <h3>{pet.name}</h3>
                        <p className="species">{pet.species}</p>
                        <div className="pet-status">
                          <span className="nfc-badge">📱 {pet.nfcId}</span>
                          {pet.insurance && <span className="insurance-badge">🛡️</span>}
                        </div>
                        {pet.listed && (
                          <div className="listing-info">
                            <span className="listed-price">{pet.price} ETH</span>
                            <span className="listed-badge">Listed</span>
                          </div>
                        )}
                      </div>
                      <div className="pet-actions">
                        {pet.listed ? (
                          <button onClick={() => unlistPet(pet.id)} className="action-btn secondary">
                            Unlist
                          </button>
                        ) : (
                          <button onClick={() => listPet(pet.id)} className="action-btn">
                            List for Sale
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {myPets.length === 0 && (
                  <div className="empty-state">
                    <p>You don't own any PeshPets yet</p>
                    <button className="cta-btn">Explore Gallery</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="tab-content">
                <div className="activity-list">
                  {activities.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'purchase' ? '🛒' : '✨'}
                      </div>
                      <div className="activity-details">
                        <h4>{activity.type === 'purchase' ? 'Purchased' : 'Minted'} {activity.petName}</h4>
                        <p className="activity-meta">
                          <span>{activity.price} ETH</span>
                          <span className="separator">•</span>
                          <span>{activity.date}</span>
                        </p>
                        <p className="tx-hash">
                          <a href={`https://etherscan.io/tx/${activity.txHash}`} target="_blank" rel="noopener noreferrer">
                            {activity.txHash}
                          </a>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="tab-content">
                <div className="services-list">
                  {services.map(service => (
                    <div key={service.id} className="service-item">
                      <div className="service-header">
                        <h4>{service.type} - {service.petName}</h4>
                        <span className={`status-badge ${service.status.toLowerCase()}`}>
                          {service.status}
                        </span>
                      </div>
                      <p className="service-date">Order Date: {service.orderDate}</p>
                      {service.type === '3D Printing' && (
                        <button className="action-btn small">Track Order</button>
                      )}
                      {service.type === 'Insurance' && (
                        <button className="action-btn small">View Policy</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'wallet' && wallet && (
              <div className="tab-content">
                <div className="wallet-stats">
                  <div className="stat-card">
                    <div className="stat-icon">💎</div>
                    <div className="stat-details">
                      <h4>Balance</h4>
                      <p className="stat-value">{wallet.balance} ETH</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-details">
                      <h4>Royalty Earnings</h4>
                      <p className="stat-value">{wallet.royalties} ETH</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-details">
                      <h4>Transactions</h4>
                      <p className="stat-value">{wallet.transactions}</p>
                    </div>
                  </div>
                </div>
                <div className="wallet-actions">
                  <button className="action-btn">Withdraw Earnings</button>
                  <button className="action-btn secondary">Transaction History</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
