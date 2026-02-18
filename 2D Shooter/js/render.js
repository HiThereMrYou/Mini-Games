// Canvas rendering logic

export class Renderer {
  constructor(canvasId = 'screen') {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  clear() {
    // nicer background gradient
    const g = this.ctx.createLinearGradient(0, 0, 0, this.height);
    g.addColorStop(0, '#001022');
    g.addColorStop(1, '#000000');
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // subtle vignette
    this.ctx.fillStyle = 'rgba(0,0,0,0.15)';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGame(player, enemies, bullets, particles) {
    this.clear();

    // Draw particles
    particles.forEach(p => p.draw(this.ctx));

    // Draw player
    if (player) {
      player.draw(this.ctx);
    }

    // Draw enemies
    enemies.forEach(e => e.draw(this.ctx));

    // Draw bullets
    bullets.forEach(b => b.draw(this.ctx));
  }

  drawText(text, x, y, color = '#FFF', size = 16, align = 'left') {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px Arial`;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  drawGameOver(score) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 40);

    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${score}`, this.width / 2, this.height / 2 + 20);
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Press R to restart or Start button', this.width / 2, this.height / 2 + 60);
  }

  drawPaused() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);

    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Press P to resume', this.width / 2, this.height / 2 + 50);
  }
}
