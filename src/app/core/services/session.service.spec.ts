import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;
  let http: HttpTestingController;
  const meUrl = `${environment.gatewayUrl}/auth/me`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SessionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('inicia sin sesión activa', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.userName()).toBeNull();
  });

  it('load() toma el usuario de Keycloak que expone el Gateway', async () => {
    const loading = service.load();
    http.expectOne(meUrl).flush({ name: 'Ana Gomez', username: 'agomez', email: 'f@example.test' });
    await loading;

    expect(service.isLoggedIn()).toBe(true);
    expect(service.userName()).toBe('Ana Gomez');
  });

  it('load() con 401 (sin sesión en el Gateway) deja la sesión vacía', async () => {
    const loading = service.load();
    http.expectOne(meUrl).flush(null, { status: 401, statusText: 'Unauthorized' });
    await loading;

    expect(service.isLoggedIn()).toBe(false);
  });

  it('clear() limpia la sesión', async () => {
    const loading = service.load();
    http.expectOne(meUrl).flush({ name: 'Ana Gomez', username: 'agomez', email: null });
    await loading;

    service.clear();

    expect(service.isLoggedIn()).toBe(false);
  });
});
