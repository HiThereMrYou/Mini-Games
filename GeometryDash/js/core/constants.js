export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');
export const scoreElement = document.getElementById('score');
export const restartBtn = document.getElementById('restartBtn');
export const levelTitleElement = document.getElementById('level-title');

// Game Constants
export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const GROUND_Y = 400;
export const GAME_SPEED = 5;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

export const gameState = {
    gameActive: true,
    score: 0,
    obstacles: [],
    frameCount: 0,
    isHoldingJump: false,
    gameDistance: 0,
    particles: [],
    currentLevelIndex: 0,
    screenShake: 0
};
