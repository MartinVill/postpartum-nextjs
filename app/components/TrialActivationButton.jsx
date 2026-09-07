'use client';

import { useState } from 'react';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function TrialActivationButton({ onActivated }) {
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const activateTrial = async () => {
    if (!auth) {
      setErrorMessage('No pudimos preparar el acceso. Inténtalo de nuevo en unos minutos.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      await onActivated?.({
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        idToken
      });
      setStatus('success');
    } catch (error) {
      console.error('[AUTH] Error al continuar con Google:', error);
      const messages = {
        'auth/popup-closed-by-user': 'Cerraste la ventana antes de terminar. Cuando quieras, inténtalo otra vez.',
        'auth/popup-blocked': 'Tu navegador bloqueó la ventana de Google. Permite ventanas emergentes e inténtalo otra vez.',
        'auth/operation-not-allowed': 'El acceso con Google aún no está habilitado. Inténtalo más tarde.'
      };
      setErrorMessage(messages[error.code] || 'No pudimos completar el acceso con Google. Inténtalo nuevamente.');
      setStatus('idle');
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={activateTrial}
        disabled={status === 'loading'}
        style={{
          width: '100%',
          minHeight: '48px',
          border: '1px solid #E9E2EA',
          borderRadius: '12px',
          background: '#FFFFFF',
          color: '#25212A',
          fontSize: '15px',
          fontWeight: '700',
          cursor: status === 'loading' ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(38,31,45,0.06)',
          opacity: status === 'loading' ? 0.72 : 1
        }}
      >
        <span aria-hidden="true" style={{ fontSize: '20px', lineHeight: 1, fontWeight: '800', color: '#4285F4' }}>G</span>
        {status === 'loading' ? 'Conectando…' : 'Continuar con Google'}
      </button>
      <p style={{ margin: '12px 4px 0', color: '#59616D', fontSize: '12px', lineHeight: 1.45, textAlign: 'center' }}>
        Así guardamos tu prueba y tu progreso de forma segura.
      </p>
      {errorMessage && (
        <p role="alert" style={{ margin: '10px 4px 0', color: '#A33950', fontSize: '12px', lineHeight: 1.45, textAlign: 'center' }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
