/** A geographic point with the client timestamp it was captured at. */
export interface LiveLocation {
  lat: number;
  lng: number;
  /** Client epoch milliseconds when the fix was taken. */
  time: number;
}

/** A trip destination held in the live session. */
export interface LiveDestination {
  lat: number;
  lng: number;
  /** Estimated arrival, epoch milliseconds. */
  estimatedArrival: number;
}

/** One member's live state within a group session. */
export interface LiveMember {
  userId: string;
  username: string;
  /** Current socket id, or null while disconnected. */
  socketId: string | null;
  location: LiveLocation | null;
  sos: boolean;
  /** Breadcrumb trail accumulated while SOS is active. */
  path: LiveLocation[];
  destination: LiveDestination | null;
  /** Id of the active Trip row, if any. */
  tripId: string | null;
  /** Snapshotted to DB and no longer broadcast. */
  offline: boolean;
  /** Inactivity notification already sent for the current idle streak. */
  inactivityNotified: boolean;
  /** "5 minutes left" reminder already sent for the current trip. */
  tripReminderSent: boolean;
}

/** The in-memory live session for one group. */
export interface LiveGroup {
  groupId: string;
  groupName: string;
  members: LiveMember[];
}
