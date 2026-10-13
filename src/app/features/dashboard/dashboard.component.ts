import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Airport } from '../../core/models/airport.model';
import { Itinerary } from '../../core/models/itinerary.model';
import { AirportService } from '../../core/services/airport.service';
import { ItineraryService } from '../../core/services/itinerary.service';
import { SessionService } from '../../core/services/session.service';
import { daysUntil, daysUntilLabel, formatDuration, formatTravelDate } from '../../core/util/travel-format';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <section class="hero fade-in">
        <div>
          <p class="hero__eyebrow">{{ greeting() }}</p>
          <h1>Hola, {{ sessionService.userName() }}</h1>
          <p class="hero__lead">
            @if (nextTrip(); as trip) {
              Tu próximo viaje es <strong>{{ trip.departureAirportId }} → {{ trip.arrivalAirportId }}</strong>
              · {{ label(trip.travelDate) }}.
            } @else {
              Aún no tienes viajes próximos. ¿A dónde vamos?
            }
          </p>
        </div>
        <a routerLink="/itineraries/new" class="btn btn--accent hero__cta">Planear un viaje</a>
      </section>

      <section class="grid grid--3 stats">
        <div class="card card--padded stat">
          <span class="stat__icon stat__icon--blue" aria-hidden="true">🧳</span>
          @if (loading()) { <span class="skeleton stat__skeleton"></span> } @else { <strong class="stat__value">{{ myItineraries().length }}</strong> }
          <span class="stat__label">Mis itinerarios</span>
        </div>
        <div class="card card--padded stat">
          <span class="stat__icon stat__icon--orange" aria-hidden="true">📅</span>
          @if (loading()) { <span class="skeleton stat__skeleton"></span> } @else { <strong class="stat__value">{{ upcoming().length }}</strong> }
          <span class="stat__label">Viajes próximos</span>
        </div>
        <div class="card card--padded stat">
          <span class="stat__icon stat__icon--green" aria-hidden="true">🛫</span>
          @if (loading()) { <span class="skeleton stat__skeleton"></span> } @else { <strong class="stat__value">{{ airports().length }}</strong> }
          <span class="stat__label">Aeropuertos sincronizados</span>
        </div>
      </section>

      <section class="grid grid--3 actions">
        <div class="card card--padded card--hover action">
          <span class="action__icon" aria-hidden="true">🗺️</span>
          <a routerLink="/airports" class="action__link">Ver aeropuertos y mapa</a>
          <p>Explora los aeropuertos y las rutas de tus viajes sobre el mapa.</p>
        </div>
        <div class="card card--padded card--hover action">
          <span class="action__icon" aria-hidden="true">🧭</span>
          <a routerLink="/itineraries" class="action__link">Mis itinerarios</a>
          <p>Consulta, edita o elimina los viajes que ya planeaste.</p>
        </div>
        <div class="card card--padded card--hover action">
          <span class="action__icon" aria-hidden="true">✨</span>
          <a routerLink="/itineraries/new" class="action__link">Crear itinerario</a>
          <p>Elige origen, destino y fecha; validamos los aeropuertos por ti.</p>
        </div>
      </section>

      <section class="card upcoming">
        <header class="upcoming__header">
          <h2>Próximos viajes</h2>
          <a routerLink="/itineraries" class="btn btn--ghost btn--sm">Ver todos</a>
        </header>
        @if (loading()) {
          @for (i of [1, 2, 3]; track i) { <div class="skeleton upcoming__skeleton"></div> }
        } @else if (upcoming().length === 0) {
          <div class="empty-state">
            <div class="empty-state__icon">🌤️</div>
            <h2>Sin viajes en el horizonte</h2>
            <p>Crea tu primer itinerario y aparecerá aquí.</p>
          </div>
        } @else {
          <ul class="trips">
            @for (trip of upcoming().slice(0, 4); track trip.id) {
              <li>
                <a class="trip" [routerLink]="['/itineraries', trip.id]">
                  <div class="trip__route">
                    <span class="trip__code">{{ trip.departureAirportId }}</span>
                    <span class="trip__line" aria-hidden="true"><span>✈</span></span>
                    <span class="trip__code">{{ trip.arrivalAirportId }}</span>
                  </div>
                  <div class="trip__meta">
                    <span>{{ date(trip.travelDate) }}</span>
                    <span class="trip__dot">·</span>
                    <span>{{ duration(trip.durationMinutes) }}</span>
                  </div>
                  <span class="badge" [class.badge--accent]="isSoon(trip.travelDate)">{{ label(trip.travelDate) }}</span>
                </a>
              </li>
            }
          </ul>
        }
      </section>
    </div>
  `,
  styles: [`
    .hero {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.5rem;
      padding: 2rem; border-radius: var(--radius-lg); color: #fff; background: var(--gradient-hero);
      box-shadow: var(--shadow-lg); margin-bottom: 1.5rem; position: relative; overflow: hidden;
    }
    .hero::after {
      content: '✈'; position: absolute; right: 9rem; top: -1.5rem; font-size: 9rem; opacity: 0.08; transform: rotate(-20deg);
    }
    .hero__eyebrow { text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.78rem; opacity: 0.8; font-weight: 700; }
    .hero__lead { margin-top: 0.5rem; opacity: 0.92; font-size: 1.05rem; }
    .hero__cta { position: relative; z-index: 1; }

    .stats { margin-bottom: 1.5rem; }
    .stat { display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 1rem; align-items: center; }
    .stat__icon { grid-row: span 2; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 14px; font-size: 1.4rem; }
    .stat__icon--blue { background: var(--primary-soft); }
    .stat__icon--orange { background: var(--accent-soft); }
    .stat__icon--green { background: var(--success-soft); }
    .stat__value { font-size: 1.75rem; font-weight: 800; line-height: 1.1; }
    .stat__label { color: var(--muted); font-size: 0.88rem; }
    .stat__skeleton { width: 48px; height: 28px; }

    .actions { margin-bottom: 1.5rem; }
    .action { position: relative; display: flex; flex-direction: column; gap: 0.4rem; }
    .action__icon { font-size: 1.6rem; }
    .action__link { font-weight: 750; color: var(--text); font-size: 1.05rem; }
    .action__link::after { content: ''; position: absolute; inset: 0; border-radius: inherit; } /* toda la tarjeta clicable */
    .action p { color: var(--muted); font-size: 0.9rem; }

    .upcoming { padding: 1.25rem; }
    .upcoming__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .upcoming__skeleton { height: 64px; margin-top: 0.6rem; }
    .trips { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
    .trip {
      display: grid; grid-template-columns: minmax(220px, 1.2fr) 1fr auto; align-items: center; gap: 1rem;
      padding: 0.9rem 1rem; border-radius: var(--radius); background: var(--surface-2); color: var(--text);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .trip:hover { transform: translateX(3px); box-shadow: var(--shadow); color: var(--text); }
    .trip__route { display: flex; align-items: center; gap: 0.75rem; }
    .trip__code { font-weight: 800; letter-spacing: 0.08em; font-size: 1.1rem; }
    .trip__line { flex: 1; height: 2px; background: repeating-linear-gradient(90deg, var(--muted) 0 6px, transparent 6px 12px); position: relative; min-width: 40px; }
    .trip__line span { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); color: var(--primary); background: var(--surface-2); padding: 0 0.2rem; }
    .trip__meta { color: var(--muted); font-size: 0.9rem; }
    .trip__dot { margin: 0 0.35rem; }
    @media (max-width: 640px) { .trip { grid-template-columns: 1fr; gap: 0.4rem; } }
  `]
})
export class DashboardComponent implements OnInit {
  protected readonly sessionService = inject(SessionService);
  private readonly itineraryService = inject(ItineraryService);
  private readonly airportService = inject(AirportService);

  protected readonly loading = signal(true);
  private readonly itineraries = signal<Itinerary[]>([]);
  protected readonly airports = signal<Airport[]>([]);

  protected readonly myItineraries = computed(() =>
    this.itineraries().filter((it) => it.userName === this.sessionService.userName()));
  protected readonly upcoming = computed(() =>
    this.myItineraries()
      .filter((it) => daysUntil(it.travelDate) >= 0)
      .sort((a, b) => a.travelDate.localeCompare(b.travelDate)));
  protected readonly nextTrip = computed(() => this.upcoming()[0] ?? null);
  protected readonly greeting = computed(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  });

  protected readonly date = (iso: string) => formatTravelDate(iso);
  protected readonly duration = formatDuration;
  protected readonly label = (iso: string) => daysUntilLabel(iso);
  protected readonly isSoon = (iso: string) => daysUntil(iso) <= 7;

  ngOnInit(): void {
    // Cada fuente falla por separado: un error en una no deja vacio el panel completo.
    forkJoin({
      itineraries: this.itineraryService.findAll().pipe(catchError(() => of([] as Itinerary[]))),
      airports: this.airportService.findAll().pipe(catchError(() => of([] as Airport[])))
    }).subscribe(({ itineraries, airports }) => {
      this.itineraries.set(itineraries);
      this.airports.set(airports);
      this.loading.set(false);
    });
  }
}
