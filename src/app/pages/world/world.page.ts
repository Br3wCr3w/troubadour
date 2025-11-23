import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container">
      <!-- Header -->
      <div class="game-header">
        <div class="logo">
          <span class="dnd-logo">D&D</span>
          <span class="title">GAUNTLET QUEST</span>
        </div>
      </div>

      <!-- Left Sidebar: Party -->
      <div class="party-sidebar">
        <div class="character-card" *ngFor="let char of party">
          <div class="char-avatar" [style.background-color]="char.color">
            <!-- Placeholder for avatar image -->
            <span class="char-initial">{{char.name[0]}}</span>
          </div>
          <div class="char-info">
            <div class="hp-bar">
              <div class="hp-fill" [style.width.%]="char.hp"></div>
            </div>
            <div class="mp-bar">
              <div class="mp-fill" [style.width.%]="char.mp"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Isometric View -->
      <div class="viewport">
        <div class="iso-world">
          <!-- Floor -->
          <div class="floor-grid">
            <div class="tile" *ngFor="let tile of tiles" 
                 [style.left.px]="tile.x" 
                 [style.top.px]="tile.y">
            </div>
          </div>
          
          <!-- Entities (simplified placement) -->
          <div class="entity hero" style="top: 200px; left: 300px;">🧝‍♀️</div>
          <div class="entity hero" style="top: 240px; left: 260px;">🧙‍♂️</div>
          <div class="entity hero" style="top: 280px; left: 220px;">🧔</div>
          
          <div class="entity monster" style="top: 150px; left: 400px;">👾</div>
          <div class="entity monster" style="top: 180px; left: 450px;">👹</div>
          
          <div class="entity prop" style="top: 100px; left: 500px;">📦</div>
        </div>
      </div>

      <!-- Bottom Left: Chat -->
      <div class="chat-panel">
        <div class="chat-header">
          <div class="chat-tabs">
            <button class="active">Global</button>
            <button>Party</button>
          </div>
          <div class="chat-tools">⚙️</div>
        </div>
        <div class="chat-log">
          <div class="msg system">Player 2: Aww, a mimic!</div>
          <div class="msg system">Player 2: Aww, a mimic!</div>
          <div class="msg alert">Player 4 needs healing!</div>
          <div class="msg alert">Player 4 needs healing!</div>
        </div>
        <div class="chat-input">
          <input type="text" placeholder="|">
        </div>
      </div>

      <!-- Bottom Right: Actions -->
      <div class="action-panel">
        <div class="main-actions">
          <button class="action-btn attack">⚔️</button>
          <button class="action-btn defend">🛡️</button>
          <button class="action-btn item">🧪</button>
        </div>
        <div class="spell-slot">🔮</div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background-color: #050505;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: white;
    }

    .game-container {
      position: relative;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, #1a1a2e 0%, #000 100%);
    }

    /* Header */
    .game-header {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100;
      pointer-events: none;
    }
    .logo {
      text-align: center;
      text-shadow: 0 0 10px #a0f;
    }
    .dnd-logo {
      display: block;
      font-size: 1.2rem;
      color: #e33;
      font-weight: bold;
    }
    .title {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    }

    /* Sidebar */
    .party-sidebar {
      position: absolute;
      top: 100px;
      left: 20px;
      width: 80px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      z-index: 90;
    }
    .character-card {
      width: 70px;
      height: 70px;
      position: relative;
      border: 3px solid #c96;
      border-radius: 50%;
      background: #222;
      box-shadow: 0 0 10px rgba(0,0,0,0.8);
    }
    .char-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      color: rgba(255,255,255,0.8);
    }
    .char-info {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .hp-bar, .mp-bar {
      height: 4px;
      background: #333;
      border-radius: 2px;
      overflow: hidden;
    }
    .hp-fill { background: #3e3; height: 100%; }
    .mp-fill { background: #33e; height: 100%; }

    /* Viewport & Isometric World */
    .viewport {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1000px;
    }
    .iso-world {
      position: relative;
      width: 800px;
      height: 600px;
      transform: rotateX(60deg) rotateZ(-45deg);
      transform-style: preserve-3d;
    }
    .floor-grid {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 40px 40px;
      background-color: #1a1a1a;
      box-shadow: 0 0 50px rgba(0,0,0,0.5);
      border: 10px solid #333;
    }
    .tile {
      position: absolute;
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .entity {
      position: absolute;
      width: 40px;
      height: 40px;
      font-size: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotateZ(45deg) rotateX(-60deg) translateY(-20px); /* Counter-rotate to face camera */
      filter: drop-shadow(0 5px 5px rgba(0,0,0,0.5));
      z-index: 10;
    }

    /* Chat Panel */
    .chat-panel {
      position: absolute;
      bottom: 20px;
      left: 20px;
      width: 350px;
      height: 200px;
      background: rgba(20, 15, 30, 0.9);
      border: 2px solid #c96;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0,0,0,0.8);
    }
    .chat-header {
      display: flex;
      justify-content: space-between;
      padding: 5px 10px;
      background: rgba(0,0,0,0.3);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .chat-tabs button {
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      font-weight: bold;
      margin-right: 10px;
    }
    .chat-tabs button.active {
      color: #c96;
    }
    .chat-log {
      flex: 1;
      padding: 10px;
      overflow-y: auto;
      font-size: 0.9rem;
    }
    .msg { margin-bottom: 4px; }
    .msg.system { color: #aaf; }
    .msg.alert { color: #f88; }
    
    .chat-input {
      padding: 8px;
      background: rgba(0,0,0,0.5);
    }
    .chat-input input {
      width: 100%;
      background: none;
      border: none;
      color: white;
      outline: none;
    }

    /* Action Panel */
    .action-panel {
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      align-items: flex-end;
      gap: 20px;
    }
    .main-actions {
      display: flex;
      gap: 10px;
      background: rgba(0,0,0,0.6);
      padding: 10px 20px;
      border-radius: 50px;
      border: 2px solid #c96;
    }
    .action-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 2px solid #fff;
      background: linear-gradient(135deg, #444, #222);
      font-size: 1.5rem;
      cursor: pointer;
      transition: transform 0.1s;
      box-shadow: 0 4px 8px rgba(0,0,0,0.5);
    }
    .action-btn:hover { transform: scale(1.1); }
    .action-btn.attack { border-color: #f55; background: linear-gradient(135deg, #833, #422); }
    .action-btn.defend { border-color: #55f; background: linear-gradient(135deg, #338, #224); }
    .action-btn.item { border-color: #5f5; background: linear-gradient(135deg, #383, #242); }
    
    .spell-slot {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid #a0f;
      background: radial-gradient(circle, #406, #203);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      box-shadow: 0 0 20px #a0f;
    }
  `]
})
export class WorldPage {
  party = [
    { name: 'Dwarf', color: '#a52', hp: 80, mp: 20 },
    { name: 'Elf', color: '#5a2', hp: 60, mp: 80 },
    { name: 'Wizard', color: '#25a', hp: 40, mp: 100 },
    { name: 'Rogue', color: '#555', hp: 70, mp: 40 }
  ];

  tiles: {x: number, y: number}[] = [];

  constructor() {
    // Generate some dummy floor tiles
    for(let i=0; i<10; i++) {
      for(let j=0; j<10; j++) {
        this.tiles.push({x: i*40, y: j*40});
      }
    }
  }
}
