import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, collection, query, orderBy, limit, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { UserProfile } from '../core/models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private firestore: Firestore = inject(Firestore);

    constructor() { }

    async saveUserProfile(user: User): Promise<void> {
        const userRef = doc(this.firestore, 'users', user.uid);
        const userData: UserProfile = {
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
            throw error;
        }
    }

    async getUserProfile(uid: string): Promise<UserProfile | null> {
        const userRef = doc(this.firestore, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        } else {
            console.log('No such document!');
            return null;
        }
    }

    getRecentUsers(): Observable<UserProfile[]> {
        const usersCol = collection(this.firestore, 'users');
        const q = query(usersCol, orderBy('lastLogin', 'desc'), limit(10));

        return new Observable<UserProfile[]>((subscriber) => {
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const users = snapshot.docs.map(doc => doc.data() as UserProfile);
                subscriber.next(users);
            }, (error) => {
                subscriber.error(error);
            });
            return () => unsubscribe();
        });
    }
}
