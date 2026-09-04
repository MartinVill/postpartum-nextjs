'use client';

import { restAudioPlayer, useRestAudioPlayer } from './restAudioPlayer';

function MediaControlIcon({ isPlaying }) {
  return isPlaying ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M8.5 6.75v10.5M15.5 6.75v10.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: 'block', marginLeft: '1px' }}>
      <path d="M8.3 5.8c0-1.02 1.12-1.65 2-1.12l8.15 4.96a2.76 2.76 0 0 1 0 4.72l-8.15 4.96a1.3 1.3 0 0 1-2-1.12V5.8Z" />
    </svg>
  );
}

export default function RestAudioMiniPlayer() {
  const player = useRestAudioPlayer();
  if (!player.track) return null;

  return (
    <div style={styles.bar} role="status" aria-label={`Reproductor: ${player.track.title}`}>
      <button onClick={() => restAudioPlayer.toggle()} style={styles.play} aria-label={player.isPlaying ? 'Pausar sonido' : 'Reproducir sonido'}>
        <MediaControlIcon isPlaying={player.isPlaying} />
      </button>
      <div style={styles.copy}>
        <strong style={styles.title}>{player.track.title}</strong>
        <span style={styles.subtitle}>{player.isPlaying ? 'Reproduciendo' : 'En pausa'}</span>
      </div>
      <button onClick={() => restAudioPlayer.stop()} style={styles.close} aria-label="Cerrar reproductor">×</button>
    </div>
  );
}

const styles = {
  bar: { position: 'fixed', left: '12px', right: '12px', bottom: 'calc(70px + env(safe-area-inset-bottom, 0px) + 8px)', zIndex: 40, maxWidth: '576px', margin: '0 auto', minHeight: '54px', padding: '8px 10px', boxSizing: 'border-box', background: 'rgba(255, 253, 246, 0.97)', border: '1px solid rgba(217, 70, 239, 0.22)', borderRadius: '16px', boxShadow: '0 8px 24px rgba(80, 40, 70, 0.16)', display: 'flex', alignItems: 'center', gap: '10px' },
  play: { width: '36px', height: '36px', flexShrink: 0, borderRadius: '50%', border: 'none', background: '#D946EF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  copy: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' },
  title: { color: '#374151', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '13px' },
  subtitle: { color: '#6B7280', fontSize: '11px' },
  close: { width: '30px', height: '30px', flexShrink: 0, border: 'none', background: 'transparent', color: '#D946EF', fontSize: '25px', lineHeight: 1, cursor: 'pointer' }
};
