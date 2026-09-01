'use client';
import { useState } from 'react';

const calculateCyclePhase = (lastMenstruationDate) => {
  const lastDate = new Date(lastMenstruationDate);
  const today = new Date();
  const daysSinceLastMenstruation = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  const dayInCycle = daysSinceLastMenstruation % 28;

  if (dayInCycle < 5) return 'Menstruación';
  if (dayInCycle < 12) return 'Fase Folicular';
  if (dayInCycle < 16) return 'Ovulación';
  return 'Fase Lútea';
};

export default function OnboardingForm({ onComplete }) {
  const [step, setStep] = useState(1);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    hobbies: [],
    lastMenstruationDate: '',
    babyBirthDate: '',
    favoriteTermsOfEndearment: ['Reina', 'Hermosa'],
    quietStart: '22:00',
    quietEnd: '08:00'
  });
  const [currentHobby, setCurrentHobby] = useState('');
  const [currentTerm, setCurrentTerm] = useState('');

  const cyclePhases = ['Menstruación', 'Fase Folicular', 'Ovulación', 'Fase Lútea'];

  const handleAddHobby = () => {
    if (currentHobby.trim()) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, currentHobby.trim()]
      }));
      setCurrentHobby('');
    }
  };

  const handleRemoveHobby = (index) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter((_, i) => i !== index)
    }));
  };

  const handleAddTerm = () => {
    if (currentTerm.trim()) {
      setFormData(prev => ({
        ...prev,
        favoriteTermsOfEndearment: [...prev.favoriteTermsOfEndearment, currentTerm.trim()]
      }));
      setCurrentTerm('');
    }
  };

  const handleRemoveTerm = (index) => {
    setFormData(prev => ({
      ...prev,
      favoriteTermsOfEndearment: prev.favoriteTermsOfEndearment.filter((_, i) => i !== index)
    }));
  };

  const handleNext = async () => {
    if (step === 1 && !formData.name.trim()) return;
    if (step === 2 && formData.hobbies.length < 3) return;
    if (step === 3 && (!formData.lastMenstruationDate || !formData.babyBirthDate)) return;

    if (step < 5) {
      setStep(step + 1);
    } else {
      // Step 5 completed - finalize onboarding
      await handleCompleteOnboarding();
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsRequestingPermission(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();

      // Save quiet hours to localStorage regardless of permission
      localStorage.setItem('quietHours', JSON.stringify({
        quietStart: formData.quietStart,
        quietEnd: formData.quietEnd,
        updatedAt: new Date().toISOString()
      }));

      // If permission granted, register Service Worker and subscribe
      if (permission === 'granted') {
        try {
          const registration = await navigator.serviceWorker.ready;
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

          if (vapidKey && 'PushManager' in window) {
            await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey)
            });

            // Save subscription to backend
            await fetch('/api/notifications/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subscription: await registration.pushManager.getSubscription().then(s => s.toJSON()),
                quietStart: formData.quietStart,
                quietEnd: formData.quietEnd
              })
            });
          }
        } catch (swError) {
          console.warn('[ONBOARDING] SW subscription optional, continuing:', swError);
        }
      }
    } catch (error) {
      console.warn('[ONBOARDING] Permission request failed, continuing:', error);
    } finally {
      setIsRequestingPermission(false);

      // Complete onboarding
      const cyclePhase = calculateCyclePhase(formData.lastMenstruationDate);
      const finalData = {
        ...formData,
        cyclePhase
      };
      onComplete(finalData);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '28px', color: '#D946EF', lineHeight: '1.3' }}>
              ¿Cuál es tu nombre?
            </h2>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Tu nombre"
              autoFocus
              style={{
                width: '100%',
                padding: '16px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '16px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'all 0.3s',
                color: '#1F2937',
                background: '#F5F5F5',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onKeyDown={(e) => e.key === 'Enter' && formData.name.trim() && handleNext()}
              onFocus={(e) => {
                e.target.style.background = '#EFEFEF';
                e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.background = '#F5F5F5';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '28px', color: '#D946EF', lineHeight: '1.3' }}>
              ¿Cuáles son tus hobbies?
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>Agregá de a uno, al menos 3 cosas que disfrutes</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                type="text"
                value={currentHobby}
                onChange={(e) => setCurrentHobby(e.target.value)}
                placeholder="Lectura, yoga, música..."
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s',
                  color: '#1F2937',
                  background: '#F5F5F5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onFocus={(e) => {
                  e.target.style.background = '#EFEFEF';
                  e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#F5F5F5';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHobby()}
              />
              <button
                onClick={handleAddHobby}
                style={{
                  padding: '14px 20px',
                  background: '#D946EF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '18px',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(217, 70, 239, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#C026D3';
                  e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#D946EF';
                  e.target.style.boxShadow = '0 2px 8px rgba(217, 70, 239, 0.2)';
                }}
              >
                +
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {formData.hobbies.map((hobby, index) => (
                <div
                  key={index}
                  style={{
                    background: '#F3E8FF',
                    color: '#7E22CE',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500'
                  }}
                >
                  {hobby}
                  <button
                    onClick={() => handleRemoveHobby(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7E22CE',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0',
                      lineHeight: '1'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '28px', color: '#D946EF', lineHeight: '1.3' }}>
              ¿Cuándo nació tu bebé?
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>Así entiendo si estás en postparto o en ciclo menstrual normal</p>
            <input
              type="date"
              value={formData.babyBirthDate}
              onChange={(e) => setFormData(prev => ({ ...prev, babyBirthDate: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '16px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.3s',
                color: '#1F2937',
                background: '#F5F5F5',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onFocus={(e) => {
                e.target.style.background = '#EFEFEF';
                e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.background = '#F5F5F5';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            />

            <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '28px', marginTop: '32px', color: '#D946EF', lineHeight: '1.3' }}>
              ¿Cuándo fue tu última menstruación?
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>Antes del embarazo (si no te acuerdas exacto, aproximado)</p>
            <input
              type="date"
              value={formData.lastMenstruationDate}
              onChange={(e) => setFormData(prev => ({ ...prev, lastMenstruationDate: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '16px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.3s',
                color: '#1F2937',
                background: '#F5F5F5',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onFocus={(e) => {
                e.target.style.background = '#EFEFEF';
                e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.background = '#F5F5F5';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            />
          </div>
        );
      case 4:
        return (
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '28px', color: '#D946EF', lineHeight: '1.3' }}>
              ¿Cómo te gusta que te digan?
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>Agregá apodos si querés (ya tenés Reina y Hermosa)</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                type="text"
                value={currentTerm}
                onChange={(e) => setCurrentTerm(e.target.value)}
                placeholder="Reina, Mamá Guerrera..."
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s',
                  color: '#1F2937',
                  background: '#F5F5F5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onFocus={(e) => {
                  e.target.style.background = '#EFEFEF';
                  e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#F5F5F5';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTerm()}
              />
              <button
                onClick={handleAddTerm}
                style={{
                  padding: '14px 20px',
                  background: '#D946EF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '18px',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(217, 70, 239, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#C026D3';
                  e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#D946EF';
                  e.target.style.boxShadow = '0 2px 8px rgba(217, 70, 239, 0.2)';
                }}
              >
                +
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {formData.favoriteTermsOfEndearment.map((term, index) => (
                <div
                  key={index}
                  style={{
                    background: '#F3E8FF',
                    color: '#7E22CE',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500'
                  }}
                >
                  {term}
                  <button
                    onClick={() => handleRemoveTerm(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7E22CE',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0',
                      lineHeight: '1'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '16px', color: '#D946EF', lineHeight: '1.3' }}>
              ¿A qué hora descansas? 🌙
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px' }}>
              Jamás te enviaremos notificaciones durante tu horario de sueño o lactancia.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '0'
            }}>
              {/* Dormir */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4B5563',
                  marginBottom: '8px'
                }}>
                  Dormir
                </label>
                <input
                  type="time"
                  value={formData.quietStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, quietStart: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #E5E7EB',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1F2937',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s',
                    background: '#F5F5F5',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#EFEFEF';
                    e.target.style.borderColor = '#D946EF';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#F5F5F5';
                    e.target.style.borderColor = '#E5E7EB';
                  }}
                />
              </div>

              {/* Despertar */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4B5563',
                  marginBottom: '8px'
                }}>
                  Despertar
                </label>
                <input
                  type="time"
                  value={formData.quietEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, quietEnd: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #E5E7EB',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1F2937',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s',
                    background: '#F5F5F5',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#EFEFEF';
                    e.target.style.borderColor = '#D946EF';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#F5F5F5';
                    e.target.style.borderColor = '#E5E7EB';
                  }}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: 'white',
      padding: '32px 24px',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Step indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px'
      }}>
        <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '500' }}>
          Paso {step} de 5
        </p>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {[1, 2, 3, 4, 5].map(s => (
            <div
              key={s}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: s <= step ? '#D946EF' : '#E5E7EB',
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>
      </div>

      {renderStep()}

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '40px'
      }}>
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              flex: 1,
              padding: '16px',
              background: '#F5F5F5',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              color: '#666',
              fontSize: '15px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#EFEFEF';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#F5F5F5';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
          >
            Atrás
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={
            isRequestingPermission ||
            (step === 1 && !formData.name.trim()) ||
            (step === 2 && formData.hobbies.length < 3) ||
            (step === 3 && (!formData.lastMenstruationDate || !formData.babyBirthDate))
          }
          style={{
            flex: 1,
            padding: '16px',
            background: (
              isRequestingPermission ||
              (step === 1 && !formData.name.trim()) ||
              (step === 2 && formData.hobbies.length < 3) ||
              (step === 3 && (!formData.lastMenstruationDate || !formData.babyBirthDate))
            ) ? '#DDD' : '#D946EF',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: (
              isRequestingPermission ||
              (step === 1 && !formData.name.trim()) ||
              (step === 2 && formData.hobbies.length < 3) ||
              (step === 3 && (!formData.lastMenstruationDate || !formData.babyBirthDate))
            ) ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'all 0.2s',
            boxShadow: (
              isRequestingPermission ||
              (step === 1 && !formData.name.trim()) ||
              (step === 2 && formData.hobbies.length < 3) ||
              (step === 3 && (!formData.lastMenstruationDate || !formData.babyBirthDate))
            ) ? 'none' : '0 2px 8px rgba(217, 70, 239, 0.2)'
          }}
          onMouseEnter={(e) => {
            if (!(
              isRequestingPermission ||
              (step === 1 && !formData.name.trim()) ||
              (step === 2 && formData.hobbies.length < 3) ||
              (step === 3 && (!formData.lastMenstruationDate || !formData.babyBirthDate))
            )) {
              e.target.style.background = '#C026D3';
              e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!(
              isRequestingPermission ||
              (step === 1 && !formData.name.trim()) ||
              (step === 2 && formData.hobbies.length < 3) ||
              (step === 3 && (!formData.lastMenstruationDate || !formData.babyBirthDate))
            )) {
              e.target.style.background = '#D946EF';
              e.target.style.boxShadow = '0 2px 8px rgba(217, 70, 239, 0.2)';
            }
          }}
        >
          {isRequestingPermission ? 'Activando...' : step === 5 ? 'Comenzar ✨' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
}
