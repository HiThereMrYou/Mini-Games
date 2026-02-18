import { gameState, GRAVITY, JUMP_FORCE, GROUND_Y } from '../core/constants.js';
import { createExplosion } from '../entities/particle.js';

export function update(player) {
    if (gameState.gameActive) {
        player.trail.push({ x: player.x, y: player.y, rotation: player.rotation, mode: player.mode });
        if (player.trail.length > 8) player.trail.shift();
    }

    if (player.mode === 'ship') {
        if (gameState.isHoldingJump) {
            player.velocityY -= 0.8 * player.gravityDir;
        } else {
            player.velocityY += 0.4 * player.gravityDir;
        }
        player.velocityY = Math.max(-8, Math.min(8, player.velocityY));
        player.y += player.velocityY;
        player.rotation = player.velocityY * 5;
    } else if (player.mode === 'wave') {
        const waveSpeed = 6;
        if (gameState.isHoldingJump) {
            player.velocityY = -waveSpeed;
        } else {
            player.velocityY = waveSpeed;
        }
        player.y += player.velocityY;
        player.rotation = gameState.isHoldingJump ? -45 : 45;
    } else if (player.mode === 'ball') {
        player.velocityY += GRAVITY * 1.5 * player.gravityDir;
        player.y += player.velocityY;
        player.rotation += 10 * player.gravityDir;
    } else if (player.mode === 'ufo') {
        player.velocityY += GRAVITY * 0.8 * player.gravityDir;
        player.y += player.velocityY;
        player.rotation += 2;
    } else { // cube
        if (!player.isGrounded) {
            player.velocityY += GRAVITY * player.gravityDir;
            player.y += player.velocityY;
            player.rotation += 5 * player.gravityDir;
        } else {
            player.rotation = Math.round(player.rotation / 90) * 90;
            if (gameState.isHoldingJump) player.jump();
        }
    }

    const CEILING = 50;
    const currentBounds = player.getBounds();
    
    let onGround = currentBounds.bottom >= GROUND_Y;
    let onCeiling = currentBounds.top <= CEILING;

    if (player.gravityDir === 1) { 
        if (onGround) {
            if (player.mode === 'cube') player.y = GROUND_Y - 40;
            else if (player.mode === 'ship') player.y = GROUND_Y - 30;
            else if (player.mode === 'ball') player.y = GROUND_Y - 38;
            else if (player.mode === 'ufo') player.y = GROUND_Y - 35;
            else if (player.mode === 'wave') player.y = GROUND_Y - 35;
            else player.y = GROUND_Y - player.height;
            
            player.velocityY = 0;
            player.isGrounded = true;
        } else {
            player.isGrounded = false;
        }
        if (onCeiling) {
            if (player.mode === 'cube') player.y = CEILING;
            else if (player.mode === 'ship') player.y = CEILING - 10;
            else if (player.mode === 'ball') player.y = CEILING - 2;
            else if (player.mode === 'ufo') player.y = CEILING - 5;
            else if (player.mode === 'wave') player.y = CEILING - 5;
            else player.y = CEILING;
            player.velocityY = 0;
        }
    } else { 
        if (onCeiling) {
            if (player.mode === 'cube') player.y = CEILING;
            else if (player.mode === 'ship') player.y = CEILING - 10;
            else if (player.mode === 'ball') player.y = CEILING - 2;
            else if (player.mode === 'ufo') player.y = CEILING - 5;
            else if (player.mode === 'wave') player.y = CEILING - 5;
            else player.y = CEILING;

            player.velocityY = 0;
            player.isGrounded = true;
        } else {
            player.isGrounded = false;
        }
        if (onGround) {
            if (player.mode === 'cube') player.y = GROUND_Y - 40;
            else if (player.mode === 'ship') player.y = GROUND_Y - 30;
            else if (player.mode === 'ball') player.y = GROUND_Y - 38;
            else if (player.mode === 'ufo') player.y = GROUND_Y - 35;
            else if (player.mode === 'wave') player.y = GROUND_Y - 35;
            else player.y = GROUND_Y - 40;
            player.velocityY = 0;
        }
    }

    const pBounds = player.getBounds();
    gameState.obstacles.forEach(obstacle => {
        if (obstacle.type === 'block') {
            const b = { left: obstacle.x, right: obstacle.x + obstacle.width, top: obstacle.y, bottom: obstacle.y + obstacle.height };

            if (pBounds.left < b.right && pBounds.right > b.left && pBounds.top < b.bottom && pBounds.bottom > b.top) {
                let landed = false;
                const buffer = player.mode === 'ship' ? 15 : 20;

                if (player.gravityDir === 1 && pBounds.bottom <= b.top + buffer) {
                    if (player.mode === 'cube') player.y = b.top - 40;
                    else if (player.mode === 'ship') player.y = b.top - 30;
                    else if (player.mode === 'ball') player.y = b.top - 38;
                    else if (player.mode === 'ufo') player.y = b.top - 35;
                    else if (player.mode === 'wave') player.y = b.top - 35;
                    else player.y = b.top - player.height;

                    player.velocityY = 0;
                    player.isGrounded = true;
                    landed = true;
                } else if (player.gravityDir === -1 && pBounds.top >= b.bottom - buffer) {
                    if (player.mode === 'cube') player.y = b.bottom;
                    else if (player.mode === 'ship') player.y = b.bottom - 10;
                    else if (player.mode === 'ball') player.y = b.bottom - 2;
                    else if (player.mode === 'ufo') player.y = b.bottom - 5;
                    else if (player.mode === 'wave') player.y = b.bottom - 5;
                    else player.y = b.bottom;

                    player.velocityY = 0;
                    player.isGrounded = true;
                    landed = true;
                }

                if (!landed && player.onGameOver) {
                    player.onGameOver();
                }
            }
        } else if (obstacle.type === 'pad-yellow') {
            const b = { left: obstacle.x, right: obstacle.x + obstacle.width, top: obstacle.y, bottom: obstacle.y + obstacle.height };
            if (pBounds.left < b.right && pBounds.right > b.left && pBounds.bottom >= b.top && pBounds.top <= b.bottom) {
                player.velocityY = JUMP_FORCE * 1.5 * player.gravityDir;
                player.isGrounded = false;
                gameState.screenShake = 10;
            }
        } else if (obstacle.type === 'pad-pink') {
            const b = { left: obstacle.x, right: obstacle.x + obstacle.width, top: obstacle.y, bottom: obstacle.y + obstacle.height };
            if (pBounds.left < b.right && pBounds.right > b.left && pBounds.bottom >= b.top && pBounds.top <= b.bottom) {
                player.velocityY = JUMP_FORCE * 0.8 * player.gravityDir;
                player.isGrounded = false;
                gameState.screenShake = 5;
            }
        } else if (obstacle.type === 'pad-blue') {
            const b = { left: obstacle.x, right: obstacle.x + obstacle.width, top: obstacle.y, bottom: obstacle.y + obstacle.height };
            if (pBounds.left < b.right && pBounds.right > b.left && pBounds.bottom >= b.top && pBounds.top <= b.bottom) {
                player.gravityDir *= -1;
                player.velocityY = JUMP_FORCE * 0.5 * player.gravityDir;
                player.isGrounded = false;
                gameState.screenShake = 10;
            }
        } else if (obstacle.type.startsWith('portal-')) {
            if (player.x + 40 > obstacle.x && player.x < obstacle.x + 40) {
                const newMode = obstacle.type.split('-')[1];
                if (player.mode !== newMode) {
                    player.mode = newMode;
                    gameState.screenShake = 5;
                }
            }
        }
    });
}

