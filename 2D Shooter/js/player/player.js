import { update } from './update.js';
import { draw } from './draw.js';
import { getHitbox } from './hitbox.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.vx = 0;
    this.vy = 0;
    this.speed = 4;
    this.width = 20;
    this.height = 20;
  }

  update(input, width, height) {
    update(this, input, width, height);
  }

  draw(ctx) {
    draw(this, ctx);
  }

  getHitbox() {
    return getHitbox(this);
  }
}
