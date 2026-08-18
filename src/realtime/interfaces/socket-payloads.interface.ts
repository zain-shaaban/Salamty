
export interface LocationPayload {
  lat: number;
  lng: number;
  time: number;
}

export interface StartTripPayload {
  lat: number;
  lng: number;
  estimatedArrival: number;
}

export interface ExtendTripPayload {
  increase: boolean;
  amount: number;
}

export interface Ack {
  status: boolean;
  message?: string;
}
