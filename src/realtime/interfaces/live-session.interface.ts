export interface LiveLocation {
  lat: number;
  lng: number;
  time: number;
}

export interface LiveDestination {
  lat: number;
  lng: number;
  estimatedArrival: number;
}

export interface LiveMember {
  userId: string;
  username: string;
  socketId: string | null;
  location: LiveLocation | null;
  sos: boolean;
  path: LiveLocation[];
  destination: LiveDestination | null;
  tripId: string | null;
  offline: boolean;
  inactivityNotified: boolean;
  tripReminderSent: boolean;
}

export interface LiveGroup {
  groupId: string;
  groupName: string;
  members: LiveMember[];
}
