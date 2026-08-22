'use client';
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <div style={{textAlign: 'center', padding: '40px'}}>
          <h2>🏠 Home</h2>
          <p>Welcome to Postpartum Fitness MVP</p>
        </div>;
      case 'tracker':
        return <div style={{textAlign: 'center', padding: '40px'}}>
          <h2>📊 Tracker</h2>
          <p>Track your symptoms and progress</p>
        </div>;
      case 'settings':
        return <div style={{textAlign: 'center', padding: '40px'}}>
          <h2>⚙️ Settings</h2>
          <p>Manage your preferences</p>
        </div>;
      default:
        return null;
    }
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f5f5'}}>
      <div style={{flex: 1, overflow: 'auto'}}>
        {renderContent()}
      </div>
      
      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        borderTop: '1px solid #ddd',
        padding: '10px 0',
        position: 'sticky',
        bottom: 0
      }}>
        {['home', 'tracker', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#C770A4' : '#fff',
              color: activeTab === tab ? '#fff' : '#999',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {tab === 'home' && '🏠 Home'}
            {tab === 'tracker' && '📊 Tracker'}
            {tab === 'settings' && '⚙️ Settings'}
          </button>
        ))}
      </nav>
    </div>
  );
}
