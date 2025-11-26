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
  templateUrl: './world.page.html',
  styleUrls: ['./world.page.css']
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
