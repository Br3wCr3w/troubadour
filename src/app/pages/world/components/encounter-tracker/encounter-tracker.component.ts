import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncounterService } from '../../../../services/encounter.service';
import { Encounter, Combatant } from '../../../../core/models/encounter.model';

@Component({
    selector: 'app-encounter-tracker',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="encounter-tracker" *ngIf="encounterService.activeEncounter$ | async as encounter">
        <div class="header">
            <h3>Round {{encounter.round}}</h3>
            <button class="next-btn" (click)="onNextTurn()">Next Turn ⏭️</button>
            <button class="end-btn" (click)="onEndEncounter()">End 🏁</button>
        </div>
        
        <div class="combatants-list">
            <div class="combatant-card" 
                 *ngFor="let c of encounter.combatants; let i = index"
                 [class.active]="i === encounter.currentTurnIndex"
                 [class.player]="c.type === 'player'"
                 [class.monster]="c.type === 'monster'">
                
                <div class="initiative">{{c.initiative}}</div>
                <div class="avatar">
                    <img *ngIf="c.image" [src]="c.image" [alt]="c.name">
                    <span *ngIf="!c.image">{{c.name[0]}}</span>
                </div>
                <div class="info">
                    <div class="name">{{c.name}}</div>
                    <div class="hp">HP: {{c.hp}} / {{c.maxHp}}</div>
                </div>
                <div class="active-indicator" *ngIf="i === encounter.currentTurnIndex">⚔️</div>
            </div>
        </div>
    </div>
  `,
    styles: [`
    .encounter-tracker {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 250px;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid #c96;
        border-radius: 10px;
        padding: 10px;
        color: #eee;
        z-index: 95;
        max-height: 80vh;
        overflow-y: auto;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        border-bottom: 1px solid #555;
        padding-bottom: 5px;
    }

    h3 {
        margin: 0;
        font-size: 1.2rem;
        color: #fb4;
    }

    button {
        background: #333;
        border: 1px solid #666;
        color: #fff;
        border-radius: 4px;
        cursor: pointer;
        padding: 4px 8px;
        font-size: 0.8rem;
    }

    button:hover {
        background: #444;
    }

    .next-btn {
        background: #242;
        border-color: #484;
    }

    .end-btn {
        background: #422;
        border-color: #844;
    }

    .combatants-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .combatant-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 5px;
        background: #222;
        border-radius: 5px;
        border: 1px solid #333;
        transition: all 0.2s;
    }

    .combatant-card.active {
        background: #334;
        border-color: #66a;
        transform: scale(1.02);
        box-shadow: 0 0 10px rgba(100, 100, 255, 0.3);
    }

    .combatant-card.player {
        border-left: 3px solid #4f4;
    }

    .combatant-card.monster {
        border-left: 3px solid #f44;
    }

    .initiative {
        font-weight: bold;
        color: #888;
        width: 20px;
        text-align: center;
    }

    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        background: #444;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .info {
        flex: 1;
        overflow: hidden;
    }

    .name {
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .hp {
        font-size: 0.8rem;
        color: #aaa;
    }

    .active-indicator {
        font-size: 1.2rem;
    }
  `]
})
export class EncounterTrackerComponent {
    encounterService = inject(EncounterService);

    onNextTurn() {
        this.encounterService.nextTurn();
    }

    onEndEncounter() {
        if (confirm('Are you sure you want to end the encounter?')) {
            this.encounterService.endEncounter();
        }
    }
}
