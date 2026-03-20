// import { Preferences } from "@capacitor/preferences";

// Utility to detect if we are in Capacitor
// const isCapacitor = typeof window !== "undefined" && window?.Capacitor;

// const storage = isCapacitor
//   ? {
//       getItem: async (name: string) => {
//         const { value } = await Preferences.get({ key: name });
//         return value ? JSON.parse(value) : null;
//       },
//       setItem: async (name: string, value: any) =>
//         Preferences.set({ key: name, value: JSON.stringify(value) }),
//       removeItem: async (name: string) => Preferences.remove({ key: name }),
//     }
//   : {
//       getItem: (name: string) => {
//         const item = localStorage.getItem(name);
//         return item ? JSON.parse(item) : null;
//       },
//       setItem: (name: string, value: any) =>
//         localStorage.setItem(name, JSON.stringify(value)),
//       removeItem: (name: string) => localStorage.removeItem(name),
//     };
//

export type AnnouncementType = "join" | "leave" | "success" | "info";

export interface Announcement {
  id: string;
  message: string;
  type: AnnouncementType;
  createdAt: number;
}

export interface AnnouncerStore {
  announcements: Announcement[];
  lastActivity: number;

  addAnnouncement: (msg: string, type?: AnnouncementType) => void;
  removeAnnouncement: (id: string) => void;
  clearAnnouncements: () => void;
  resetActivity: () => void;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Participant {
  userId: string;
  role: string;
  joinedAt: string;
}
export interface Settings {
  maxRiders: number;
  visibility: "public" | "private";
}

export interface RideState {
  _id: string | null;
  rideCode: string | null;
  status: "not started" | "started" | "ended" | null;
  createdAt: string | null;
  createdBy: string | null;
  endedAt?: string | null;
  startedAt?: string | null;
  participants: Participant[] | null;
  settings: Settings | null;
  start: GeoLocation | null;
  destination: GeoLocation | null;
  startName: string | null;
  destinationName: string | null;
  tripName: string | null;
}

export interface RouteData {
  polyline: GeoLocation[];
  distance: number;
  duration: string;
}

export interface DashboardState {
  formIndex: number;
  fitTrigger: number;
  toLocation: GeoLocation | null;
  fromLocation: GeoLocation | null;
  userLocation: GeoLocation | null;
  toLocationName: string | null;
  fromLocationName: string | null;
  maxRiders: number;
  visibility: "public" | "private";
  tripName: string | null;
  routeData: RouteData | null;
}

export interface UserState {
  id: string | null;
  name: string | null;
  email?: string | null;
  emailVerified?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  isActive?: boolean | null;
  currentRide?: string | null;
  image?: string | null;
  location?: GeoLocation | null;
  pushSubscription?: PushSubscription | null;
}

export interface SocketState {
  isConnected: boolean;
  inRoom: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  joinRide: (payload: { rideCode: string }) => void;
  sendLocation: (payload: { rideCode: string; location: GeoLocation }) => void;
  sendSignal: (payload: {
    rideCode: string;
    signalType: string;
    location: GeoLocation;
  }) => void;
  leaveRide: (payload: { rideCode: string }) => void;
  endRide: (payload: { rideCode: string }) => void;
  onRideEnded: (cb: (() => void) | null) => void;
}

export const storage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) =>
    localStorage.setItem(name, JSON.stringify(value)),
  removeItem: (name: string) => localStorage.removeItem(name),
};

export interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: UserState | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  setUser: (user: UserState) => void;
  loginWithGoogle: (redirect: string) => Promise<void>;
  logout: () => void;
}

export interface RidesStore {
  rides: RideState[];
  addRide: (ride: RideState) => void;
  removeRide: (id: string) => void;
  setRides: (rides: RideState[]) => void;
  replaceRide: (ride: RideState) => void;
  clearRides: () => void;
}

export interface OtherUsersStore {
  users: Record<string, UserState>; // key = userId
  addUser: (user: UserState) => void;
  addUsers: (users: UserState[]) => void;
  setUserLocation: (userId: string, location: GeoLocation | null) => void;
  setUsersLocation: (userLocations: Record<string, GeoLocation>) => void;
  getUserById: (id: string) => UserState | undefined;
  fetchUsersByIds: (ids: string[]) => Promise<void>;
  clearUsersLocations: () => void;
  clearUsers: () => void;
}
