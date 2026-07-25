/**
 * Inbound socket message payloads. These arrive over the wire untyped, so
 * every handler validates them via the guards in `payload.util.ts` before use.
 */

export interface LocationPayload {
  lat: number;
  lng: number;
  time: number;
}

export interface StartTripPayload {
  lat: number;
  lng: number;
  /** Estimated arrival, epoch milliseconds. */
  estimatedArrival: number;
}

export interface ExtendTripPayload {
  /** true → push the ETA later, false → pull it earlier. */
  increase: boolean;
  /** Amount to shift the ETA by, in milliseconds (> 0). */
  amount: number;
}

/** Standard acknowledgement returned to the emitting client. */
export interface Ack {
  status: boolean;
  message?: string;
}
