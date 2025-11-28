import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../../../core/models/user.model';

@Component({
    selector: 'app-party-sidebar',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="party-sidebar">
        <!-- Logged In User -->
        <div class="character-card player-card" (click)="onOpenPlayerPopup()" draggable="true" (dragstart)="onDragStart($event)">
            <div class="char-avatar" [style.background-color]="'#444'">
                <img *ngIf="playerCharacter.image" [src]="playerCharacter.image" class="avatar-img" alt="Player Avatar">
                <span *ngIf="!playerCharacter.image" class="char-initial">{{playerCharacter.name[0]}}</span>
            </div>
            <div class="char-info">
                <div class="hp-bar">
                    <div class="hp-fill player-hp" [style.width.%]="(playerCharacter.hp / playerCharacter.maxHp) * 100">
                    </div>
                </div>
            </div>
        </div>

        <div class="character-card" *ngFor="let user of party" [title]="user.displayName">
            <div class="char-avatar" [style.background-color]="getUserColor(user.displayName || 'Anon')">
                <img *ngIf="user.photoURL" [src]="user.photoURL" class="avatar-img" [alt]="user.displayName">
                <span *ngIf="!user.photoURL" class="char-initial">{{(user.displayName || 'A')[0]}}</span>
            </div>
            <div class="char-info">
                <!-- Mock HP/MP for other users since we don't have that data yet -->
                <div class="hp-bar">
                    <div class="hp-fill" [style.width.%]="100"></div>
                </div>
                <div class="mp-bar">
                    <div class="mp-fill" [style.width.%]="100"></div>
                </div>
            </div>
        </div>
    </div>
  `,
    styles: [`
    .party-sidebar {
        position: absolute;
        top: 20px;
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
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
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
        color: rgba(255, 255, 255, 0.8);
        overflow: hidden;
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

    .hp-bar,
    .mp-bar {
        height: 4px;
        background: #333;
        border-radius: 2px;
        overflow: hidden;
    }

    .hp-fill {
        background: #3e3;
        height: 100%;
    }

    .mp-fill {
        background: #33e;
        height: 100%;
    }

    .player-card {
        cursor: pointer;
        border-color: #fff;
        transition: transform 0.2s;
    }

    .player-card:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    }

    .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .hp-fill.player-hp {
        background: #f33;
    }
  `]
})
export class PartySidebarComponent {
    @Input() party: UserProfile[] | null = [];
    @Input() playerCharacter: any;
    @Output() openPlayerPopup = new EventEmitter<void>();

    onOpenPlayerPopup() {
        this.openPlayerPopup.emit();
    }

    onDragStart(event: DragEvent) {
        if (this.playerCharacter) {
            event.dataTransfer?.setData('application/json', JSON.stringify({
                type: 'player-token',
                name: this.playerCharacter.name,
                image: this.playerCharacter.image
            }));
            event.dataTransfer!.effectAllowed = 'copy';
        }
    }

    getUserColor(name: string): string {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    }
}
