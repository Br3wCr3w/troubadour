import { Routes } from '@angular/router';
import { inject } from '@angular/core';

import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AuthService } from './core/services/auth.service';

const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.user$.pipe(
        map(user => {
            if (user) return true;
            router.navigate(['/login']);
            return false;
        })
    );
};

const loginGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.user$.pipe(
        map(user => {
            if (!user) return true;
            router.navigate(['/world']);
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
