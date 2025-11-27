import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-game-actions',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="action-panel">
        <div class="main-actions">
            <button class="action-btn attack">⚔️</button>
            <button class="action-btn defend">🛡️</button>
            <button class="action-btn item">🧪</button>
        </div>
        <div class="spell-slot">🔮</div>
    </div>
  `,
    styles: [`
    .action-panel {
        position: absolute;
        bottom: 20px;
        right: 20px;
        display: flex;
        align-items: flex-end;
        gap: 20px;
        z-index: 90;
    }

    .main-actions {
        display: flex;
        gap: 10px;
        background: rgba(0, 0, 0, 0.6);
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
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    }

    .action-btn:hover {
        transform: scale(1.1);
    }

    .action-btn.attack {
        border-color: #f55;
        background: linear-gradient(135deg, #833, #422);
    }

    .action-btn.defend {
        border-color: #55f;
        background: linear-gradient(135deg, #338, #224);
    }

    .action-btn.item {
        border-color: #5f5;
        background: linear-gradient(135deg, #383, #242);
    }

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
export class GameActionsComponent { }
