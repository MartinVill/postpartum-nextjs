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
      background: '#FFFBF0',
      borderTop: '1px solid #F3F4F6',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '70px',
      maxWidth: '600px',
      margin: '0 auto',
      zIndex: 50,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
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
            gap: '4px',
            transition: 'all 0.2s',
            backgroundColor: activeTab === tab.id ? '#FFF8FE' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.backgroundColor = '#F9F9F9';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = activeTab === tab.id ? '#FFF8FE' : 'transparent';
          }}
        >
          <span style={{
            fontSize: '24px',
            opacity: activeTab === tab.id ? 1 : 0.5,
            transition: 'all 0.2s'
          }}>
            {tab.icon}
          </span>
          <span style={{
            fontSize: '10px',
            fontWeight: activeTab === tab.id ? '600' : '500',
            color: activeTab === tab.id ? '#D946EF' : '#9CA3AF',
            transition: 'all 0.2s'
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
