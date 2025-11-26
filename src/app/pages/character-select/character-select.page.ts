import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-character-select',
  standalone: true,
  imports: [],
  templateUrl: './character-select.page.html',
  styleUrls: ['./character-select.page.css']
})
export class CharacterSelectPage {
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);

  selectCharacter() {
    this.router.navigate(['/world']);
  }

  async logout() {
    await this.authService.logout();
  }
}
