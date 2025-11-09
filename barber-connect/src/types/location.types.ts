export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface LocationPermission {
  granted: boolean;
  canAskAgain: boolean;
}

export interface DistanceFilter {
  miles: number;
  kilometers: number;
}

export const DISTANCE_OPTIONS = [
  { label: '5 miles', value: 5, km: 8 },
  { label: '10 miles', value: 10, km: 16 },
  { label: '25 miles', value: 25, km: 40 },
  { label: '50 miles', value: 50, km: 80 },
  { label: '100 miles', value: 100, km: 160 },
  { label: 'Any distance', value: 999, km: 9999 },
];
