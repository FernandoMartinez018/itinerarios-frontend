import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { SessionService } from './core/services/session.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular 22: zoneless por defecto en proyectos nuevos (ver README para
    // el caso de que se prefiera mantener Zone.js por compatibilidad).
    provideZonelessChangeDetection(),
    provideRouter(routes),
    // XSRF activo por defecto: Angular reenvia la cookie XSRF-TOKEN del Gateway en X-XSRF-TOKEN.
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideAppInitializer(() => inject(SessionService).load())
  ]
};
