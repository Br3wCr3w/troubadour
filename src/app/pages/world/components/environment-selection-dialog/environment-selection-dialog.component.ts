import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-environment-selection-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="popup-overlay" (click)="onCancel()">
      <div class="popup-content" (click)="$event.stopPropagation()">
        <h2>Select Environment</h2>
        <div class="environment-options">
          <button class="env-btn dungeon" (click)="selectEnvironment('dungeon')">
            <span class="icon">🏰</span>
            <span class="label">Dungeon</span>
          </button>
          <button class="env-btn forest" (click)="selectEnvironment('forest')">
            <span class="icon">🌲</span>
            <span class="label">Forest</span>
          </button>
          <button class="env-btn town" (click)="selectEnvironment('town')">
            <span class="icon">🏘️</span>
            <span class="label">Town</span>
          </button>
        </div>
        <div class="popup-actions">
          <button class="btn-cancel" (click)="onCancel()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(3px);
    }

    .popup-content {
      background: #1a1a2e;
      border: 2px solid #c96;
      border-radius: 10px;
      padding: 20px;
      width: 400px;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.9);
      color: #fff;
      text-align: center;
    }

    h2 {
      margin-top: 0;
      color: #c96;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    .environment-options {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-bottom: 20px;
    }

    .env-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid #444;
      border-radius: 8px;
      padding: 15px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      width: 100px;
      transition: all 0.2s;
      color: #ccc;
    }

    .env-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: #c96;
      transform: translateY(-2px);
      color: #fff;
    }

    .env-btn .icon {
      font-size: 2rem;
    }

    .env-btn .label {
      font-weight: bold;
      font-size: 0.9rem;
    }

    .popup-actions {
      display: flex;
      justify-content: center;
    }

    .btn-cancel {
      padding: 8px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      background: #444;
      color: #ccc;
      transition: background 0.2s;
    }

    .btn-cancel:hover {
      background: #555;
    }
  `]
})
export class EnvironmentSelectionDialogComponent {
  @Output() select = new EventEmitter<'dungeon' | 'forest' | 'town'>();
  @Output() cancel = new EventEmitter<void>();

  selectEnvironment(type: 'dungeon' | 'forest' | 'town') {
    this.select.emit(type);
  }

  onCancel() {
    this.cancel.emit();
  }
}
