import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Airport } from '../../core/models/airport.model';
import { Itinerary } from '../../core/models/itinerary.model';
import { AirportService } from '../../core/services/airport.service';
import { ItineraryService } from '../../core/services/itinerary.service';
import { daysUntilLabel, formatDuration, formatTravelDate } from '../../core/util/travel-format';

@Component({
  selector: 'app-itinerary-detail',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page detail">
      <a routerLink="/itineraries" class="back">← Volver a mis itinerarios</a>

      @if (itinerary(); as it) {
        <article class="pass fade-in" aria-label="Pase de abordar">
          <header class="pass__header">
            <span class="pass__brand">✈ Itinerarios Personales</span>
            <span class="badge pass__badge">{{ label(it.travelDate) }}</span>
          </header>

          <div class="pass__body">
            <div class="pass__route">
              <div class="pass__end">
                <span class="pass__tag">Salida</span>
                <h1 class="pass__code">{{ it.departureAirportId }}</h1>
                <span class="pass__city">{{ departure()?.city ?? '—' }}</span>
                <span class="pass__name">{{ departure()?.name ?? '' }}</span>
              </div>
              <div class="pass__path" aria-hidden="true"><span>✈</span></div>
              <div class="pass__end pass__end--right">
                <span class="pass__tag">Llegada</span>
                <span class="pass__code">{{ it.arrivalAirportId }}</span>
                <span class="pass__city">{{ arrival()?.city ?? '—' }}</span>
                <span class="pass__name">{{ arrival()?.name ?? '' }}</span>
              </div>
            </div>

            <dl class="pass__facts">
              <div><dt>Pasajero</dt><dd>{{ it.userName }}</dd></div>
              <div><dt>Fecha</dt><dd>{{ date(it.travelDate) }}</dd></div>
              <div><dt>Duración</dt><dd>{{ duration(it.durationMinutes) }}</dd></div>
              <div><dt>Itinerario</dt><dd>#{{ it.id }}</dd></div>
            </dl>
          </div>

          <footer class="pass__stub">
            <div class="pass__barcode" aria-hidden="true"></div>
            <div class="pass__actions">
              <a class="btn btn--primary" [routerLink]="['/itineraries', it.id, 'edit']">Editar</a>
              <a class="btn btn--ghost" routerLink="/itineraries">Volver</a>
            </div>
          </footer>
        </article>
      } @else {
        <div class="skeleton pass-skeleton"></div>
      }
    </div>
  `,
  styles: [`
    .detail { max-width: 760px; }
    .back { display: inline-block; margin-bottom: 1.25rem; font-weight: 600; }
    .pass-skeleton { height: 360px; border-radius: var(--radius-lg); }
    .pass { border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg); background: var(--surface); border: 1px solid var(--border); }
    .pass__header {
      display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;
      background: var(--gradient-hero); color: #fff;
    }
    .pass__brand { font-weight: 800; letter-spacing: 0.02em; }
    .pass__badge { background: rgba(255, 255, 255, 0.2); color: #fff; }
    .pass__body { padding: 1.75rem 1.5rem 1.25rem; }
    .pass__route { display: flex; align-items: center; gap: 1rem; }
    .pass__end { display: flex; flex-direction: column; min-width: 0; }
    .pass__end--right { text-align: right; align-items: flex-end; }
    .pass__tag { text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.7rem; color: var(--muted); font-weight: 700; }
    .pass__code { font-size: clamp(2.4rem, 7vw, 3.4rem); font-weight: 850; letter-spacing: 0.06em; line-height: 1.05; margin: 0; }
    .pass__city { font-weight: 700; }
    .pass__name { color: var(--muted); font-size: 0.85rem; }
    .pass__path { flex: 1; height: 2px; background: repeating-linear-gradient(90deg, var(--border) 0 8px, transparent 8px 14px); position: relative; }
    .pass__path span {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      color: var(--primary); background: var(--surface); padding: 0 0.3rem; font-size: 1.4rem;
    }
    .pass__facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin: 1.75rem 0 0; }
    .pass__facts dt { color: var(--muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; }
    .pass__facts dd { margin: 0.2rem 0 0; font-weight: 700; }
    .pass__stub {
      display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;
      padding: 1.25rem 1.5rem; border-top: 2px dashed var(--border); background: var(--surface-2); position: relative;
    }
    .pass__stub::before, .pass__stub::after {
      content: ''; position: absolute; top: -12px; width: 22px; height: 22px; border-radius: 50%; background: var(--bg);
    }
    .pass__stub::before { left: -11px; }
    .pass__stub::after { right: -11px; }
    .pass__barcode {
      width: 180px; height: 42px; border-radius: 4px;
      background: repeating-linear-gradient(90deg, var(--text) 0 2px, transparent 2px 4px, var(--text) 4px 7px, transparent 7px 9px);
      opacity: 0.75;
    }
    .pass__actions { display: flex; gap: 0.6rem; }
  `]
})
export class ItineraryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly itineraryService = inject(ItineraryService);
  private readonly airportService = inject(AirportService);

  protected readonly itinerary = signal<Itinerary | null>(null);
  protected readonly departure = signal<Airport | null>(null);
  protected readonly arrival = signal<Airport | null>(null);

  protected readonly date = (iso: string) => formatTravelDate(iso);
  protected readonly duration = formatDuration;
  protected readonly label = (iso: string) => daysUntilLabel(iso);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const airport = (code: string) => this.airportService.findByIataCode(code).pipe(catchError(() => of(null)));
    this.itineraryService.findById(id).pipe(
      switchMap((it) => {
        this.itinerary.set(it);
        return forkJoin([airport(it.departureAirportId), airport(it.arrivalAirportId)]);
      })
    ).subscribe(([from, to]) => {
      this.departure.set(from);
      this.arrival.set(to);
    });
  }
}
