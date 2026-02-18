export function update(player, keys, walls, rectCircleColliding, WORLD_WIDTH, WORLD_HEIGHT) {
    const oldPos = { x: player.x, y: player.y };
    
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    
    // Check vertical collision
    for(let w of walls) {
        if(rectCircleColliding(player, w)) {
            player.y = oldPos.y;
            break;
        }
    }

    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;

    // Check horizontal collision
    for(let w of walls) {
        if(rectCircleColliding(player, w)) {
            player.x = oldPos.x;
            break;
        }
    }

    // Screen boundaries
    player.x = Math.max(player.radius, Math.min(WORLD_WIDTH - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(WORLD_HEIGHT - player.radius, player.y));

    player.health = Math.min(player.maxHealth, player.health + player.regen / 60);
}
