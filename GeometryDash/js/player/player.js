import { GROUND_Y } from '../core/constants.js';
import { getBounds } from './hitbox.js';
import { update, jump } from './update.js';
import { draw } from './draw.js';

export class Player {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = 100;
        this.y = GROUND_Y - this.height;
        this.velocityY = 0;
        this.isGrounded = true;
        this.rotation = 0;
        this.trail = [];
        this.mode = 'cube'; // cube, ship, ball, ufo, wave
        this.gravityDir = 1; // 1 for down, -1 for up
        this.onGameOver = null;
    }

    getBounds() {
        return getBounds(this);
    }

    update() {
        update(this);
    }

    jump() {
        jump(this);
    }

    draw() {
        draw(this);
    }
}
