import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Character } from '../core/models/character.model';

@Injectable({
    providedIn: 'root'
})
export class CharacterService {
    private firestore: Firestore = inject(Firestore);
    private storage: Storage = inject(Storage);

    constructor() { }

    async uploadImage(file: File, uid: string): Promise<string> {
        const timestamp = Date.now();
        const filePath = `character-images/${uid}/${timestamp}_${file.name}`;
        const storageRef = ref(this.storage, filePath);

        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    }

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
