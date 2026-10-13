import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Airport } from '../../core/models/airport.model';
import { AirportService } from '../../core/services/airport.service';
import { ItineraryService } from '../../core/services/itinerary.service';
import { SessionService } from '../../core/services/session.service';
import { formatDuration, formatTravelDate } from '../../core/util/travel-format';

@Component({
  selector: 'app-itinerary-form',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page form-page">
      <header class="page__header">
        <div>
          <h1>{{ itineraryId() ? 'Editar itinerario' : 'Nuevo itinerario' }}</h1>
          <p class="page__subtitle">Usa códigos IATA (por ejemplo BOG, MDE, CTG). Validamos que el aeropuerto exista.</p>
        </div>
      </header>

      <div class="layout">
        <form class="card card--padded form" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="pair">
            <div class="field">
              <label class="field__label" for="departureAirportId">Aeropuerto de salida (código IATA)</label>
              <input id="departureAirportId" class="input input--code" formControlName="departureAirportId"
                     placeholder="BOG" maxlength="10" list="airport-codes" autocomplete="off" />
            </div>
            <span class="pair__swap" aria-hidden="true">✈</span>
            <div class="field">
              <label class="field__label" for="arrivalAirportId">Aeropuerto de llegada (código IATA)</label>
              <input id="arrivalAirportId" class="input input--code" formControlName="arrivalAirportId"
                     placeholder="MDE" maxlength="10" list="airport-codes" autocomplete="off" />
            </div>
          </div>
          <datalist id="airport-codes">
            @for (a of knownAirports(); track a.id) {
              <option [value]="a.iataCode">{{ a.name }} — {{ a.city }}</option>
            }
          </datalist>

          <div class="pair pair--even">
            <div class="field">
              <label class="field__label" for="travelDate">Fecha de viaje</label>
              <input id="travelDate" class="input" type="date" formControlName="travelDate" [min]="today" />
            </div>
            <div class="field">
              <label class="field__label" for="durationMinutes">Duración (minutos)</label>
              <input id="durationMinutes" class="input" type="number" min="1" formControlName="durationMinutes" />
              <div class="presets">
                @for (m of presets; track m) {
                  <button type="button" class="preset" [class.is-active]="value().durationMinutes === m"
                          (click)="form.controls.durationMinutes.setValue(m)">{{ duration(m) }}</button>
                }
              </div>
            </div>
          </div>

          <div class="form__actions">
            <a routerLink="/itineraries" class="btn btn--ghost">Cancelar</a>
            <button type="submit" class="btn btn--primary" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>

        <aside class="preview" aria-label="Vista previa del viaje">
          <span class="preview__label">Vista previa</span>
          <div class="preview__route">
            <div class="preview__end">
              <span class="preview__code">{{ code(value().departureAirportId) }}</span>
              <span class="preview__city">{{ cityOf(value().departureAirportId) }}</span>
            </div>
            <div class="preview__path" aria-hidden="true"><span>✈</span></div>
            <div class="preview__end preview__end--right">
              <span class="preview__code">{{ code(value().arrivalAirportId) }}</span>
              <span class="preview__city">{{ cityOf(value().arrivalAirportId) }}</span>
            </div>
          </div>
          <dl class="preview__facts">
            <div><dt>Fecha</dt><dd>{{ value().travelDate ? date(value().travelDate!) : '—' }}</dd></div>
            <div><dt>Duración</dt><dd>{{ value().durationMinutes ? duration(value().durationMinutes!) : '—' }}</dd></div>
            <div><dt>Viajero</dt><dd>{{ sessionService.userName() }}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.5rem; align-items: start; }
    .form { display: flex; flex-direction: column; gap: 1.25rem; }
    .pair { display: grid; grid-template-columns: 1fr auto 1fr; gap: 0.75rem; align-items: end; }
    .pair--even { grid-template-columns: 1fr 1fr; align-items: start; }
    .pair__swap { padding-bottom: 0.7rem; color: var(--primary); font-size: 1.2rem; }
    .presets { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.15rem; }
    .preset {
      padding: 0.25rem 0.65rem; border-radius: 999px; border: 1px solid var(--border); background: var(--surface-2);
      color: var(--muted); font: inherit; font-size: 0.8rem; font-weight: 650; cursor: pointer;
    }
    .preset.is-active { background: var(--primary-soft); color: var(--primary-strong); border-color: transparent; }
    .form__actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.5rem; border-top: 1px solid var(--border); }

    .preview {
      position: sticky; top: 5.5rem; padding: 1.5rem; border-radius: var(--radius-lg); color: #fff;
      background: var(--gradient-hero); box-shadow: var(--shadow-lg);
    }
    .preview__label { text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.72rem; opacity: 0.75; font-weight: 700; }
    .preview__route { display: flex; align-items: center; gap: 0.75rem; margin: 1.25rem 0; }
    .preview__end { display: flex; flex-direction: column; min-width: 0; }
    .preview__end--right { text-align: right; }
    .preview__code { font-size: 2.1rem; font-weight: 850; letter-spacing: 0.08em; line-height: 1; }
    .preview__city { font-size: 0.82rem; opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .preview__path { flex: 1; height: 2px; background: repeating-linear-gradient(90deg, rgba(255,255,255,.6) 0 6px, transparent 6px 12px); position: relative; }
    .preview__path span { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
    .preview__facts { display: grid; gap: 0.75rem; margin: 0; padding-top: 1rem; border-top: 1px dashed rgba(255,255,255,0.35); }
    .preview__facts div { display: flex; justify-content: space-between; gap: 1rem; }
    .preview__facts dt { opacity: 0.75; }
    .preview__facts dd { margin: 0; font-weight: 700; text-align: right; }

    @media (max-width: 860px) {
      .layout { grid-template-columns: 1fr; }
      .preview { position: static; order: -1; }
      .pair { grid-template-columns: 1fr; }
      .pair__swap { display: none; }
      .pair--even { grid-template-columns: 1fr; }
    }
  `]
})
export class ItineraryFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly itineraryService = inject(ItineraryService);
  private readonly airportService = inject(AirportService);
  protected readonly sessionService = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly itineraryId = signal<number | null>(null);
  protected readonly saving = signal(false);
  protected readonly presets = [45, 60, 90, 120];
  protected readonly today = new Date().toLocaleDateString('en-CA'); // yyyy-MM-dd local, minimo del date picker

  protected readonly form = this.fb.nonNullable.group({
    departureAirportId: ['', [Validators.required, Validators.maxLength(10)]],
    arrivalAirportId: ['', [Validators.required, Validators.maxLength(10)]],
    travelDate: ['', Validators.required],
    durationMinutes: [60, [Validators.required, Validators.min(1)]]
  });

  protected readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /** Aeropuertos ya sincronizados: solo para sugerir codigos; la validacion real la hace el backend. */
  protected readonly knownAirports = toSignal(
    this.airportService.findAll().pipe(catchError(() => of([] as Airport[]))), { initialValue: [] as Airport[] });
  private readonly airportsByCode = computed(() =>
    new Map(this.knownAirports().filter((a) => a.iataCode).map((a) => [a.iataCode!.toUpperCase(), a])));

  protected readonly code = (v?: string) => (v?.trim() ? v.trim().toUpperCase() : '···');
  protected readonly cityOf = (v?: string) =>
    v?.trim() ? (this.airportsByCode().get(v.trim().toUpperCase())?.city ?? 'Se valida al guardar') : 'Origen / destino';
  protected readonly date = (iso: string) => formatTravelDate(iso);
  protected readonly duration = formatDuration;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.itineraryId.set(id);
      this.itineraryService.findById(id).subscribe((itinerary) => {
        this.form.patchValue({
          departureAirportId: itinerary.departureAirportId,
          arrivalAirportId: itinerary.arrivalAirportId,
          travelDate: itinerary.travelDate,
          durationMinutes: itinerary.durationMinutes
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const userName = this.sessionService.userName() ?? 'anonimo';
    const value = this.form.getRawValue();
    const request = {
      userName,
      departureAirportId: value.departureAirportId.toUpperCase(),
      arrivalAirportId: value.arrivalAirportId.toUpperCase(),
      travelDate: value.travelDate,
      durationMinutes: value.durationMinutes
    };

    this.saving.set(true);
    const id = this.itineraryId();
    const request$ = id
      ? this.itineraryService.update(id, request)
      : this.itineraryService.create(request);

    request$.subscribe({
      next: () => this.router.navigateByUrl('/itineraries'),
      error: () => this.saving.set(false)
    });
  }
}
