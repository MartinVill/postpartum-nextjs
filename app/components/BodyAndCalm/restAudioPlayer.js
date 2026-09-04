'use client';

import { useEffect, useState } from 'react';

const DEFAULT_TIMER_MINUTES = 30;
let audio = null;
let detachAudioListeners = null;
let tickId = null;
let timerEndsAt = null;
let timerRemainingMs = null;
let finishingTimer = false;
const listeners = new Set();
let snapshot = {
  track: null,
  isPlaying: false,
  timerMinutes: DEFAULT_TIMER_MINUTES,
  remainingSeconds: null,
  error: ''
};

function publish(next) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach(listener => listener(snapshot));
}

function clearTimer() {
  if (tickId) window.clearInterval(tickId);
  tickId = null;
  timerEndsAt = null;
}

function stopAndDisposeAudio() {
  clearTimer();
  if (!audio) return;
  if (detachAudioListeners) detachAudioListeners();
  detachAudioListeners = null;
  audio.pause();
  audio.currentTime = 0;
  audio.removeAttribute('src');
  audio.load();
  audio = null;
}

function runTimer() {
  if (!timerEndsAt || !audio) return;
  const remainingMs = Math.max(0, timerEndsAt - Date.now());
  timerRemainingMs = remainingMs;
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  if (remainingMs <= 10000) {
    audio.volume = Math.max(0, remainingMs / 10000);
  }

  publish({ remainingSeconds });

  if (remainingMs > 0) return;

  finishingTimer = true;
  clearTimer();
  timerRemainingMs = null;
  audio.pause();
  audio.currentTime = 0;
  audio.volume = 1;
  publish({ isPlaying: false, remainingSeconds: null });
  finishingTimer = false;
}

function startTimer() {
  clearTimer();
  if (snapshot.timerMinutes == null || !audio) {
    timerRemainingMs = null;
    publish({ remainingSeconds: null });
    return;
  }

  const duration = timerRemainingMs ?? snapshot.timerMinutes * 60 * 1000;
  timerEndsAt = Date.now() + duration;
  runTimer();
  tickId = window.setInterval(runTimer, 250);
}

function prepareAudio(track) {
  if (audio && snapshot.track?.id === track.id) return audio;

  stopAndDisposeAudio();
  audio = new Audio(track.audioUrl);
  audio.preload = 'metadata';
  audio.loop = true;
  audio.volume = 1;

  const onPlay = () => publish({ isPlaying: true, error: '' });
  const onPause = () => {
    if (!finishingTimer) {
      if (timerEndsAt) timerRemainingMs = Math.max(0, timerEndsAt - Date.now());
      clearTimer();
    }
    publish({ isPlaying: false });
  };
  const onError = () => publish({ isPlaying: false, error: 'No pudimos reproducir este sonido. Inténtalo otra vez.' });
  audio.addEventListener('play', onPlay);
  audio.addEventListener('pause', onPause);
  audio.addEventListener('error', onError);
  detachAudioListeners = () => {
    audio?.removeEventListener('play', onPlay);
    audio?.removeEventListener('pause', onPause);
    audio?.removeEventListener('error', onError);
  };
  timerRemainingMs = null;
  publish({ track, isPlaying: false, remainingSeconds: null, error: '' });
  return audio;
}

export const restAudioPlayer = {
  subscribe(listener) {
    listeners.add(listener);
    listener(snapshot);
    return () => listeners.delete(listener);
  },

  select(track) {
    prepareAudio(track);
  },

  async play(track) {
    const player = track ? prepareAudio(track) : audio;
    if (!player) return;
    player.volume = 1;
    try {
      await player.play();
      startTimer();
    } catch {
      publish({ isPlaying: false, error: 'El sonido necesita un toque para comenzar. Inténtalo otra vez.' });
    }
  },

  pause() {
    audio?.pause();
    if (audio) audio.volume = 1;
  },

  async toggle() {
    if (snapshot.isPlaying) this.pause();
    else await this.play();
  },

  setTimer(minutes) {
    const normalized = minutes === null ? null : Number(minutes);
    timerRemainingMs = normalized == null ? null : normalized * 60 * 1000;
    publish({ timerMinutes: normalized, remainingSeconds: normalized == null ? null : normalized * 60 });
    if (snapshot.isPlaying) startTimer();
  },

  stop() {
    stopAndDisposeAudio();
    timerRemainingMs = null;
    publish({ track: null, isPlaying: false, remainingSeconds: null, error: '' });
  }
};

export function useRestAudioPlayer() {
  const [state, setState] = useState(snapshot);
  useEffect(() => restAudioPlayer.subscribe(setState), []);
  return state;
}
