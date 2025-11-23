import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

const authGuard = () => {
    const auth = inject(Auth);
    const router = inject(Router);
    return user(auth).pipe(
        map(user => {
            if (user) return true;
            router.navigate(['/login']);
            return false;
        })
    );
};

const loginGuard = () => {
    const auth = inject(Auth);
    const router = inject(Router);
    return user(auth).pipe(
        map(user => {
            if (!user) return true;
            router.navigate(['/characters']);
            return false;
        })
    );
};

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
        canActivate: [loginGuard]
    },
    {
        path: 'characters',
        loadComponent: () => import('./pages/character-select/character-select.page').then(m => m.CharacterSelectPage),
        canActivate: [authGuard]
    },
    {
        path: 'world',
        loadComponent: () => import('./pages/world/world.page').then(m => m.WorldPage),
        canActivate: [authGuard]
    }
];
