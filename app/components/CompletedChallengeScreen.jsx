'use client';
import { useState } from 'react';

export default function CompletedChallengeScreen({ activity, mood, onClose }) {
  const [showFeedback, setShowFeedback] = useState(false);

  const moodFeedback = {
    '😔': {
      title: 'Te escuchamos',
      message: 'Vamos a hacer algo para que te sientas mejor.'
    },
    '😊': {
      title: '¡Excelente!',
      message: '¡Nos encanta verte con esa energía!'
    },
    '⚡': {
      title: '¡Excelente!',
      message: '¡Nos encanta verte con esa energía!'
    }
  };

  const feedback = moodFeedback[mood] || moodFeedback['😊'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
      padding: '40px 16px 100px',
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '32px'
    }}>
      {/* Emoji del reto en círculo */}
      <div style={{
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        background: '#FFF8FE',
        border: '2px solid #D946EF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '72px',
        boxShadow: '0 8px 24px rgba(217, 70, 239, 0.15)'
      }}>
        {activity?.emoji || '✨'}
      </div>

      {/* Texto de celebración */}
      <div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#D946EF',
          margin: '0 0 12px 0',
          letterSpacing: '-0.5px'
        }}>
          ¡Día completado!
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          margin: '0 0 24px 0',
          lineHeight: '1.6'
        }}>
          Progreso registrado en tu calendario.
        </p>
      </div>

      {/* Feedback basado en ánimo */}
      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '100%'
      }}>
        <p style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#111827',
          margin: '0 0 8px 0'
        }}>
          {feedback.title}
        </p>
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
          margin: '0',
          lineHeight: '1.5'
        }}>
          {feedback.message}
        </p>
      </div>

      {/* Botón de cierre */}
      <button
        onClick={onClose}
        style={{
          padding: '14px 32px',
          background: '#D946EF',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '15px',
          color: 'white',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(217, 70, 239, 0.2)'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#C72BD9';
          e.target.style.boxShadow = '0 6px 16px rgba(217, 70, 239, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#D946EF';
          e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.2)';
        }}
      >
        Volver al inicio
      </button>
    </div>
  );
}
