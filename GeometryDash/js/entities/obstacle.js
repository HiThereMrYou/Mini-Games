import { ctx, GROUND_Y, GAME_SPEED } from '../core/constants.js';

export class Obstacle {
    constructor(x, type = 'spike', y = null, width = 40, height = 40) {
        this.width = width || 40;
        this.height = height || 40;
        this.x = x;
        this.type = type;
        this.y = (y !== null && y !== undefined) ? y : (type === 'ceiling-spike' ? 50 : GROUND_Y - this.height);
    }

    update() {
        this.x -= GAME_SPEED;
    }

    draw() {
        if (this.type === 'spike') {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(this.x, GROUND_Y);
            ctx.lineTo(this.x + this.width / 2, GROUND_Y - this.height);
            ctx.lineTo(this.x + this.width, GROUND_Y);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#c0392b';
            ctx.stroke();
        } else if (this.type === 'ceiling-spike') {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(this.x, 50);
            ctx.lineTo(this.x + this.width / 2, 50 + this.height);
            ctx.lineTo(this.x + this.width, 50);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#c0392b';
            ctx.stroke();
        } else if (this.type === 'block') {
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#ecf0f1';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.strokeRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
        } else if (this.type.startsWith('portal-')) {
            const mode = this.type.split('-')[1];
            const colors = { ship: '#3498db', ball: '#9b59b6', ufo: '#2ecc71', cube: '#f1c40f', wave: '#00d2ff' };
            ctx.fillStyle = colors[mode] || '#fff';
            
            ctx.beginPath();
            ctx.ellipse(this.x + 20, 225, 30, 150, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.stroke();
            
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.ellipse(this.x + 20, 225, 20, 130, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
            
            ctx.fillStyle = "#fff";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.fillText(mode.toUpperCase(), this.x + 20, 225 - 160);
        } else if (this.type === 'pad-yellow' || this.type === 'pad-blue' || this.type === 'pad-pink') {
            const colors = { 'pad-yellow': '#f1c40f', 'pad-blue': '#3498db', 'pad-pink': '#e91e63' };
            ctx.fillStyle = colors[this.type];
            ctx.fillRect(this.x, GROUND_Y - 10, 40, 10);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(this.x, GROUND_Y - 10, 40, 10);
            ctx.globalAlpha = 0.3;
            ctx.fillRect(this.x - 5, GROUND_Y - 15, 50, 5);
            ctx.globalAlpha = 1.0;
        } else if (this.type.startsWith('orb-')) {
            const colors = { 'orb-yellow': '#f1c40f', 'orb-blue': '#3498db', 'orb-pink': '#e91e63' };
            ctx.fillStyle = colors[this.type] || '#fff';
            ctx.beginPath();
            ctx.arc(this.x + 20, this.y + 20, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(this.x + 20, this.y + 20, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    getBounds() {
        if (this.type === 'spike') {
            return {
                left: this.x + 10,
                right: this.x + this.width - 10,
                top: GROUND_Y - this.height + 10,
                bottom: GROUND_Y
            };
        } else if (this.type === 'ceiling-spike') {
            return {
                left: this.x + 10,
                right: this.x + this.width - 10,
                top: 50,
                bottom: 50 + this.height - 10
            };
        } else {
            return {
                left: this.x,
                right: this.x + this.width,
                top: this.y,
                bottom: this.y + this.height
            };
        }
    }
}
