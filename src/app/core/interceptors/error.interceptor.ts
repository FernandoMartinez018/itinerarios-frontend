import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiErrorResponse } from '../models/itinerary.model';
import { ErrorService } from '../services/error.service';
import { SessionService } from '../services/session.service';

/**
 * Traduce cualquier error HTTP (incluido el ErrorResponse consistente que
 * devuelven los microservicios, sección 64) a un mensaje mostrable en el
 * banner global de error, sin romper el flujo normal de cada componente
 * (cada uno decide si además maneja el error localmente).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);
  const session = inject(SessionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 = sin sesion en el Gateway (o vencida): no es un error para el usuario, se vuelve al login.
      if (error.status === 401) {
        if (!req.url.endsWith('/auth/me')) {
          session.clear();
          router.navigateByUrl('/login');
        }
        return throwError(() => error);
      }
      const apiError = error.error as ApiErrorResponse | undefined;
      const fallback =
        error.status === 0
          ? 'No se pudo conectar con el servidor. Verifica tu conexión.'
          : `Ocurrió un error inesperado (HTTP ${error.status}).`;

      errorService.showFromApiError(apiError ?? null, fallback);
      return throwError(() => error);
    })
  );
};
