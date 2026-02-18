import { Player } from '../player/player.js';

const canvas = window.canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const goldEl = document.getElementById('gold');
const timeEl = document.getElementById('time');
const healthBar = document.getElementById('health-bar');
const hpText = document.getElementById('hp-text');

const WORLD_WIDTH = window.WORLD_WIDTH = 4000;
const WORLD_HEIGHT = window.WORLD_HEIGHT = 4000;
const camera = window.camera = { x: 0, y: 0, zoom: 1 };

let gold = 0;
let gameActive = false;
let startTime = 0;
let lastLightning = 0;
let lastNova = 0;

const walls = [];
const fx = [];
const player = new Player();
const keys = {};
const bullets = [];
const trails = [];
const enemyBullets = []; // Added as it was global
const enemies = []; // Added as it was global

function generateWalls() {
    walls.length = 0;
    const count = 40; // Way more walls
    for (let i = 0; i < count; i++) {
        walls.push({
            x: Math.random() * (WORLD_WIDTH - 400) + 200,
            y: Math.random() * (WORLD_HEIGHT - 400) + 200,
            w: Math.random() * 200 + 100,
            h: Math.random() * 200 + 100,
            color: '#444'
        });
    }
}

function startGame() {
    loadGame(); // Load saved upgrades and gold
    document.getElementById('overlay').style.display = 'none';
    gameActive = true;
    startTime = Date.now();
    player.x = WORLD_WIDTH / 2;
    player.y = WORLD_HEIGHT / 2;
    player.health = player.maxHealth;
    // Removed gold = 250; to persist gold across rounds
    enemies.length = 0;
    enemyBullets.length = 0;
    bullets.length = 0;
    trails.length = 0;
    fx.length = 0;
    lastLightning = 0;
    lastNova = 0;
    generateWalls();
    initShop();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'e') toggleShop();
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener('mousedown', () => keys.mousedown = true);
canvas.addEventListener('mouseup', () => keys.mousedown = false);
let mouseX = 0, mouseY = 0;
canvas.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function gameLoop() {
    if (!gameActive) return;
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Update Camera
    camera.x = player.x - (canvas.width / camera.zoom) / 2;
    camera.y = player.y - (canvas.height / camera.zoom) / 2;
    // Clamp camera to world bounds
    camera.x = Math.max(0, Math.min(WORLD_WIDTH - (canvas.width / camera.zoom), camera.x));
    camera.y = Math.max(0, Math.min(WORLD_HEIGHT - (canvas.height / camera.zoom), camera.y));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Background Grid (World indicator)
    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    for(let x = 0; x <= WORLD_WIDTH; x += 200) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_HEIGHT); ctx.stroke();
    }
    for(let y = 0; y <= WORLD_HEIGHT; y += 200) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_WIDTH, y); ctx.stroke();
    }

    // Draw Walls
    walls.forEach(w => {
        ctx.fillStyle = w.color;
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 4;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
    });

    player.update(keys, walls, rectCircleColliding, WORLD_WIDTH, WORLD_HEIGHT);

    // FX logic
    for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i];
        f.life--;
        if (f.type === 'nova') {
            ctx.fillStyle = `rgba(171, 71, 188, ${f.life / 20 * 0.4})`;
            ctx.beginPath(); ctx.arc(f.x, f.y, 200, 0, Math.PI * 2); ctx.fill();
        } else if (f.type === 'lightning') {
            ctx.strokeStyle = `rgba(255, 245, 157, ${f.life / 10})`;
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke();
        }
        if (f.life <= 0) fx.splice(i, 1);
    }

    // Trail logic
    if (player.trail > 0 && Math.random() < 0.2) {
        trails.push({ x: player.x, y: player.y, r: 10 + player.trail * 2, life: 60 });
    }
    for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.life--;
        ctx.fillStyle = `rgba(255, 105, 180, ${t.life / 60})`;
        ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fill();
        if (t.life <= 0) trails.splice(i, 1);
    }

    // Orb logic
    if (player.orbs > 0) {
        const time = Date.now() / 1000;
        for (let i = 0; i < player.orbs; i++) {
            const orbAngle = time * 3 + (i * Math.PI * 2 / player.orbs);
            const orbX = player.x + Math.cos(orbAngle) * 80;
            const orbY = player.y + Math.sin(orbAngle) * 80;
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath(); ctx.arc(orbX, orbY, 10, 0, Math.PI * 2); ctx.fill();
            // Collision with enemies
            enemies.forEach(e => {
                if (Math.hypot(e.x - orbX, e.y - orbY) < e.size / 2 + 10) {
                    e.health -= 0.8; // Buffed orb damage
                }
            });
        }
    }

    // Lightning logic
    if (player.lightning > 0 && Date.now() - lastLightning > (2500 / player.lightning)) {
        if (enemies.length > 0) {
            const target = enemies[Math.floor(Math.random() * enemies.length)];
            target.health -= 60;
            lastLightning = Date.now();
            fx.push({ type: 'lightning', x1: player.x, y1: player.y, x2: target.x, y2: target.y, life: 10 });
        }
    }

    // Nova logic
    if (player.nova > 0 && Date.now() - lastNova > 4000) {
        lastNova = Date.now();
        fx.push({ type: 'nova', x: player.x, y: player.y, life: 20 });
        enemies.forEach(e => {
            const d = Math.hypot(e.x - player.x, e.y - player.y);
            if (d < 250 + e.size / 2) {
                e.health -= 120;
            }
        });
    }

    if (keys.mousedown && Date.now() - player.lastShot > player.fireRate) {
        const worldMouseX = mouseX / camera.zoom + camera.x;
        const worldMouseY = mouseY / camera.zoom + camera.y;
        const angle = Math.atan2(worldMouseY - player.y, worldMouseX - player.x);
        for(let i=0; i<player.multishot; i++) {
            const spread = (i - (player.multishot-1)/2) * 0.2;
            bullets.push({
                x: player.x, y: player.y,
                vx: Math.cos(angle + spread) * player.bulletSpeed,
                vy: Math.sin(angle + spread) * player.bulletSpeed,
                damage: player.bulletDamage,
                size: player.rainbowSize,
                life: 120
            });
        }
        player.lastShot = Date.now();
    }

    player.draw(ctx);

    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life--;

        let hitWall = false;
        for (let w of walls) {
            if (rectCircleColliding({ x: b.x, y: b.y, radius: b.size }, w)) {
                hitWall = true;
                break;
            }
        }

        if (hitWall || b.life <= 0) {
            bullets.splice(i, 1);
            continue;
        }

        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size);
        grad.addColorStop(0, "white");grad.addColorStop(0.5, "cyan");grad.addColorStop(1, "rgba(255, 0, 255, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);ctx.fill();
    }

    // Enemy Projectiles
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eb = enemyBullets[i];
        eb.x += eb.vx;
        eb.y += eb.vy;
        eb.life--;

        let hitWall = false;
        for (let w of walls) {
            if (rectCircleColliding({ x: eb.x, y: eb.y, radius: eb.size }, w)) { hitWall = true; break; }
        }

        if (hitWall || eb.life <= 0) { enemyBullets.splice(i, 1); continue; }

        ctx.fillStyle = '#ff5252';
        ctx.beginPath(); ctx.arc(eb.x, eb.y, eb.size, 0, Math.PI * 2); ctx.fill();

        if (Math.hypot(player.x - eb.x, player.y - eb.y) < player.radius + eb.size) {
            player.health -= eb.damage;
            enemyBullets.splice(i, 1);
            if (player.health <= 0) { 
                gameActive = false; 
                saveGame();
                alert("Game Over!"); location.reload(); 
            }
        }
    }

    // Spawn rate: Starts at 0.04, increases by 0.01 every 10 seconds (10000ms)
    const timeElapsed = Date.now() - startTime;
    const spawnChance = 0.04 + (timeElapsed / 10000) * 0.01;
    if (Math.random() < spawnChance) {
        spawnEnemy();
        // Occasionally spawn extra enemies as time goes on
        if (timeElapsed > 60000 && Math.random() < 0.2) spawnEnemy();
        if (timeElapsed > 120000 && Math.random() < 0.4) spawnEnemy();
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const dist = Math.hypot(player.x - e.x, player.y - e.y);
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        
        const oldX = e.x;
        const oldY = e.y;

        // Enemy AI Movement
        let shouldMove = true;
        if (e.type === 'ranged' && dist < 400) shouldMove = false;

        if (shouldMove) {
            e.x += Math.cos(angle) * e.speed;
            if (e.type !== 'ghost') {
                for(let w of walls) {
                    if(rectCircleColliding({x: e.x, y: e.y, radius: e.size/2}, w)) { e.x = oldX; break; }
                }
            }
            e.y += Math.sin(angle) * e.speed;
            if (e.type !== 'ghost') {
                for(let w of walls) {
                    if(rectCircleColliding({x: e.x, y: e.y, radius: e.size/2}, w)) { e.y = oldY; break; }
                }
            }
        }

        // Ranged Attack
        if (e.type === 'ranged' && Date.now() - e.lastShot > e.fireRate) {
            enemyBullets.push({
                x: e.x, y: e.y,
                vx: Math.cos(angle) * 5,
                vy: Math.sin(angle) * 5,
                damage: 10,
                size: 6,
                life: 200
            });
            e.lastShot = Date.now();
        }

        if (dist < player.radius + e.size / 2) {
            player.health -= e.damage;
            if (e.type === 'bomber') e.health = 0; // Destroy bomber on contact
            if (player.health <= 0) { 
                gameActive = false; 
                saveGame(); // Save progress before reload
                alert("Game Over!"); 
                location.reload(); 
            }
        }

        // Check trails
        trails.forEach(t => {
            if (Math.hypot(e.x - t.x, e.y - t.y) < e.size / 2 + t.r) {
                e.health -= 0.3; // Buffed trail
            }
        });

        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (Math.hypot(e.x - b.x, e.y - b.y) < e.size / 2 + b.size) {
                e.health -= b.damage; bullets.splice(j, 1);
                if (e.health <= 0) break;
            }
        }
        if (e.health <= 0) { 
            gold += e.value; 
            player.health = Math.min(player.maxHealth, player.health + player.lifesteal); 
            enemies.splice(i, 1); 
            continue; 
        }
        
        // Only draw if on screen
        const viewWidth = canvas.width / camera.zoom;
        const viewHeight = canvas.height / camera.zoom;
        if (e.x > camera.x - 50 && e.x < camera.x + viewWidth + 50 &&
            e.y > camera.y - 50 && e.y < camera.y + viewHeight + 50) {
            ctx.fillStyle = e.color;
            if (e.type === 'tank') {
                ctx.fillRect(e.x - e.size/2, e.y - e.size/2, e.size, e.size);
                ctx.font = `${e.size * 0.8}px serif`;
                ctx.fillText('🛡️', e.x, e.y);
            } else {
                ctx.beginPath(); ctx.arc(e.x, e.y, e.size/2, 0, Math.PI * 2); ctx.fill();
                ctx.font = `${e.size}px serif`;
                if (e.type === 'ranged') ctx.fillText('🏹', e.x, e.y);
                else if (e.type === 'scout') ctx.fillText('⚡', e.x, e.y);
                else if (e.type === 'ghost') ctx.fillText('👻', e.x, e.y);
                else if (e.type === 'bomber') ctx.fillText('💣', e.x, e.y);
                else if (e.type === 'dragon') ctx.fillText('🐲', e.x, e.y);
                else ctx.fillText('🔫', e.x, e.y);
            }
        }
    }
    
    ctx.restore(); // Restore from camera translation

    gold += 0.02; // Reduced passive gold
    goldEl.textContent = Math.floor(gold);
    timeEl.textContent = Math.floor((Date.now() - startTime) / 1000) + 's';
    healthBar.style.width = (player.health / player.maxHealth * 100) + '%';
    hpText.textContent = `${Math.floor(player.health)}/${player.maxHealth}`;
    requestAnimationFrame(gameLoop);
}

// Load game data on initial script load
loadGame();
initShop();
