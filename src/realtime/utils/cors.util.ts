/**
 * Resolve allowed CORS origins for the Socket.IO gateways from the same
 * ALLOWED_ORIGINS env var the HTTP server uses. Returns `true` (reflect the
 * request origin) when none are configured — native mobile clients send no
 * Origin header, so this keeps them working in every environment.
 */
export function resolveCorsOrigins(): string[] | boolean {
  const raw = process.env.ALLOWED_ORIGINS ?? '';
  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : true;
}
