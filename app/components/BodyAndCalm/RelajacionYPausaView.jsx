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

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = String(safeSeconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function TrackArtwork({ track, style }) {
  return (
    <div style={{ ...styles.artwork, ...style }}>
      <img
        src={track.imageUrl}
        alt={track.title}
        className="rest-audio-artwork"
        style={styles.image}
      />
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
    restAudioPlayer.play(track);
  };

  const closePlayer = () => setSelectedTrack(null);

  return (
    <div style={styles.screen}>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.back} aria-label="Volver a Cuerpo y Calma">&lt;</button>
        <div style={styles.headerCopy}>
          <h1 style={styles.heading}>Sonidos para descansar</h1>
          <p style={styles.subheading}>Encuentra tu momento de calma.</p>
        </div>
      </header>

      <main style={styles.grid}>
        {REST_AUDIO_TRACKS.map(track => (
          <button key={track.id} onClick={() => openPlayer(track)} style={styles.card} aria-label={`Abrir ${track.title}`}>
            <TrackArtwork track={track} style={styles.cardArtwork} />
            <span style={styles.playBadge} aria-hidden="true">▶</span>
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
            <style>{`@keyframes restPlayerFadeIn { from { opacity: 0; transform: scale(1.015); } to { opacity: 1; transform: scale(1); } }`}</style>
            <div style={styles.modalBackground} aria-hidden="true">
              <img src={selectedTrack.imageUrl} alt="" style={styles.modalBackgroundImage} />
              <div style={{ ...styles.modalBackgroundShade, ...(nightMode ? styles.modalBackgroundShadeNight : {}) }} />
            </div>
            <button onClick={closePlayer} style={{ ...styles.modalClose, opacity: nightMode ? 0.3 : 0.65 }} aria-label="Cerrar reproductor">×</button>
            <button onClick={() => setNightMode(value => !value)} style={{ ...styles.moon, opacity: nightMode ? 1 : 0.65 }} aria-pressed={nightMode} aria-label="Oscurecer pantalla">☾</button>
            <div style={{ ...styles.modalControls, opacity: nightMode ? 0.3 : 1 }}>
              <h2 style={styles.modalTitle}>{selectedTrack.title}</h2>
              <button onClick={() => restAudioPlayer.toggle()} style={styles.primaryPlay} aria-label={player.isPlaying ? 'Pausar' : 'Reproducir'}>
                {player.isPlaying ? 'Ⅱ' : '▶'}
              </button>
              <p style={styles.timerLabel}>Limitar duración</p>
              <div style={styles.timerOptions}>
                {TIMER_OPTIONS.map(option => (
                  <button key={String(option.value)} onClick={() => restAudioPlayer.setTimer(option.value)} style={{ ...styles.timerButton, ...(player.timerMinutes === option.value ? styles.timerButtonActive : {}) }}>
                    {option.label}
                  </button>
                ))}
              </div>
              <div style={styles.progressGroup} aria-label="Progreso de reproducción">
                <div style={styles.progressTrack}>
                  <span
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min(100, Math.max(0, player.timerMinutes != null && player.timerTotalSeconds ? ((player.timerTotalSeconds - (player.remainingSeconds ?? player.timerTotalSeconds)) / player.timerTotalSeconds) * 100 : player.duration ? (player.currentTime / player.duration) * 100 : 0))}%`
                    }}
                  />
                </div>
                <span style={styles.progressCopy}>
                  {player.timerMinutes != null
                    ? `Faltan ${formatTime(player.remainingSeconds ?? player.timerTotalSeconds)}`
                    : `Faltan ${formatTime(Math.max(0, (player.duration || 0) - player.currentTime))}`}
                </span>
              </div>
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
  card: { position: 'relative', display: 'flex', flexDirection: 'column', height: '220px', overflow: 'hidden', padding: 0, border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '18px', background: '#fff', color: '#1E293B', cursor: 'pointer', textAlign: 'left', boxShadow: '0 5px 14px rgba(44, 31, 47, 0.09)' },
  artwork: { position: 'relative', overflow: 'hidden', background: '#FCE7F3' },
  cardArtwork: { width: '100%', height: '65%', flexShrink: 0 },
  image: { width: '100%', height: '100%', display: 'block', objectFit: 'cover' },
  playBadge: { position: 'absolute', zIndex: 2, top: 'calc(65% - 19px)', right: '10px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: '#C026D3', fontSize: '13px', paddingLeft: '2px', boxShadow: '0 3px 9px rgba(51, 65, 85, 0.16)' },
  cardText: { minHeight: 0, flex: 1, boxSizing: 'border-box', padding: '11px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', background: 'rgba(255, 251, 253, 0.65)' },
  cardTitle: { fontSize: '15px', lineHeight: 1.2, color: '#1E293B', fontWeight: 600 },
  cardSubtitle: { display: '-webkit-box', overflow: 'hidden', color: '#64748B', fontSize: '13px', lineHeight: 1.25, WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 },
  modalBackdrop: { position: 'fixed', inset: 0, zIndex: 80, overflow: 'hidden', background: 'rgba(15, 23, 42, 0.42)', touchAction: 'none', overscrollBehavior: 'contain' },
  modal: { position: 'relative', width: '100%', minHeight: '100dvh', height: '100dvh', boxSizing: 'border-box', padding: 'calc(42px + env(safe-area-inset-top, 0px)) 24px calc(32px + env(safe-area-inset-bottom, 0px))', background: '#172033', color: '#fff', overflow: 'hidden', overscrollBehavior: 'contain', animation: 'restPlayerFadeIn 220ms ease-out both', transition: 'background 260ms ease, color 260ms ease' },
  modalNight: { background: '#020617', color: '#fff' },
  modalBackground: { position: 'absolute', inset: 0, overflow: 'hidden' },
  modalBackgroundImage: { width: '100%', height: '100%', objectFit: 'cover', opacity: 1 },
  modalBackgroundShade: { position: 'absolute', inset: 0, background: 'rgba(10, 14, 26, 0.66)' },
  modalBackgroundShadeNight: { background: 'rgba(2, 6, 23, 0.82)' },
  modalClose: { position: 'absolute', zIndex: 2, top: '17px', right: '18px', width: '44px', height: '44px', border: 'none', background: 'transparent', color: '#D946EF', fontSize: '38px', lineHeight: 1, cursor: 'pointer' },
  moon: { position: 'absolute', zIndex: 2, top: '20px', left: '20px', width: '40px', height: '40px', border: 'none', borderRadius: '50%', background: 'transparent', color: '#D946EF', fontSize: '30px', lineHeight: 1, cursor: 'pointer' },
  modalControls: { position: 'relative', zIndex: 1, minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 'calc(42px + env(safe-area-inset-bottom, 0px))', boxSizing: 'border-box', transition: 'opacity 260ms ease' },
  modalTitle: { margin: '0 0 22px', color: '#fff', fontSize: '22px', lineHeight: 1.2, fontWeight: 700, textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.38)' },
  primaryPlay: { width: '78px', height: '78px', border: 'none', borderRadius: '50%', background: '#C026D3', color: '#fff', fontSize: '29px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 0 7px rgba(192,38,211,0.14), 0 14px 30px rgba(192,38,211,0.42)', transition: 'transform 180ms ease, background 180ms ease' },
  timerLabel: { margin: '26px 0 10px', color: '#fff', fontSize: '14px', fontWeight: 400 },
  timerOptions: { display: 'flex', gap: '7px', flexWrap: 'wrap', justifyContent: 'center' },
  timerButton: { padding: '8px 11px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: '12px', cursor: 'pointer', backdropFilter: 'blur(12px)' },
  timerButtonActive: { border: '1px solid #C026D3', background: '#C026D3', color: '#fff', fontWeight: 700 },
  progressGroup: { width: '100%', maxWidth: '276px', marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' },
  progressTrack: { width: '100%', height: '5px', overflow: 'hidden', borderRadius: '999px', background: 'rgba(255,255,255,0.26)' },
  progressFill: { display: 'block', height: '100%', borderRadius: 'inherit', background: '#E879F9', transition: 'width 250ms linear' },
  progressCopy: { color: '#F5D0FE', fontSize: '12px', fontWeight: 400 },
  error: { margin: '14px 0 0', color: '#DC2626', fontSize: '12px', textAlign: 'center' }
};
