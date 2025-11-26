import { Component, inject } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css']
})
export class LoginPage {
  private authService: AuthService = inject(AuthService);

  async signInWithGoogle(): Promise<void> {
    try {
      await this.authService.loginWithGoogle();
    } catch (error) {
      // Error is already logged in AuthService
    }
  }
}
