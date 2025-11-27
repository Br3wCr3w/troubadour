import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-battle-map',
    standalone: true,
    imports: [CommonModule],
    template: `
    <canvas #battleMap class="battle-map"></canvas>
  `,
    styles: [`
    :host {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
    }

    .battle-map {
        width: 100%;
        height: 100%;
        display: block;
    }
  `]
})
export class BattleMapComponent implements AfterViewInit {
    @ViewChild('battleMap') canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D | null;

    ngAfterViewInit(): void {
        this.initCanvas();
    }

    @HostListener('window:resize')
    onResize() {
        this.initCanvas();
    }

    private initCanvas() {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d');
        if (!this.ctx) return;

        // Set canvas internal resolution to match window size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        this.drawPlaceholder();
    }

    private drawPlaceholder() {
        if (!this.ctx) return;
        const { width, height } = this.canvasRef.nativeElement;

        this.ctx.clearRect(0, 0, width, height);

        const gridSize = 50;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        for (let y = 0; y < height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        for (let i = 0; i < 100; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2;

            this.ctx.fillStyle = Math.random() > 0.5 ? '#00f3ff' : '#ff00ff';
            this.ctx.globalAlpha = Math.random() * 0.5 + 0.2;

            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1.0;
    }
}