export function jump(player) {
    let hitOrb = false;
    const pBounds = player.getBounds();
    const pCenterX = (pBounds.left + pBounds.right) / 2;
    const pCenterY = (pBounds.top + pBounds.bottom) / 2;

    if (player.mode !== 'ship') {
        gameState.obstacles.forEach(obstacle => {
            if (obstacle.type.startsWith('orb-')) {
                const dx = pCenterX - (obstacle.x + 20);
                const dy = pCenterY - (obstacle.y + 20);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 60) {
                    if (obstacle.type === 'orb-yellow') {
                        player.velocityY = JUMP_FORCE * 1.1 * player.gravityDir;
                        createExplosion(obstacle.x + 20, obstacle.y + 20, '#f1c40f');
                        gameState.screenShake = 5;
                    } else if (obstacle.type === 'orb-pink') {
                        player.velocityY = JUMP_FORCE * 0.7 * player.gravityDir;
                        createExplosion(obstacle.x + 20, obstacle.y + 20, '#e91e63');
                        gameState.screenShake = 3;
                    } else if (obstacle.type === 'orb-blue') {
                        player.gravityDir *= -1;
                        player.velocityY = JUMP_FORCE * 0.5 * player.gravityDir;
                        createExplosion(obstacle.x + 20, obstacle.y + 20, '#3498db');
                        gameState.screenShake = 7;
                    }
                    player.isGrounded = false;
                    hitOrb = true;
                }
            }
        });
    }

    if (hitOrb) return;

    if (player.mode === 'cube' && player.isGrounded) {
        player.velocityY = JUMP_FORCE * player.gravityDir;
        player.isGrounded = false;
    } else if (player.mode === 'ball') {
        player.gravityDir *= -1;
        player.isGrounded = false;
    } else if (player.mode === 'ufo') {
        player.velocityY = JUMP_FORCE * 0.8 * player.gravityDir;
        player.isGrounded = false;
    }
}
