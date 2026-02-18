import { ctx, gameState } from '../core/constants.js';

export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 5 + 2;
        this.velocityX = (Math.random() - 0.5) * 10;
        this.velocityY = (Math.random() - 0.5) * 10;
        this.life = 1.0;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.life -= 0.05;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

export function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
        gameState.particles.push(new Particle(x, y, color));
    }
}
