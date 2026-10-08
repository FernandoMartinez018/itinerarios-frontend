import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import type PlotlyModule from 'plotly.js-dist-min';
import { Airport } from '../../core/models/airport.model';

/**
 * Mapa de aeropuertos con Plotly.js (sección 34: "Mapa: Plotly.js").
 * Plotly se carga dinámicamente (import()) para no inflar el bundle inicial
 * de toda la aplicación con una librería que solo esta pantalla necesita.
 */
@Component({
  selector: 'app-airport-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #mapContainer class="airport-map"></div>`,
  styles: [`
    .airport-map { width: 100%; height: 480px; margin-bottom: 1.5rem; }
  `]
})
export class AirportMapComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) airports: Airport[] = [];

  @ViewChild('mapContainer', { static: true }) private mapContainer!: ElementRef<HTMLDivElement>;

  private plotly?: typeof PlotlyModule;
  private viewInitialized = false;

  async ngAfterViewInit(): Promise<void> {
    this.plotly = (await import('plotly.js-dist-min')).default;
    this.viewInitialized = true;
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['airports'] && this.viewInitialized) {
      this.render();
    }
  }

  private render(): void {
    if (!this.plotly) {
      return;
    }

    const withCoordinates = this.airports.filter(
      (a) => a.latitude !== null && a.longitude !== null
    );

    const trace: Partial<PlotlyModule.PlotData> = {
      type: 'scattergeo',
      mode: 'markers',
      lat: withCoordinates.map((a) => a.latitude as number),
      lon: withCoordinates.map((a) => a.longitude as number),
      text: withCoordinates.map((a) => `${a.name} (${a.iataCode ?? 'sin IATA'})`),
      marker: { size: 9, color: '#1f6feb' }
    };

    const layout: Partial<PlotlyModule.Layout> = {
      geo: {
        scope: 'south america',
        center: { lat: 4.5, lon: -74 },
        projection: { scale: 5 },
        showland: true,
        landcolor: '#eef2f5'
      },
      margin: { l: 0, r: 0, t: 0, b: 0 }
    };

    this.plotly.newPlot(this.mapContainer.nativeElement, [trace], layout, { responsive: true });
  }
}
