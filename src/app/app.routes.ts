import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { CharacterSelectPage } from './pages/character-select/character-select.page';
import { WorldPage } from './pages/world/world.page';
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
        component: LoginPage,
        canActivate: [loginGuard]
    },
    {
        path: 'characters',
        component: CharacterSelectPage,
        canActivate: [authGuard]
    },
    {
        path: 'world',
        component: WorldPage,
        canActivate: [authGuard]
    }
];
