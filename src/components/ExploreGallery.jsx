import React, { useState, useEffect } from 'react';
import './ExploreGallery.css';
import PetHealthVisual from './PetHealthVisual';
import { DataStream } from './LoadingStates';

function ExploreGallery() {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [filters, setFilters] = useState({
    species: 'all',
    priceRange: 'all',
    insurance: 'all',
    printing: 'all'
  });
  const [selectedPet, setSelectedPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, pets]);

  const loadPets = async () => {
    setLoading(true);
    // Mock data - replace with actual contract call
    const mockPets = [
      {
        id: 1,
        name: 'Golden Max',
        species: 'Golden Retriever',
        price: '0.5',
        image: '',
        nfcId: 'NFC-001',
        insurance: true,
        printing: true,
        owner: '0x1234...5678',
        traits: { health: 'Excellent', age: '2 years' }
      },
      {
        id: 2,
        name: 'Luna Cat',
        species: 'Persian Cat',
        price: '0.3',
        image: '',
        nfcId: 'NFC-002',
        insurance: true,
        printing: false,
        owner: '0xabcd...efgh',
        traits: { health: 'Good', age: '1 year' }
      },
      {
        id: 3,
        name: 'Buddy Bear',
        species: 'Teddy Bear',
        price: '0.8',
        image: '',
        nfcId: 'NFC-003',
        insurance: false,
        printing: true,
        owner: '0x9876...5432',
        traits: { health: 'Excellent', age: '3 years' }
      }
    ];

    setTimeout(() => {
      setPets(mockPets);
      setFilteredPets(mockPets);
      setLoading(false);
    }, 1000);
  };

  const applyFilters = () => {
    let filtered = [...pets];

    if (filters.species !== 'all') {
      filtered = filtered.filter(pet => pet.species === filters.species);
    }

    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(pet => {
        const price = parseFloat(pet.price);
        return price >= min && price <= max;
      });
    }

    if (filters.insurance !== 'all') {
      filtered = filtered.filter(pet => pet.insurance === (filters.insurance === 'true'));
    }

    if (filters.printing !== 'all') {
      filtered = filtered.filter(pet => pet.printing === (filters.printing === 'true'));
    }

    setFilteredPets(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const buyPet = async (petId) => {
    // TODO: Implement actual purchase logic with smart contract
    alert(`Purchase functionality coming soon for Pet #${petId}`);
  };

  return (
    <div className="explore-container">
      <div className="explore-header">
        <h2>Explore PeshPet Gallery</h2>
        <p className="muted">Discover and collect unique digital pets</p>
      </div>

      <div className="filters-bar">
        <select 
          value={filters.species}
          onChange={(e) => handleFilterChange('species', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Species</option>
          <option value="Golden Retriever">Golden Retriever</option>
          <option value="Persian Cat">Persian Cat</option>
          <option value="Teddy Bear">Teddy Bear</option>
        </select>

        <select 
          value={filters.priceRange}
          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Prices</option>
          <option value="0-0.5">0 - 0.5 ETH</option>
          <option value="0.5-1">0.5 - 1 ETH</option>
          <option value="1-5">1 - 5 ETH</option>
        </select>

        <select 
          value={filters.insurance}
          onChange={(e) => handleFilterChange('insurance', e.target.value)}
          className="filter-select"
        >
          <option value="all">Insurance: All</option>
          <option value="true">With Insurance</option>
          <option value="false">No Insurance</option>
        </select>

        <select 
          value={filters.printing}
          onChange={(e) => handleFilterChange('printing', e.target.value)}
          className="filter-select"
        >
          <option value="all">3D Print: All</option>
          <option value="true">Available</option>
          <option value="false">Not Available</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading pets...</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredPets.map(pet => (
            <div key={pet.id} className="pet-card" onClick={() => setSelectedPet(pet)}>
              <div className="pet-image-placeholder">
                <span className="pet-emoji">🐾</span>
                <span className="pet-id">#{pet.id}</span>
              </div>
              <div className="pet-info">
                <h3>{pet.name}</h3>
                <p className="species">{pet.species}</p>
                <div className="pet-meta">
                  <span className="price">{pet.price} ETH</span>
                  <div className="badges">
                    {pet.insurance && <span className="badge insurance">🛡️</span>}
                    {pet.printing && <span className="badge printing">🖨️</span>}
                  </div>
                </div>
              </div>
              <div className="hover-overlay">
                <button className="view-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPets.length === 0 && !loading && (
        <div className="empty-state">
          <p>No pets found matching your filters</p>
        </div>
      )}

      {selectedPet && (
        <div className="modal-overlay" onClick={() => setSelectedPet(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedPet(null)}>✕</button>
            
            <div className="modal-body">
              <div className="modal-image">
                <div className="pet-image-large">
                  <span className="pet-emoji-large">🐾</span>
                </div>
              </div>

              <div className="modal-details">
                <DataStream isActive={true}>
                  <h2>{selectedPet.name}</h2>
                  <p className="species-large">{selectedPet.species}</p>
                </DataStream>

                <PetHealthVisual pet={selectedPet} />

                <div className="detail-section">
                  <h3>Details</h3>
                  <div className="detail-row">
                    <span>Token ID:</span>
                    <span>#{selectedPet.id}</span>
                  </div>
                  <div className="detail-row">
                    <span>NFC Tag:</span>
                    <span>{selectedPet.nfcId}</span>
                  </div>
                  <div className="detail-row">
                    <span>Owner:</span>
                    <span className="address">{selectedPet.owner}</span>
                  </div>
                  <div className="detail-row">
                    <span>Health Status:</span>
                    <span>{selectedPet.traits.health}</span>
                  </div>
                  <div className="detail-row">
                    <span>Age:</span>
                    <span>{selectedPet.traits.age}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Services</h3>
                  <div className="service-badges">
                    <span className={`service-badge ${selectedPet.insurance ? 'active' : ''}`}>
                      🛡️ Insurance {selectedPet.insurance ? 'Active' : 'Not Available'}
                    </span>
                    <span className={`service-badge ${selectedPet.printing ? 'active' : ''}`}>
                      🖨️ 3D Printing {selectedPet.printing ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>

                <div className="modal-actions">
                  <div className="price-display">
                    <span className="price-label">Price</span>
                    <span className="price-value">{selectedPet.price} ETH</span>
                  </div>
                  <button className="buy-btn" onClick={() => buyPet(selectedPet.id)}>
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExploreGallery;
