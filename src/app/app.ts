import { Component, OnInit } from '@angular/core';
import { SocialAuthService, GoogleSigninButtonModule, SocialUser } from '@abacritt/angularx-social-login';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GoogleSigninButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = 'Troubadour';
  user: SocialUser | null = null;
  loggedIn: boolean = false;

  constructor(private authService: SocialAuthService) { }

  ngOnInit() {
    console.log('App initialized');

    // Check localStorage for existing session
    const savedUser = localStorage.getItem('troubadour_user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      this.loggedIn = true;
      console.log('Restored user from storage:', this.user?.name);
    }

    this.authService.authState.subscribe((user) => {
      console.log('Auth State Changed:', user);
      if (user) {
        this.user = user;
        this.loggedIn = true;
        localStorage.setItem('troubadour_user', JSON.stringify(user));
        console.log('User logged in and saved:', user.name);
      } else {
        // Only clear if we don't have a saved user (or if explicit logout happened)
        // But authState emits null on load if autoLogin fails, so we shouldn't clear immediately if we just restored.
        // However, we need to know if this is a logout event or an initial load event.
        // The library doesn't distinguish well.
        // Better strategy: Only save on login. Clear on explicit signOut.
      }
    });
  }

  signOut(): void {
    this.authService.signOut();
    this.user = null;
    this.loggedIn = false;
    localStorage.removeItem('troubadour_user');
    console.log('User signed out and storage cleared');
  }
}
