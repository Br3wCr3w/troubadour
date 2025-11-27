import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, user } from '@angular/fire/auth';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { Observable, Subscription, catchError, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ChatComponent } from './components/chat/chat.component';
import { PartySidebarComponent } from './components/party-sidebar/party-sidebar.component';
import { GameActionsComponent } from './components/game-actions/game-actions.component';
import { PlayerEditPopupComponent } from './components/player-edit-popup/player-edit-popup.component';
import { BattleMapComponent } from './components/battle-map/battle-map.component';

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent, PartySidebarComponent, GameActionsComponent, PlayerEditPopupComponent, BattleMapComponent],
  templateUrl: './world.page.html',
  styleUrls: ['./world.page.css']
})
export class WorldPage implements OnInit, OnDestroy {
  private document = inject(DOCUMENT);
  private chatService = inject(ChatService);
  private auth = inject(Auth);

  user$ = user(this.auth);
  chatMessages$: Observable<ChatMessage[]>;
  chatError = '';

  party = [
    { name: 'Dwarf', color: '#a52', hp: 80, mp: 20 },
    { name: 'Elf', color: '#5a2', hp: 60, mp: 80 },
    { name: 'Wizard', color: '#25a', hp: 40, mp: 100 },
    { name: 'Rogue', color: '#555', hp: 70, mp: 40 }
  ];

  // Player Character State
  playerCharacter = {
    name: 'Me',
    hp: 100,
    maxHp: 100,
    ac: 10,
    image: '' as string | null
  };

  showPlayerPopup = false;

  constructor() {
    this.chatMessages$ = this.chatService.getMessages().pipe(
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

  async onSendMessage(message: string) {
    const currentUser = this.auth.currentUser;
    const senderName = currentUser?.displayName || 'Anonymous';
    const senderId = currentUser?.uid || 'anon-' + Math.random().toString(36).substr(2, 9);

    try {
      await this.chatService.sendMessage(message, senderName, senderId);
      this.chatError = '';
    } catch (error: any) {
      console.error('Error sending message:', error);
      this.chatError = error.message || 'Could not send message.';
    }
  }

  openPlayerPopup() {
    this.showPlayerPopup = true;
  }

  closePlayerPopup() {
    this.showPlayerPopup = false;
  }

  onSavePlayerStats(newStats: any) {
    this.playerCharacter = { ...newStats };
    this.closePlayerPopup();
  }
}
