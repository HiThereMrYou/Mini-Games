import { update } from './update.js';
import { draw } from './draw.js';
import { getHitbox } from './hitbox.js';

export class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = 25;
        this.speed = 6;
        this.health = 120;
        this.maxHealth = 120;
        this.regen = 1.0;
        this.bulletSpeed = 10;
        this.bulletDamage = 20;
        this.fireRate = 300;
        this.lastShot = 0;
        this.rainbowSize = 14;
        this.multishot = 1;
        this.lifesteal = 1;
        this.orbs = 0;
        this.lightning = 0;
        this.trail = 0;
        this.nova = 0;
    }

    update(keys, walls, rectCircleColliding, WORLD_WIDTH, WORLD_HEIGHT) {
        update(this, keys, walls, rectCircleColliding, WORLD_WIDTH, WORLD_HEIGHT);
    }

    draw(ctx) {
        draw(this, ctx);
    }

    getHitbox() {
        return getHitbox(this);
    }
}
