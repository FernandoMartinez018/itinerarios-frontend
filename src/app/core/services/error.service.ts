import { Injectable, signal } from '@angular/core';
import { ApiErrorResponse } from '../models/itinerary.model';

export interface DisplayableError {
  message: string;
  status?: number;
  correlationId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly currentErrorSignal = signal<DisplayableError | null>(null);

  readonly currentError = this.currentErrorSignal.asReadonly();

  showFromApiError(apiError: Partial<ApiErrorResponse> | null, fallbackMessage: string): void {
    this.currentErrorSignal.set({
      message: apiError?.message ?? fallbackMessage,
      status: apiError?.status,
      correlationId: apiError?.correlationId
    });
  }

  show(message: string): void {
    this.currentErrorSignal.set({ message });
  }

  clear(): void {
    this.currentErrorSignal.set(null);
  }
}
