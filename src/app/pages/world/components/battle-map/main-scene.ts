import Phaser from 'phaser';
import { MapService, MapData } from '../../../../services/map.service';
import { DungeonGenerator } from './dungeon-generator';

export class MainScene extends Phaser.Scene {
    private tileSize = 32;
    private mapWidth = 60;
    private mapHeight = 40;
    private selectedToken: Phaser.GameObjects.Container | Phaser.GameObjects.Sprite | null = null;
    private selectionRing!: Phaser.GameObjects.Image;
    private wallsGroup!: Phaser.GameObjects.Group;
    private doorsGroup!: Phaser.GameObjects.Group;
    private tilemap!: Phaser.Tilemaps.Tilemap;
    private floorLayer!: Phaser.Tilemaps.TilemapLayer;
    // private elf!: Phaser.GameObjects.Sprite; // Removed
    private monsterTokens: Phaser.GameObjects.Sprite[] = [];
    private isDragging = false;
    private playerTokens: Phaser.GameObjects.Sprite[] = [];
    private lastMapCreatedAt: number = 0;

    // Visibility System
    private objectMap: any[][] = []; // Stores { walls: [], floor: [], doors: [], etc } at each x,y
    private visibleTiles: boolean[][] = [];
    private entrance: { x: number, y: number, w: number, h: number } | null = null;

    constructor(private mapService: MapService) {
        super({ key: 'MainScene' });
    }

