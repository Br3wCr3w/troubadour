export type CombatantType = 'player' | 'monster';

export interface Combatant {
    id: string;
    name: string;
    initiative: number;
    hp: number;
    maxHp: number;
    image: string | null;
    type: CombatantType;
    tokenId: string; // To link back to the map token
}

export interface Encounter {
    id?: string;
    round: number;
    currentTurnIndex: number;
    combatants: Combatant[];
    isActive: boolean;
    createdAt: number;
}
