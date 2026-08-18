import type {
  ExtendTripPayload,
  LocationPayload,
  StartTripPayload,
} from '../interfaces/socket-payloads.interface.js';

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isValidLat = (value: unknown): value is number =>
  isFiniteNumber(value) && value >= -90 && value <= 90;

const isValidLng = (value: unknown): value is number =>
  isFiniteNumber(value) && value >= -180 && value <= 180;

export function parseLocation(raw: unknown): LocationPayload {
  const value = raw as Partial<LocationPayload> | null | undefined;
  if (
    !value ||
    !isValidLat(value.lat) ||
    !isValidLng(value.lng) ||
    !isFiniteNumber(value.time) ||
    value.time <= 0
  ) {
    throw new Error('Invalid location payload');
  }
  return { lat: value.lat, lng: value.lng, time: value.time };
}

export function parseOptionalLocation(raw: unknown): LocationPayload | null {
  if (raw === undefined || raw === null || raw === '') return null;
  const parsed = typeof raw === 'string' ? safeJson(raw) : raw;
  if (parsed === null) return null;
  try {
    return parseLocation(parsed);
  } catch {
    return null;
  }
}

export function parseStartTrip(raw: unknown): StartTripPayload {
  const value = raw as Partial<StartTripPayload> | null | undefined;
  if (
    !value ||
    !isValidLat(value.lat) ||
    !isValidLng(value.lng) ||
    !isFiniteNumber(value.estimatedArrival) ||
    value.estimatedArrival <= 0
  ) {
    throw new Error('Invalid trip payload');
  }
  return {
    lat: value.lat,
    lng: value.lng,
    estimatedArrival: value.estimatedArrival,
  };
}

export function parseExtendTrip(raw: unknown): ExtendTripPayload {
  const value = raw as Partial<ExtendTripPayload> | null | undefined;
  if (
    !value ||
    typeof value.increase !== 'boolean' ||
    !isFiniteNumber(value.amount) ||
    value.amount <= 0
  ) {
    throw new Error('Invalid change-time payload');
  }
  return { increase: value.increase, amount: value.amount };
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
