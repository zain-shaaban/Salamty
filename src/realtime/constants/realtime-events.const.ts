/** Socket.IO event names for the live tracking gateway (default namespace). */
export const RealtimeEvent = {
  // Server → client
  SESSION_INIT: 'session:init',
  LOCATION_UPDATE: 'location:update',
  SOS_STARTED: 'sos:started',
  SOS_ENDED: 'sos:ended',
  TRIP_STARTED: 'trip:started',
  TRIP_TIME_CHANGED: 'trip:time-changed',
  TRIP_ENDED: 'trip:ended',

  // Client → server (@SubscribeMessage)
  LOCATION_SEND: 'location:send',
  SOS_START: 'sos:start',
  SOS_END: 'sos:end',
  TRIP_START: 'trip:start',
  TRIP_EXTEND: 'trip:extend',
  TRIP_END: 'trip:end',
} as const;

/** Event emitted on the `groups` namespace when a user's membership changes. */
export const GroupEvent = {
  GROUP_CHANGED: 'group:changed',
} as const;
