import { ctx } from '../core/constants.js';

export function draw(player) {
    player.trail.forEach((t, i) => {
        ctx.save();
        ctx.translate(t.x + player.width / 2, t.y + player.height / 2);
        ctx.rotate((t.rotation * Math.PI) / 180);
        ctx.globalAlpha = i / 15;
        const trailColors = { ship: '#3498db', ball: '#9b59b6', ufo: '#2ecc71', wave: '#00d2ff', cube: '#f1c40f' };
        ctx.fillStyle = trailColors[t.mode] || '#f1c40f';
        if (t.mode === 'ship') {
            ctx.fillRect(-player.width / 2, -player.height / 4, player.width, player.height / 2);
        } else {
            ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
        }
        ctx.restore();
    });
    ctx.globalAlpha = 1.0;

    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate((player.rotation * Math.PI) / 180);
    
    if (player.mode === 'ship') {
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(20, -10);
        ctx.lineTo(20, 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(5, -5, 5, 5);
    } else if (player.mode === 'ball') {
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(20, 0);
        ctx.stroke();
    } else if (player.mode === 'ufo') {
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.ellipse(0, 5, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(0, -5, 12, Math.PI, 0);
        ctx.fill();
    } else if (player.mode === 'wave') {
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(10, -15);
        ctx.lineTo(10, 15);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, -5, 5, 5);
    } else {
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(5, -10, 8, 8);
        ctx.fillRect(5, 5, 8, 8);
    }
    
    ctx.restore();
}