    preload() {
        // --- 1. Realistic Floor Texture ---
        const floorG = this.make.graphics({ x: 0, y: 0 });
        floorG.fillStyle(0x222222);
        floorG.fillRect(0, 0, 32, 32);
        for (let i = 0; i < 40; i++) {
            floorG.fillStyle(Math.random() > 0.5 ? 0x2a2a2a : 0x1a1a1a, 0.8);
            floorG.fillRect(Math.random() * 32, Math.random() * 32, 2, 2);
        }
        floorG.lineStyle(1, 0x111111, 0.3);
        floorG.strokeRect(0, 0, 32, 32);
        floorG.generateTexture('floor', 32, 32);
        floorG.destroy();

        // --- 2. 3D Wall Texture ---
        const wallG = this.make.graphics({ x: 0, y: 0 });
        // Top
        wallG.fillStyle(0x555555);
        wallG.fillRect(0, 0, 32, 14);
        for (let i = 0; i < 10; i++) {
            wallG.fillStyle(0x666666, 0.5);
            wallG.fillRect(Math.random() * 32, Math.random() * 14, 2, 2);
        }
        wallG.fillStyle(0x777777);
        wallG.fillRect(0, 0, 32, 2);
        // Front
        wallG.fillStyle(0x333333);
        wallG.fillRect(0, 14, 32, 18);
        wallG.fillStyle(0x111111);
        wallG.fillRect(0, 14, 32, 2); // Shadow lip
        // Details
        wallG.fillStyle(0x444444);
        wallG.fillRect(4, 18, 8, 4);
        wallG.fillRect(18, 24, 10, 4);
        wallG.fillRect(2, 26, 6, 4);
        wallG.generateTexture('wall', 32, 32);
        wallG.destroy();

        // --- 3. Shadow Texture ---
        const shadowG = this.make.graphics({ x: 0, y: 0 });
        shadowG.fillStyle(0x000000, 0.5);
        shadowG.fillRect(0, 0, 32, 16);
        shadowG.generateTexture('shadow', 32, 16);
        shadowG.destroy();

        // --- 4. Entities (Elf & Ogre) ---
        // Elf - REMOVED
        /*
        const elfG = this.make.graphics({ x: 0, y: 0 });
        elfG.fillStyle(0x228822);
        elfG.fillCircle(16, 16, 12);
        elfG.lineStyle(2, 0xaaffaa);
        elfG.strokeCircle(16, 16, 12);
        elfG.fillStyle(0xffffff);
        elfG.fillRect(10, 12, 4, 4);
        elfG.fillRect(18, 12, 4, 4);
        elfG.generateTexture('elf', 32, 32);
        elfG.destroy();
        */

        // Ogre
        const ogreG = this.make.graphics({ x: 0, y: 0 });
        ogreG.fillStyle(0x882222);
        ogreG.fillRoundedRect(4, 4, 56, 56, 8);
        ogreG.lineStyle(4, 0x441111);
        ogreG.strokeRoundedRect(4, 4, 56, 56, 8);
        ogreG.fillStyle(0x000000);
        ogreG.fillRect(16, 20, 8, 8);
        ogreG.fillRect(40, 20, 8, 8);
        ogreG.fillStyle(0xffffff);
        ogreG.fillRect(20, 44, 4, 8);
        ogreG.fillRect(40, 44, 4, 8);
        ogreG.generateTexture('ogre', 64, 64);
        ogreG.destroy();

        // --- 5. Selection Ring ---
        const ringG = this.make.graphics({ x: 0, y: 0 });
        ringG.lineStyle(3, 0x00ff00, 0.8);
        ringG.strokeCircle(16, 16, 20);
        ringG.generateTexture('selectRing', 32, 32);
        ringG.destroy();

        // --- 6. Torch ---
        const torchG = this.make.graphics({ x: 0, y: 0 });
        torchG.fillStyle(0x8B4513);
        torchG.fillRect(14, 10, 4, 10);
        torchG.fillStyle(0xFF4500);
        torchG.fillCircle(16, 8, 4);
        torchG.fillStyle(0xFFD700, 0.5);
        torchG.fillCircle(16, 8, 6);
        torchG.generateTexture('torch', 32, 32);
        torchG.destroy();

        // --- 7. Door Texture ---
        const doorG = this.make.graphics({ x: 0, y: 0 });
        // Door Frame/Base
        doorG.fillStyle(0x5C4033); // Dark Wood
        doorG.fillRect(0, 0, 32, 32);
        // Planks
        doorG.lineStyle(2, 0x3e2b22);
        doorG.beginPath();
        doorG.moveTo(10, 0); doorG.lineTo(10, 32);
        doorG.moveTo(22, 0); doorG.lineTo(22, 32);
        doorG.strokePath();
        // Iron Bands
        doorG.fillStyle(0x555555); // Iron
        doorG.fillRect(0, 6, 32, 4);
        doorG.fillRect(0, 22, 32, 4);
        // Rivets
        doorG.fillStyle(0x888888);
        doorG.fillCircle(4, 8, 1); doorG.fillCircle(28, 8, 1);
        doorG.fillCircle(4, 24, 1); doorG.fillCircle(28, 24, 1);
        // Knob
        doorG.fillStyle(0xFFD700);
        doorG.fillCircle(26, 16, 3);
        doorG.generateTexture('door', 32, 32);
        doorG.destroy();
    }

