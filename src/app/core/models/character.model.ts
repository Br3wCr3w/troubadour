export interface Character {
    ownerId: string;
    name: string;
    hp: number;
    maxHp: number;
    ac: number;
    image: string | null;
    size?: 'medium' | 'large' | 'huge' | 'gargantuan' | 'colossal';
}
