import { Injectable, inject, NgZone } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

    // Subscribe using the same SDK instance for both Query creation and onSnapshot.
    return new Observable<ChatMessage[]>((subscriber) => {
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const messages = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ChatMessage, 'id'>),
          })) as ChatMessage[];
          subscriber.next(messages);
        },
        (err) => subscriber.error(err)
      );
      return () => unsubscribe();
    });
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
