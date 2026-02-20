import { ctx } from '../core/constants.js';

export function draw(player) {
    // Wave Trail (Solid Line with Fading Tail)
    if (player.mode === 'wave' && player.trail.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#00d2ff';
        ctx.lineWidth = 10;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        const centerX = player.width / 2;
        const centerY = player.height / 2;

        for (let i = 1; i < player.trail.length; i++) {
            // Only draw if it's a wave segment
            if (player.trail[i].mode === 'wave' && player.trail[i-1].mode === 'wave') {
                ctx.beginPath();
                // Fades out at the end of the trail
                ctx.globalAlpha = Math.pow(i / player.trail.length, 2); 
                ctx.moveTo(player.trail[i-1].x + centerX, player.trail[i-1].y + centerY);
                ctx.lineTo(player.trail[i].x + centerX, player.trail[i].y + centerY);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    ctx.globalAlpha = 1.0;

    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate((player.rotation * Math.PI) / 180);
    
    const outlineColor = '#000';
    const outlineWidth = 2;

    if (player.mode === 'ship') {
        // Ship (Icon #2) - Simple triangle
        ctx.fillStyle = '#33f';
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        
        ctx.beginPath();
        ctx.moveTo(-18, -15);
        ctx.lineTo(22, 0);
        ctx.lineTo(-18, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit window
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(2, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (player.mode === 'ball') {
        // Ball (Icon #3) - Circle with segment lines
        ctx.fillStyle = '#99f';
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Segment lines for texture
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
            ctx.lineTo(Math.cos(angle + Math.PI) * 18, Math.sin(angle + Math.PI) * 18);
            ctx.stroke();
        }
    } else if (player.mode === 'ufo') {
        // UFO (Icon #4) - Green base + cyan dome
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;

        // Bottom base (green)
        ctx.fillStyle = '#3f3';
        ctx.beginPath();
        ctx.ellipse(0, 8, 22, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Top dome (cyan)
        ctx.fillStyle = '#33f';
        ctx.beginPath();
        ctx.arc(0, 2, 14, Math.PI, 0);
        ctx.fill();
        ctx.stroke();

        // Window detail
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (player.mode === 'wave') {
        // Wave (Icon #5) - Triangle pointing right
        ctx.fillStyle = '#33f';
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        
        ctx.beginPath();
        ctx.moveTo(-16, -16);
        ctx.lineTo(20, 0);
        ctx.lineTo(-16, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner stripe
        ctx.fillStyle = '#ff3';
        ctx.beginPath();
        ctx.moveTo(-8, -6);
        ctx.lineTo(10, 0);
        ctx.lineTo(-8, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else {
        // Cube (Icon #1) - Simple yellow square
        ctx.fillStyle = '#ff3';
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        
        const size = player.width;
        ctx.fillRect(-size/2, -size/2, size, size);
        ctx.strokeRect(-size/2, -size/2, size, size);

        // Eyes (simple black squares)
        ctx.fillStyle = '#000';
        ctx.fillRect(-8, -8, 5, 5);
        ctx.fillRect(3, -8, 5, 5);

        // Simple smile
        ctx.fillRect(-8, 4, 19, 4);
    }
    
    ctx.restore();
}