    create() {
        // Inputs
        this.input.on('pointermove', this.handleCameraPan, this);
        this.input.on('wheel', this.handleCameraZoom, this);

        // Subscribe to map updates from Firestore
        this.mapService.currentMap$.subscribe(mapData => {
            if (mapData) {
                this.renderMap(mapData);
            }
        });

        // Selection State
        this.selectedToken = null;
        this.selectionRing = this.add.image(0, 0, 'selectRing').setVisible(false).setDepth(100);

        this.tweens.add({
            targets: this.selectionRing,
            alpha: 0.2,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        this.wallsGroup = this.add.group();
        this.doorsGroup = this.add.group();

        // Initialize object map
        this.objectMap = Array(this.mapHeight).fill(null).map(() => Array(this.mapWidth).fill(null).map(() => ({
            walls: [],
            floor: null,
            door: null,
            shadows: [],
            torches: []
        })));
        this.visibleTiles = Array(this.mapHeight).fill(false).map(() => Array(this.mapWidth).fill(false));
    }

    generateNewMap(environmentType: string = 'dungeon') {
        console.log('Generating map for environment:', environmentType);
        const generator = new DungeonGenerator(this.mapWidth, this.mapHeight);
        const dungeonData = generator.generate();

        // Create initial map data structure
        const mapData: MapData = {
            grid: dungeonData.map,
            rooms: dungeonData.rooms,
            doors: dungeonData.doors,
            tokens: [], // Initial tokens will be added during render or separately
            createdAt: Date.now(),
            entrance: dungeonData.entrance || undefined
        };

        this.mapService.saveMap(mapData);
    }

    saveTokenState() {
        const tokens = this.getEncounterTokens();
        this.mapService.updateTokens(tokens);
    }

    saveDoorState() {
        const doors: any[] = [];
        this.doorsGroup.getChildren().forEach((d: any) => {
            // Find grid position
            const x = Math.floor((d.x - 16) / 32);
            const y = Math.floor((d.y - 16) / 32);
            doors.push({
                x,
                y,
                rotation: d.getData('baseRotation'),
                isOpen: d.getData('isOpen')
            });
        });
        this.mapService.updateDoors(doors);
    }

    renderMap(dungeonData: MapData) {
        // Only re-render static elements if the map has actually changed (new generation)
        if (this.lastMapCreatedAt !== dungeonData.createdAt) {
            this.renderStaticMap(dungeonData);
            this.lastMapCreatedAt = dungeonData.createdAt;
        }

        // Always render tokens as they might have moved
        this.renderTokens(dungeonData);
    }

    renderStaticMap(dungeonData: MapData) {
        this.clearStaticMap();

        // Reset object map
        this.objectMap = Array(this.mapHeight).fill(null).map(() => Array(this.mapWidth).fill(null).map(() => ({
            walls: [],
            floor: null,
            door: null,
            shadows: [],
            torches: []
        })));

        const rooms = dungeonData.rooms;
        const grid = dungeonData.grid;
        const doors = dungeonData.doors;
        this.entrance = dungeonData.entrance || null;

        // 1. Render Floor (Layer 0)
        this.tilemap = this.make.tilemap({ tileWidth: 32, tileHeight: 32, width: this.mapWidth, height: this.mapHeight });
        const tileset = this.tilemap.addTilesetImage('floor', undefined, 32, 32);
        if (tileset) {
            const layer = this.tilemap.createBlankLayer('Floor', tileset);
            if (layer) {
                this.floorLayer = layer.setDepth(0);
                for (let y = 0; y < this.mapHeight; y++) {
                    for (let x = 0; x < this.mapWidth; x++) {
                        if (grid[y][x] === 1) {
                            const tile = this.floorLayer.putTileAt(0, x, y);
                            if (Math.random() > 0.9) tile.tint = 0xdddddd;
                            this.objectMap[y][x].floor = tile;
                        }
                    }
                }
            }
        }

        // 2. Render Walls, Shadows & Torches (Layer 1)
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (grid[y][x] === 0) {
                    if (this.hasAdjacentFloor(grid, x, y)) {
                        const wall = this.add.image(x * 32 + 16, y * 32 + 16, 'wall').setDepth(10);
                        this.wallsGroup.add(wall);
                        this.objectMap[y][x].walls.push(wall);

                        // Shadow
                        if (y + 1 < this.mapHeight && grid[y + 1][x] === 1) {
                            const shadow = this.add.image(x * 32 + 16, (y + 1) * 32 + 8, 'shadow').setDepth(5);
                            this.wallsGroup.add(shadow);
                            // Add shadow to the floor tile below it for visibility toggling
                            this.objectMap[y + 1][x].shadows.push(shadow);
                        }

                        // Torch
                        if (Math.random() > 0.95) {
                            const torch = this.add.image(x * 32 + 16, y * 32 + 16, 'torch').setDepth(11);
                            const light = this.add.circle(x * 32 + 16, y * 32 + 16, 60, 0xFFAA00, 0.1).setDepth(11);
                            light.setBlendMode(Phaser.BlendModes.ADD);
                            this.wallsGroup.add(torch);
                            this.wallsGroup.add(light);
                            this.objectMap[y][x].torches.push(torch);
                            this.objectMap[y][x].torches.push(light);
                        }
                    }
                }
            }
        }

        // 3. Render Doors (Layer 2)
        for (let d of doors) {
            this.createDoor(d.x, d.y, d.rotation, d.isOpen);
        }
    }

