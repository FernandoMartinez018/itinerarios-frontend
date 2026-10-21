import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CurrentUser {
  name: string;
  username: string;
  email: string | null;
}

/**
 * Sesión del usuario autenticado con Keycloak a través del Gateway (patrón BFF, ADR-018).
 * El navegador nunca ve tokens: el Gateway hace el login OIDC y deja una cookie de sesión;
 * aquí solo se consulta quién es el usuario (/auth/me) y se navega a login/logout del Gateway.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly user = signal<CurrentUser | null>(null);

  readonly currentUser = this.user.asReadonly();
  readonly userName = computed(() => this.user()?.name ?? null);
  readonly isLoggedIn = computed(() => this.user() !== null);

  /** Se ejecuta al arrancar la app: 401 del Gateway significa que no hay sesión. */
  async load(): Promise<void> {
    try {
      this.user.set(await firstValueFrom(this.http.get<CurrentUser>(`${environment.gatewayUrl}/auth/me`)));
    } catch {
      this.user.set(null);
    }
  }

  /** Navegación completa: el Gateway redirige a la pantalla de login de Keycloak. */
  login(): void {
    window.location.assign(`${environment.gatewayUrl}/oauth2/authorization/keycloak`);
  }

  /** POST con el token CSRF (cookie XSRF-TOKEN); el Gateway cierra también la sesión de Keycloak. */
  logout(): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${environment.gatewayUrl}/logout`;
    const csrf = document.createElement('input');
    csrf.type = 'hidden';
    csrf.name = '_csrf';
    csrf.value = readCookie('XSRF-TOKEN') ?? '';
    form.appendChild(csrf);
    document.body.appendChild(form);
    form.submit();
  }

  /** La sesión expiró en el Gateway (401 en una llamada a la API). */
  clear(): void {
    this.user.set(null);
  }
}

function readCookie(name: string): string | null {
  const entry = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.substring(name.length + 1)) : null;
}
