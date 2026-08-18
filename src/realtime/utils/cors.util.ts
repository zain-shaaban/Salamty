export function resolveCorsOrigins(): string[] | boolean {
  const raw = process.env.ALLOWED_ORIGINS ?? '';
  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : true;
}
