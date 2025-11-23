import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';

@Component({
  selector: 'app-character-select',
  standalone: true,
  imports: [],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>SELECT CHARACTER</h1>
        <button (click)="logout()" class="cyber-btn small">LOGOUT</button>
      </header>
      
      <div class="character-grid">
        <!-- Mock Character Card -->
        <div class="character-card" (click)="selectCharacter()">
          <div class="card-image"></div>
          <div class="card-info">
            <h3>NEW CHARACTER</h3>
            <p>Create a new persona</p>
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
    }
    .page-container {
      padding: 2rem;
      height: 100%;
      color: #fff;
      position: relative;
      z-index: 20;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
      border-bottom: 1px solid rgba(0, 255, 255, 0.2);
      padding-bottom: 1rem;
    }
    h1 {
      color: #0ff;
      font-family: 'Orbitron', sans-serif;
      margin: 0;
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }
    .character-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
    }
    .character-card {
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
    }
    .character-card:hover {
      border-color: #0ff;
      transform: translateY(-5px);
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
    }
    .card-image {
      height: 150px;
      background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
      border-bottom: 1px solid rgba(0, 255, 255, 0.1);
    }
    .card-info {
      padding: 1.5rem;
    }
    h3 {
      color: #0ff;
      margin: 0 0 0.5rem 0;
      font-family: 'Orbitron', sans-serif;
    }
    p {
      color: #888;
      margin: 0;
      font-size: 0.9rem;
    }
    .cyber-btn {
      background: transparent;
      border: 1px solid #0ff;
      color: #0ff;
      padding: 8px 16px;
      font-family: 'Orbitron', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .cyber-btn:hover {
      background: rgba(0, 255, 255, 0.1);
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
    }
  `]
})
export class CharacterSelectPage {
  private router: Router = inject(Router);
  private auth: Auth = inject(Auth);

  selectCharacter() {
    this.router.navigate(['/world']);
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}
