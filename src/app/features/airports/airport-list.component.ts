import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { AirportMapComponent } from './airport-map.component';
import { Airport } from '../../core/models/airport.model';
import { AirportService } from '../../core/services/airport.service';

@Component({
  selector: 'app-airport-list',
  standalone: true,
  imports: [AirportMapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="airports">
      <h1>Aeropuertos</h1>

      @if (loading()) {
        <p>Cargando aeropuertos...</p>
      } @else if (airports().length === 0) {
        <p>Aún no hay aeropuertos sincronizados. Crea un itinerario con un código IATA válido para sincronizar el primero.</p>
      } @else {
        <app-airport-map [airports]="airports()" />

        <table class="airports__table">
          <thead>
            <tr>
              <th>IATA</th>
              <th>Nombre</th>
              <th>Ciudad</th>
              <th>Departamento</th>
            </tr>
          </thead>
          <tbody>
            @for (airport of airports(); track airport.id) {
              <tr>
                <td>{{ airport.iataCode }}</td>
                <td>{{ airport.name }}</td>
                <td>{{ airport.city }}</td>
                <td>{{ airport.department }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .airports { max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
    .airports__table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
    .airports__table th, .airports__table td {
      border: 1px solid #ddd;
      padding: 0.5rem;
      text-align: left;
    }
  `]
})
export class AirportListComponent implements OnInit {
  private readonly airportService = inject(AirportService);

  protected readonly airports = signal<Airport[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.airportService.findAll().subscribe({
      next: (airports) => {
        this.airports.set(airports);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
