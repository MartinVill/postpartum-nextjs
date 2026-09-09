'use client';

import { useState } from 'react';
import { GoogleAuthProvider, browserLocalPersistence, createUserWithEmailAndPassword, sendEmailVerification, setPersistence, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const GoogleMark = () => <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.94v2.79h3.59c2.1-1.93 3.31-4.78 3.31-7.76Z"/><path fill="#34A853" d="M12 21.75c2.62 0 4.82-.87 6.43-2.36l-3.59-2.79c-1 .67-2.27 1.07-3.84 1.07-2.95 0-5.45-1.99-6.34-4.67H.95v2.88A9.72 9.72 0 0 0 12 21.75Z"/><path fill="#FBBC05" d="M4.66 13c-.23-.67-.36-1.39-.36-2.13s.13-1.46.36-2.13V5.86H.95a9.75 9.75 0 0 0 0 10.02L4.66 13Z"/><path fill="#EA4335" d="M12 4.07c1.71 0 3.24.59 4.45 1.74l3.34-3.34C16.81.69 14.61-.25 12 0A9.72 9.72 0 0 0 .95 5.86l3.71 2.88C5.55 6.06 8.05 4.07 12 4.07Z"/></svg>;
const EmailMark = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.4"/><path d="m4.5 7 7.5 5.7L19.5 7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const inputStyle = { width: '100%', height: '46px', boxSizing: 'border-box', border: '1px solid #DED8E1', borderRadius: '10px', background: '#FFFFFF', color: '#25212A', fontSize: '15px', padding: '0 13px', outlineColor: '#C84BE0' };

export default function TrialActivationButton({ onAuthenticated }) {
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailMode, setEmailMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const completeActivation = async (user) => {
    const idToken = await user.getIdToken();
    await onAuthenticated?.({ uid: user.uid, email: user.email || '', displayName: user.displayName || '', idToken });
  };
  const ensureAuth = () => {
    if (auth) return true;
    setErrorMessage('No pudimos preparar el acceso. Inténtalo de nuevo en unos minutos.');
    return false;
  };

  const activateWithGoogle = async () => {
    if (!ensureAuth()) return;
    setStatus('google'); setErrorMessage('');
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      await completeActivation(result.user);
      setStatus('success');
    } catch (error) {
      console.error('[AUTH] Error al continuar con Google:', error);
      const messages = { 'auth/popup-closed-by-user': 'Cerraste la ventana antes de terminar. Cuando quieras, inténtalo otra vez.', 'auth/popup-blocked': 'Tu navegador bloqueó la ventana de Google. Permite ventanas emergentes e inténtalo otra vez.', 'auth/operation-not-allowed': 'El acceso con Google aún no está habilitado. Inténtalo más tarde.' };
      setErrorMessage(messages[error.code] || 'No pudimos completar el acceso con Google. Inténtalo nuevamente.'); setStatus('idle');
    }
  };

  const activateWithEmail = async (event) => {
    event.preventDefault();
    if (!ensureAuth()) return;
    if (password.length < 8) { setErrorMessage('Usa una contraseña de al menos 8 caracteres.'); return; }
    setStatus('email'); setErrorMessage('');
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = emailMode === 'signup' ? await createUserWithEmailAndPassword(auth, email.trim(), password) : await signInWithEmailAndPassword(auth, email.trim(), password);
      if (emailMode === 'signup') {
        try { await sendEmailVerification(result.user); } catch (verificationError) { console.warn('[AUTH] Verificación pendiente:', verificationError.code || verificationError.message); }
      }
      await completeActivation(result.user);
      setStatus('success');
    } catch (error) {
      console.error('[AUTH] Error al continuar con email:', error);
      const messages = { 'auth/email-already-in-use': 'Este email ya tiene una cuenta. Elige “Ya tengo cuenta” para ingresar.', 'auth/invalid-credential': 'El email o la contraseña no coinciden.', 'auth/invalid-email': 'Revisa el email e inténtalo nuevamente.', 'auth/weak-password': 'Usa una contraseña de al menos 8 caracteres.', 'auth/operation-not-allowed': 'El acceso con email aún no está habilitado. Inténtalo más tarde.' };
      setErrorMessage(messages[error.code] || 'No pudimos continuar con ese email. Inténtalo nuevamente.'); setStatus('idle');
    }
  };

  const isIdle = status === 'idle';
  const buttonStyle = { width: '100%', minHeight: '48px', border: '1px solid #E2DCE5', borderRadius: '12px', background: '#FFFFFF', color: '#25212A', fontSize: '15px', fontWeight: '700', cursor: isIdle ? 'pointer' : 'wait', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(38,31,45,0.06)', opacity: isIdle ? 1 : 0.72 };
  return <div>
    <button type="button" onClick={activateWithGoogle} disabled={!isIdle} style={buttonStyle}><GoogleMark />{status === 'google' ? 'Conectando…' : 'Continuar con Google'}</button>
    {!showEmailForm ? <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0' }} aria-hidden="true"><span style={{ height: '1px', background: '#E8E1EA', flex: 1 }} /><span style={{ color: '#847B89', fontSize: '12px', fontWeight: '600' }}>o</span><span style={{ height: '1px', background: '#E8E1EA', flex: 1 }} /></div>
      <button type="button" onClick={() => { setShowEmailForm(true); setErrorMessage(''); }} disabled={!isIdle} style={buttonStyle}><EmailMark />Continuar con email</button>
    </> : <form onSubmit={activateWithEmail} style={{ marginTop: '16px', textAlign: 'left' }}>
      <p style={{ margin: '0 0 12px', color: '#302A34', fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>{emailMode === 'signup' ? 'Crea tu cuenta' : 'Ingresa a tu cuenta'}</p>
      <label style={{ display: 'block', color: '#4C4651', fontSize: '12px', fontWeight: '650', margin: '0 0 6px' }} htmlFor="trial-email">Email</label>
      <input id="trial-email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required style={inputStyle} />
      <label style={{ display: 'block', color: '#4C4651', fontSize: '12px', fontWeight: '650', margin: '12px 0 6px' }} htmlFor="trial-password">Contraseña</label>
      <input id="trial-password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'} minLength="8" required style={inputStyle} />
      <button type="submit" disabled={!isIdle} style={{ width: '100%', minHeight: '46px', marginTop: '14px', border: 'none', borderRadius: '11px', background: '#D946EF', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', cursor: isIdle ? 'pointer' : 'wait', opacity: isIdle ? 1 : 0.72 }}>{status === 'email' ? 'Continuando…' : emailMode === 'signup' ? 'Crear cuenta y activar prueba' : 'Ingresar y activar prueba'}</button>
      <button type="button" onClick={() => { setEmailMode(emailMode === 'signup' ? 'signin' : 'signup'); setErrorMessage(''); }} style={{ width: '100%', marginTop: '12px', padding: '4px', border: 'none', background: 'transparent', color: '#8E3AB1', fontSize: '13px', fontWeight: '650', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>{emailMode === 'signup' ? 'Ya tengo cuenta' : 'Crear una cuenta'}</button>
    </form>}
    <p style={{ margin: '12px 4px 0', color: '#59616D', fontSize: '12px', lineHeight: 1.45, textAlign: 'center' }}>Así guardamos tu prueba y tu progreso de forma segura.</p>
    {errorMessage && <p role="alert" style={{ margin: '10px 4px 0', color: '#A33950', fontSize: '12px', lineHeight: 1.45, textAlign: 'center' }}>{errorMessage}</p>}
  </div>;
}
