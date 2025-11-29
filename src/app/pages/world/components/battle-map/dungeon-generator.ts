export class DungeonGenerator {
    width: number;
    height: number;
    map: number[][] = [];
    rooms: any[] = [];
    doors: any[] = [];
    entrance: { x: number, y: number, w: number, h: number } | null = null;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    generate() {
        // 1. Fill map with walls
        this.map = Array(this.height).fill(0).map(() => Array(this.width).fill(0));
        this.rooms = [];
        this.doors = [];
        this.entrance = null;

        // 2. Try to place rooms
        const MAX_ROOMS = 25;
        const MIN_SIZE = 6;
        const MAX_SIZE = 12;

        for (let i = 0; i < 100; i++) {
            if (this.rooms.length >= MAX_ROOMS) break;

            const w = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;
            const h = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;
            const x = Math.floor(Math.random() * (this.width - w - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - h - 2)) + 1;

            const newRoom = { x, y, w, h, center: { x: x + Math.floor(w / 2), y: y + Math.floor(h / 2) } };

            if (!this.roomOverlaps(newRoom)) {
                this.createRoom(newRoom);
                this.rooms.push(newRoom);
                if (!this.entrance) {
                    this.entrance = newRoom;
                }
            }
        }

        // 3. Connect rooms with corridors
        for (let i = 1; i < this.rooms.length; i++) {
            const prev = this.rooms[i - 1].center;
            const curr = this.rooms[i].center;

            if (Math.random() < 0.5) {
                this.createHCorridor(prev.x, curr.x, prev.y);
                this.createVCorridor(prev.y, curr.y, curr.x);
            } else {
                this.createVCorridor(prev.y, curr.y, prev.x);
                this.createHCorridor(prev.x, curr.x, curr.y);
            }
        }

        // 4. Find Door Locations
        for (let room of this.rooms) {
            this.checkRoomPerimeterForDoors(room);
        }

        return { map: this.map, rooms: this.rooms, doors: this.doors, entrance: this.entrance };
    }

    checkRoomPerimeterForDoors(room: any) {
        // Top and Bottom edges
        for (let x = room.x; x < room.x + room.w; x++) {
            this.checkDoorCandidate(x, room.y - 1); // Top
            this.checkDoorCandidate(x, room.y + room.h); // Bottom
        }
        // Left and Right edges
        for (let y = room.y; y < room.y + room.h; y++) {
            this.checkDoorCandidate(room.x - 1, y); // Left
            this.checkDoorCandidate(room.x + room.w, y); // Right
        }
    }

    checkDoorCandidate(x: number, y: number) {
        // Bounds check
        if (x < 1 || x >= this.width - 1 || y < 1 || y >= this.height - 1) return;

        // A door must be a floor tile
        if (this.map[y][x] !== 1) return;

        // Check if it's already a door
        if (this.doors.some(d => d.x === x && d.y === y)) return;

        // Rule: A door must be flanked by walls on one axis and floors on the other.
        const left = this.map[y][x - 1];
        const right = this.map[y][x + 1];
        const top = this.map[y - 1][x];
        const bottom = this.map[y + 1][x];

        // Horizontal Door: Walls above and below, Floors left and right
        if (top === 0 && bottom === 0 && left === 1 && right === 1) {
            this.doors.push({ x, y, rotation: 0, isOpen: false }); // 0 rads = horizontal sprite
        }
        // Vertical Door: Walls left and right, Floors top and bottom
        else if (left === 0 && right === 0 && top === 1 && bottom === 1) {
            this.doors.push({ x, y, rotation: Math.PI / 2, isOpen: false }); // 90 degrees
        }
    }

    roomOverlaps(room: any) {
        for (let r of this.rooms) {
            if (room.x <= r.x + r.w + 1 && room.x + room.w + 1 >= r.x &&
                room.y <= r.y + r.h + 1 && room.y + room.h + 1 >= r.y) {
                return true;
            }
        }
        return false;
    }

    createRoom(room: any) {
        for (let y = room.y; y < room.y + room.h; y++) {
            for (let x = room.x; x < room.x + room.w; x++) {
                this.map[y][x] = 1;
            }
        }
    }

    createHCorridor(x1: number, x2: number, y: number) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            this.map[y][x] = 1;
        }
    }

    createVCorridor(y1: number, y2: number, x: number) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            this.map[y][x] = 1;
        }
    }
}
