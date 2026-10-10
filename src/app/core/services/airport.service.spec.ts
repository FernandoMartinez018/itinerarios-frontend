import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AirportService } from './airport.service';

describe('AirportService', () => {
  let service: AirportService;
  let http: HttpTestingController;
  const baseUrl = `${environment.gatewayUrl}/api/airports`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AirportService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('findByIataCode() consulta el Gateway, no la API externa', () => {
    service.findByIataCode('BOG').subscribe();
    const req = http.expectOne(`${baseUrl}/iata/BOG`);
    expect(req.request.method).toBe('GET');
    expect(req.request.url.startsWith(environment.gatewayUrl)).toBe(true);
    req.flush({});
  });
});
