import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Itinerary, ItineraryRequest } from '../models/itinerary.model';

@Injectable({ providedIn: 'root' })
export class ItineraryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/itineraries`;

  findAll(): Observable<Itinerary[]> {
    return this.http.get<Itinerary[]>(this.baseUrl);
  }

  findById(id: number): Observable<Itinerary> {
    return this.http.get<Itinerary>(`${this.baseUrl}/${id}`);
  }

  create(request: ItineraryRequest): Observable<Itinerary> {
    return this.http.post<Itinerary>(this.baseUrl, request);
  }

  update(id: number, request: ItineraryRequest): Observable<Itinerary> {
    return this.http.put<Itinerary>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
