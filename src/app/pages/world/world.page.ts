import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-world',
    standalone: true,
    imports: [CommonModule, CdkDrag],
    template: `
    <div class="world-container">
      <div class="map-area">
        <!-- Grid Background -->
        <div class="grid-layer"></div>
        
        <!-- Draggable Token -->
        <div class="token" cdkDrag>
          <div class="token-avatar"></div>
        </div>
      </div>
      
      <div class="ui-overlay">
        <div class="toolbar">
          <button class="tool-btn">MAP</button>
          <button class="tool-btn">TOKENS</button>
          <button class="tool-btn">CHAT</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .world-container {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      background: #0a0a0a;
    }
    .map-area {
      width: 100%;
      height: 100%;
      position: relative;
      background-color: #111;
    }
    .grid-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
    }
    .token {
      width: 50px;
      height: 50px;
      position: absolute;
      top: 100px;
      left: 100px;
      cursor: move;
      z-index: 10;
    }
    .token-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #0ff;
      box-shadow: 0 0 10px #0ff;
      border: 2px solid #fff;
    }
    .token:active {
      cursor: grabbing;
    }
    .ui-overlay {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
    }
    .toolbar {
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 255, 255, 0.2);
      padding: 0.5rem;
      border-radius: 8px;
      display: flex;
      gap: 0.5rem;
    }
    .tool-btn {
      background: transparent;
      border: 1px solid rgba(0, 255, 255, 0.3);
      color: #0ff;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-family: 'Orbitron', sans-serif;
      transition: all 0.2s;
    }
    .tool-btn:hover {
      background: rgba(0, 255, 255, 0.1);
      border-color: #0ff;
    }
  `]
})
export class WorldPage { }
