export const RealtimeEvent = {
  SESSION_INIT: 'session:init',
  LOCATION_UPDATE: 'location:update',
  SOS_STARTED: 'sos:started',
  SOS_ENDED: 'sos:ended',
  TRIP_STARTED: 'trip:started',
  TRIP_TIME_CHANGED: 'trip:time-changed',
  TRIP_ENDED: 'trip:ended',

  LOCATION_SEND: 'location:send',
  SOS_START: 'sos:start',
  SOS_END: 'sos:end',
  TRIP_START: 'trip:start',
  TRIP_EXTEND: 'trip:extend',
  TRIP_END: 'trip:end',
} as const;

export const GroupEvent = {
  GROUP_CHANGED: 'group:changed',
} as const;
