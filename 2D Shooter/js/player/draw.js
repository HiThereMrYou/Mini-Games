export function draw(player, ctx) {
  // Draw player as a stylized triangle with gradient and rotation
  ctx.save();
  ctx.translate(player.x, player.y);
  const rot = player.vx * 0.05;
  ctx.rotate(rot);

  const grad = ctx.createLinearGradient(-player.radius, -player.radius, player.radius, player.radius);
  grad.addColorStop(0, '#3BFF8A');
  grad.addColorStop(1, '#00A84D');

  ctx.fillStyle = grad;
  ctx.shadowColor = 'rgba(0, 200, 100, 0.6)';
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.moveTo(0, -player.radius);
  ctx.lineTo(-player.radius, player.radius);
  ctx.lineTo(player.radius, player.radius);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}
