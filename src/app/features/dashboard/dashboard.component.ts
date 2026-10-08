import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <h1>Hola, {{ sessionService.userName() }}</h1>
      <nav class="dashboard__nav">
        <a routerLink="/airports">Ver aeropuertos y mapa</a>
        <a routerLink="/itineraries">Mis itinerarios</a>
        <a routerLink="/itineraries/new">Crear itinerario</a>
      </nav>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 480px; margin: 3rem auto; text-align: center; }
    .dashboard__nav { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem; }
    .dashboard__nav a {
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      text-decoration: none;
    }
  `]
})
export class DashboardComponent {
  protected readonly sessionService = inject(SessionService);
}
