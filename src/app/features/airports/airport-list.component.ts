import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AirportMapComponent, MapRoute } from './airport-map.component';
import { Airport } from '../../core/models/airport.model';
import { Itinerary } from '../../core/models/itinerary.model';
import { AirportService } from '../../core/services/airport.service';
import { ItineraryService } from '../../core/services/itinerary.service';

@Component({
  selector: 'app-airport-list',
  imports: [AirportMapComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page__header">
        <div>
          <h1>Aeropuertos</h1>
          <p class="page__subtitle">Aeropuertos sincronizados desde API Colombia y las rutas de tus itinerarios.</p>
        </div>
        @if (!loading() && airports().length > 0) {
          <div class="legend">
            <span class="legend__item"><span class="legend__dot"></span>{{ airports().length }} aeropuertos</span>
            <span class="legend__item"><span class="legend__line"></span>{{ routes().length }} rutas</span>
          </div>
        }
      </header>

      @if (loading()) {
        <div class="card skeleton map-skeleton"></div>
      } @else if (airports().length === 0) {
        <div class="card empty-state">
          <div class="empty-state__icon">🛬</div>
          <h2>Aún no hay aeropuertos sincronizados</h2>
          <p>Se sincronizan al crear un itinerario con un código IATA válido.</p>
          <a routerLink="/itineraries/new" class="btn btn--primary empty-cta">Crear el primero</a>
        </div>
      } @else {
        <div class="split">
        <section class="card map-card fade-in">
          <app-airport-map [airports]="airports()" [routes]="routes()" />
        </section>

        <section class="card list-card fade-in">
          <div class="list-card__toolbar">
            <h2>Listado</h2>
            <label class="sr-only" for="airportSearch">Buscar aeropuerto</label>
            <input id="airportSearch" class="input search" type="search" placeholder="Buscar por código, nombre o ciudad…"
                   [value]="query()" (input)="query.set($any($event.target).value)" />
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>IATA</th>
                  <th>Nombre</th>
                  <th>Ciudad</th>
                  <th>Departamento</th>
                </tr>
              </thead>
              <tbody>
                @for (airport of filtered(); track airport.id) {
                  <tr>
                    <td><span class="badge">{{ airport.iataCode ?? '—' }}</span></td>
                    <td><strong>{{ airport.name }}</strong></td>
                    <td>{{ airport.city }}</td>
                    <td class="muted">{{ airport.department }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="muted no-results">Ningún aeropuerto coincide con “{{ query() }}”.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .legend { display: flex; gap: 1rem; color: var(--muted); font-size: 0.9rem; }
    .legend__item { display: inline-flex; align-items: center; gap: 0.45rem; }
    .legend__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 0 2px #fff; }
    .legend__line { width: 22px; height: 3px; border-radius: 2px; background: var(--accent); }
    .split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 1.25rem; align-items: start; }
    .map-card { overflow: hidden; padding: 0.5rem; position: sticky; top: 5rem; }
    .map-skeleton { height: 520px; }
    .list-card { overflow: hidden; display: flex; flex-direction: column; max-height: 540px; }
    .list-card .table-wrap { overflow-y: auto; }
    .list-card thead th { position: sticky; top: 0; z-index: 1; }
    @media (max-width: 900px) {
      .split { grid-template-columns: 1fr; }
      .map-card { position: static; }
      .list-card { max-height: none; }
    }
    .list-card__toolbar {
      display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; padding: 1rem 1.25rem;
    }
    .search { max-width: 260px; }
    .muted { color: var(--muted); }
    .no-results { text-align: center; padding: 2rem; }
    .empty-cta { margin-top: 1rem; }
  `]
})
export class AirportListComponent implements OnInit {
  private readonly airportService = inject(AirportService);
  private readonly itineraryService = inject(ItineraryService);

  protected readonly airports = signal<Airport[]>([]);
  private readonly itineraries = signal<Itinerary[]>([]);
  protected readonly loading = signal(true);
  protected readonly query = signal('');

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.airports();
    return this.airports().filter((a) =>
      [a.iataCode, a.name, a.city, a.department].some((v) => v?.toLowerCase().includes(q)));
  });

  /** Rutas unicas de los itinerarios cuyos dos aeropuertos tienen coordenadas conocidas. */
  protected readonly routes = computed<MapRoute[]>(() => {
    const byCode = new Map(this.airports()
      .filter((a) => a.iataCode && a.latitude !== null && a.longitude !== null)
      .map((a) => [a.iataCode!.toUpperCase(), a]));
    const seen = new Set<string>();
    const result: MapRoute[] = [];
    for (const it of this.itineraries()) {
      const from = byCode.get(it.departureAirportId.toUpperCase());
      const to = byCode.get(it.arrivalAirportId.toUpperCase());
      const key = `${it.departureAirportId}-${it.arrivalAirportId}`.toUpperCase();
      if (from && to && from !== to && !seen.has(key)) {
        seen.add(key);
        result.push({ from, to });
      }
    }
    return result;
  });

  ngOnInit(): void {
    forkJoin({
      airports: this.airportService.findAll(),
      itineraries: this.itineraryService.findAll().pipe(catchError(() => of([] as Itinerary[])))
    }).subscribe({
      next: ({ airports, itineraries }) => {
        this.airports.set(airports);
        this.itineraries.set(itineraries);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
