export class ForestGenerator {
    width: number;
    height: number;
    map: number[][] = [];
    // We might not have "rooms" in the traditional sense, but we can define clearings
    rooms: any[] = [];
    doors: any[] = []; // No doors in forest usually, but keeping structure
    entrance: { x: number, y: number, w: number, h: number, center?: { x: number, y: number } } | null = null;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    generate() {
        // 1. Fill map with Grass (1)
        this.map = Array(this.height).fill(0).map(() => Array(this.width).fill(1));
        this.rooms = [];
        this.doors = [];
        this.entrance = null;

        // 2. Place Trees (0)
        // Use a simple cellular automata or just random noise for trees
        // 0 = Tree (Wall), 1 = Grass (Floor)

        // Border of trees
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    this.map[y][x] = 0;
                } else {
                    // Random trees
                    if (Math.random() < 0.15) {
                        this.map[y][x] = 0;
                    }
                }
            }
        }

        // 3. Cellular Automata Smoothing (Optional, to make clumps)
        // Let's do one pass to make tree clumps look nicer
        const newMap = JSON.parse(JSON.stringify(this.map));
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const neighbors = this.countNeighbors(x, y);
                if (this.map[y][x] === 0) {
                    // If tree has few tree neighbors, maybe it dies (becomes grass)
                    if (neighbors < 2) newMap[y][x] = 1;
                } else {
                    // If grass has many tree neighbors, it becomes a tree
                    if (neighbors > 5) newMap[y][x] = 0;
                }
            }
        }
        this.map = newMap;

        // 4. Define "Rooms" (Clearings) for spawn points
        // We'll just pick a few large open areas
        // For simplicity, let's just pick a random spot that is grass and call it the entrance
        let entranceFound = false;
        while (!entranceFound) {
            const x = Math.floor(Math.random() * (this.width - 10)) + 5;
            const y = Math.floor(Math.random() * (this.height - 10)) + 5;

            // Check if 3x3 area is clear
            if (this.isAreaClear(x, y, 3, 3)) {
                this.entrance = {
                    x,
                    y,
                    w: 3,
                    h: 3,
                    center: { x: x + 1, y: y + 1 } // Center of 3x3
                };
                this.rooms.push(this.entrance); // Treat entrance as a room for spawn logic
                entranceFound = true;
            }
        }

        // Add a "Boss Clearing" for the Ogre
        let bossClearingFound = false;
        let attempts = 0;
        while (!bossClearingFound && attempts < 100) {
            const x = Math.floor(Math.random() * (this.width - 10)) + 5;
            const y = Math.floor(Math.random() * (this.height - 10)) + 5;

            // Ensure far from entrance
            const dist = Math.sqrt(Math.pow(x - this.entrance!.x, 2) + Math.pow(y - this.entrance!.y, 2));
            if (dist > 20 && this.isAreaClear(x, y, 4, 4)) {
                this.rooms.push({ x, y, w: 4, h: 4, center: { x: x + 2, y: y + 2 } });
                bossClearingFound = true;
            }
            attempts++;
        }

        // If no boss clearing found, just use a random spot
        if (!bossClearingFound) {
            this.rooms.push({ x: 10, y: 10, w: 1, h: 1, center: { x: 10, y: 10 } });
        }

        return { map: this.map, rooms: this.rooms, doors: this.doors, entrance: this.entrance };
    }

    countNeighbors(x: number, y: number): number {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                if (this.map[y + i][x + j] === 0) count++;
            }
        }
        return count;
    }

    isAreaClear(x: number, y: number, w: number, h: number): boolean {
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                if (this.map[y + i][x + j] === 0) return false;
            }
        }
        return true;
    }
}
