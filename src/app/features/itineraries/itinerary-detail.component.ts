import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Itinerary } from '../../core/models/itinerary.model';
import { ItineraryService } from '../../core/services/itinerary.service';

@Component({
  selector: 'app-itinerary-detail',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (itinerary(); as it) {
      <div class="detail">
        <h1>Itinerario #{{ it.id }}</h1>
        <dl>
          <dt>Usuario</dt><dd>{{ it.userName }}</dd>
          <dt>Salida</dt><dd>{{ it.departureAirportId }}</dd>
          <dt>Llegada</dt><dd>{{ it.arrivalAirportId }}</dd>
          <dt>Fecha</dt><dd>{{ it.travelDate }}</dd>
          <dt>Duración</dt><dd>{{ it.durationMinutes }} minutos</dd>
        </dl>
        <a [routerLink]="['/itineraries', it.id, 'edit']">Editar</a>
        <a routerLink="/itineraries">Volver</a>
      </div>
    }
  `,
  styles: [`
    .detail { max-width: 480px; margin: 2rem auto; padding: 0 1rem; }
    dl { display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1rem; }
    a { margin-right: 1rem; }
  `]
})
export class ItineraryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly itineraryService = inject(ItineraryService);

  protected readonly itinerary = signal<Itinerary | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.itineraryService.findById(id).subscribe((itinerary) => this.itinerary.set(itinerary));
  }
}
