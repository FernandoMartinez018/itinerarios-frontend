import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'itinerarios.userName';

/**
 * Sesión simplificada para Nivel 1: solo captura el nombre de usuario que
 * se usará como `userName` en los itinerarios. La sección 33 marca la
 * propagación de JWT como "seguridad futura" y la sección 73 pide
 * explícitamente NO implementar seguridad compleja todavía.
 *
 * En Nivel 3 (sección 108, "Seguridad S2S" prioridad media) esto debe
 * reemplazarse por autenticación real contra el Gateway.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly userNameSignal = signal<string | null>(this.readStoredUserName());

  readonly userName = computed(() => this.userNameSignal());
  readonly isLoggedIn = computed(() => this.userNameSignal() !== null);

  login(userName: string): void {
    const trimmed = userName.trim();
    if (!trimmed) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, trimmed);
    this.userNameSignal.set(trimmed);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.userNameSignal.set(null);
  }

  private readStoredUserName(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }
}
