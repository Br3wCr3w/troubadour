import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, user } from '@angular/fire/auth';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { Observable, Subscription, catchError, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="game-container">
      <canvas #battleMap class="battle-map"></canvas>

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

      <!-- Bottom Left: Chat -->
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
          <input type="text" placeholder="Type a message..." [(ngModel)]="chatInput" (keyup.enter)="sendMessage()">
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

    .battle-map {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    /* Sidebar */
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
      z-index: 90;
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
    .msg { margin-bottom: 4px; word-wrap: break-word; }
    .msg .sender { font-weight: bold; margin-right: 5px; color: #ccc; }
    .msg.system { color: #aaf; font-style: italic; }
    .msg.alert { color: #f88; }
    .msg.party { color: #8f8; }
    .msg.global { color: #fff; }
    
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
      z-index: 90;
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
export class WorldPage implements OnInit, OnDestroy, AfterViewInit {
  private document = inject(DOCUMENT);
  private chatService = inject(ChatService);
  private auth = inject(Auth);
  
  @ViewChild('battleMap') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chatLog') chatLogRef!: ElementRef<HTMLDivElement>;
  
  private ctx!: CanvasRenderingContext2D | null;
  user$ = user(this.auth);
  chatMessages$: Observable<ChatMessage[]>;
  chatInput = '';
  chatError = '';

  party = [
    { name: 'Dwarf', color: '#a52', hp: 80, mp: 20 },
    { name: 'Elf', color: '#5a2', hp: 60, mp: 80 },
    { name: 'Wizard', color: '#25a', hp: 40, mp: 100 },
    { name: 'Rogue', color: '#555', hp: 70, mp: 40 }
  ];

  constructor() {
    this.chatMessages$ = this.chatService.getMessages().pipe(
      tap(() => this.scrollToBottom()),
      catchError(err => {
        console.error('Chat subscription error:', err);
        setTimeout(() => {
          this.chatError = 'Failed to load chat.';
        });
        return of([]);
      })
    );
  }

  ngOnInit(): void {
    this.document.body.classList.add('world-no-header');
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove('world-no-header');
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.scrollToBottom();
  }

  @HostListener('window:resize')
  onResize() {
    this.initCanvas();
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.drawPlaceholder();
  }

  private drawPlaceholder() {
    if (!this.ctx) return;
    const { width, height } = this.canvasRef.nativeElement;

    this.ctx.clearRect(0, 0, width, height);
    
    const gridSize = 50;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;

    for (let x = 0; x < width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2;
      
      this.ctx.fillStyle = Math.random() > 0.5 ? '#00f3ff' : '#ff00ff'; 
      this.ctx.globalAlpha = Math.random() * 0.5 + 0.2;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;
  }

  async sendMessage() {
    if (!this.chatInput.trim()) return;

    const currentUser = this.auth.currentUser;
    // Use a random ID if anonymous to avoid permission errors if we had strict rules
    // But we relaxed rules, so this is just for display
    const senderName = currentUser?.displayName || 'Anonymous';
    const senderId = currentUser?.uid || 'anon-' + Math.random().toString(36).substr(2, 9);

    try {
      await this.chatService.sendMessage(this.chatInput, senderName, senderId);
      this.chatInput = '';
      this.chatError = '';
    } catch (error: any) {
      console.error('Error sending message:', error);
      this.chatError = error.message || 'Could not send message.';
    }
  }

  private scrollToBottom() {
    if (this.chatLogRef) {
      setTimeout(() => {
        this.chatLogRef.nativeElement.scrollTop = this.chatLogRef.nativeElement.scrollHeight;
      }, 100);
    }
  }
}
