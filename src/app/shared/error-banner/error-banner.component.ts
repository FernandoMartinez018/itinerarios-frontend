import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ErrorService } from '../../core/services/error.service';

/** Aviso de error flotante (toast). Muestra el Correlation ID para rastrear el fallo (seccion 63). */
@Component({
  selector: 'app-error-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (errorService.currentError(); as err) {
      <div class="error-banner" role="alert">
        <span class="error-banner__icon" aria-hidden="true">!</span>
        <div class="error-banner__body">
          <strong>Algo salió mal</strong>
          <span class="error-banner__message">{{ err.message }}</span>
          @if (err.correlationId) {
            <span class="error-banner__correlation">ref: {{ err.correlationId }}</span>
          }
        </div>
        <button type="button" class="error-banner__close" (click)="errorService.clear()" aria-label="Cerrar">
          &times;
        </button>
      </div>
    }
  `,
  styles: [`
    .error-banner {
      position: fixed; top: 4.75rem; right: 1.25rem; z-index: 50; max-width: min(420px, calc(100vw - 2.5rem));
      display: flex; align-items: flex-start; gap: 0.75rem;
      background: var(--surface); color: var(--text);
      border: 1px solid var(--border); border-left: 4px solid var(--danger);
      border-radius: var(--radius); box-shadow: var(--shadow-lg);
      padding: 0.9rem 1rem; animation: slideIn 0.25s ease both;
    }
    .error-banner__icon {
      flex: none; display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%;
      background: var(--danger-soft); color: var(--danger); font-weight: 900;
    }
    .error-banner__body { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.92rem; }
    .error-banner__message { color: var(--muted); }
    .error-banner__correlation { font-size: 0.72rem; color: var(--muted); font-family: ui-monospace, monospace; }
    .error-banner__close {
      background: none; border: none; font-size: 1.3rem; line-height: 1; cursor: pointer; color: var(--muted);
    }
    @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
  `]
})
export class ErrorBannerComponent {
  protected readonly errorService = inject(ErrorService);
}
