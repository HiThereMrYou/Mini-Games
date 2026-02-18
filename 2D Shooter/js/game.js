// Game loop and state management

import { Player } from './player/player.js';
import { Enemy } from './entities/enemy.js';
import { Bullet } from './entities/bullet.js';
import { Particle } from './entities/particle.js';
import { checkCollision, randomInt } from './utils.js';

export class Game {
  constructor(renderer, input, ui) {
    this.renderer = renderer;
    this.input = input;
    this.ui = ui;

    this.width = renderer.width;
    this.height = renderer.height;

    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.particles = [];

    this.score = 0;
    this.lives = 3;
    this.wave = 0;
    this.enemiesDefeated = 0;

    this.survivalTime = 0; // seconds survived
    this.survivalAccumulator = 0; // accumulate fractional seconds
    this.survivalRate = 1; // points per second survived
    this.highScore = 0;

    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;

    this.lastShotTime = 0;
    this.shootCooldown = 8;

    this.enemySpawnTimer = 0;
    this.enemySpawnRate = 10;

    this.prevPausedState = false;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.isPaused = false;
      this.isGameOver = false;

      this.player = new Player(this.width / 2, this.height - 40);
      this.enemies = [];
      this.bullets = [];
      this.particles = [];

      this.score = 0;
      this.lives = 3;
      this.wave = 1;
      this.enemiesDefeated = 0;
      this.survivalTime = 0;
      this.survivalAccumulator = 0;

      try {
        const stored = localStorage.getItem('highScore');
        this.highScore = stored ? Number(stored) : 0;
      } catch (e) {
        this.highScore = 0;
      }

      this.ui.updateHighScore(this.highScore);

      this.ui.setStartButtonText('Restart');
    }
  }

  restart() {
    this.start();
  }

  pause() {
    if (this.isRunning && !this.isGameOver) {
      this.isPaused = !this.isPaused;
      this.ui.setPauseButtonText(this.isPaused ? 'Resume' : 'Pause');
    }
  }

  checkDifficultyIncrease() {
    const newWave = Math.floor(this.enemiesDefeated / 10) + 1;
    if (newWave > this.wave) {
      this.wave = newWave;
      this.enemySpawnRate = Math.max(2, 10 - this.wave);
    }
  }

  update(dt) {
    if (!this.isRunning || this.isGameOver) return;

    // Handle pause toggle
    if (this.input.isPausing()) {
      if (!this.prevPausedState) {
        this.pause();
      }
    }
    this.prevPausedState = this.input.isPausing();

    // Handle restart
    if (this.input.isRestarting()) {
      this.restart();
      return;
    }

    if (this.isPaused) return;

    // Survival scoring (based on real time)
    this.survivalAccumulator += dt;
    if (this.survivalAccumulator >= 1) {
      const whole = Math.floor(this.survivalAccumulator);
      this.score += whole * this.survivalRate;
      this.survivalAccumulator -= whole;
    }
    this.survivalTime += dt;

    // Update player
    if (this.player) {
      this.player.update(this.input, this.width, this.height);
    }

    // Handle shooting
    if (this.input.isShooting()) {
      this.lastShotTime++;
      if (this.lastShotTime > this.shootCooldown) {
        this.shoot();
        this.lastShotTime = 0;
      }
    } else {
      this.lastShotTime = 0;
    }

    // Spawn enemies continuously
    this.enemySpawnTimer += dt * 60; // keep earlier feel (frames)
    if (this.enemySpawnTimer > this.enemySpawnRate) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // Check if difficulty should increase
    this.checkDifficultyIncrease();

    // Update enemies
    this.enemies = this.enemies.filter(e => e.alive);
    this.enemies.forEach(e => e.update(this.width, this.height));

    // Update bullets
    this.bullets = this.bullets.filter(b => b.alive);
    this.bullets.forEach(b => b.update());

    // Update particles
    this.particles = this.particles.filter(p => p.isAlive());
    this.particles.forEach(p => p.update());

    // Collision detection: bullets vs enemies
    this.bullets.forEach(bullet => {
      this.enemies.forEach(enemy => {
        if (checkCollision(bullet, enemy)) {
          bullet.alive = false;
          enemy.takeDamage();
          this.score += 10;
          this.enemiesDefeated++;

          // Spawn particles
          for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5;
            const speed = 2;
            this.particles.push(
              new Particle(
                enemy.x,
                enemy.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#FFD700',
                20
              )
            );
          }
        }
      });
    });

    // Collision detection: enemies vs player
    this.enemies.forEach(enemy => {
      if (this.player && checkCollision(enemy, this.player)) {
        enemy.alive = false;
        this.lives--;

        // Spawn particles
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          const speed = 3;
          this.particles.push(
            new Particle(
              this.player.x,
              this.player.y,
              Math.cos(angle) * speed,
              Math.sin(angle) * speed,
              '#FF6B6B',
              30
            )
          );
        }

        if (this.lives <= 0) {
          this.gameOver();
        }
      }
    });

    // Update UI
    this.ui.updateScore(this.score);
    this.ui.updateHighScore(this.highScore);
    this.ui.updateLives(this.lives);
    this.ui.updateWave(this.wave);
    this.ui.updateEnemies(this.enemies.length);
    this.ui.updateSurvivalTime(this.survivalTime);
  }

  spawnEnemy() {
    const x = randomInt(20, this.width - 20);
    this.enemies.push(new Enemy(x, -20));
  }

  shoot() {
    if (this.player) {
      this.bullets.push(new Bullet(this.player.x, this.player.y - 15));
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.isRunning = false;

    // Persist high score
    try {
      if (this.score > (this.highScore || 0)) {
        this.highScore = this.score;
        localStorage.setItem('highScore', String(this.highScore));
      }
    } catch (e) {}

    this.ui.updateHighScore(this.highScore);
  }

  render() {
    if (this.isPaused) {
      this.renderer.drawGame(this.player, this.enemies, this.bullets, this.particles);
      this.renderer.drawPaused();
    } else if (this.isGameOver) {
      this.renderer.drawGame(this.player, this.enemies, this.bullets, this.particles);
      this.renderer.drawGameOver(this.score);
    } else {
      this.renderer.drawGame(this.player, this.enemies, this.bullets, this.particles);
    }
  }
}
