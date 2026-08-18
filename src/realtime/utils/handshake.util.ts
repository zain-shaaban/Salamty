import type { Socket } from 'socket.io';

export function getHandshakeToken(client: Socket): string | null {
  const authToken = (client.handshake.auth as { token?: unknown } | undefined)
    ?.token;
  if (typeof authToken === 'string' && authToken) return authToken;

  const query = client.handshake.query;
  const fromQuery = query.authToken ?? query.token;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;

  return null;
}

export function getHandshakeGroupId(client: Socket): string | null {
  const groupId =
    client.handshake.query.groupId ?? client.handshake.query.groupID;
  return typeof groupId === 'string' && groupId ? groupId : null;
}

export function getHandshakeLocation(client: Socket): unknown {
  return client.handshake.query.location;
}
