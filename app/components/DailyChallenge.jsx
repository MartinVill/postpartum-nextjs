'use client';
import { useState, useEffect } from 'react';

export default function DailyChallenge({ energy, userProfile }) {
  const [challenge, setChallenge] = useState(null);
  const [progress, setProgress] = useState(0);

  // Retos contextuales basados en energía
  const getChallengeByEnergy = (energyLevel) => {
    const challenges = {
      low: [
        { title: 'Beber 1 vaso de agua', icon: '💧', target: 1, hint: 'Uno. Solo uno.' },
        { title: 'Respira profundo 5 veces', icon: '🌬️', target: 5, hint: 'Lento y tranquilo.' },
        { title: 'Acostarte 10 minutos', icon: '😴', target: 1, hint: 'Descansa.' }
      ],
      medium: [
        { title: 'Beber 6 vasos de agua', icon: '💧', target: 6, hint: 'A lo largo del día.' },
        { title: 'Comer algo nutritivo', icon: '🥗', target: 3, hint: 'Desayuno, almuerzo, merienda.' },
        { title: 'Pasear 15 minutos', icon: '🚶‍♀️', target: 15, hint: 'Con o sin bebé.' },
        { title: 'Estirarse 5 minutos', icon: '🧘‍♀️', target: 1, hint: 'Cuello, hombros, espalda.' }
      ],
      high: [
        { title: '20 min de movimiento', icon: '💪', target: 20, hint: 'Yoga, caminar, lo que te guste.' },
        { title: 'Hacer algo que te relaje', icon: '✨', target: 1, hint: 'Música, lectura, lo tuyo.' },
        { title: 'Llamar a alguien', icon: '💬', target: 1, hint: 'Amiga, mamá, pareja.' },
        { title: '30 min con tu hobbie', icon: '🎨', target: 30, hint: `${userProfile?.hobbies?.[0] || 'tu cosa'}` }
      ]
    };

    let level = energy <= 3 ? 'low' : energy <= 6 ? 'medium' : 'high';
    const list = challenges[level];
    return list[Math.floor(Math.random() * list.length)];
  };

  useEffect(() => {
    if (energy) {
      const today = new Date().toDateString();
      const savedChallenge = localStorage.getItem('dailyChallenge');
      const savedData = savedChallenge ? JSON.parse(savedChallenge) : null;

      if (savedData && savedData.date === today) {
        setChallenge(savedData.challenge);
        setProgress(savedData.progress || 0);
      } else {
        const newChallenge = getChallengeByEnergy(energy);
        setChallenge(newChallenge);
        setProgress(0);
        localStorage.setItem('dailyChallenge', JSON.stringify({
          date: today,
          challenge: newChallenge,
          progress: 0
        }));
      }
    }
  }, [energy]);

  const handleProgressClick = () => {
    if (progress < challenge.target) {
      const newProgress = progress + 1;
      setProgress(newProgress);

      const today = new Date().toDateString();
      localStorage.setItem('dailyChallenge', JSON.stringify({
        date: today,
        challenge,
        progress: newProgress
      }));
    }
  };

  if (!challenge) return null;

  const percentComplete = Math.round((progress / challenge.target) * 100);
  const isComplete = progress >= challenge.target;

  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '16px',
      marginBottom: '20px',
      border: isComplete ? '2px solid #10B981' : '2px solid #E5E7EB',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '28px' }}>{challenge.icon}</span>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#1F2937',
            margin: 0
          }}>
            {challenge.title}
          </h3>
          <p style={{
            fontSize: '12px',
            color: '#9CA3AF',
            margin: '4px 0 0 0'
          }}>
            {challenge.hint}
          </p>
        </div>
        <span style={{
          fontSize: '20px',
          fontWeight: '700',
          color: isComplete ? '#10B981' : '#D946EF'
        }}>
          {progress}/{challenge.target}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        background: '#F3F4F6',
        height: '8px',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <div style={{
          background: isComplete ? '#10B981' : '#D946EF',
          height: '100%',
          width: `${percentComplete}%`,
          transition: 'width 0.3s'
        }} />
      </div>

      {/* Click to progress button */}
      <button
        onClick={handleProgressClick}
        disabled={isComplete}
        style={{
          width: '100%',
          padding: '12px',
          background: isComplete ? '#F0FDF4' : '#F3E8FF',
          border: `2px solid ${isComplete ? '#10B981' : '#D946EF'}`,
          color: isComplete ? '#10B981' : '#D946EF',
          borderRadius: '10px',
          fontWeight: '600',
          fontSize: '14px',
          cursor: isComplete ? 'default' : 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!isComplete) {
            e.target.style.background = '#E9D5FF';
          }
        }}
        onMouseLeave={(e) => {
          if (!isComplete) {
            e.target.style.background = '#F3E8FF';
          }
        }}
      >
        {isComplete ? '✅ ¡Completado!' : `+1 ${challenge.title.split(' ')[0]}`}
      </button>
    </div>
  );
}
