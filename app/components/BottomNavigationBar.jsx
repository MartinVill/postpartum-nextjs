'use client';

export default function BottomNavigationBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Inicio' },
    { id: 'calendar', icon: '📅', label: 'Calendario' },
    { id: 'profile', icon: '👤', label: 'Mi Perfil' }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(255, 253, 246, 0.94)',
      borderTop: '1px solid #EEE9E1',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '74px',
      maxWidth: '600px',
      margin: '0 auto',
      zIndex: 50,
      boxShadow: '0 -8px 24px rgba(48, 38, 56, 0.07)',
      backdropFilter: 'blur(14px)'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            height: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            margin: '7px 6px',
            height: '60px',
            borderRadius: '14px',
            transition: 'all 0.2s',
            backgroundColor: activeTab === tab.id ? '#F5EAF8' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.backgroundColor = '#FAF5FB';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = activeTab === tab.id ? '#F5EAF8' : 'transparent';
          }}
        >
          <span style={{
            fontSize: '22px',
            opacity: activeTab === tab.id ? 1 : 0.56,
            transition: 'all 0.2s'
          }}>
            {tab.icon}
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: activeTab === tab.id ? '600' : '500',
            color: activeTab === tab.id ? '#A63AC7' : '#69707A',
            transition: 'all 0.2s'
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
