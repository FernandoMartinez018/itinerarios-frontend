import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorBannerComponent } from './shared/error-banner/error-banner.component';
import { NavBarComponent } from './shared/nav-bar/nav-bar.component';
import { SessionService } from './core/services/session.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorBannerComponent, NavBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell">
      @if (session.isLoggedIn()) {
        <app-nav-bar />
      }
      <app-error-banner />
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell { min-height: 100vh; display: flex; flex-direction: column; }
    main { flex: 1; }
  `]
})
export class App {
  protected readonly session = inject(SessionService);
}
