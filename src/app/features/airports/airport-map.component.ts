import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import type PlotlyModule from 'plotly.js-dist-min';
import { Airport } from '../../core/models/airport.model';

export interface MapRoute {
  from: Airport;
  to: Airport;
}

/**
 * Mapa de aeropuertos con Plotly.js (seccion 34). Ademas de los aeropuertos dibuja las rutas de
 * los itinerarios como arcos. Plotly se carga con import() dinamico para no inflar el bundle
 * inicial con una libreria que solo esta pantalla necesita.
 */
@Component({
  selector: 'app-airport-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #mapContainer class="airport-map"></div>`,
  styles: [`
    .airport-map { width: 100%; height: 520px; }
    @media (max-width: 640px) { .airport-map { height: 380px; } }
  `]
})
export class AirportMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) airports: Airport[] = [];
  @Input() routes: MapRoute[] = [];

  @ViewChild('mapContainer', { static: true }) private mapContainer!: ElementRef<HTMLDivElement>;

  private plotly?: typeof PlotlyModule;
  private viewInitialized = false;
  private readonly darkQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
  private readonly onThemeChange = () => this.render();

  async ngAfterViewInit(): Promise<void> {
    this.plotly = (await import('plotly.js-dist-min')).default;
    this.viewInitialized = true;
    this.darkQuery?.addEventListener('change', this.onThemeChange);
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['airports'] || changes['routes']) && this.viewInitialized) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.darkQuery?.removeEventListener('change', this.onThemeChange);
    if (this.plotly) {
      this.plotly.purge(this.mapContainer.nativeElement);
    }
  }

  private render(): void {
    if (!this.plotly) {
      return;
    }
    const dark = this.darkQuery?.matches ?? false;
    const palette = dark
      ? { land: '#1b2740', ocean: '#0d1526', border: '#2c3b5c', text: '#e8eefb', marker: '#60a5fa', route: '#fb923c' }
      : { land: '#eef3fa', ocean: '#dbeafe', border: '#c4d2e6', text: '#0f1b2d', marker: '#2563eb', route: '#f97316' };

    const withCoordinates = this.airports.filter((a) => a.latitude !== null && a.longitude !== null);

    // Un trazo por ruta para que cada arco se dibuje independiente (Plotly no admite cortes en lineas geo).
    const routeTraces: Partial<PlotlyModule.PlotData>[] = this.routes.map((route) => ({
      type: 'scattergeo',
      mode: 'lines',
      lat: [route.from.latitude as number, route.to.latitude as number],
      lon: [route.from.longitude as number, route.to.longitude as number],
      line: { width: 2.5, color: palette.route },
      opacity: 0.85,
      hoverinfo: 'skip',
      showlegend: false
    }));

    const airportTrace: Partial<PlotlyModule.PlotData> = {
      type: 'scattergeo',
      mode: 'text+markers' as PlotlyModule.PlotData['mode'],
      lat: withCoordinates.map((a) => a.latitude as number),
      lon: withCoordinates.map((a) => a.longitude as number),
      text: withCoordinates.map((a) => a.iataCode ?? ''),
      textposition: 'top center',
      textfont: { size: 11, color: palette.text, family: 'Segoe UI, system-ui, sans-serif' },
      customdata: withCoordinates.map((a) => [a.name, a.city, a.department ?? '']),
      hovertemplate: '<b>%{customdata[0]}</b><br>%{customdata[1]}, %{customdata[2]}<extra>%{text}</extra>',
      marker: { size: 11, color: palette.marker, line: { width: 2, color: '#ffffff' } },
      showlegend: false
    };

    const layout: Partial<PlotlyModule.Layout> = {
      geo: {
        scope: 'south america',
        center: { lat: 4.6, lon: -73.5 },
        projection: { type: 'mercator', scale: 5.2 },
        showland: true,
        landcolor: palette.land,
        showocean: true,
        oceancolor: palette.ocean,
        showcountries: true,
        countrycolor: palette.border,
        coastlinecolor: palette.border,
        showlakes: false,
        bgcolor: 'rgba(0,0,0,0)'
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 0, r: 0, t: 0, b: 0 },
      hoverlabel: { bgcolor: dark ? '#111a2e' : '#ffffff', bordercolor: palette.marker, font: { color: palette.text } }
    };

    this.plotly.react(this.mapContainer.nativeElement, [...routeTraces, airportTrace], layout, {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toImage']
    });
  }
}
