export interface Airport {
  id: number;
  externalId: string;
  iataCode: string | null;
  icaoCode: string | null;
  name: string;
  city: string;
  department: string | null;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
}