    renderTokens(dungeonData: MapData) {
        this.clearTokens();

        // 4. Place Tokens
        // If we have saved tokens, use them. Otherwise, spawn defaults.
        if (dungeonData.tokens && dungeonData.tokens.length > 0) {
            dungeonData.tokens.forEach((t: any) => {
                // Check if it's a player or monster
                if (t.type === 'player') {
                    // Use spawnPlayerToken to handle dynamic image loading and masking
                    // Pass false to shouldSave to avoid infinite loops during render
                    this.spawnPlayerToken(t.x, t.y, t.image, t.name, t.size || 'medium', false);
                } else if (t.type === 'monster') {
                    const token = this.createToken(t.x, t.y, t.image || 'ogre', t.name, t.size || 'medium');
                    // Store original image for persistence if needed, though for monsters we might just use key
                    token.setData('imageUrl', t.image);
                    this.monsterTokens.push(token);
                }
            });
        } else {
            // Default Spawns (only if no tokens saved)
            // We need rooms for default spawn, but rooms are in dungeonData
            // If this is a fresh map, we should have rooms.
            if (dungeonData.rooms && dungeonData.rooms.length > 0) {
                const startRoom = dungeonData.rooms[0];
                const elfX = (startRoom.center.x * 32) + 16;
                const elfY = (startRoom.center.y * 32) + 16;

                const endRoom = dungeonData.rooms[dungeonData.rooms.length - 1];
                const ogreX = (endRoom.center.x * 32);
                const ogreY = (endRoom.center.y * 32);

                const ogre = this.createToken(ogreX + 32, ogreY + 32, 'ogre', 'Ogre', 'large');
                this.monsterTokens.push(ogre);

                this.cameras.main.centerOn(elfX, elfY);

                // Save initial state including the Ogre
                this.saveTokenState();
            }
        }

        // Recalculate visibility after placing tokens
        this.calculateVisibility();
    }


    createDoor(x: number, y: number, rotation: number, isOpen: boolean = false) {
        const door = this.add.sprite(x * 32 + 16, y * 32 + 16, 'door');
        this.doorsGroup.add(door);
        door.setRotation(rotation);
        door.setDepth(15); // Higher than walls, lower than tokens
        door.setInteractive();

        // Register door in object map
        this.objectMap[y][x].door = door;

        // State
        door.setData('isOpen', isOpen);
        door.setData('baseRotation', rotation);

        // Initial visual state
        if (isOpen) {
            door.setRotation(rotation + (Math.PI / 2));
            door.setAlpha(0.5);
        }

        door.on('pointerdown', () => {
            const currentIsOpen = door.getData('isOpen');
            const baseRot = door.getData('baseRotation');

            if (!currentIsOpen) {
                // Open: Rotate 90 degrees more and fade slightly
                this.tweens.add({
                    targets: door,
                    rotation: baseRot + (Math.PI / 2),
                    alpha: 0.5,
                    duration: 200
                });
                door.setData('isOpen', true);
                this.calculateVisibility();
                this.saveDoorState();
            } else {
                // Close: Return to base state
                this.tweens.add({
                    targets: door,
                    rotation: baseRot,
                    alpha: 1,
                    duration: 200
                });
                door.setData('isOpen', false);
                this.calculateVisibility();
                this.saveDoorState();
            }
        });
    }

