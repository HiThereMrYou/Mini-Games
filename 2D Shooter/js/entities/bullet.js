// Bullet entity

export class Bullet {
  constructor(x, y, vx = 0, vy = -8) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 3;
    this.alive = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Remove bullet if it goes off screen
    if (this.y < -10 || this.y > 500 || this.x < -10 || this.x > 650) {
      this.alive = false;
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
