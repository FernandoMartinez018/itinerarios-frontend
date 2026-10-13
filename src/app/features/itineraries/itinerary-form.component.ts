import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../core/services/session.service';
import { ItineraryService } from '../../core/services/itinerary.service';

@Component({
  selector: 'app-itinerary-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="itinerary-form">
      <h1>{{ itineraryId() ? 'Editar itinerario' : 'Nuevo itinerario' }}</h1>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label for="departureAirportId">Aeropuerto de salida (código IATA)</label>
        <input id="departureAirportId" formControlName="departureAirportId" placeholder="BOG" maxlength="10" />

        <label for="arrivalAirportId">Aeropuerto de llegada (código IATA)</label>
        <input id="arrivalAirportId" formControlName="arrivalAirportId" placeholder="MDE" maxlength="10" />

        <label for="travelDate">Fecha de viaje</label>
        <input id="travelDate" type="date" formControlName="travelDate" />

        <label for="durationMinutes">Duración (minutos)</label>
        <input id="durationMinutes" type="number" min="1" formControlName="durationMinutes" />

        <button type="submit" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Guardando...' : 'Guardar' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .itinerary-form { max-width: 420px; margin: 2rem auto; padding: 0 1rem; }
    form { display: flex; flex-direction: column; gap: 0.4rem; }
    input { padding: 0.5rem; font-size: 1rem; margin-bottom: 0.75rem; }
    button { padding: 0.6rem; font-size: 1rem; cursor: pointer; margin-top: 0.5rem; }
  `]
})
export class ItineraryFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly itineraryService = inject(ItineraryService);
  private readonly sessionService = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly itineraryId = signal<number | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    departureAirportId: ['', [Validators.required, Validators.maxLength(10)]],
    arrivalAirportId: ['', [Validators.required, Validators.maxLength(10)]],
    travelDate: ['', Validators.required],
    durationMinutes: [60, [Validators.required, Validators.min(1)]]
  });

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
