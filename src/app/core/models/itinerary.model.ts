export interface Itinerary {
  id: number;
  userName: string;
  departureAirportId: string;
  arrivalAirportId: string;
  travelDate: string; // ISO yyyy-MM-dd
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

/** Espejo de ItineraryRequest del backend, usado tanto para crear como editar. */
export interface ItineraryRequest {
  userName: string;
  departureAirportId: string;
  arrivalAirportId: string;
  travelDate: string;
  durationMinutes: number;
}

/** Espejo de ErrorResponse del backend (sección 64 de la especificación maestra). */
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  correlationId: string | null;
}
