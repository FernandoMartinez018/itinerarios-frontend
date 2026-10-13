import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { ItineraryRequest } from '../models/itinerary.model';
import { ItineraryService } from './itinerary.service';

/**
 * Verifica que el frontend consuma exclusivamente el Gateway (secciones 34 y 103)
 * con los verbos y rutas del contrato REST de api-design.md.
 */
describe('ItineraryService', () => {
  let service: ItineraryService;
  let http: HttpTestingController;
  const baseUrl = `${environment.gatewayUrl}/api/itineraries`;

  const request: ItineraryRequest = {
    userName: 'Juan Perez',
    departureAirportId: 'BOG',
    arrivalAirportId: 'MDE',
    travelDate: '2026-12-01',
    durationMinutes: 60
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ItineraryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('findAll() hace GET al Gateway', () => {
    service.findAll().subscribe((items) => expect(items.length).toBe(0));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('create() hace POST con el ItineraryRequest', () => {
    service.create(request).subscribe();
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ id: 1, ...request, createdAt: '', updatedAt: '' });
  });

  it('update() hace PUT sobre /{id}', () => {
    service.update(7, request).subscribe();
    const req = http.expectOne(`${baseUrl}/7`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 7, ...request, createdAt: '', updatedAt: '' });
  });

  it('delete() hace DELETE sobre /{id}', () => {
    service.delete(7).subscribe();
    const req = http.expectOne(`${baseUrl}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('nunca apunta a API Colombia', () => {
    expect(baseUrl).not.toContain('api-colombia');
  });
});
