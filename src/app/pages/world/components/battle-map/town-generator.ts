export class TownGenerator {
    width: number;
    height: number;
    map: number[][] = [];
    rooms: any[] = []; // Not used in this specific layout but kept for compatibility
    doors: any[] = []; // Not used in this specific layout but kept for compatibility
    entrance: { x: number, y: number, w: number, h: number, center?: { x: number, y: number } } | null = null;

    // Tile Constants
    static readonly COBBLE = 10;
    static readonly ROOF = 11;
    static readonly GRASS = 1; // Reuse existing grass
    static readonly TREE = 12;
    static readonly WATER = 13;
    static readonly DOOR = 14;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    generate() {
        // 1. Create Ground Layout
        const groundData = this.createGroundLayout();

        // 2. Create Deco Layout (Trees)
        const decoData = this.createDecoLayout(groundData);

        // 3. Merge into single map grid
        // We'll use the ground data as base, but maybe mark trees?
        // For the simple grid system in MapService, we need a single layer.
        // Trees are obstacles, so we can mark them.
        // Roofs are obstacles.
        // Water is obstacle.

        this.map = groundData.map((row, y) => row.map((tile, x) => {
            if (decoData[y][x] === TownGenerator.TREE) {
                return TownGenerator.TREE;
            }
            return tile;
        }));

        // Set entrance (e.g., on the main street)
        this.entrance = { x: 20, y: 38, w: 2, h: 2, center: { x: 21, y: 39 } };

        return { map: this.map, rooms: this.rooms, doors: this.doors, entrance: this.entrance };
    }

    createEmptyMap(defaultTile: number): number[][] {
        const rows = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(defaultTile);
            }
            rows.push(row);
        }
        return rows;
    }

    createGroundLayout(): number[][] {
        const data = this.createEmptyMap(TownGenerator.GRASS);

        // Main north-south street
        for (let y = 0; y < this.height; y++) {
            for (let x = 18; x <= 22; x++) {
                if (x >= 0 && x < this.width) data[y][x] = TownGenerator.COBBLE;
            }
        }

        // Cross street east-west
        for (let x = 10; x < 30; x++) {
            for (let y = 16; y <= 20; y++) {
                if (y >= 0 && y < this.height) data[y][x] = TownGenerator.COBBLE;
            }
        }

        // Plaza in middle
        for (let y = 16; y <= 20; y++) {
            for (let x = 18; x <= 22; x++) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) data[y][x] = TownGenerator.COBBLE;
            }
        }

        // Canal/river on the right
        for (let y = 0; y < this.height; y++) {
            for (let x = 32; x < this.width; x++) {
                if (x >= 0 && x < this.width) data[y][x] = TownGenerator.WATER;
            }
        }

        // Row of houses on west edge of main street
        this.makeHouseBlock(data, 8, 10, 16, 14);   // big L-shaped group
        this.makeHouseBlock(data, 8, 18, 15, 23);   // lower left block

        // East side houses
        this.makeHouseBlock(data, 24, 11, 31, 15);
        this.makeHouseBlock(data, 24, 19, 31, 25);

        // Small park to the north of plaza
        for (let y = 10; y <= 14; y++) {
            for (let x = 18; x <= 22; x++) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) data[y][x] = TownGenerator.GRASS;
            }
        }

        // Doors opening onto the street
        this.safeSet(data, 18, 16, TownGenerator.DOOR); // south edge of plaza - wait, coords?
        // Example: data[16][18] = TILE.DOOR;
        // My grid is [y][x]
        this.safeSet(data, 18, 16, TownGenerator.DOOR);
        this.safeSet(data, 22, 16, TownGenerator.DOOR);
        this.safeSet(data, 19, 20, TownGenerator.DOOR);
        this.safeSet(data, 21, 20, TownGenerator.DOOR);

        return data;
    }

    makeHouseBlock(data: number[][], x1: number, y1: number, x2: number, y2: number) {
        // fill region with roof tiles
        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                this.safeSet(data, x, y, TownGenerator.ROOF);
            }
        }
        // carve narrow alleys/courtyards inside for flavor
        for (let y = y1 + 2; y <= y2 - 2; y += 4) {
            for (let x = x1 + 1; x <= x2 - 1; x++) {
                this.safeSet(data, x, y, TownGenerator.COBBLE);
            }
        }

        // Treat this block as a "room"
        this.rooms.push({
            x: x1,
            y: y1,
            w: x2 - x1 + 1,
            h: y2 - y1 + 1,
            center: {
                x: Math.floor((x1 + x2) / 2),
                y: Math.floor((y1 + y2) / 2)
            }
        });
    }

    createDecoLayout(groundData: number[][]): number[][] {
        const data = this.createEmptyMap(0); // 0 = empty

        // Scatter trees in grass areas
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (groundData[y][x] === TownGenerator.GRASS) {
                    if (Math.random() < 0.08) {
                        data[y][x] = TownGenerator.TREE;
                    }
                }
            }
        }

        // A few trees by canal
        for (let y = 8; y < 24; y += 4) {
            if (groundData[y][30] === TownGenerator.GRASS) {
                data[y][30] = TownGenerator.TREE;
            }
        }

        return data;
    }

    safeSet(data: number[][], x: number, y: number, value: number) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
            data[y][x] = value;
        }
    }
}
