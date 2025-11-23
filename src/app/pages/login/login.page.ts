import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <div class="glass-card">
        <div class="login-state">
          <h2>INITIALIZE LINK</h2>
          <p>Connect your neural profile to enter the simulation.</p>
          <div class="google-btn-wrapper">
            <button (click)="signInWithGoogle()" class="cyber-btn">
              <span class="btn-content">CONNECT NEURAL LINK</span>
              <span class="glitch-effect"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 20;
    }
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
    }
    .glass-card {
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
    }
    h2 {
      color: #0ff;
      font-family: 'Orbitron', sans-serif;
      margin-bottom: 1rem;
      text-align: center;
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }
    p {
      color: #ccc;
      text-align: center;
      margin-bottom: 2rem;
    }
    .google-btn-wrapper {
      display: flex;
      justify-content: center;
    }
    .cyber-btn {
      background: transparent;
      border: 1px solid #0ff;
      color: #0ff;
      padding: 12px 24px;
      font-family: 'Orbitron', sans-serif;
      font-size: 1rem;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .cyber-btn:hover {
      background: rgba(0, 255, 255, 0.1);
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
    }
  `]
})
export class LoginPage {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/characters']);
    } catch (error) {
      console.error('Login failed', error);
    }
  }
}
