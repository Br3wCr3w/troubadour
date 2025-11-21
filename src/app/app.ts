import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, GoogleAuthProvider, signInWithPopup, user, User, signOut } from '@angular/fire/auth';
import { UserService } from './services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = 'AI Troubadour';
  user: User | null = null;
  loggedIn: boolean = false;

  private auth: Auth = inject(Auth);
  private userService: UserService = inject(UserService);
  private user$ = user(this.auth);
  private subscription: Subscription | undefined;

  ngOnInit() {
    this.subscription = this.user$.subscribe(async (currentUser) => {
      this.user = currentUser;
      this.loggedIn = !!currentUser;
      if (currentUser) {
        await this.userService.saveUserProfile(currentUser);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
}
