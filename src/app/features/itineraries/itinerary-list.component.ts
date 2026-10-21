import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Itinerary } from '../../core/models/itinerary.model';
import { ItineraryService } from '../../core/services/itinerary.service';
import { SessionService } from '../../core/services/session.service';
import { daysUntil, daysUntilLabel, formatTravelDate } from '../../core/util/travel-format';

type Filter = 'all' | 'mine' | 'upcoming';

@Component({
  selector: 'app-itinerary-list',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page__header">
        <div>
          <h1>Mis itinerarios</h1>
          <p class="page__subtitle">Todos los viajes planeados, con su ruta, fecha y duración.</p>
        </div>
        <a routerLink="/itineraries/new" class="btn btn--accent">+ Nuevo itinerario</a>
      </header>

      <div class="filters" role="tablist" aria-label="Filtrar itinerarios">
        @for (f of filters; track f.value) {
          <button type="button" role="tab" class="chip" [class.is-active]="filter() === f.value"
                  [attr.aria-selected]="filter() === f.value" (click)="filter.set(f.value)">
            {{ f.label }} <span class="chip__count">{{ count(f.value) }}</span>
          </button>
        }
      </div>

      @if (loading()) {
        <div class="card">
          @for (i of [1, 2, 3, 4]; track i) { <div class="skeleton row-skeleton"></div> }
        </div>
      } @else if (itineraries().length === 0) {
        <div class="card empty-state">
          <div class="empty-state__icon">🧳</div>
          <h2>Todavía no tienes itinerarios</h2>
          <p>Crea el primero y lo verás aquí y en el mapa.</p>
          <a routerLink="/itineraries/new" class="btn btn--primary empty-cta">Crear itinerario</a>
        </div>
      } @else {
        <div class="card table-wrap fade-in">
          <table class="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Salida</th>
                <th aria-label="Ruta"></th>
                <th>Llegada</th>
                <th>Fecha</th>
                <th>Duración (min)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (itinerary of visible(); track itinerary.id) {
                <tr>
                  <td class="user">{{ itinerary.userName }}</td>
                  <td class="table__code">{{ itinerary.departureAirportId }}</td>
                  <td class="route" aria-hidden="true">✈</td>
                  <td class="table__code">{{ itinerary.arrivalAirportId }}</td>
                  <td>
                    <div class="date">
                      <span>{{ date(itinerary.travelDate) }}</span>
                      <span class="badge" [class.badge--accent]="isSoon(itinerary.travelDate)"
                            [class.badge--muted]="isPast(itinerary.travelDate)">{{ label(itinerary.travelDate) }}</span>
                    </div>
                  </td>
                  <td>{{ itinerary.durationMinutes }}</td>
                  <td>
                    <div class="actions">
                      <a class="btn btn--ghost btn--sm" [routerLink]="['/itineraries', itinerary.id]">Ver</a>
                      <a class="btn btn--ghost btn--sm" [routerLink]="['/itineraries', itinerary.id, 'edit']">Editar</a>
                      <button type="button" class="btn btn--danger-ghost btn--sm" (click)="onDelete(itinerary.id)"
                              [attr.aria-label]="'Eliminar itinerario ' + itinerary.id">Eliminar</button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="no-results">No hay itinerarios para este filtro.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .filters { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .chip {
      display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.45rem 0.9rem; border-radius: 999px;
      border: 1px solid var(--border); background: var(--surface); color: var(--muted);
      font: inherit; font-weight: 650; font-size: 0.88rem; cursor: pointer;
    }
    .chip.is-active { background: var(--primary); border-color: var(--primary); color: #fff; }
    .chip__count {
      min-width: 1.5rem; padding: 0 0.4rem; border-radius: 999px; font-size: 0.75rem;
      background: color-mix(in srgb, currentColor 16%, transparent);
    }
    .row-skeleton { height: 52px; margin: 0.6rem 1rem; }
    .empty-cta { margin-top: 1rem; }
    .user { font-weight: 600; }
    .route { color: var(--primary); font-size: 1rem; padding-inline: 0; text-align: center; }
    .date { display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem; white-space: nowrap; }
    .table { min-width: 760px; }
    .actions { display: flex; justify-content: flex-end; gap: 0.25rem; }
    .no-results { text-align: center; color: var(--muted); padding: 2rem; }
  `]
})
export class ItineraryListComponent implements OnInit {
  private readonly itineraryService = inject(ItineraryService);
  private readonly session = inject(SessionService);

  protected readonly itineraries = signal<Itinerary[]>([]);
  protected readonly loading = signal(true);
  protected readonly filter = signal<Filter>('all');
  protected readonly filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'mine', label: 'Míos' },
    { value: 'upcoming', label: 'Próximos' }
  ];

  protected readonly visible = computed(() => this.apply(this.filter())
    .sort((a, b) => a.travelDate.localeCompare(b.travelDate)));

  protected readonly date = (iso: string) => formatTravelDate(iso, 'short');
  protected readonly label = (iso: string) => daysUntilLabel(iso);
  protected readonly isSoon = (iso: string) => { const d = daysUntil(iso); return d >= 0 && d <= 7; };
  protected readonly isPast = (iso: string) => daysUntil(iso) < 0;
  protected readonly count = (f: Filter) => this.apply(f).length;

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

  private apply(filter: Filter): Itinerary[] {
    const all = this.itineraries();
    if (filter === 'mine') return all.filter((it) => it.userName === this.session.userName());
    if (filter === 'upcoming') return all.filter((it) => daysUntil(it.travelDate) >= 0);
    return [...all];
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
