import { Injectable, inject, NgZone } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  Timestamp,
  collectionData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Timestamp;
  type: 'global' | 'party' | 'system';
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // Injecting Firestore from AngularFire ensures compatibility with re-exported helpers
  private firestore = inject(Firestore);
  private ngZone = inject(NgZone);

  constructor() {
    console.log('ChatService initialized. Firestore instance:', this.firestore);
  }

  getMessages(): Observable<ChatMessage[]> {
    const chatsCol = collection(this.firestore, 'chats');
    const q = query(chatsCol, orderBy('timestamp', 'asc'), limit(100));
    // Use AngularFire's collectionData to remain inside Angular injection context
    return collectionData(q, { idField: 'id' }) as unknown as Observable<ChatMessage[]>;
  }

  async sendMessage(content: string, senderName: string, senderId: string, type: 'global' | 'party' = 'global'): Promise<void> {
    if (!content.trim()) return;
    
    try {
      const chatsCol = collection(this.firestore, 'chats');
      await addDoc(chatsCol, {
        content,
        senderName,
        senderId,
        timestamp: Timestamp.now(),
        type
      });
    } catch (error) {
      console.error('Error sending message to Firestore:', error);
      throw error;
    }
  }
}
