import { createHash, randomBytes } from 'crypto';

export function createSecretKey() {
  const plain = randomBytes(32).toString('hex');
  const hash = hashSecretKey(plain);
  return { plain, hash };
}

export function hashSecretKey(plain: string): string {
  return createHash('sha256').update(plain).digest('hex');
}
