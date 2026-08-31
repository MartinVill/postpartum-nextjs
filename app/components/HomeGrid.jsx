'use client';

export default function HomeGrid({ energy, userProfile, onChat, onCalendar, onBodyAndCalm, onReto, onMoreOptions }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
      padding: '20px 16px 90px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Grilla 2x2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Card 1: Chat de apoyo */}
        <button
          onClick={onChat}
          style={{
            padding: '24px 16px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#D946EF',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            minHeight: '140px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
            e.currentTarget.style.borderColor = '#D946EF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <span style={{ fontSize: '32px' }}>💬</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '700', marginBottom: '2px' }}>Chat de apoyo</div>
            <div style={{ fontSize: '11px', color: '#999' }}>Sin filtros</div>
          </div>
        </button>

        {/* Card 2: Reto del día */}
        <button
          onClick={onReto}
          style={{
            padding: '24px 16px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#D946EF',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            minHeight: '140px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
            e.currentTarget.style.borderColor = '#D946EF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <span style={{ fontSize: '32px' }}>🏆</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '700', marginBottom: '2px' }}>Reto del día</div>
            <div style={{ fontSize: '11px', color: '#999' }}>30 días</div>
          </div>
        </button>

        {/* Card 3: Cuerpo y Calma */}
        <button
          onClick={onBodyAndCalm}
          style={{
            padding: '24px 16px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#D946EF',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            minHeight: '140px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
            e.currentTarget.style.borderColor = '#D946EF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <span style={{ fontSize: '32px' }}>🧘‍♀️</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '700', marginBottom: '2px' }}>Cuerpo y Calma</div>
            <div style={{ fontSize: '11px', color: '#999' }}>Movimiento</div>
          </div>
        </button>

        {/* Card 4: Más opciones */}
        <button
          onClick={onMoreOptions}
          style={{
            padding: '24px 16px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#D946EF',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            minHeight: '140px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
            e.currentTarget.style.borderColor = '#D946EF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <span style={{ fontSize: '32px' }}>➕</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '700', marginBottom: '2px' }}>Más opciones</div>
            <div style={{ fontSize: '11px', color: '#999' }}>Explorar</div>
          </div>
        </button>
      </div>
    </div>
  );
}
