import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'airports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/airports/airport-list.component').then((m) => m.AirportListComponent)
  },
  {
    path: 'itineraries',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/itineraries/itinerary-list.component').then((m) => m.ItineraryListComponent)
  },
  {
    path: 'itineraries/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/itineraries/itinerary-form.component').then((m) => m.ItineraryFormComponent)
  },
  {
    path: 'itineraries/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/itineraries/itinerary-detail.component').then((m) => m.ItineraryDetailComponent)
  },
  {
    path: 'itineraries/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/itineraries/itinerary-form.component').then((m) => m.ItineraryFormComponent)
  },
  { path: '**', redirectTo: 'login' }
];
