import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login">
      <section class="login__hero" aria-hidden="true">
        <svg class="login__route" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
          <path class="login__path" d="M40 330 C 180 120, 360 360, 560 80" />
          <circle cx="40" cy="330" r="7" class="login__dot" />
          <circle cx="560" cy="80" r="7" class="login__dot" />
          <g class="login__plane">
            <path d="M0 -9 L4 -2 L14 2 L14 5 L4 3 L3 9 L6 11 L6 13 L0 11.5 L-6 13 L-6 11 L-3 9 L-4 3 L-14 5 L-14 2 L-4 -2 Z" />
          </g>
        </svg>
        <div class="login__hero-copy">
          <span class="badge login__badge">Datos abiertos · API Colombia</span>
          <h2>Planea tus viajes entre aeropuertos de Colombia</h2>
          <p>Crea itinerarios, visualiza tus rutas en el mapa y recibe una notificación cada vez que planeas un viaje.</p>
        </div>
      </section>

      <section class="login__panel">
        <div class="login__card card fade-in">
          <div class="login__logo" aria-hidden="true">✈</div>
          <h1>Itinerarios Personales</h1>
          <p class="login__lead">Ingresa tu nombre para continuar.</p>

          <form (ngSubmit)="onSubmit()" class="login__form">
            <div class="field">
              <label class="field__label" for="userName">Nombre</label>
              <input id="userName" name="userName" type="text" class="input" placeholder="Ej. Ana Gómez"
                     autocomplete="name" [(ngModel)]="userNameInput" required minlength="2" />
            </div>
            <button type="submit" class="btn btn--primary login__submit" [disabled]="userNameInput.trim().length < 2">
              Entrar
            </button>
          </form>
          <p class="login__note">Autenticación de usuarios: fase posterior. Los servicios ya se protegen entre sí con OAuth2.</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .login { min-height: 100vh; display: grid; grid-template-columns: 1.1fr 1fr; }
    .login__hero {
      position: relative; overflow: hidden; background: var(--gradient-hero); color: #fff;
      display: flex; align-items: flex-end; padding: 3rem;
    }
    .login__route { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.9; }
    .login__path {
      fill: none; stroke: rgba(255, 255, 255, 0.55); stroke-width: 2.5; stroke-dasharray: 8 10;
      animation: dash 18s linear infinite;
    }
    .login__dot { fill: #fff; filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)); }
    .login__plane {
      fill: #fff; offset-path: path('M40 330 C 180 120, 360 360, 560 80'); offset-rotate: auto 90deg;
      animation: fly 6s ease-in-out infinite;
    }
    @keyframes dash { to { stroke-dashoffset: -400; } }
    @keyframes fly { from { offset-distance: 0%; } to { offset-distance: 100%; } }
    .login__hero-copy { position: relative; max-width: 460px; display: flex; flex-direction: column; gap: 0.9rem; }
    .login__hero-copy h2 { font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 800; }
    .login__hero-copy p { color: rgba(255, 255, 255, 0.85); font-size: 1.05rem; }
    .login__badge { align-self: flex-start; background: rgba(255, 255, 255, 0.18); color: #fff; }

    .login__panel { display: grid; place-items: center; padding: 2rem 1.25rem; }
    .login__card { width: min(400px, 100%); padding: 2.25rem; box-shadow: var(--shadow-lg); text-align: center; }
    .login__logo {
      width: 56px; height: 56px; margin: 0 auto 1rem; border-radius: 16px; display: grid; place-items: center;
      background: var(--gradient-hero); color: #fff; font-size: 1.6rem; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
    }
    .login__lead { color: var(--muted); margin-top: 0.4rem; }
    .login__form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.75rem; text-align: left; }
    .login__submit { width: 100%; padding-block: 0.8rem; }
    .login__note { margin-top: 1.25rem; font-size: 0.78rem; color: var(--muted); }

    @media (max-width: 860px) {
      .login { grid-template-columns: 1fr; }
      .login__hero { min-height: 240px; padding: 2rem 1.5rem; }
    }
  `]
})
export class LoginComponent {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  protected userNameInput = '';

  onSubmit(): void {
    this.sessionService.login(this.userNameInput);
    this.router.navigateByUrl('/dashboard');
  }
}
