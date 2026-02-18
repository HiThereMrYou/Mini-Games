import { 
    ctx, gameState, scoreElement, restartBtn, 
    GROUND_Y, GAME_SPEED, CANVAS_WIDTH, CANVAS_HEIGHT 
} from './constants.js';
import { Player } from '../player/player.js';
import { Obstacle } from '../entities/obstacle.js';
import { createExplosion } from '../entities/particle.js';
import { levels, initLevels, renderLevelButtons } from '../levels/levelData.js';
import { setupInput } from './input.js';

const player = new Player();
player.onGameOver = gameOver;

function initLevel() {
    gameState.obstacles = levels[gameState.currentLevelIndex].data.map(
        data => new Obstacle(data.x, data.type, data.y, data.width, data.height)
    );
}

function checkCollision(player, obstacle) {
    const pBounds = player.getBounds();
    const oBounds = obstacle.getBounds();

    return pBounds.left < oBounds.right &&
           pBounds.right > oBounds.left &&
           pBounds.top < oBounds.bottom &&
           pBounds.bottom > oBounds.top;
}

function update() {
    // Always update particles even if game is over
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const particle = gameState.particles[i];
        particle.update();
        if (particle.life <= 0) {
            gameState.particles.splice(i, 1);
        }
    }

    if (!gameState.gameActive) return;

    player.update();
    gameState.gameDistance += GAME_SPEED;

    gameState.obstacles.forEach((obstacle) => {
        obstacle.update();
        if ((obstacle.type === 'spike' || obstacle.type === 'ceiling-spike') && checkCollision(player, obstacle)) {
            gameOver();
        }
    });

    // Update progress percentage
    const currentLevel = levels[gameState.currentLevelIndex];
    const progress = Math.min(100, Math.floor((gameState.gameDistance / currentLevel.end) * 100)); 
    scoreElement.innerText = progress + '%';
    
    if (progress >= 100) {
        gameWin();
    }
}

function gameWin() {
    gameState.gameActive = false;
    scoreElement.innerText = "Level Complete!";
    restartBtn.style.display = 'block';
    restartBtn.innerText = "Play Again";
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    if (gameState.screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * gameState.screenShake, (Math.random() - 0.5) * gameState.screenShake);
        gameState.screenShake *= 0.9;
        if (gameState.screenShake < 0.1) gameState.screenShake = 0;
    }

    // Dynamic Background Pulse (Simulates beat)
    const pulse = Math.abs(Math.sin(gameState.frameCount * 0.1)) * 15;
    const baseColor = levels[gameState.currentLevelIndex].color;
    
    // Draw Background/Sky
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Pulse overlay
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = 1.0;

    // Draw Parallax Mountains
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    for (let i = 0; i < 5; i++) {
        let x = ((i * 300) - (gameState.gameDistance * 0.2)) % (CANVAS_WIDTH + 300);
        if (x < -300) x += (CANVAS_WIDTH + 300);
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y);
        ctx.lineTo(x + 150, GROUND_Y - 100);
        ctx.lineTo(x + 300, GROUND_Y);
        ctx.fill();
    }

    // Draw Ground
    ctx.fillStyle = '#111';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    
    // Draw Ground Grid lines (scrolling)
    ctx.strokeStyle = `rgba(255,255,255,${0.1 + (pulse/100)})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 50) {
        let x = (i - (gameState.gameDistance % 50));
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }

    // Draw Ground Line (Pulsing)
    ctx.strokeStyle = `rgba(255,255,255,${0.8 + (pulse/50)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();

    player.draw();
    gameState.obstacles.forEach(o => o.draw());
    gameState.particles.forEach(p => p.draw());

    ctx.restore();

    gameState.frameCount++;
}

function gameOver() {
    if (!gameState.gameActive) return;
    createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#f1c40f');
    gameState.gameActive = false;
    gameState.screenShake = 20;
    restartBtn.style.display = 'block';
}

function restart() {
    player.y = GROUND_Y - player.height;
    player.velocityY = 0;
    player.isGrounded = true;
    player.rotation = 0;
    player.trail = [];
    player.mode = 'cube';
    player.gravityDir = 1;
    gameState.gameDistance = 0;
    gameState.particles = [];
    initLevel();
    gameState.gameActive = true;
    restartBtn.style.display = 'none';
    restartBtn.innerText = "Restart";
}

function selectLevel(index) {
    gameState.currentLevelIndex = index;
    restart();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize and start
initLevels();
renderLevelButtons(selectLevel);
setupInput(player, restart);
initLevel();
gameLoop();
