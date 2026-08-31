'use client';
import { useState, useRef, useEffect } from 'react';

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: 'white',
      border: 'none',
      padding: '8px',
      borderRadius: '50%',
      cursor: 'pointer',
      width: '40px',
      height: '40px',
      minWidth: '40px',
      minHeight: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.2s',
      flexShrink: 0
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
      e.currentTarget.style.background = '#FFF8FE';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      e.currentTarget.style.background = 'white';
    }}
  >
    <span style={{ fontSize: '20px', color: '#D946EF' }}>&lt;</span>
  </button>
);

export default function Profile({ userProfile, onBack }) {
  const [activeSubView, setActiveSubView] = useState(null);
  const [draftProfile, setDraftProfile] = useState(() => ({
    name: userProfile?.name || '',
    surname: userProfile?.surname || '',
    email: userProfile?.email || '',
    babyBirthDate: userProfile?.babyBirthDate || '',
    hobbies: userProfile?.hobbies || ['Yoga', 'Lectura'],
    avatar: userProfile?.avatar || null
  }));
  const fileInputRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [newHobby, setNewHobby] = useState('');
  const [openFAQ, setOpenFAQ] = useState(null);
  const containerRef = useRef(null);
  const [notifications, setNotifications] = useState({
    dailyRoutine: true,
    dailyRoutineTime: '09:30',
    breathing: true,
    news: true
  });

  const trialStartDate = new Date(userProfile?.trialStartDate || new Date());
  const daysPassed = Math.floor((new Date() - trialStartDate) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, 14 - daysPassed);
  const trialEndDate = new Date(trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  const progressPercentage = (daysPassed / 14) * 100;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [activeSubView]);

  useEffect(() => {
    if (userProfile) {
      setDraftProfile({
        name: userProfile.name || '',
        surname: userProfile.surname || '',
        email: userProfile.email || '',
        babyBirthDate: userProfile.babyBirthDate || '',
        hobbies: userProfile.hobbies || ['Yoga', 'Lectura'],
        avatar: userProfile.avatar || null
      });
    }
  }, [userProfile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newProfile = { ...userProfile, avatar: reader.result };
        localStorage.setItem('userProfile', JSON.stringify(newProfile));
        setDraftProfile(newProfile);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleSaveProfile = () => {
    if ((draftProfile?.hobbies || []).length < 2) {
      alert('Debes conservar al menos 2 hobbies');
      return;
    }
    localStorage.setItem('userProfile', JSON.stringify(draftProfile));
    setActiveSubView(null);
  };

  const handleAddHobby = (hobby) => {
    if (hobby && !(draftProfile?.hobbies || []).includes(hobby)) {
      setDraftProfile(prev => ({
        ...prev,
        hobbies: [...(prev?.hobbies || []), hobby]
      }));
    }
  };

  const handleRemoveHobby = (hobby) => {
    if ((draftProfile?.hobbies || []).length > 2) {
      setDraftProfile(prev => ({
        ...prev,
        hobbies: (prev?.hobbies || []).filter(h => h !== hobby)
      }));
    }
  };

  const handleNotificationChange = (key, value) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem('notificationPreferences', JSON.stringify(updated));
  };

  // ============ VISTA PRINCIPAL ============
  if (activeSubView === null) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
        paddingBottom: '100px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* HEADER PERFIL */}
        <div style={{
          padding: '24px 16px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          {/* Avatar */}
          <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 16px' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: userProfile?.avatar ? `url(${userProfile.avatar})` : '#E5E7EB',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '3px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: '#999'
            }} onClick={handleAvatarClick}>
              {!userProfile?.avatar && '👤'}
            </div>
            <button
              onClick={handleAvatarClick}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#F3F4F6',
                border: '2px solid white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E5E7EB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F3F4F6';
              }}
            >
              <span style={{ fontSize: '14px' }}>📷</span>
            </button>
          </div>

          {/* Nombre */}
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 8px 0'
          }}>
            {userProfile?.name} {userProfile?.surname || ''}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{
              background: '#FFF8FE',
              border: '1px solid #D946EF',
              color: '#D946EF',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Prueba Gratuita
            </span>
          </div>
        </div>

        {/* BANNER TRIAL */}
        <div style={{
          margin: '24px 16px',
          padding: '20px 16px',
          background: '#FFF8FE',
          border: '2px solid #D946EF',
          borderRadius: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 4px 0'
              }}>
                ⭐ Tu Prueba Gratuita está activa
              </h3>
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#D946EF'
            }}>
              {daysRemaining} días
            </div>
          </div>

          <div style={{
            height: '8px',
            background: '#E5E7EB',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{
              height: '100%',
              background: '#D946EF',
              width: `${Math.min(progressPercentage, 100)}%`,
              transition: 'width 0.3s'
            }} />
          </div>

          <p style={{
            fontSize: '11px',
            color: '#6B7280',
            margin: '0 0 12px 0'
          }}>
            Inicio: {trialStartDate.toLocaleDateString('es-ES')} — Finaliza: {trialEndDate.toLocaleDateString('es-ES')}
          </p>

          <button
            onClick={() => setActiveSubView('SUBSCRIPTION')}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#D946EF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Pasar a PRO y asegurar tu acceso
          </button>

          <p style={{
            fontSize: '12px',
            color: '#6B7280',
            margin: '8px 0 0 0',
            textAlign: 'center'
          }}>
            Garantiza el acceso ininterrumpido a tus rutinas al finalizar los 14 días. Cancela cuando quieras.
          </p>
        </div>

        {/* MENÚ PRINCIPAL */}
        <div style={{ padding: '0 16px' }}>
          {[
            { id: 'EDIT_PROFILE', icon: '👤', title: 'Información Personal y Hobbies', subtitle: 'Nombre, fecha de parto y tus intereses.' },
            { id: 'SUBSCRIPTION', icon: '💳', title: 'Suscripción y Facturación', subtitle: 'Detalles del plan, métodos de pago e historial.' },
            { id: 'NOTIFICATIONS', icon: '🔔', title: 'Preferencias de Notificación', subtitle: 'Recordatorios de rutina y alertas.' },
            { id: 'SUPPORT', icon: '💬', title: 'Soporte y Ayuda', subtitle: 'Preguntas frecuentes, contacto y legales.' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubView(item.id)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                marginBottom: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D946EF';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(217, 70, 239, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  {item.icon} {item.title}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  margin: 0
                }}>
                  {item.subtitle}
                </div>
              </div>
              <span style={{ fontSize: '18px', color: '#D946EF', marginLeft: '12px' }}>›</span>
            </button>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{
          padding: '32px 16px 24px',
          textAlign: 'center',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          marginTop: '24px'
        }}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              padding: '12px 24px',
              background: '#FEE2E2',
              color: '#DC2626',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FCA5A5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FEE2E2';
            }}
          >
            Cerrar Sesión
          </button>

          <p style={{
            fontSize: '11px',
            color: '#9CA3AF',
            margin: '16px 0 0 0'
          }}>
            Postpartum Recovery v1.0.0
          </p>
        </div>

        {/* MODAL LOGOUT */}
        {showLogoutConfirm && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              maxWidth: '320px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 8px 0'
              }}>
                ¿Estás segura?
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: '0 0 20px 0'
              }}>
                ¿Deseas cerrar sesión? Podrás volver a iniciar sesión después.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    color: '#111827',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E5E7EB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F3F4F6';
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#991B1B';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#DC2626';
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
        />
      </div>
    );
  }

  // ============ EDITAR PERFIL ============
  if (activeSubView === 'EDIT_PROFILE') {
    const suggestedHobbies = ['Yoga', 'Lectura', 'Caminatas', 'Meditación', 'Cocina', 'Pilates', 'Danza', 'Arte'];
    const hobbyList = draftProfile?.hobbies || [];

    return (
      <div style={{
        minHeight: '100vh',
        background: 'white',
        paddingBottom: '100px',
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column'
      }} ref={containerRef}>
        {/* HEADER STICKY */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <BackButton onClick={() => {
            setDraftProfile({
              name: userProfile?.name || '',
              surname: userProfile?.surname || '',
              email: userProfile?.email || '',
              babyBirthDate: userProfile?.babyBirthDate || '',
              hobbies: userProfile?.hobbies || ['Yoga', 'Lectura'],
              avatar: userProfile?.avatar || null
            });
            setNewHobby('');
            setActiveSubView(null);
          }} />
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            margin: 0,
            flex: 1
          }}>
            Editar Perfil
          </h1>
        </div>

        {/* FORMULARIO */}
        <div style={{ padding: '20px 16px', flex: 1 }}>
          {/* Nombre */}
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '6px'
          }}>
            Nombre
          </label>
          <input
            type="text"
            value={draftProfile?.name || ''}
            onChange={(e) => setDraftProfile(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '16px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />

          {/* Apellido */}
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '6px'
          }}>
            Apellido
          </label>
          <input
            type="text"
            value={draftProfile?.surname || ''}
            onChange={(e) => setDraftProfile(prev => ({ ...prev, surname: e.target.value }))}
            placeholder="Apellido"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '16px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />

          {/* Email (read-only) */}
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '6px'
          }}>
            Correo Electrónico
          </label>
          <input
            type="email"
            value={draftProfile?.email || 'email@example.com'}
            disabled
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '6px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              background: '#F9FAFB',
              color: '#9CA3AF'
            }}
          />
          <p style={{
            fontSize: '11px',
            color: '#6B7280',
            margin: '0 0 16px 0'
          }}>
            Para cambiar tu correo contacta a soporte
          </p>

          {/* Fecha de Parto */}
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '6px'
          }}>
            Fecha de Parto / Nacimiento del Bebé
          </label>
          <input
            type="date"
            value={draftProfile?.babyBirthDate || ''}
            onChange={(e) => setDraftProfile(prev => ({ ...prev, babyBirthDate: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '6px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
          <p style={{
            fontSize: '11px',
            color: '#6B7280',
            margin: '0 0 16px 0'
          }}>
            Ajustamos las recomendaciones según la etapa exacta de tu posparto
          </p>

          {/* Hobbies */}
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '12px'
          }}>
            Mis Hobbies e Intereses
          </label>

          <p style={{
            fontSize: '12px',
            color: '#6B7280',
            margin: '0 0 12px 0'
          }}>
            Selecciona o agrega tus hobbies (Mínimo 2)
          </p>

          {/* Chips de hobbies activos */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '12px'
          }}>
            {hobbyList.map((hobby) => (
              <div
                key={hobby}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: '#FFF8FE',
                  border: '1px solid #D946EF',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#D946EF'
                }}
              >
                {hobby}
                <button
                  onClick={() => handleRemoveHobby(hobby)}
                  disabled={hobbyList.length === 2}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: hobbyList.length > 2 ? 'pointer' : 'not-allowed',
                    fontSize: '16px',
                    opacity: hobbyList.length > 2 ? 1 : 0.5,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {hobbyList.length === 2 && (
            <p style={{
              fontSize: '11px',
              color: '#F97316',
              margin: '0 0 12px 0',
              padding: '8px',
              background: '#FFF7ED',
              borderRadius: '6px'
            }}>
              ⚠️ Debes conservar al menos 2 hobbies para personalizar tu contenido
            </p>
          )}

          {/* Input para agregar hobby */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <input
              type="text"
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newHobby.trim()) {
                  handleAddHobby(newHobby.trim());
                  setNewHobby('');
                }
              }}
              placeholder="Agregar hobby..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={() => {
                if (newHobby.trim()) {
                  handleAddHobby(newHobby.trim());
                  setNewHobby('');
                }
              }}
              style={{
                padding: '10px 16px',
                background: '#D946EF',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              + Agregar
            </button>
          </div>

          {/* Sugerencias rápidas */}
          <p style={{
            fontSize: '12px',
            color: '#6B7280',
            margin: '0 0 8px 0',
            fontWeight: '600'
          }}>
            Sugerencias rápidas:
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '24px'
          }}>
            {suggestedHobbies.map((hobby) => {
              const isSelected = hobbyList.includes(hobby);
              return (
                <button
                  key={hobby}
                  onClick={() => {
                    if (isSelected) {
                      handleRemoveHobby(hobby);
                    } else {
                      handleAddHobby(hobby);
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    background: isSelected ? '#D946EF' : '#F3F4F6',
                    color: isSelected ? 'white' : '#6B7280',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#E5E7EB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#F3F4F6';
                    }
                  }}
                >
                  {isSelected ? '✓ ' : ''}{hobby}
                </button>
              );
            })}
          </div>

          {/* Botón Guardar */}
          <button
            onClick={handleSaveProfile}
            disabled={hobbyList.length < 2}
            style={{
              width: '100%',
              padding: '14px',
              background: hobbyList.length < 2 ? '#E5E7EB' : '#D946EF',
              color: hobbyList.length < 2 ? '#9CA3AF' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: hobbyList.length < 2 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (hobbyList.length >= 2) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (hobbyList.length >= 2) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    );
  }

  // ============ SUSCRIPCIÓN ============
  if (activeSubView === 'SUBSCRIPTION') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'white',
        paddingBottom: '100px',
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column'
      }} ref={containerRef}>
        {/* HEADER STICKY */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <BackButton onClick={() => setActiveSubView(null)} />
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            margin: 0,
            flex: 1
          }}>
            Suscripción y Facturación
          </h1>
        </div>

        {/* CONTENIDO */}
        <div style={{ padding: '20px 16px', flex: 1 }}>
          <div style={{
            background: '#FFF8FE',
            border: '2px solid #D946EF',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 8px 0'
            }}>
              Plan Actual
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: '0 0 12px 0'
            }}>
              Prueba Gratuita de 14 Días
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Estado:</span>
              <span style={{
                background: '#D946EF',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                Activa
              </span>
            </div>

            <button
              onClick={() => alert('Funcionalidad de pago en desarrollo')}
              style={{
                width: '100%',
                padding: '12px',
                background: '#D946EF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Pasar al Plan PRO
            </button>
          </div>

          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 12px 0'
          }}>
            Historial de Pagos
          </h3>

          <div style={{
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '14px'
          }}>
            📭 No hay pagos registrados aún
          </div>
        </div>
      </div>
    );
  }

  // ============ NOTIFICACIONES ============
  if (activeSubView === 'NOTIFICATIONS') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'white',
        paddingBottom: '100px',
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column'
      }} ref={containerRef}>
        {/* HEADER STICKY */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <BackButton onClick={() => setActiveSubView(null)} />
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            margin: 0,
            flex: 1
          }}>
            Preferencias de Notificación
          </h1>
        </div>

        {/* CONTENIDO */}
        <div style={{ padding: '20px 16px', flex: 1 }}>
          {/* Toggle 1: Recordatorio diario */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: '#F9FAFB',
            borderRadius: '8px',
            marginBottom: '12px',
            borderLeft: notifications.dailyRoutine ? '3px solid #D946EF' : '3px solid transparent'
          }}>
            <div>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 4px 0'
              }}>
                Recordatorio de Rutina Diaria
              </h4>
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                margin: 0
              }}>
                Notificaciones para ejercicio y check-in
              </p>
            </div>
            <button
              onClick={() => handleNotificationChange('dailyRoutine', !notifications.dailyRoutine)}
              style={{
                width: '48px',
                height: '28px',
                borderRadius: '14px',
                border: 'none',
                background: notifications.dailyRoutine ? '#D946EF' : '#E5E7EB',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                position: 'absolute',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'white',
                top: '2px',
                left: notifications.dailyRoutine ? '22px' : '2px',
                transition: 'left 0.3s'
              }} />
            </button>
          </div>

          {notifications.dailyRoutine && (
            <div style={{
              padding: '12px 16px',
              background: '#FFF8FE',
              border: '1px solid #D946EF',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <label style={{
                fontSize: '12px',
                color: '#6B7280',
                flex: 1,
                margin: 0
              }}>
                Hora de notificación:
              </label>
              <input
                type="time"
                value={notifications.dailyRoutineTime}
                onChange={(e) => handleNotificationChange('dailyRoutineTime', e.target.value)}
                style={{
                  padding: '6px',
                  border: '1px solid #D946EF',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          )}

          {/* Toggle 2: Pausas de respiración */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: '#F9FAFB',
            borderRadius: '8px',
            marginBottom: '12px',
            borderLeft: notifications.breathing ? '3px solid #D946EF' : '3px solid transparent'
          }}>
            <div>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 4px 0'
              }}>
                Pausas de Respiración y Relajación
              </h4>
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                margin: 0
              }}>
                Recordatorios para momentos de calma
              </p>
            </div>
            <button
              onClick={() => handleNotificationChange('breathing', !notifications.breathing)}
              style={{
                width: '48px',
                height: '28px',
                borderRadius: '14px',
                border: 'none',
                background: notifications.breathing ? '#D946EF' : '#E5E7EB',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                position: 'absolute',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'white',
                top: '2px',
                left: notifications.breathing ? '22px' : '2px',
                transition: 'left 0.3s'
              }} />
            </button>
          </div>

          {/* Toggle 3: Novedades y consejos */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: '#F9FAFB',
            borderRadius: '8px',
            marginBottom: '12px',
            borderLeft: notifications.news ? '3px solid #D946EF' : '3px solid transparent'
          }}>
            <div>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 4px 0'
              }}>
                Novedades y Consejos Posparto
              </h4>
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                margin: 0
              }}>
                Tips y actualizaciones de contenido
              </p>
            </div>
            <button
              onClick={() => handleNotificationChange('news', !notifications.news)}
              style={{
                width: '48px',
                height: '28px',
                borderRadius: '14px',
                border: 'none',
                background: notifications.news ? '#D946EF' : '#E5E7EB',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                position: 'absolute',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'white',
                top: '2px',
                left: notifications.news ? '22px' : '2px',
                transition: 'left 0.3s'
              }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ SOPORTE ============
  if (activeSubView === 'SUPPORT') {
    const faqs = [
      {
        q: '¿Cómo cambio mis datos personales?',
        a: 'Ve a Información Personal en tu perfil. Puedes actualizar tu nombre, apellido y fecha de parto. Para cambiar el correo, contacta a soporte.'
      },
      {
        q: '¿Qué sucede cuando finaliza la prueba gratuita?',
        a: 'Tu acceso se pausará si no contratas el Plan PRO. Podrás reactivar en cualquier momento sin perder tus datos.'
      },
      {
        q: '¿Puedo cancelar mi suscripción?',
        a: 'Sí, puedes cancelar tu Plan PRO desde la sección de Suscripción. La cancelación es inmediata sin penalidades.'
      },
      {
        q: '¿Mis datos son seguros?',
        a: 'Usamos encriptación de nivel industrial. Tus datos personales y actividad nunca se comparten con terceros.'
      }
    ];

    return (
      <div style={{
        minHeight: '100vh',
        background: 'white',
        paddingBottom: '100px',
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column'
      }} ref={containerRef}>
        {/* HEADER STICKY */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <BackButton onClick={() => setActiveSubView(null)} />
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            margin: 0,
            flex: 1
          }}>
            Soporte y Ayuda
          </h1>
        </div>

        {/* CONTENIDO */}
        <div style={{ padding: '20px 16px', flex: 1 }}>
          {/* FAQ Acordeón */}
          <h3 style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 12px 0'
          }}>
            Preguntas Frecuentes
          </h3>

          <div style={{ marginBottom: '24px' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F3F4F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F9FAFB';
                  }}
                >
                  {faq.q}
                  <span style={{
                    transition: 'transform 0.3s',
                    transform: openFAQ === idx ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </span>
                </button>

                {openFAQ === idx && (
                  <div style={{
                    padding: '12px 14px',
                    background: '#FFF8FE',
                    border: '1px solid #E5E7EB',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    fontSize: '13px',
                    color: '#6B7280',
                    lineHeight: '1.5'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Botón contacto */}
          <h3 style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#111827',
            margin: '24px 0 12px 0'
          }}>
            ¿Necesitas ayuda directa?
          </h3>

          <button
            onClick={() => window.location.href = 'mailto:support@postpartumrecovery.app'}
            style={{
              width: '100%',
              padding: '14px',
              background: '#D946EF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            💬 Contactar a Soporte
          </button>

          {/* Enlaces legales */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <button
              onClick={() => alert('Términos y Condiciones\n\nPlaceholder de contenido legal')}
              style={{
                padding: '10px',
                background: 'transparent',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#D946EF',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFF8FE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Términos y Condiciones
            </button>

            <button
              onClick={() => alert('Política de Privacidad\n\nPlaceholder de contenido legal')}
              style={{
                padding: '10px',
                background: 'transparent',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#D946EF',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFF8FE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Política de Privacidad
            </button>
          </div>
        </div>
      </div>
    );
  }
}
