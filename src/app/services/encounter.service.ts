import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, query, where, onSnapshot, orderBy, limit } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { Encounter, Combatant } from '../core/models/encounter.model';

@Injectable({
    providedIn: 'root'
})
export class EncounterService {
    private firestore = inject(Firestore);
    private encountersCollection = collection(this.firestore, 'encounters');

    private activeEncounterSubject = new BehaviorSubject<Encounter | null>(null);
    activeEncounter$ = this.activeEncounterSubject.asObservable();

    constructor() {
        this.subscribeToActiveEncounter();
    }

    private subscribeToActiveEncounter() {
        // Query for the most recent active encounter
        const q = query(
            this.encountersCollection,
            where('isActive', '==', true),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const docData = snapshot.docs[0].data() as Encounter;
                const encounter = { ...docData, id: snapshot.docs[0].id };
                this.activeEncounterSubject.next(encounter);
            } else {
                this.activeEncounterSubject.next(null);
            }
        }, (error) => {
            console.error('Error subscribing to active encounter:', error);
        });
    }

    async createEncounter(combatants: Combatant[]) {
        // Sort by initiative descending
        const sortedCombatants = [...combatants].sort((a, b) => b.initiative - a.initiative);

        const newEncounter: Encounter = {
            round: 1,
            currentTurnIndex: 0,
            combatants: sortedCombatants,
            isActive: true,
            createdAt: Date.now()
        };

        // If there's already an active encounter, maybe we should close it?
        // For now, let's just create a new one, and the query will pick up the most recent.
        // Ideally, we'd close the old one first.
        const current = this.activeEncounterSubject.value;
        if (current && current.id) {
            await this.endEncounter(current.id);
        }

        return addDoc(this.encountersCollection, newEncounter);
    }

    async nextTurn() {
        const current = this.activeEncounterSubject.value;
        if (!current || !current.id) return;

        let nextIndex = current.currentTurnIndex + 1;
        let nextRound = current.round;

        if (nextIndex >= current.combatants.length) {
            nextIndex = 0;
            nextRound++;
        }

        const encounterRef = doc(this.firestore, 'encounters', current.id);
        await updateDoc(encounterRef, {
            currentTurnIndex: nextIndex,
            round: nextRound
        });
    }

    async endEncounter(encounterId?: string) {
        const id = encounterId || this.activeEncounterSubject.value?.id;
        if (!id) return;

        const encounterRef = doc(this.firestore, 'encounters', id);
        await updateDoc(encounterRef, {
            isActive: false
        });
    }

    async updateCombatant(encounterId: string, combatant: Combatant) {
        const current = this.activeEncounterSubject.value;
        if (!current || current.id !== encounterId) return;

        const updatedCombatants = current.combatants.map(c =>
            c.id === combatant.id ? combatant : c
        );

        const encounterRef = doc(this.firestore, 'encounters', encounterId);
        await updateDoc(encounterRef, {
            combatants: updatedCombatants
        });
    }
}