    hasAdjacentFloor(grid: number[][], x: number, y: number) {
        const dirs = [
            [0, 1], [0, -1], [1, 0], [-1, 0],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        for (let d of dirs) {
            let ny = y + d[0];
            let nx = x + d[1];
            if (ny >= 0 && ny < this.mapHeight && nx >= 0 && nx < this.mapWidth) {
                if (grid[ny][nx] === 1) return true;
            }
        }
        return false;
    }

    getSizeInTiles(size: string): number {
        switch (size) {
            case 'medium': return 1;
            case 'large': return 2;
            case 'huge': return 3;
            case 'gargantuan': return 4;
            case 'colossal': return 5;
            default: return 1;
        }
    }

    getSnappingOffset(sizeInTiles: number): number {
        // If size is odd (1, 3, 5), center is in middle of tile (+16)
        // If size is even (2, 4), center is on grid line (multiple of 32)
        return sizeInTiles % 2 === 1 ? 16 : 0;
    }

    private spawnPlayerToken(worldX: number, worldY: number, imageUrl: string, name: string, size: string, shouldSave: boolean = true) {
        const sizeInTiles = this.getSizeInTiles(size);
        const offset = this.getSnappingOffset(sizeInTiles);

        // Snap to grid based on size
        const gridX = Math.floor((worldX - offset) / 32 + 0.5) * 32 + offset;
        const gridY = Math.floor((worldY - offset) / 32 + 0.5) * 32 + offset;

        const key = `player-${name}`;

        const createAndTrackToken = () => {
            // Check for existing token
            const existingTokenIndex = this.playerTokens.findIndex(t => t.getData('name') === name);
            if (existingTokenIndex !== -1) {
                const oldToken = this.playerTokens[existingTokenIndex];
                if (this.selectedToken === oldToken) {
                    this.selectedToken = null;
                    this.selectionRing.setVisible(false);
                }
                oldToken.destroy();
                this.playerTokens.splice(existingTokenIndex, 1);
            }

            const token = this.createToken(gridX, gridY, key, name, size);
            // Store the original image URL for persistence
            token.setData('imageUrl', imageUrl);
            this.playerTokens.push(token);

            // Scale token to fit size
            const pixelSize = sizeInTiles * 32;
            token.setDisplaySize(pixelSize, pixelSize);

            // Make it circular using a mask
            const radius = pixelSize / 2;
            const maskShape = this.make.graphics({}).fillCircle(gridX, gridY, radius);
            const mask = maskShape.createGeometryMask();
            token.setMask(mask);

            // We need to update the mask position when dragging
            token.on('drag', () => {
                maskShape.clear();
                maskShape.fillCircle(token.x, token.y, radius);
            });
            token.on('dragend', () => {
                maskShape.clear();
                maskShape.fillCircle(token.x, token.y, radius);
            });

            // Save state after spawning only if requested
            if (shouldSave) {
                this.saveTokenState();
            }

            // Recalculate visibility to ensure map is revealed around the new token
            // This is critical for async image loading where the initial renderTokens pass
            // might have finished before this token was added.
            this.calculateVisibility();
        };

        // If texture exists, create token immediately
        if (this.textures.exists(key)) {
            createAndTrackToken();
        } else {
            // Load texture dynamically
            this.load.image(key, imageUrl);
            this.load.once('complete', () => {
                createAndTrackToken();
            });
            this.load.start();
        }
    }

    createToken(x: number, y: number, texture: string, name: string, size: string = 'medium') {
        const token = this.add.sprite(x, y, texture).setInteractive();
        token.setData('name', name);
        token.setData('size', size);
        token.setDepth(20);

        // Dragging Logic
        this.input.setDraggable(token);

        token.on('pointerdown', () => {
            this.selectToken(token);
        });

        token.on('dragstart', () => {
            this.isDragging = true;
        });

        token.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            token.x = dragX;
            token.y = dragY;
            if (this.selectedToken === token) {
                this.selectionRing.setPosition(token.x, token.y);
            }
        });

        token.on('dragend', () => {
            this.isDragging = false;

            const sizeInTiles = this.getSizeInTiles(token.getData('size'));
            const offset = this.getSnappingOffset(sizeInTiles);

            // Snap to grid
            // We want the center to be at (N * 32) + offset
            token.x = Math.floor((token.x - offset) / 32 + 0.5) * 32 + offset;
            token.y = Math.floor((token.y - offset) / 32 + 0.5) * 32 + offset;

            if (this.selectedToken === token) {
                this.selectionRing.setPosition(token.x, token.y);
            }

            // Save state after move
            this.saveTokenState();

            // Update visibility
            this.calculateVisibility();
        });

