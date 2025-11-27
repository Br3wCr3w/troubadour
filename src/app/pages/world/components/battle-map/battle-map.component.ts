import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Phaser from 'phaser';

@Component({
    selector: 'app-battle-map',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div #gameContainer class="game-container"></div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .game-container {
      width: 100%;
      height: 100%;
    }
  `]
})
export class BattleMapComponent implements AfterViewInit, OnDestroy {
    @ViewChild('gameContainer') gameContainer!: ElementRef<HTMLElement>;
    private game: Phaser.Game | null = null;

    ngAfterViewInit(): void {
        this.initGame();
    }

    ngOnDestroy(): void {
        if (this.game) {
            this.game.destroy(true);
            this.game = null;
        }
    }

    private initGame(): void {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: this.gameContainer.nativeElement,
            width: this.gameContainer.nativeElement.clientWidth,
            height: this.gameContainer.nativeElement.clientHeight,
            backgroundColor: '#000000',
            scene: [MainScene],
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            pixelArt: true
        };

        this.game = new Phaser.Game(config);
    }
}

/**
 * DUNGEON GENERATOR LOGIC
 */
class DungeonGenerator {
    width: number;
    height: number;
    map: number[][] = [];
    rooms: any[] = [];
    doors: any[] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    generate() {
        // 1. Fill map with walls
        this.map = Array(this.height).fill(0).map(() => Array(this.width).fill(0));
        this.rooms = [];
        this.doors = [];

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

        return { map: this.map, rooms: this.rooms, doors: this.doors };
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
            this.doors.push({ x, y, rotation: 0 }); // 0 rads = horizontal sprite
        }
        // Vertical Door: Walls left and right, Floors top and bottom
        else if (left === 0 && right === 0 && top === 1 && bottom === 1) {
            this.doors.push({ x, y, rotation: Math.PI / 2 }); // 90 degrees
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

class MainScene extends Phaser.Scene {
    private tileSize = 32;
    private mapWidth = 60;
    private mapHeight = 40;
    private selectedToken: Phaser.GameObjects.Container | Phaser.GameObjects.Sprite | null = null;
    private selectionRing!: Phaser.GameObjects.Image;
    private wallsGroup!: Phaser.GameObjects.Group;
    private elf!: Phaser.GameObjects.Sprite;
    private ogre!: Phaser.GameObjects.Sprite;
    private isDragging = false;

    constructor() {
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
        // Elf
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
        this.generateMap();

        // Inputs
        this.input.on('pointermove', this.handleCameraPan, this);
        this.input.on('wheel', this.handleCameraZoom, this);
        this.input.keyboard?.on('keydown-R', () => {
            this.scene.restart();
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
    }

    generateMap() {
        const generator = new DungeonGenerator(this.mapWidth, this.mapHeight);
        const dungeonData = generator.generate();
        const rooms = dungeonData.rooms;
        const grid = dungeonData.map;
        const doors = dungeonData.doors;

        // 1. Render Floor (Layer 0)
        const map = this.make.tilemap({ tileWidth: 32, tileHeight: 32, width: this.mapWidth, height: this.mapHeight });
        const tileset = map.addTilesetImage('floor', undefined, 32, 32);
        if (tileset) {
            const floorLayer = map.createBlankLayer('Floor', tileset)?.setDepth(0);

            if (floorLayer) {
                for (let y = 0; y < this.mapHeight; y++) {
                    for (let x = 0; x < this.mapWidth; x++) {
                        if (grid[y][x] === 1) {
                            floorLayer.putTileAt(0, x, y);
                            if (Math.random() > 0.9) floorLayer.getTileAt(x, y).tint = 0xdddddd;
                        }
                    }
                }
            }
        }

        // 2. Render Walls, Shadows & Torches (Layer 1)
        this.wallsGroup = this.add.group();

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (grid[y][x] === 0) {
                    if (this.hasAdjacentFloor(grid, x, y)) {
                        this.add.image(x * 32 + 16, y * 32 + 16, 'wall').setDepth(10);

                        // Shadow
                        if (y + 1 < this.mapHeight && grid[y + 1][x] === 1) {
                            this.add.image(x * 32 + 16, (y + 1) * 32 + 8, 'shadow').setDepth(5);
                        }

                        // Torch
                        if (Math.random() > 0.95) {
                            this.add.image(x * 32 + 16, y * 32 + 16, 'torch').setDepth(11);
                            let light = this.add.circle(x * 32 + 16, y * 32 + 16, 60, 0xFFAA00, 0.1).setDepth(11);
                            light.setBlendMode(Phaser.BlendModes.ADD);
                        }
                    }
                }
            }
        }

        // 3. Render Doors (Layer 2)
        // We use Sprites for doors so we can animate/rotate them
        for (let d of doors) {
            this.createDoor(d.x, d.y, d.rotation);
        }

        // 4. Place Tokens
        const startRoom = rooms[0];
        const elfX = (startRoom.center.x * 32) + 16;
        const elfY = (startRoom.center.y * 32) + 16;
        this.elf = this.createToken(elfX, elfY, 'elf', 'Elf');

        const endRoom = rooms[rooms.length - 1];
        const ogreX = (endRoom.center.x * 32) + 16;
        const ogreY = (endRoom.center.y * 32) + 16;
        this.ogre = this.createToken(ogreX, ogreY, 'ogre', 'Ogre');

        this.cameras.main.centerOn(elfX, elfY);
    }

    createDoor(x: number, y: number, rotation: number) {
        const door = this.add.sprite(x * 32 + 16, y * 32 + 16, 'door');
        door.setRotation(rotation);
        door.setDepth(15); // Higher than walls, lower than tokens
        door.setInteractive();

        // State
        door.setData('isOpen', false);
        door.setData('baseRotation', rotation);

        door.on('pointerdown', () => {
            const isOpen = door.getData('isOpen');
            const baseRot = door.getData('baseRotation');

            if (!isOpen) {
                // Open: Rotate 90 degrees more and fade slightly
                this.tweens.add({
                    targets: door,
                    rotation: baseRot + (Math.PI / 2),
                    alpha: 0.5,
                    duration: 200
                });
                door.setData('isOpen', true);
            } else {
                // Close: Return to base state
                this.tweens.add({
                    targets: door,
                    rotation: baseRot,
                    alpha: 1,
                    duration: 200
                });
                door.setData('isOpen', false);
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

    createToken(x: number, y: number, texture: string, name: string) {
        const token = this.add.sprite(x, y, texture).setInteractive();
        token.setData('name', name);
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
            token.x = Math.floor(token.x / 32) * 32 + 16;
            token.y = Math.floor(token.y / 32) * 32 + 16;
            if (this.selectedToken === token) {
                this.selectionRing.setPosition(token.x, token.y);
            }
        });

        return token;
    }

    selectToken(token: Phaser.GameObjects.Sprite) {
        this.selectedToken = token;
        this.selectionRing.setVisible(true);
        this.selectionRing.setPosition(token.x, token.y);

        if (token.texture.key === 'ogre') {
            this.selectionRing.setScale(2.2);
        } else {
            this.selectionRing.setScale(1.2);
        }
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
}
