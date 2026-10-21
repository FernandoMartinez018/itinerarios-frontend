import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

/** Barra de navegación global: marca, secciones y usuario con cierre de sesión. */
@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="nav">
      <div class="nav__inner">
        <a routerLink="/dashboard" class="nav__brand" aria-label="Inicio">
          <span class="nav__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
            </svg>
          </span>
          <span class="nav__brand-text">Itinerarios</span>
        </a>

        <nav class="nav__links" aria-label="Principal">
          <a routerLink="/dashboard" routerLinkActive="is-active">Inicio</a>
          <a routerLink="/airports" routerLinkActive="is-active">Aeropuertos</a>
          <a routerLink="/itineraries" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">Mis viajes</a>
        </nav>

        <div class="nav__user">
          <a routerLink="/itineraries/new" class="btn btn--accent btn--sm nav__cta">+ Nuevo viaje</a>
          <span class="nav__avatar" [title]="session.userName() ?? ''">{{ initials() }}</span>
          <button type="button" class="btn btn--ghost btn--sm" (click)="logout()">Salir</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .nav {
      position: sticky; top: 0; z-index: 20;
      background: color-mix(in srgb, var(--surface) 82%, transparent);
      backdrop-filter: saturate(160%) blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .nav__inner {
      max-width: 1120px; margin: 0 auto; padding: 0.7rem 1.25rem;
      display: flex; align-items: center; gap: 1.5rem;
    }
    .nav__brand { display: inline-flex; align-items: center; gap: 0.6rem; color: var(--text); font-weight: 800; }
    .nav__logo {
      display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px;
      background: var(--gradient-hero); color: #fff; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    }
    .nav__logo svg { transform: rotate(45deg); }
    .nav__links { display: flex; gap: 0.25rem; flex: 1; }
    .nav__links a {
      padding: 0.45rem 0.85rem; border-radius: 999px; color: var(--muted); font-weight: 600; font-size: 0.93rem;
    }
    .nav__links a:hover { color: var(--text); background: var(--surface-2); }
    .nav__links a.is-active { color: var(--primary-strong); background: var(--primary-soft); }
    .nav__user { display: flex; align-items: center; gap: 0.6rem; }
    .nav__avatar {
      display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%;
      background: var(--gradient-accent); color: #fff; font-weight: 800; font-size: 0.85rem;
    }
    @media (max-width: 720px) {
      .nav__inner { flex-wrap: wrap; gap: 0.75rem; }
      .nav__links { order: 3; flex-basis: 100%; overflow-x: auto; }
      .nav__brand-text, .nav__cta { display: none; }
      .nav__user { margin-left: auto; }
    }
  `]
})
export class NavBarComponent {
  protected readonly session = inject(SessionService);

  protected readonly initials = computed(() =>
    (this.session.userName() ?? '?')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('')
  );

  protected logout(): void {
    this.session.logout();
  }
}
