import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    private router: Router = inject(Router);

    user$: Observable<User | null> = user(this.auth);

    constructor() { }

    async loginWithGoogle(): Promise<void> {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(this.auth, provider);
            this.router.navigate(['/characters']);
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            await signOut(this.auth);
            this.router.navigate(['/login']);
        } catch (error) {
            console.error('Logout failed', error);
            throw error;
        }
    }

    getCurrentUser(): User | null {
        return this.auth.currentUser;
    }
}
