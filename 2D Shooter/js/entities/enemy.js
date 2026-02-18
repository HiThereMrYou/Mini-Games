// Enemy entity

import { randomInt } from '../utils.js';

export class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = randomInt(-2, 2);
    this.vy = randomInt(1, 3);
    this.radius = 10;
    this.health = 1;
    this.alive = true;
    this.wobbleAngle = 0;
  }

  update(width, height) {
    this.x += this.vx;
    this.y += this.vy;
    this.wobbleAngle += 0.05;

    // Bounce off walls
    if (this.x - this.radius < 0 || this.x + this.radius > width) {
      this.vx *= -1;
    }

    // Kill if off bottom
    if (this.y - this.radius > height) {
      this.alive = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const wob = Math.sin(this.wobbleAngle) * 0.15;
    ctx.scale(1 + wob, 1 - wob);

    const grad = ctx.createRadialGradient(0, 0, this.radius * 0.1, 0, 0, this.radius);
    grad.addColorStop(0, '#FFD0D0');
    grad.addColorStop(1, '#FF6B6B');

    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(255,100,100,0.6)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyes
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(-4, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  takeDamage() {
    this.health--;
    if (this.health <= 0) {
      this.alive = false;
    }
  }
}
