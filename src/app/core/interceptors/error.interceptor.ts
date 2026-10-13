import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiErrorResponse } from '../models/itinerary.model';
import { ErrorService } from '../services/error.service';

/**
 * Traduce cualquier error HTTP (incluido el ErrorResponse consistente que
 * devuelven los microservicios, sección 64) a un mensaje mostrable en el
 * banner global de error, sin romper el flujo normal de cada componente
 * (cada uno decide si además maneja el error localmente).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
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
