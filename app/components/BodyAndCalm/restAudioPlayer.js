'use client';

import { useEffect, useState } from 'react';

const DEFAULT_TIMER_MINUTES = 30;
let audio = null;
let detachAudioListeners = null;
let tickId = null;
let fadeInId = null;
let timerEndsAt = null;
let timerRemainingMs = null;
let finishingTimer = false;
const listeners = new Set();
let snapshot = {
  track: null,
  isPlaying: false,
  timerMinutes: DEFAULT_TIMER_MINUTES,
  timerTotalSeconds: DEFAULT_TIMER_MINUTES * 60,
  remainingSeconds: null,
  currentTime: 0,
  duration: 0,
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

function clearFadeIn() {
  if (fadeInId) window.clearInterval(fadeInId);
  fadeInId = null;
}

function fadeInAudio(player) {
  clearFadeIn();
  // A longer, gentle ramp keeps playback comfortable when starting from silence.
  const fadeDuration = 7500;
  const startedAt = Date.now();
  player.volume = 0;
  fadeInId = window.setInterval(() => {
    const progress = Math.min(1, (Date.now() - startedAt) / fadeDuration);
    player.volume = progress;
    if (progress === 1) clearFadeIn();
  }, 100);
}

function stopAndDisposeAudio() {
  clearTimer();
  clearFadeIn();
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
  if (!audio) return;
  const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  const remainingMs = timerEndsAt ? Math.max(0, timerEndsAt - Date.now()) : null;
  const remainingSeconds = remainingMs == null ? null : Math.ceil(remainingMs / 1000);

  if (remainingMs != null) timerRemainingMs = remainingMs;

  publish({ currentTime, duration, remainingSeconds });

  if (remainingMs == null) return;

  if (remainingMs <= 10000) {
    clearFadeIn();
    audio.volume = Math.max(0, remainingMs / 10000);
  }

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
  if (!audio) return;

  if (snapshot.timerMinutes == null) {
    timerRemainingMs = null;
    publish({ remainingSeconds: null });
  } else {
    const duration = timerRemainingMs ?? snapshot.timerMinutes * 60 * 1000;
    timerEndsAt = Date.now() + duration;
  }

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
  const onLoadedMetadata = () => publish({ duration: Number.isFinite(audio?.duration) ? audio.duration : 0 });
  audio.addEventListener('play', onPlay);
  audio.addEventListener('pause', onPause);
  audio.addEventListener('error', onError);
  audio.addEventListener('loadedmetadata', onLoadedMetadata);
  detachAudioListeners = () => {
    audio?.removeEventListener('play', onPlay);
    audio?.removeEventListener('pause', onPause);
    audio?.removeEventListener('error', onError);
    audio?.removeEventListener('loadedmetadata', onLoadedMetadata);
  };
  timerRemainingMs = null;
  publish({ track, isPlaying: false, remainingSeconds: null, currentTime: 0, duration: 0, error: '' });
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
    try {
      await player.play();
      fadeInAudio(player);
      startTimer();
    } catch {
      publish({ isPlaying: false, error: 'El sonido necesita un toque para comenzar. Inténtalo otra vez.' });
    }
  },

  pause() {
    audio?.pause();
    clearFadeIn();
    if (audio) audio.volume = 1;
  },

  async toggle() {
    if (snapshot.isPlaying) this.pause();
    else await this.play();
  },

  setTimer(minutes) {
    const normalized = minutes === null ? null : Number(minutes);
    timerRemainingMs = normalized == null ? null : normalized * 60 * 1000;
    publish({ timerMinutes: normalized, timerTotalSeconds: normalized == null ? null : normalized * 60, remainingSeconds: normalized == null ? null : normalized * 60 });
    if (snapshot.isPlaying) startTimer();
  },

  stop() {
    stopAndDisposeAudio();
    timerRemainingMs = null;
    publish({ track: null, isPlaying: false, remainingSeconds: null, currentTime: 0, duration: 0, error: '' });
  }
};

export function useRestAudioPlayer() {
  const [state, setState] = useState(snapshot);
  useEffect(() => restAudioPlayer.subscribe(setState), []);
  return state;
}
