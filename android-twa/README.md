# Postpartum Android TWA

Trusted Web Activity wrapper for `https://postpartum-nextjs.vercel.app`.

- Package ID: `com.postpartum.app`
- Google Play Billing: enabled
- Minimum Android API: 23 (Android 6.0), required by the billing helper

## Release build

From this directory, run Bubblewrap with a 64-bit JDK 17 configured in `JAVA_HOME`:

```powershell
bubblewrap build
```

The Android signing key is intentionally untracked at `android.keystore`. Back it up securely; it is the upload key for future Play Console releases.

## Digital Asset Links

After the first AAB upload, copy the **App signing key certificate SHA-256** shown by Google Play Console into Vercel as `TWA_SHA256_CERT_FINGERPRINTS`. The live `/.well-known/assetlinks.json` route will then authorize the installed TWA for the production domain.
