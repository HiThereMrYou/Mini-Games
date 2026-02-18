// Application bootstrap and main game loop

import { Game } from './game.js';
import { Renderer } from './render.js';
import { InputHandler } from './input.js';
import { UI } from './ui.js';

// Initialize game components
const renderer = new Renderer('screen');
const input = new InputHandler();
const ui = new UI();
const game = new Game(renderer, input, ui);

// Setup UI event listeners
ui.onStartClick(() => {
  if (!game.isRunning || game.isGameOver) {
    game.start();
  }
});

ui.onPauseClick(() => {
  game.pause();
});

// Game loop
let lastTime = performance.now();
function gameLoop(timestamp) {
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  game.update(dt);
  game.render();
  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);

// Initial UI update
ui.updateScore(game.score);
ui.updateLives(game.lives);
ui.updateWave(game.wave);
ui.updateEnemies(game.enemies.length);
ui.updateHighScore(game.highScore ?? 0);
ui.updateSurvivalTime(game.survivalTime ?? 0);
