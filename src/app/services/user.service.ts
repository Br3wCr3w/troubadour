import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private firestore: Firestore = inject(Firestore);

    constructor() { }

    async saveUserProfile(user: User) {
        const userRef = doc(this.firestore, 'users', user.uid);
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: new Date()
        };

        try {
            await setDoc(userRef, userData, { merge: true });
            console.log('User profile saved');
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    }

    async getUserProfile(uid: string) {
        const userRef = doc(this.firestore, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            console.log('No such document!');
            return null;
        }
    }
}
