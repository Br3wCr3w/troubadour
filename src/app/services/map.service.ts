import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, onSnapshot, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MapData {
    grid: number[][];
    rooms: any[];
    doors: any[];
    tokens: any[];
    createdAt: number;
    width?: number;
    height?: number;
}

interface FirestoreMapData {
    flatGrid: number[];
    width: number;
    height: number;
    rooms: any[];
    doors: any[];
    tokens: any[];
    createdAt: number;
}

@Injectable({
    providedIn: 'root'
})
export class MapService {
    private firestore = inject(Firestore);
    private mapDocRef = doc(this.firestore, 'maps', 'current-map');

    private currentMapSubject = new BehaviorSubject<MapData | null>(null);
    currentMap$ = this.currentMapSubject.asObservable();

    constructor() {
        this.subscribeToMap();
    }

    private subscribeToMap() {
        onSnapshot(this.mapDocRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data() as FirestoreMapData;
                // Reconstruct grid
                const grid: number[][] = [];
                if (data.flatGrid && data.width && data.height) {
                    for (let y = 0; y < data.height; y++) {
                        const row = data.flatGrid.slice(y * data.width, (y + 1) * data.width);
                        grid.push(row);
                    }
                }

                const mapData: MapData = {
                    grid: grid,
                    rooms: data.rooms,
                    doors: data.doors,
                    tokens: data.tokens,
                    createdAt: data.createdAt,
                    width: data.width,
                    height: data.height
                };

                this.currentMapSubject.next(mapData);
            } else {
                this.currentMapSubject.next(null);
            }
        }, (error) => {
            console.error('Error subscribing to map:', error);
        });
    }

    async saveMap(mapData: MapData) {
        try {
            // Flatten grid
            const flatGrid: number[] = [];
            const height = mapData.grid.length;
            const width = height > 0 ? mapData.grid[0].length : 0;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    flatGrid.push(mapData.grid[y][x]);
                }
            }

            const firestoreData: FirestoreMapData = {
                flatGrid,
                width,
                height,
                rooms: mapData.rooms,
                doors: mapData.doors,
                tokens: mapData.tokens,
                createdAt: mapData.createdAt
            };

            await setDoc(this.mapDocRef, firestoreData);
        } catch (error) {
            console.error('Error saving map:', error);
            throw error;
        }
    }

    async updateTokens(tokens: any[]) {
        try {
            await setDoc(this.mapDocRef, { tokens }, { merge: true });
        } catch (error) {
            console.error('Error updating tokens:', error);
        }
    }
}