        return token;
    }

    addPlayerToken(x: number, y: number, imageUrl: string, name: string, size: string = 'medium') {
        // Convert screen coordinates to world coordinates
        const worldPoint = this.cameras.main.getWorldPoint(x, y);
        this.spawnPlayerToken(worldPoint.x, worldPoint.y, imageUrl, name, size, true);
    }

    resetPointer() {
        this.input.activePointer.isDown = false;
        this.input.activePointer.buttons = 0;
    }

    selectToken(token: Phaser.GameObjects.Sprite) {
        this.selectedToken = token;
        this.selectionRing.setVisible(true);
        this.selectionRing.setPosition(token.x, token.y);

        const size = token.getData('size') || 'medium';
        const sizeInTiles = this.getSizeInTiles(size);
        const pixelSize = sizeInTiles * 32;

        // Scale ring to be slightly larger than the token
        const scale = (pixelSize / 32) * 1.2;
        this.selectionRing.setScale(scale);
    }

    handleCameraPan(pointer: Phaser.Input.Pointer) {
        if (pointer.isDown && !this.isDragging) {
            const cam = this.cameras.main;
            cam.scrollX -= (pointer.x - pointer.prevPosition.x) / cam.zoom;
            cam.scrollY -= (pointer.y - pointer.prevPosition.y) / cam.zoom;
        }
    }

    handleCameraZoom(pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number, deltaZ: number) {
        const cam = this.cameras.main;
        if (deltaY > 0) {
            cam.zoom = Math.max(0.5, cam.zoom - 0.1);
        } else {
            cam.zoom = Math.min(2, cam.zoom + 0.1);
        }
    }

    public getEncounterTokens(): any[] {
        const tokens: any[] = [];

        // Player Tokens
        this.playerTokens.forEach(t => {
            tokens.push({
                name: t.getData('name'),
                image: t.getData('imageUrl'), // Use the stored original URL
                id: t.getData('name'),
                type: 'player',
                tokenId: t.getData('name'),
                x: t.x,
                y: t.y,
                size: t.getData('size')
            });
        });

        // Monster Tokens
        this.monsterTokens.forEach(t => {
            tokens.push({
                name: t.getData('name'),
                image: t.getData('imageUrl') || (t.texture.key === 'ogre' ? null : t.texture.key),
                id: t.getData('name'), // Unique ID might be needed if multiple same monsters
                type: 'monster',
                tokenId: t.getData('name'),
                x: t.x,
                y: t.y,
                size: t.getData('size')
            });
        });

        return tokens;
    }

    clearStaticMap() {
        // Clear Tilemap
        if (this.floorLayer) {
            this.floorLayer.destroy();
        }
        if (this.tilemap) {
            this.tilemap.destroy();
        }

        // Clear Groups
        this.wallsGroup.clear(true, true);
        this.doorsGroup.clear(true, true);
    }

    clearTokens() {
        // Clear Tokens
        this.playerTokens.forEach(t => t.destroy());
        this.playerTokens = [];

        this.monsterTokens.forEach(t => t.destroy());
        this.monsterTokens = [];
    }

    clearMap() {
        this.clearStaticMap();
        this.clearTokens();
    }

    calculateVisibility() {
        // 1. Reset visibility
        this.visibleTiles = Array(this.mapHeight).fill(false).map(() => Array(this.mapWidth).fill(false));

        // 1a. Reveal Entrance
        if (this.entrance) {
            for (let y = this.entrance.y; y < this.entrance.y + this.entrance.h; y++) {
                for (let x = this.entrance.x; x < this.entrance.x + this.entrance.w; x++) {
                    if (y >= 0 && y < this.mapHeight && x >= 0 && x < this.mapWidth) {
                        this.visibleTiles[y][x] = true;
                    }
                }
            }
        }

        // 2. BFS from each player token
        const queue: { x: number, y: number }[] = [];
        const visited = new Set<string>();

        this.playerTokens.forEach(token => {
            // Convert world coords to grid coords
            const gx = Math.floor(token.x / 32);
            const gy = Math.floor(token.y / 32);

            if (gx >= 0 && gx < this.mapWidth && gy >= 0 && gy < this.mapHeight) {
                queue.push({ x: gx, y: gy });
                visited.add(`${gx},${gy}`);
                this.visibleTiles[gy][gx] = true;
            }
        });

        while (queue.length > 0) {
            const { x, y } = queue.shift()!;

            // Check neighbors
            const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

            for (let d of dirs) {
                const nx = x + d[0];
                const ny = y + d[1];

                if (nx >= 0 && nx < this.mapWidth && ny >= 0 && ny < this.mapHeight) {
                    const key = `${nx},${ny}`;
                    if (!visited.has(key)) {
                        // Logic:
                        // If current tile is a WALL or CLOSED DOOR, we can see it, but cannot see PAST it.
                        // If current tile is FLOOR or OPEN DOOR, we can see it AND see past it.

                        // However, we are processing the NEIGHBOR (nx, ny) from (x, y).
                        // So if (x,y) allows light to pass, we can see (nx, ny).

                        // Check if the source tile (x,y) blocks vision
                        let blocksVision = false;
                        const cell = this.objectMap[y][x];

                        // Walls block vision
                        if (cell.walls.length > 0) blocksVision = true;

                        // Closed doors block vision
                        if (cell.door && !cell.door.getData('isOpen')) blocksVision = true;

                        // If source doesn't block vision, we can see the neighbor
                        if (!blocksVision) {
                            this.visibleTiles[ny][nx] = true;
                            visited.add(key);

                            // Determine if we should continue propagating FROM the neighbor
                            // We propagate if the neighbor itself doesn't block vision

                            const neighborCell = this.objectMap[ny][nx];
                            let neighborIsBlocker = false;
                            if (neighborCell.walls.length > 0) neighborIsBlocker = true;
                            if (neighborCell.door && !neighborCell.door.getData('isOpen')) neighborIsBlocker = true;

                            if (!neighborIsBlocker) {
                                queue.push({ x: nx, y: ny });
                            }
                        }
                    }
                }
            }
        }

        // 3. Apply visibility to scene objects
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const isVisible = this.visibleTiles[y][x];
                const alpha = isVisible ? 1 : 0;

                const cell = this.objectMap[y][x];

                // Floor
                if (cell.floor) cell.floor.alpha = alpha;

                // Walls
                cell.walls.forEach((w: any) => w.setAlpha(alpha));

                // Shadows
                cell.shadows.forEach((s: any) => s.setAlpha(alpha));

                // Torches
                cell.torches.forEach((t: any) => t.setAlpha(alpha));

                // Door
                if (cell.door) cell.door.setAlpha(isVisible ? (cell.door.getData('isOpen') ? 0.5 : 1) : 0);
            }
        }

        // 4. Hide/Show Monsters based on tile visibility
        this.monsterTokens.forEach(token => {
            const gx = Math.floor(token.x / 32);
            const gy = Math.floor(token.y / 32);
            if (gx >= 0 && gx < this.mapWidth && gy >= 0 && gy < this.mapHeight) {
                token.setVisible(this.visibleTiles[gy][gx]);
            }
        });
    }

    isTileVisible(worldX: number, worldY: number): boolean {
        const gx = Math.floor(worldX / 32);
        const gy = Math.floor(worldY / 32);

        if (gx >= 0 && gx < this.mapWidth && gy >= 0 && gy < this.mapHeight) {
            return this.visibleTiles[gy][gx];
        }
        return false;
    }

    centerOnToken(tokenId: string) {
        // Search in player tokens
        const playerToken = this.playerTokens.find(t => t.getData('name') === tokenId);
        if (playerToken) {
            this.cameras.main.centerOn(playerToken.x, playerToken.y);
            this.cameras.main.zoomTo(1.5, 1000); // Zoom in for better visibility
            this.selectToken(playerToken);
            return;
        }

        // Search in monster tokens
        const monsterToken = this.monsterTokens.find(t => t.getData('name') === tokenId);
        if (monsterToken) {
            this.cameras.main.centerOn(monsterToken.x, monsterToken.y);
            this.cameras.main.zoomTo(1.5, 1000);
            this.selectToken(monsterToken);
            return;
        }
    }
}
