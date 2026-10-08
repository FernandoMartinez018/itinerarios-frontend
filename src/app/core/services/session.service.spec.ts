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
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('login() guarda el nombre de usuario y activa la sesión', () => {
    service.login('Juan Perez');

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.userName()).toBe('Juan Perez');
  });

  it('login() con string vacío no activa la sesión', () => {
    service.login('   ');

    expect(service.isLoggedIn()).toBeFalse();
  });

  it('logout() limpia la sesión', () => {
    service.login('Juan Perez');
    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.userName()).toBeNull();
  });
});
