import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Phaser from 'phaser';
import { MapService, MapData } from '../../../../services/map.service';
import { MainScene } from './main-scene';

@Component({
    selector: 'app-battle-map',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div #gameContainer class="game-container" (dragover)="onDragOver($event)" (drop)="onDrop($event)"></div>
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
    private mapService = inject(MapService);

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
            scene: [new MainScene(this.mapService)], // Pass service to scene
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

    generateNewMap(environmentType: string = 'dungeon') {
        const scene = this.game?.scene.getScene('MainScene') as MainScene;
        if (scene) {
            scene.generateNewMap(environmentType);
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'copy';
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        const data = event.dataTransfer?.getData('application/json');
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed.type === 'player-token') {
                const rect = this.gameContainer.nativeElement.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                // Get the active scene
                const scene = this.game?.scene.getScene('MainScene') as MainScene;
                if (scene) {
                    // Convert screen coords to world coords for visibility check
                    const worldPoint = scene.cameras.main.getWorldPoint(x, y);

                    // Check visibility before dropping
                    if (scene.isTileVisible(worldPoint.x, worldPoint.y)) {
                        // Default to medium if size not provided
                        const size = parsed.size || 'medium';
                        scene.addPlayerToken(x, y, parsed.image, parsed.name, size);
                    } else {
                        console.log('Cannot drop token in unexplored area');
                        // Optional: Show a visual feedback or toast
                    }
                    // Always reset pointer to prevent sticky drag
                    scene.resetPointer();
                }
            }
        }
    }
    public getEncounterTokens(): any[] {
        const scene = this.game?.scene.getScene('MainScene') as MainScene;
        if (scene) {
            return scene.getEncounterTokens();
        }
        return [];
    }

    public centerOnToken(tokenId: string) {
        const scene = this.game?.scene.getScene('MainScene') as MainScene;
        if (scene) {
            scene.centerOnToken(tokenId);
        }
    }
}
