import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorBannerComponent } from './shared/error-banner/error-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ErrorBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell">
      <app-error-banner />
      <router-outlet />
    </div>
  `,
  styles: [`
    .app-shell { min-height: 100vh; font-family: system-ui, sans-serif; }
  `]
})
export class App {}
