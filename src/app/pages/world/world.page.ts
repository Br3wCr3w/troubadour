import { Component, OnDestroy, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, user } from '@angular/fire/auth';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { CharacterService } from '../../services/character.service';
import { Observable, catchError, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatComponent } from './components/chat/chat.component';
import { PartySidebarComponent } from './components/party-sidebar/party-sidebar.component';
import { GameActionsComponent } from './components/game-actions/game-actions.component';
import { PlayerEditPopupComponent } from './components/player-edit-popup/player-edit-popup.component';
import { BattleMapComponent } from './components/battle-map/battle-map.component';
import { EncounterTrackerComponent } from './components/encounter-tracker/encounter-tracker.component';
import { EncounterService } from '../../services/encounter.service';
import { UserProfile } from '../../core/models/user.model';
import { Character } from '../../core/models/character.model';

import { EnvironmentSelectionDialogComponent } from './components/environment-selection-dialog/environment-selection-dialog.component';

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent, PartySidebarComponent, GameActionsComponent, PlayerEditPopupComponent, BattleMapComponent, EncounterTrackerComponent, EnvironmentSelectionDialogComponent],
  templateUrl: './world.page.html',
  styleUrls: ['./world.page.css']
})
export class WorldPage implements OnInit, OnDestroy {


  private document = inject(DOCUMENT);
  private chatService = inject(ChatService);
  private userService = inject(UserService);
  private characterService = inject(CharacterService);
  private encounterService = inject(EncounterService);
  private auth = inject(Auth);

  @ViewChild(BattleMapComponent) battleMap!: BattleMapComponent;

  user$ = user(this.auth);
  chatMessages$: Observable<ChatMessage[]>;
  chatError = '';

  party$: Observable<UserProfile[]>;

  // Player Character State
  playerCharacter: Omit<Character, 'ownerId'> = {
    name: 'Me',
    hp: 100,
    maxHp: 100,
    ac: 10,
    image: '' as string | null
  };

  showPlayerPopup = false;
  showEnvironmentDialog = false;

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

    this.party$ = combineLatest([
      this.userService.getRecentUsers(),
      this.user$
    ]).pipe(
      map(([users, currentUser]) => {
        // Filter out the current user from the party list
        return users.filter(u => u.uid !== currentUser?.uid);
      }),
      catchError(err => {
        console.error('Error loading party:', err);
        return of([]);
      })
    );
  }

  ngOnInit(): void {
    this.document.body.classList.add('world-no-header');

    // Load player character from character service
    this.user$.subscribe(async (user) => {
      if (user) {
        const character = await this.characterService.getCharacter(user.uid);
        if (character) {
          // We don't need ownerId in the local state for editing
          const { ownerId, ...charData } = character;
          this.playerCharacter = charData;
        }
      }
    });
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

  async onSavePlayerStats(event: { stats: any, file: File | null }) {
    const { stats, file } = event;
    this.playerCharacter = { ...stats };
    this.closePlayerPopup();

    const currentUser = this.auth.currentUser;
    if (currentUser) {
      try {
        if (file) {
          const imageUrl = await this.characterService.uploadImage(file, currentUser.uid);
          this.playerCharacter.image = imageUrl;
        }
        await this.characterService.saveCharacter(currentUser.uid, this.playerCharacter);
      } catch (error) {
        console.error('Failed to save character:', error);
      }
    }
  }
  async onStartEncounter() {
    const tokens = this.battleMap.getEncounterTokens();
    if (tokens.length === 0) {
      alert('No tokens on the map!');
      return;
    }

    const combatants = tokens.map((t: any) => ({
      id: t.id,
      name: t.name,
      initiative: Math.floor(Math.random() * 20) + 1, // Random initiative for now
      hp: 100, // Default HP
      maxHp: 100,
      image: null, // We need to pass the image URL properly
      type: t.type,
      tokenId: t.tokenId
    }));

    await this.encounterService.createEncounter(combatants);
  }

  onGenerateMap() {
    this.showEnvironmentDialog = true;
  }

  onEnvironmentSelected(type: 'dungeon' | 'forest' | 'town') {
    this.showEnvironmentDialog = false;
    this.battleMap.generateNewMap(type);
  }

  onEnvironmentCancel() {
    this.showEnvironmentDialog = false;
  }

  onTargetPlayer(playerId: string) {
    if (this.battleMap) {
      this.battleMap.centerOnToken(playerId);
    }
  }
}
