import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Character } from '../core/models/character.model';

@Injectable({
    providedIn: 'root'
})
export class CharacterService {
    private firestore: Firestore = inject(Firestore);

    constructor() { }

    async saveCharacter(uid: string, character: Omit<Character, 'ownerId'>): Promise<void> {
        const charRef = doc(this.firestore, 'characters', uid);
        const charData: Character = {
            ...character,
            ownerId: uid
        };

        try {
            await setDoc(charRef, charData, { merge: true });
            console.log('Character saved');
        } catch (error) {
            console.error('Error saving character:', error);
            throw error;
        }
    }

    async getCharacter(uid: string): Promise<Character | null> {
        const charRef = doc(this.firestore, 'characters', uid);
        const charSnap = await getDoc(charRef);

        if (charSnap.exists()) {
            return charSnap.data() as Character;
        } else {
            return null;
        }
    }
}
