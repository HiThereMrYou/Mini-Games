// DOM UI bindings

export class UI {
  constructor() {
    this.scoreSpan = document.getElementById('score');
    this.highScoreSpan = document.getElementById('highScore');
    this.livesSpan = document.getElementById('lives');
    this.survivalSpan = document.getElementById('survival');
    this.waveSpan = document.getElementById('wave');
    this.enemiesSpan = document.getElementById('enemies');
    this.startBtn = document.getElementById('startBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
  }

  updateScore(score) {
    if (this.scoreSpan) this.scoreSpan.textContent = score;
  }

  updateLives(lives) {
    if (this.livesSpan) this.livesSpan.textContent = lives;
  }

  updateWave(wave) {
    if (this.waveSpan) this.waveSpan.textContent = wave;
  }

  updateHighScore(high) {
    if (this.highScoreSpan) this.highScoreSpan.textContent = high;
  }

  updateSurvivalTime(seconds) {
    if (this.survivalSpan) this.survivalSpan.textContent = `${Math.floor(seconds)}s`;
  }

  updateEnemies(count) {
    if (this.enemiesSpan) this.enemiesSpan.textContent = count;
  }

  onStartClick(callback) {
    if (this.startBtn) {
      this.startBtn.addEventListener('click', callback);
    }
  }

  onPauseClick(callback) {
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', callback);
    }
  }

  setStartButtonText(text) {
    if (this.startBtn) {
      this.startBtn.textContent = text;
    }
  }

  setPauseButtonText(text) {
    if (this.pauseBtn) {
      this.pauseBtn.textContent = text;
    }
  }
}
