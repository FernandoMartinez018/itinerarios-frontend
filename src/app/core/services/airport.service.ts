import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Airport } from '../models/airport.model';

@Injectable({ providedIn: 'root' })
export class AirportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/airports`;

  findAll(): Observable<Airport[]> {
    return this.http.get<Airport[]>(this.baseUrl);
  }

  findById(id: number): Observable<Airport> {
    return this.http.get<Airport>(`${this.baseUrl}/${id}`);
  }

  /** Consulta (y sincroniza si hace falta) un aeropuerto por código IATA. */
  findByIataCode(iataCode: string): Observable<Airport> {
    return this.http.get<Airport>(`${this.baseUrl}/iata/${iataCode}`);
  }
}
