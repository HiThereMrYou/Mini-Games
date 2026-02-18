export function update(player, input, width, height) {
  // Handle movement
  player.vx = 0;
  player.vy = 0;

  if (input.isMovingLeft()) player.vx = -player.speed;
  if (input.isMovingRight()) player.vx = player.speed;
  if (input.isMovingUp()) player.vy = -player.speed;
  if (input.isMovingDown()) player.vy = player.speed;

  // Update position
  player.x += player.vx;
  player.y += player.vy;

  // Boundary check
  if (player.x - player.radius < 0) player.x = player.radius;
  if (player.x + player.radius > width) player.x = width - player.radius;
  if (player.y - player.radius < 0) player.y = player.radius;
  if (player.y + player.radius > height) player.y = height - player.radius;
}
