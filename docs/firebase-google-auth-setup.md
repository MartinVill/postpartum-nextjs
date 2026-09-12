# Acceso con Google: configuración requerida antes de publicar

El cliente web usa Firebase Authentication. Para que una persona pueda entrar con Google, estas variables deben estar cargadas en Vercel para los entornos **Production**, **Preview** y **Development**:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Los seis valores se encuentran en Firebase Console → Project settings → General → Your apps → Web app → SDK setup and configuration. Son identificadores públicos del cliente; no incluir aquí la clave privada de Firebase Admin.

Además, en Firebase Console → Authentication:

1. Activar **Google** como proveedor de acceso y definir el email de soporte.
2. Añadir `postpartum-nextjs.vercel.app` en **Authorized domains**.
3. Añadir el dominio definitivo de producción cuando exista.

La app usa `signInWithRedirect` en móviles y `signInWithPopup` en escritorio. Firebase recomienda la redirección para móviles. Antes de publicar, probar ambos flujos en Android y en un navegador de escritorio con una cuenta de prueba.

Si el dominio de autenticación de Firebase es distinto del dominio de la app, seguir las prácticas de Firebase para navegadores que bloquean almacenamiento de terceros y configurar el proxy de `__/auth/` o un dominio de autenticación propio. Esto evita que la redirección falle en navegadores con protección de privacidad estricta.
