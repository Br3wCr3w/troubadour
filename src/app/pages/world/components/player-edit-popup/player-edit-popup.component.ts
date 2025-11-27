import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-player-edit-popup',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="popup-overlay" (click)="onCancel()">
        <div class="popup-content" (click)="$event.stopPropagation()">
            <h2>Edit Character</h2>

            <div class="form-group">
                <label>Avatar Image</label>
                <input type="file" (change)="onFileSelected($event)" accept="image/*">
                <div class="preview-container" *ngIf="tempPlayerStats.image">
                    <img [src]="tempPlayerStats.image" class="preview-img" alt="Avatar Preview">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Current HP</label>
                    <input type="number" [(ngModel)]="tempPlayerStats.hp">
                </div>
                <div class="form-group">
                    <label>Max HP</label>
                    <input type="number" [(ngModel)]="tempPlayerStats.maxHp">
                </div>
            </div>

            <div class="form-group">
                <label>Armor Class (AC)</label>
                <input type="number" [(ngModel)]="tempPlayerStats.ac">
            </div>

            <div class="popup-actions">
                <button class="btn-cancel" (click)="onCancel()">Cancel</button>
                <button class="btn-save" (click)="onSave()">Save</button>
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
        width: 300px;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.9);
        color: #fff;
    }

    .popup-content h2 {
        margin-top: 0;
        color: #c96;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 10px;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-row {
        display: flex;
        gap: 10px;
    }

    .form-row .form-group {
        flex: 1;
    }

    label {
        display: block;
        margin-bottom: 5px;
        font-size: 0.9rem;
        color: #aaa;
    }

    input[type="number"],
    input[type="text"] {
        width: 100%;
        padding: 8px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #444;
        border-radius: 4px;
        color: white;
        box-sizing: border-box;
    }

    input[type="file"] {
        width: 100%;
        padding: 5px;
        background: rgba(0, 0, 0, 0.3);
        color: #aaa;
        font-size: 0.8rem;
    }

    .preview-container {
        margin-top: 10px;
        text-align: center;
    }

    .preview-img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #c96;
    }

    .popup-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    }

    .btn-cancel,
    .btn-save {
        padding: 8px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: background 0.2s;
    }

    .btn-cancel {
        background: #444;
        color: #ccc;
    }

    .btn-cancel:hover {
        background: #555;
    }

    .btn-save {
        background: #c96;
        color: #000;
    }

    .btn-save:hover {
        background: #da7;
    }
  `]
})
export class PlayerEditPopupComponent implements OnInit {
    @Input() playerCharacter: any;
    @Output() save = new EventEmitter<any>();
    @Output() cancel = new EventEmitter<void>();

    tempPlayerStats: any;

    ngOnInit() {
        this.tempPlayerStats = { ...this.playerCharacter };
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.tempPlayerStats.image = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    onSave() {
        this.save.emit(this.tempPlayerStats);
    }

    onCancel() {
        this.cancel.emit();
    }
}
