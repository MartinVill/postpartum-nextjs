'use client';
import { useState } from 'react';

export default function DynamicFeed({ energy, userProfile, onChat, onCalendar, onReflection }) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Rango 1-5: Crisis
  if (energy <= 5) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
        padding: '20px 16px 100px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          paddingBottom: '24px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <p style={{
            fontSize: '19px',
            color: '#7F1D1D',
            fontWeight: '600',
            margin: '0 0 16px 0',
            lineHeight: '1.5'
          }}>
            Vamos a hacer algo<br />para que te sientas mejor
          </p>
          <p style={{
            fontSize: '26px',
            color: '#7F1D1D',
            fontWeight: '700',
            margin: '0',
            lineHeight: '1.4',
            letterSpacing: '-0.5px'
          }}>
            ¿Qué te gustaría hacer?
          </p>
        </div>

        {/* Contenedor de opciones */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginTop: '24px',
          marginBottom: '24px'
        }}>
          {/* Chat principal */}
          <button
            onClick={onChat}
            style={{
              padding: '20px 16px',
              background: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#D946EF',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 4px 16px rgba(217, 70, 239, 0.15)';
              e.target.style.background = '#FFF8FE';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
              e.target.style.background = 'white';
            }}
          >
            <span style={{ fontSize: '28px' }}>💬</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>Cuéntame</div>
              <div style={{ fontSize: '12px', color: '#999', fontWeight: '400' }}>sin filtros por chat</div>
            </div>
          </button>

          {/* Reto 30 días */}
          <button
            onClick={() => {}}
            style={{
              padding: '20px 16px',
              background: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#D946EF',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 4px 16px rgba(217, 70, 239, 0.15)';
              e.target.style.background = '#FFF8FE';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
              e.target.style.background = 'white';
            }}
          >
            <span style={{ fontSize: '28px' }}>😊</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>Reto 30 días</div>
              <div style={{ fontSize: '12px', color: '#999', fontWeight: '400' }}>para sentirte bien</div>
            </div>
          </button>
        </div>

        {/* Ver más opciones */}
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            style={{
              background: 'none',
              border: 'none',
              color: '#D946EF',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'underline',
              padding: '8px 16px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            Ver más opciones
          </button>

          {showMoreOptions && (
            <div
              onClick={() => setShowMoreOptions(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.3)',
                zIndex: 999,
                display: 'flex',
                alignItems: 'flex-end'
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'white',
                  borderRadius: '24px 24px 0 0',
                  padding: '24px 16px 32px',
                  width: '100%',
                  maxWidth: '600px',
                  margin: '0 auto',
                  boxShadow: '0 -4px 16px rgba(0,0,0,0.1)'
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1F2937',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  Todas las opciones
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={onChat}
                    style={{
                      padding: '14px 16px',
                      background: '#FFF8FE',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '14px',
                      color: '#D946EF',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#F8F0FF'}
                    onMouseLeave={(e) => e.target.style.background = '#FFF8FE'}
                  >
                    💬 Chat con Sofia
                  </button>
                  <button
                    onClick={() => {
                      onCalendar();
                      setShowMoreOptions(false);
                    }}
                    style={{
                      padding: '14px 16px',
                      background: '#F0F8FF',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '14px',
                      color: '#2563EB',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#E0EFFF'}
                    onMouseLeave={(e) => e.target.style.background = '#F0F8FF'}
                  >
                    📅 Calendario
                  </button>
                  <button
                    onClick={() => {
                      onReflection();
                      setShowMoreOptions(false);
                    }}
                    style={{
                      padding: '14px 16px',
                      background: '#F0FDF4',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '14px',
                      color: '#10B981',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#DCFCE7'}
                    onMouseLeave={(e) => e.target.style.background = '#F0FDF4'}
                  >
                    🌙 Reflexión nocturna
                  </button>
                  <button
                    onClick={() => {
                      setShowMoreOptions(false);
                    }}
                    style={{
                      padding: '14px 16px',
                      background: '#F5F5F5',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '14px',
                      color: '#666',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#EFEFEF'}
                    onMouseLeave={(e) => e.target.style.background = '#F5F5F5'}
                  >
                    🏋️ Workouts
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Rango 6-7: Estable
  if (energy <= 7) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
        padding: '20px 16px 100px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Mensaje motivador */}
        <div style={{
          padding: '24px',
          background: 'white',
          border: 'none',
          borderRadius: '20px',
          marginBottom: '24px',
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(59, 130, 246, 0.1)'
        }}>
          <p style={{
            fontSize: '18px',
            color: '#2563EB',
            fontWeight: '700',
            margin: '0'
          }}>
            Vas bien 💙
          </p>
          <p style={{
            fontSize: '14px',
            color: '#1D4ED8',
            marginTop: '8px',
            margin: '0',
            lineHeight: '1.6'
          }}>
            Hoy es un día para consolidar este ánimo. Vamos!
          </p>
        </div>

        {/* Reto normal */}
        <button
          onClick={onChat}
          style={{
            width: '100%',
            padding: '16px',
            background: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#D946EF',
            cursor: 'pointer',
            marginBottom: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 4px 16px rgba(217, 70, 239, 0.15)';
            e.target.style.background = '#FFF8FE';
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
            e.target.style.background = 'white';
          }}
        >
          💬 Hablar con Sofia
        </button>

        {/* Reto diario */}
        <div style={{
          padding: '16px',
          background: '#F8F5FF',
          border: 'none',
          borderRadius: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 12px rgba(217, 70, 239, 0.1)'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#A855F7',
            fontWeight: '600',
            margin: '0 0 8px 0'
          }}>
            🎯 Tu reto de hoy
          </p>
          <p style={{
            fontSize: '13px',
            color: '#9333EA',
            margin: '0'
          }}>
            Camina 15 minutos. Puede ser con el bebé, sola, como sea. El movimiento te va a sacar de la cabeza.
          </p>
        </div>

        {/* Calendario */}
        <button
          onClick={onCalendar}
          style={{
            width: '100%',
            padding: '16px',
            background: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#6B7280',
            cursor: 'pointer',
            marginBottom: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
            e.target.style.background = '#F9F9F9';
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
            e.target.style.background = 'white';
          }}
        >
          📅 Tu calendario
        </button>

        {/* Dato del día */}
        <div style={{
          padding: '16px',
          background: '#F0F8FF',
          border: 'none',
          borderRadius: '20px',
          fontSize: '13px',
          color: '#1E40AF',
          lineHeight: '1.6',
          boxShadow: '0 2px 12px rgba(59, 130, 246, 0.1)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>
            ✨ Ten en mente
          </div>
          Estás en una buena vibra hoy. Aprovechá esto. No es casualidad.
        </div>
      </div>
    );
  }

  // Rango 8-10: Genial
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
      padding: '20px 16px 100px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Mensaje empoderador */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #CCFF00 0%, #84DD20 100%)',
        border: 'none',
        borderRadius: '20px',
        marginBottom: '24px',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(132, 204, 22, 0.2)'
      }}>
        <p style={{
          fontSize: '20px',
          color: '#3F6212',
          fontWeight: '700',
          margin: '0'
        }}>
          ¡Estás encendida! 🔥
        </p>
        <p style={{
          fontSize: '14px',
          color: '#4F7C2F',
          marginTop: '8px',
          margin: '0',
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          Esta energía es tuya. Vamos a hacerla grande hoy.
        </p>
      </div>

      {/* Reto desafiante */}
      <div style={{
        padding: '16px',
        background: '#FFFAEB',
        border: 'none',
        borderRadius: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 12px rgba(132, 204, 22, 0.15)'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#84CC16',
          fontWeight: '700',
          margin: '0 0 8px 0'
        }}>
          ⚡ Desafío del día
        </p>
        <p style={{
          fontSize: '13px',
          color: '#65A30D',
          margin: '0',
          lineHeight: '1.5',
          fontWeight: '500'
        }}>
          20 minutos de movimiento. Yoga, caminar, bailar, lo que te encienda. Vos sabes.
        </p>
      </div>

      {/* Botones */}
      <button
        onClick={onChat}
        style={{
          width: '100%',
          padding: '16px',
          background: 'white',
          border: 'none',
          borderRadius: '20px',
          fontSize: '15px',
          fontWeight: '600',
          color: '#D946EF',
          cursor: 'pointer',
          marginBottom: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0 4px 16px rgba(217, 70, 239, 0.15)';
          e.target.style.background = '#FFF8FE';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
          e.target.style.background = 'white';
        }}
      >
        💬 Hablar con Sofia
      </button>

      <button
        onClick={onReflection}
        style={{
          width: '100%',
          padding: '16px',
          background: '#F0FDF4',
          border: 'none',
          borderRadius: '20px',
          fontSize: '15px',
          fontWeight: '600',
          color: '#10B981',
          cursor: 'pointer',
          marginBottom: '20px',
          boxShadow: '0 2px 12px rgba(16, 185, 129, 0.1)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.2)';
          e.target.style.background = '#ECFDF5';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = '0 2px 12px rgba(16, 185, 129, 0.1)';
          e.target.style.background = '#F0FDF4';
        }}
      >
        🌙 Reflexión nocturna
      </button>

      {/* Dato del día */}
      <div style={{
        padding: '16px',
        background: '#F8FFFE',
        border: 'none',
        borderRadius: '20px',
        fontSize: '13px',
        color: '#3F6212',
        lineHeight: '1.6',
        boxShadow: '0 2px 12px rgba(132, 204, 22, 0.1)'
      }}>
        <div style={{ fontWeight: '700', marginBottom: '8px' }}>
          ✨ Aprovechá esto
        </div>
        No todos los días te sentís así. Cuando lleguen los días duros, acordate de esta sensación. Vos podés.
      </div>
    </div>
  );
}
