import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login">
      <h1>Itinerarios Personales</h1>
      <p>Ingresa tu nombre para continuar. (Autenticación real llega en una fase posterior.)</p>

      <form (ngSubmit)="onSubmit()">
        <label for="userName">Nombre</label>
        <input id="userName" name="userName" type="text" [(ngModel)]="userNameInput" required minlength="2" />
        <button type="submit" [disabled]="userNameInput.trim().length < 2">Entrar</button>
      </form>
    </div>
  `,
  styles: [`
    .login { max-width: 360px; margin: 4rem auto; text-align: center; }
    form { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem; }
    input { padding: 0.5rem; font-size: 1rem; }
    button { padding: 0.6rem; font-size: 1rem; cursor: pointer; }
  `]
})
export class LoginComponent {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  protected userNameInput = '';

  onSubmit(): void {
    this.sessionService.login(this.userNameInput);
    this.router.navigateByUrl('/dashboard');
  }
}
