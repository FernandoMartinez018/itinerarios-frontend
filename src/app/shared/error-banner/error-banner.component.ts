import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (errorService.currentError(); as err) {
      <div class="error-banner" role="alert">
        <span class="error-banner__message">{{ err.message }}</span>
        @if (err.correlationId) {
          <span class="error-banner__correlation">ref: {{ err.correlationId }}</span>
        }
        <button type="button" class="error-banner__close" (click)="errorService.clear()" aria-label="Cerrar">
          &times;
        </button>
      </div>
    }
  `,
  styles: [`
    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #fdecea;
      color: #611a15;
      border: 1px solid #f5c2c0;
      border-radius: 6px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
    }
    .error-banner__message { flex: 1; }
    .error-banner__correlation { font-size: 0.75rem; opacity: 0.7; }
    .error-banner__close {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: inherit;
    }
  `]
})
export class ErrorBannerComponent {
  protected readonly errorService = inject(ErrorService);
}
