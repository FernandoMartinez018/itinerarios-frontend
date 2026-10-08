import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Itinerary } from '../../core/models/itinerary.model';
import { ItineraryService } from '../../core/services/itinerary.service';

@Component({
  selector: 'app-itinerary-list',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="itineraries">
      <header class="itineraries__header">
        <h1>Mis itinerarios</h1>
        <a routerLink="/itineraries/new">+ Nuevo itinerario</a>
      </header>

      @if (loading()) {
        <p>Cargando itinerarios...</p>
      } @else if (itineraries().length === 0) {
        <p>Todavía no tienes itinerarios. Crea el primero.</p>
      } @else {
        <table class="itineraries__table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Salida</th>
              <th>Llegada</th>
              <th>Fecha</th>
              <th>Duración (min)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (itinerary of itineraries(); track itinerary.id) {
              <tr>
                <td>{{ itinerary.userName }}</td>
                <td>{{ itinerary.departureAirportId }}</td>
                <td>{{ itinerary.arrivalAirportId }}</td>
                <td>{{ itinerary.travelDate }}</td>
                <td>{{ itinerary.durationMinutes }}</td>
                <td class="itineraries__actions">
                  <a [routerLink]="['/itineraries', itinerary.id]">Ver</a>
                  <a [routerLink]="['/itineraries', itinerary.id, 'edit']">Editar</a>
                  <button type="button" (click)="onDelete(itinerary.id)">Eliminar</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .itineraries { max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
    .itineraries__header { display: flex; justify-content: space-between; align-items: center; }
    .itineraries__table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
    .itineraries__table th, .itineraries__table td {
      border: 1px solid #ddd;
      padding: 0.5rem;
      text-align: left;
    }
    .itineraries__actions { display: flex; gap: 0.5rem; }
  `]
})
export class ItineraryListComponent implements OnInit {
  private readonly itineraryService = inject(ItineraryService);

  protected readonly itineraries = signal<Itinerary[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.loadItineraries();
  }

  onDelete(id: number): void {
    if (!confirm('¿Eliminar este itinerario?')) {
      return;
    }
    this.itineraryService.delete(id).subscribe({
      next: () => this.loadItineraries()
    });
  }

  private loadItineraries(): void {
    this.loading.set(true);
    this.itineraryService.findAll().subscribe({
      next: (itineraries) => {
        this.itineraries.set(itineraries);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
