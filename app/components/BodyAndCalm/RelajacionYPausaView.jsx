'use client';

import { useState } from 'react';
import { REST_AUDIO_TRACKS } from '@/src/data/restAudioData';
import { restAudioPlayer, useRestAudioPlayer } from './restAudioPlayer';

const TIMER_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 h' },
  { value: null, label: 'Sin límite' }
];

function TrackArtwork({ track, withOverlay = true }) {
  return (
    <div style={styles.artwork}>
      <img
        src={track.imageUrl}
        alt={track.title}
        className="rest-audio-artwork"
        style={styles.image}
      />
      {withOverlay && <div style={styles.overlay} />}
    </div>
  );
}

export default function RelajacionYPausaView({ onBack }) {
  const player = useRestAudioPlayer();
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [nightMode, setNightMode] = useState(false);

  const openPlayer = (track) => {
    restAudioPlayer.select(track);
    restAudioPlayer.setTimer(30);
    setSelectedTrack(track);
    setNightMode(false);
  };

  const closePlayer = () => setSelectedTrack(null);

  return (
    <div style={styles.screen}>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.back} aria-label="Volver a Cuerpo y Calma">&lt;</button>
        <div style={styles.headerCopy}>
          <h1 style={styles.heading}>Sonidos para descansar</h1>
          <p style={styles.subheading}>Elige un sonido, activa el temporizador si deseas y tómate una pausa.</p>
        </div>
      </header>

      <main style={styles.grid}>
        {REST_AUDIO_TRACKS.map(track => (
          <button key={track.id} onClick={() => openPlayer(track)} style={styles.card} aria-label={`Abrir ${track.title}`}>
            <TrackArtwork track={track} />
            <span style={styles.cardText}>
              <strong style={styles.cardTitle}>{track.title}</strong>
              <span style={styles.cardSubtitle}>{track.subtitle}</span>
            </span>
          </button>
        ))}
      </main>

      {selectedTrack && (
        <div style={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label={`Reproductor de ${selectedTrack.title}`}>
          <section style={{ ...styles.modal, ...(nightMode ? styles.modalNight : {}) }}>
            <button onClick={closePlayer} style={{ ...styles.modalClose, opacity: nightMode ? 0.3 : 0.65 }} aria-label="Cerrar reproductor">×</button>
            <button onClick={() => setNightMode(value => !value)} style={{ ...styles.moon, opacity: nightMode ? 1 : 0.65 }} aria-pressed={nightMode} aria-label="Oscurecer pantalla">☾</button>
            <div style={{ ...styles.modalControls, opacity: nightMode ? 0.3 : 1 }}>
              <div style={styles.modalArtwork}><TrackArtwork track={selectedTrack} withOverlay={false} /></div>
              <p style={styles.nowPlaying}>Sonido para descansar</p>
              <h2 style={styles.modalTitle}>{selectedTrack.title}</h2>
              <button onClick={() => restAudioPlayer.toggle()} style={styles.primaryPlay} aria-label={player.isPlaying ? 'Pausar' : 'Reproducir'}>
                {player.isPlaying ? 'Ⅱ' : '▶'}
              </button>
              <p style={styles.timerLabel}>Temporizador</p>
              <div style={styles.timerOptions}>
                {TIMER_OPTIONS.map(option => (
                  <button key={String(option.value)} onClick={() => restAudioPlayer.setTimer(option.value)} style={{ ...styles.timerButton, ...(player.timerMinutes === option.value ? styles.timerButtonActive : {}) }}>
                    {option.label}
                  </button>
                ))}
              </div>
              {player.remainingSeconds != null && player.isPlaying && <span style={styles.remaining}>Quedan {Math.ceil(player.remainingSeconds / 60)} min</span>}
              {player.error && <p style={styles.error}>{player.error}</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

const styles = {
  screen: { minHeight: '100vh', boxSizing: 'border-box', background: '#FFFDF6', color: '#374151', padding: '20px 16px 168px', maxWidth: '600px', margin: '0 auto' },
  header: { position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '8px 0 22px' },
  back: { position: 'absolute', top: '3px', left: '0', width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#FFFDF6', color: '#D946EF', fontWeight: 700, fontSize: '24px', lineHeight: 1, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  headerCopy: { width: '100%', maxWidth: '320px', padding: '0 8px', textAlign: 'center' },
  heading: { margin: 0, color: '#D946EF', fontSize: '23px', lineHeight: 1.2, fontWeight: 700 },
  subheading: { margin: '9px 0 0', color: '#5F6670', fontSize: '14px', lineHeight: 1.45 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' },
  card: { position: 'relative', overflow: 'hidden', minHeight: '170px', padding: 0, border: 'none', borderRadius: '18px', background: '#21152A', color: '#fff', cursor: 'pointer', textAlign: 'left', boxShadow: '0 5px 14px rgba(44, 31, 47, 0.13)' },
  artwork: { position: 'absolute', inset: 0, overflow: 'hidden', background: '#1D1825' },
  image: { width: '100%', height: '100%', display: 'block', objectFit: 'cover' },
  overlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' },
  cardText: { position: 'relative', zIndex: 1, minHeight: '170px', boxSizing: 'border-box', padding: '16px 13px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '5px' },
  cardTitle: { fontSize: '15px', lineHeight: 1.18, color: '#fff' },
  cardSubtitle: { color: '#E5E7EB', fontSize: '11px', lineHeight: 1.28 },
  modalBackdrop: { position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-end', background: 'rgba(17, 24, 39, 0.45)' },
  modal: { position: 'relative', width: '100%', minHeight: '510px', boxSizing: 'border-box', padding: '32px 24px calc(94px + env(safe-area-inset-bottom, 0px))', borderRadius: '28px 28px 0 0', background: '#111827', color: '#fff', overflow: 'hidden', transition: 'background 260ms ease, color 260ms ease' },
  modalNight: { background: '#020617', color: '#fff' },
  modalClose: { position: 'absolute', zIndex: 2, top: '17px', right: '18px', width: '36px', height: '36px', border: 'none', background: 'transparent', color: '#D946EF', fontSize: '31px', lineHeight: 1, cursor: 'pointer' },
  moon: { position: 'absolute', zIndex: 2, top: '20px', left: '20px', width: '32px', height: '32px', border: 'none', borderRadius: '50%', background: 'transparent', color: '#D946EF', fontSize: '24px', lineHeight: 1, cursor: 'pointer' },
  modalControls: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'opacity 260ms ease' },
  modalArtwork: { position: 'relative', width: '192px', height: '192px', margin: '4px 0 18px', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 18px 34px rgba(0,0,0,0.45)' },
  nowPlaying: { margin: 0, color: '#A3A3A3', fontSize: '12px', fontWeight: 600 },
  modalTitle: { margin: '7px 0 18px', color: '#fff', fontSize: '24px', lineHeight: 1.2, textAlign: 'center' },
  primaryPlay: { width: '76px', height: '76px', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '50%', background: '#C026D3', color: '#fff', fontSize: '29px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 0 7px rgba(192,38,211,0.11), 0 14px 28px rgba(192,38,211,0.38)', transition: 'transform 180ms ease, box-shadow 180ms ease' },
  timerLabel: { margin: '26px 0 10px', color: '#fff', fontSize: '14px', fontWeight: 650 },
  timerOptions: { display: 'flex', gap: '7px', flexWrap: 'wrap', justifyContent: 'center' },
  timerButton: { padding: '8px 11px', borderRadius: '999px', border: '1px solid #404040', background: '#262626', color: '#D4D4D4', fontSize: '12px', cursor: 'pointer' },
  timerButtonActive: { borderColor: '#C026D3', background: '#C026D3', color: '#fff', fontWeight: 700 },
  remaining: { marginTop: '13px', color: '#E879F9', fontSize: '12px', fontWeight: 500 },
  error: { margin: '14px 0 0', color: '#DC2626', fontSize: '12px', textAlign: 'center' }
};
