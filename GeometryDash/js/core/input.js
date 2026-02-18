import { canvas, gameState, restartBtn } from './constants.js';

export function setupInput(player, restartCallback) {
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            gameState.isHoldingJump = true;
            player.jump();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            gameState.isHoldingJump = false;
        }
    });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        gameState.isHoldingJump = true;
        player.jump();
    });

    canvas.addEventListener('touchend', () => {
        gameState.isHoldingJump = false;
    });

    canvas.addEventListener('mousedown', () => {
        gameState.isHoldingJump = true;
        player.jump();
    });

    canvas.addEventListener('mouseup', () => {
        gameState.isHoldingJump = false;
    });

    restartBtn.addEventListener('click', restartCallback);
}
