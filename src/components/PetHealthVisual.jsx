import React from 'react';
import './PetHealthVisual.css';

/**
 * Visual representation of pet health and status
 * Shows insurance, medical records, and physical verification
 */
const PetHealthVisual = ({ pet }) => {
  const healthMetrics = [
    { label: 'Vaccinations', value: pet.vaccinations || 4, max: 5, color: '#0ff' },
    { label: 'Medical Records', value: pet.medicalRecords || 8, max: 10, color: '#f0f' },
    { label: 'Insurance Status', value: pet.hasInsurance ? 100 : 0, max: 100, color: '#0f0' }
  ];

  const geneticTraits = [
    { name: 'Purity', value: 95 },
    { name: 'Vitality', value: 88 },
    { name: 'Longevity', value: 92 }
  ];

  return (
    <div className="pet-health-visual">
      <div className="health-header">
        <div className="header-left">
          <h3 className="glitch-text" data-text="PHYSICAL VERIFICATION">
            PHYSICAL VERIFICATION
          </h3>
          <span className="subtitle">BIOMETRIC ANALYSIS SYSTEM v2.1</span>
        </div>
        <div className={`verification-badge ${pet.nfcId ? 'verified' : 'unverified'}`}>
          <span className="badge-icon">{pet.nfcId ? '✓' : '⚠'}</span>
          <span className="badge-text">{pet.nfcId ? 'NFC VERIFIED' : 'NOT VERIFIED'}</span>
        </div>
      </div>

      <div className="health-grid">
        <div className="metrics-section">
          <h4 className="section-title">
            <span className="title-icon">▶</span>
            HEALTH METRICS
          </h4>
          <div className="health-metrics">
            {healthMetrics.map((metric, index) => (
              <div key={index} className="metric-row">
                <div className="metric-header">
                  <span className="metric-label">{metric.label}</span>
                  <span className="metric-numbers">{metric.value}/{metric.max}</span>
                </div>
                <div className="metric-bar-container">
                  <div 
                    className="metric-bar" 
                    style={{ 
                      width: `${(metric.value / metric.max) * 100}%`,
                      background: `linear-gradient(90deg, ${metric.color}, ${metric.color}99)`
                    }}
                  >
                    <div className="bar-glow" style={{ background: metric.color }}></div>
                  </div>
                  <div className="bar-grid"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="genetics-section">
          <h4 className="section-title">
            <span className="title-icon">▶</span>
            GENETIC PROFILE
          </h4>
          <div className="genetic-traits">
            {geneticTraits.map((trait, index) => (
              <div key={index} className="trait-item">
                <div className="trait-hexagon">
                  <span className="trait-value">{trait.value}%</span>
                </div>
                <span className="trait-name">{trait.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="service-indicators">
        <div className={`service-chip ${pet.has3DPrinting ? 'active' : 'inactive'}`}>
          <div className="chip-border"></div>
          <span className="chip-icon">🖨️</span>
          <div className="chip-content">
            <span className="chip-title">3D PRINTING</span>
            <span className="chip-status">{pet.has3DPrinting ? 'AVAILABLE' : 'UNAVAILABLE'}</span>
          </div>
        </div>
        <div className={`service-chip ${pet.hasInsurance ? 'active' : 'inactive'}`}>
          <div className="chip-border"></div>
          <span className="chip-icon">🛡️</span>
          <div className="chip-content">
            <span className="chip-title">INSURANCE</span>
            <span className="chip-status">{pet.hasInsurance ? 'ACTIVE' : 'INACTIVE'}</span>
          </div>
        </div>
      </div>

      {pet.nfcId && (
        <div className="id-display-grid">
          <div className="id-display">
            <span className="id-label">NFC TAG ID</span>
            <code className="id-code">{pet.nfcId}</code>
          </div>
          {pet.microchipId && (
            <div className="id-display">
              <span className="id-label">MICROCHIP ID</span>
              <code className="id-code">{pet.microchipId}</code>
            </div>
          )}
        </div>
      )}

      <div className="scan-lines"></div>
    </div>
  );
};

export default PetHealthVisual;
