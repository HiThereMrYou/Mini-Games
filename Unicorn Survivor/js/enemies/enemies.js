const enemies = [];
const enemyBullets = [];

function spawnEnemy() {
    // Determine spawn position (outside the screen but within world bounds)
    let x, y;
    const padding = 100;
    const side = Math.floor(Math.random() * 4);
    
    // Attempt to spawn relative to camera to ensure they are near the player
    if (side === 0) { // Top
        x = camera.x + Math.random() * canvas.width;
        y = camera.y - padding;
    } else if (side === 1) { // Bottom
        x = camera.x + Math.random() * canvas.width;
        y = camera.y + canvas.height + padding;
    } else if (side === 2) { // Left
        x = camera.x - padding;
        y = camera.y + Math.random() * canvas.height;
    } else { // Right
        x = camera.x + canvas.width + padding;
        y = camera.y + Math.random() * canvas.height;
    }

    // Clamp to world bounds
    x = Math.max(0, Math.min(WORLD_WIDTH, x));
    y = Math.max(0, Math.min(WORLD_HEIGHT, y));

    const type = Math.random();
    if (type > 0.99) {
        // Dragon: Rare, boss-like stats
        enemies.push({ x, y, type: 'dragon', health: 500, speed: 2.0, color: '#d32f2f', size: 100, damage: 3.0, value: 300 });
    } else if (type > 0.96) {
        // Ghost: Moves through walls, hard to see
        enemies.push({ x, y, type: 'ghost', health: 25, speed: 1.5, color: 'rgba(155, 89, 182, 0.6)', size: 40, damage: 0.5, value: 50 });
    } else if (type > 0.92) {
        // Tank: Slow, high health, high reward
        enemies.push({ x, y, type: 'tank', health: 120, speed: 1.0, color: '#1b5e20', size: 60, damage: 1.2, value: 60 });
    } else if (type > 0.85) {
        // Bomber: Fast, explodes on contact (handled in game.js)
        enemies.push({ x, y, type: 'bomber', health: 10, speed: 4.5, color: '#e64a19', size: 30, damage: 2.0, value: 25 });
    } else if (type > 0.70) {
        // Ranged: Stops at distance to shoot
        enemies.push({ x, y, type: 'ranged', health: 15, speed: 1.8, color: '#fdd835', size: 35, damage: 0.2, value: 15, lastShot: 0, fireRate: 2000 });
    } else if (type > 0.55) {
        // Scout: Fast but weak
        enemies.push({ x, y, type: 'scout', health: 8, speed: 4.0, color: '#03a9f4', size: 25, damage: 0.2, value: 10 });
    } else {
        // Soldier: Standard
        enemies.push({ x, y, type: 'soldier', health: 15, speed: 2.3, color: '#37474f', size: 35, damage: 0.4, value: 8 });
    }
}
