export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const packageName = process.env.TWA_ANDROID_PACKAGE_NAME;
  const fingerprints = process.env.TWA_SHA256_CERT_FINGERPRINTS
    ?.split(',').map(value => value.trim()).filter(Boolean);
  if (!packageName || !fingerprints?.length) {
    return Response.json({ error: 'TWA asset links not configured' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  return Response.json([{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: packageName, sha256_cert_fingerprints: fingerprints }
  }], { headers: { 'Cache-Control': 'public, max-age=300' } });
}
