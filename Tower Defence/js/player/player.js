import { update } from './update.js';
import { draw } from './draw.js';
import { getHitbox } from './hitbox.js';

export class Player {
    constructor() {
        this.life = 20;
        this.mana = 100;
        this.wood = 0;
        this.selectedAction = null;
        this.mouse = { x: 0, y: 0, gridX: 0, gridY: 0 };
    }

    update() {
        update(this);
    }

    draw(ctx, state, TILE_SIZE, Tower) {
        draw(this, ctx, state, TILE_SIZE, Tower);
    }

    getHitbox() {
        return getHitbox(this);
    }
}
