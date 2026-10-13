import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('inicia sin sesión activa', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('login() guarda el nombre de usuario y activa la sesión', () => {
    service.login('Juan Perez');

    expect(service.isLoggedIn()).toBe(true);
    expect(service.userName()).toBe('Juan Perez');
  });

  it('login() con string vacío no activa la sesión', () => {
    service.login('   ');

    expect(service.isLoggedIn()).toBe(false);
  });

  it('logout() limpia la sesión', () => {
    service.login('Juan Perez');
    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.userName()).toBeNull();
  });
});
