import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ChatMessage } from '../../../../services/chat.service';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="chat-panel">
        <div class="chat-header">
            <div class="chat-tabs">
                <button class="active">Global</button>
                <button>Party</button>
            </div>
            <div class="chat-tools">⚙️</div>
        </div>
        <div #chatLog class="chat-log">
            <div class="msg system" *ngIf="chatError">System: Error connecting to chat server. {{chatError}}</div>
            <div class="msg" *ngFor="let msg of chatMessages$ | async" [ngClass]="msg.type">
                <span class="sender" *ngIf="msg.type !== 'system'">{{msg.senderName}}:</span>
                {{msg.content}}
            </div>
        </div>
        <div class="chat-input">
            <input type="text" placeholder="Type a message..." [(ngModel)]="chatInput" (keyup.enter)="onSendMessage()">
        </div>
    </div>
  `,
    styles: [`
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
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
        z-index: 90;
    }

    .chat-header {
        display: flex;
        justify-content: space-between;
        padding: 5px 10px;
        background: rgba(0, 0, 0, 0.3);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

    .msg {
        margin-bottom: 4px;
        word-wrap: break-word;
    }

    .msg .sender {
        font-weight: bold;
        margin-right: 5px;
        color: #ccc;
    }

    .msg.system {
        color: #aaf;
        font-style: italic;
    }

    .msg.alert {
        color: #f88;
    }

    .msg.party {
        color: #8f8;
    }

    .msg.global {
        color: #fff;
    }

    .chat-input {
        padding: 8px;
        background: rgba(0, 0, 0, 0.5);
    }

    .chat-input input {
        width: 100%;
        background: none;
        border: none;
        color: white;
        outline: none;
    }
  `]
})
export class ChatComponent implements AfterViewChecked {
    @Input() chatMessages$!: Observable<ChatMessage[]>;
    @Input() chatError: string = '';
    @Output() sendMessage = new EventEmitter<string>();

    @ViewChild('chatLog') chatLogRef!: ElementRef<HTMLDivElement>;

    chatInput = '';

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    onSendMessage() {
        if (this.chatInput.trim()) {
            this.sendMessage.emit(this.chatInput);
            this.chatInput = '';
        }
    }

    private scrollToBottom() {
        if (this.chatLogRef) {
            try {
                this.chatLogRef.nativeElement.scrollTop = this.chatLogRef.nativeElement.scrollHeight;
            } catch (err) { }
        }
    }
}
