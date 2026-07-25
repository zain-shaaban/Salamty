/** Timing constants for live tracking (all in milliseconds). */

/** How often the background scheduler sweeps live groups. */
export const SCHEDULER_INTERVAL_MS = 60_000;

/** Warn the traveller this long before their trip ETA elapses. */
export const TRIP_REMINDER_LEAD_MS = 5 * 60 * 1000;

/** No location for this long (and disconnected) → notify the group once. */
export const INACTIVITY_NOTIFY_MS = 30 * 60 * 1000;

/** No location for this long (and disconnected) → snapshot to DB and mark offline. */
export const OFFLINE_SNAPSHOT_MS = 45 * 60 * 1000;
