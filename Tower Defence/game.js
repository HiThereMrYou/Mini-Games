import { Player } from './js/player/player.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants
const TILE_SIZE = 50;
const ROWS = 12;
const COLS = 16;
canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

const UI = {
    life: document.getElementById('life-val'),
    mana: document.getElementById('mana-val'),
    wood: document.getElementById('wood-val'),
    timer: document.getElementById('wave-timer')
};

const player = new Player();

// Game State
const state = {
    grid: [],
    path: [],
    enemies: [],
    towers: [],
    projectiles: [],
    particles: [],
    messages: [],
    wave: 0,
    waveTimer: 500,
    isWaveActive: false
};

// --- Classes ---

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1.0;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 4, 4);
        ctx.restore();
    }
}

class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1.0;
    }
    update() {
        this.y -= 0.5;
        this.life -= 0.015;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

class Tree {
    constructor(x, y) {
        this.gridX = x;
        this.gridY = y;
        this.x = x * TILE_SIZE + TILE_SIZE / 2;
        this.y = y * TILE_SIZE + TILE_SIZE / 2;
        this.health = 3;
    }
    draw() {
        // Trunk
        ctx.fillStyle = '#4e3620';
        ctx.fillRect(this.x - 4, this.y + 4, 8, 12);
        // Leaves
        ctx.fillStyle = '#2d5a27';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 15);
        ctx.lineTo(this.x - 12, this.y + 5);
        ctx.lineTo(this.x + 12, this.y + 5);
        ctx.fill();
        ctx.fillStyle = '#3a7a33';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 8);
        ctx.lineTo(this.x - 10, this.y + 8);
        ctx.lineTo(this.x + 10, this.y + 8);
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, target, damage, speed, color, isAOE = false, isSlow = false, radius = 60) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.color = color;
        this.isAOE = isAOE;
        this.isSlow = isSlow;
        this.radius = radius;
        this.dead = false;
    }
    update() {
        if (!this.target || this.target.health <= 0) {
            this.dead = true;
            return;
        }
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.speed) {
            this.hit();
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }
    hit() {
        if (this.isAOE) {
            state.enemies.forEach(e => {
                const d = Math.sqrt((e.x - this.x)**2 + (e.y - this.y)**2);
                if (d < this.radius) {
                    e.health -= this.damage;
                    if (this.isSlow) e.slowTimer = 120;
                }
            });
            for(let i=0; i<10; i++) state.particles.push(new Particle(this.x, this.y, this.color));
        } else {
            this.target.health -= this.damage;
            if (this.isSlow) this.target.slowTimer = 180;
        }
        this.dead = true;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Tower {
    constructor(x, y, type) {
        this.gridX = x;
        this.gridY = y;
        this.x = x * TILE_SIZE + TILE_SIZE / 2;
        this.y = y * TILE_SIZE + TILE_SIZE / 2;
        this.type = type;
        this.level = 1;
        this.cooldown = 0;
        this.angle = 0;
        
        const configs = {
            'basic':  { range: 150, rate: 40,  damage: 10, color: '#4db8ff', hp: 100, upCost: 20 },
            'fast':   { range: 120, rate: 15,  damage: 4,  color: '#ffd700', hp: 80,  upCost: 40 },
            'aoe':    { range: 100, rate: 60,  damage: 20, color: '#e94560', hp: 120, upCost: 50 },
            'sniper': { range: 350, rate: 100, damage: 50, color: '#ff00ff', hp: 90,  upCost: 90 },
            'slow':   { range: 130, rate: 50,  damage: 2,  color: '#00ffff', hp: 100, upCost: 75 },
            'wall':   { range: 0,   rate: 0,   damage: 0,  color: '#7f8c8d', hp: 500, upCost: 15 }
        };
        Object.assign(this, configs[type]);
        this.health = this.hp;
        this.maxHealth = this.hp;
    }
    upgrade() {
        const cost = this.upCost * this.level;
        if (player.mana >= cost || (this.type === 'wall' && player.wood >= cost)) {
            if (this.type === 'wall') player.wood -= cost;
            else player.mana -= cost;
            
            this.level++;
            
            // Specialized stat scaling
            if (this.type === 'sniper') {
                this.damage *= 1.6; // Sniper gets huge damage
                this.range *= 1.15;
                this.rate = Math.max(10, this.rate * 0.95);
            } else if (this.type === 'aoe') {
                this.damage *= 1.4;
                this.range *= 1.2; // Blast gets more range
                this.rate = Math.max(5, this.rate * 0.85); // Fires much faster
            } else if (this.type === 'fast') {
                this.damage *= 1.3;
                this.rate = Math.max(3, this.rate * 0.8); // Machine gun speed
            } else if (this.type === 'slow') {
                this.damage += 5;
                this.range *= 1.1;
                this.rate = Math.max(5, this.rate * 0.9);
            } else {
                this.damage *= 1.4;
                this.range *= 1.1;
                this.rate = Math.max(5, this.rate * 0.9);
            }

            this.maxHealth *= 1.5;
            this.health = this.maxHealth;
            
            state.messages.push(new FloatingText(this.x, this.y, `UPGRADED!`, "#ffd700"));
            for(let i=0; i<15; i++) state.particles.push(new Particle(this.x, this.y, this.color || '#ffffff'));
            return true;
        }
        return false;
    }
    update() {
        if (this.type === 'wall') return;
        if (this.cooldown > 0) this.cooldown--;
        
        const target = findTarget(this.x, this.y, this.range);
        if (target) {
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
            if (this.cooldown === 0) {
                const isSlow = this.type === 'slow';
                const isAOE = this.type === 'aoe';
                let projRadius = 60;
                if (isAOE) projRadius = 60 + (this.level * 10); // Blast grows with level
                
                state.projectiles.push(new Projectile(this.x, this.y, target, this.damage, 7, this.color, isAOE, isSlow, projRadius));
                this.cooldown = this.rate;
            }
        }
    }
    draw() {
        const cx = this.x;
        const cy = this.y;
        
        if (this.type === 'wall') {
            const wallSize = 20 + (this.level * 2);
            ctx.fillStyle = '#34495e';
            ctx.fillRect(cx - wallSize, cy - wallSize, wallSize * 2, wallSize * 2);
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - wallSize, cy - wallSize, wallSize * 2, wallSize * 2);
        } else {
            // Base - gets larger with levels
            const baseSize = 18 + (this.level * 1.5);
            ctx.fillStyle = '#16213e';
            ctx.beginPath();
            ctx.arc(cx, cy, baseSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Turret decoration per level
            if (this.level >= 3) {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, baseSize + 4, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Turret
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            
            // Barrel gets longer/thicker with levels
            const barrelWidth = 20 + (this.level * 4);
            const barrelHeight = 10 + (this.level * 2);
            ctx.fillRect(-5, -barrelHeight/2, barrelWidth, barrelHeight);
            
            const bodySize = 12 + (this.level * 1.5);
            ctx.fillRect(-bodySize, -bodySize, bodySize * 2, bodySize * 2);
            ctx.restore();

            // Level text shadow
            ctx.fillStyle = 'black';
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.level, cx + 1, cy + 6);
            // Level indicator
            ctx.fillStyle = 'white';
            ctx.fillText(this.level, cx, cy + 5);
            ctx.textAlign = 'left';
        }
        
        if (this.health < this.maxHealth) {
            ctx.fillStyle = 'red';
            ctx.fillRect(cx - 15, cy - 25, 30, 4);
            ctx.fillStyle = 'green';
            ctx.fillRect(cx - 15, cy - 25, 30 * (this.health / this.maxHealth), 4);
        }
    }
}

class Enemy {
    constructor(wave, type) {
        this.pathIndex = 0;
        this.x = state.path[0].x * TILE_SIZE + TILE_SIZE / 2;
        this.y = state.path[0].y * TILE_SIZE + TILE_SIZE / 2;
        this.type = type;
        this.slowTimer = 0;
        
        const cfgs = {
            'normal': { hp: 20,  speed: 1.2, color: '#e94560', size: 12 },
            'fast':   { hp: 12,  speed: 2.2, color: '#ffd700', size: 9 },
            'tank':   { hp: 80,  speed: 0.7, color: '#533483', size: 16 },
            'swarm':  { hp: 6,   speed: 1.8, color: '#90ee90', size: 6 },
            'boss':   { hp: 500, speed: 0.4, color: '#000000', size: 25 }
        };
        const c = cfgs[type];

        // Scaling Health (1.2^wave)
        const healthMult = Math.pow(1.22, wave - 1);
        this.maxHP = c.hp * healthMult;
        if (type === 'boss') this.maxHP *= 2.5;

        this.health = this.maxHP;
        // Cap speed to 4.5
        this.baseSpeed = Math.min(4.5, c.speed + (wave * 0.03));
        this.speed = this.baseSpeed;
        this.color = c.color;
        this.size = c.size;
        this.dead = false;
        this.reachedBase = false;
        
        // Reward Scaling
        this.reward = type === 'boss' ? 100 : Math.floor(12 + wave * 1.2);
    }
    update() {
        if (this.slowTimer > 0) {
            this.slowTimer--;
            this.speed = this.baseSpeed * 0.5;
        } else {
            this.speed = this.baseSpeed;
        }

        const targetTile = state.path[this.pathIndex];
        if (!targetTile) {
            this.reachedBase = true;
            return;
        }
        
        // Attack walls
        const tile = state.grid[targetTile.y][targetTile.x];
        if (tile.object instanceof Tower && tile.object.type === 'wall') {
            tile.object.health -= 0.5;
            for(let i=0; i<2; i++) state.particles.push(new Particle(this.x, this.y, '#7f8c8d'));
            return;
        }
        
        const tx = targetTile.x * TILE_SIZE + TILE_SIZE / 2;
        const ty = targetTile.y * TILE_SIZE + TILE_SIZE / 2;
        const dx = tx - this.x;
        const dy = ty - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.speed) {
            this.pathIndex++;
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // HP Bar
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x - 15, this.y - 18, 30, 3);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(this.x - 15, this.y - 18, 30 * (this.health / this.maxHP), 3);
    }
}

// --- Systems ---

function init() {
    state.grid = [];
    for (let y = 0; y < ROWS; y++) {
        state.grid[y] = [];
        for (let x = 0; x < COLS; x++) {
            const decor = Math.random() < 0.1 ? (Math.random() < 0.5 ? 'flower' : 'grass') : null;
            state.grid[y][x] = { type: 'ground', object: null, decor: decor };
            
            // Random Trees
            if (Math.random() < 0.12 && x > 1 && x < COLS - 2) {
                state.grid[y][x].object = new Tree(x, y);
            }
        }
    }
    
    // Static Path
    state.path = [
        {x:0,y:2}, {x:1,y:2}, {x:2,y:2}, {x:3,y:2}, {x:3,y:3}, {x:3,y:4}, {x:4,y:4},
        {x:5,y:4}, {x:6,y:4}, {x:6,y:5}, {x:6,y:6}, {x:6,y:7}, {x:7,y:7}, {x:8,y:7},
        {x:9,y:7}, {x:9,y:6}, {x:9,y:5}, {x:10,y:5}, {x:11,y:5}, {x:12,y:5}, {x:13,y:5},
        {x:14,y:5}, {x:15,y:5}
    ];
    state.path.forEach(p => {
        state.grid[p.y][p.x].type = 'path';
        state.grid[p.y][p.x].object = null;
    });
}

function findTarget(x, y, range) {
    let best = null;
    let minDist = range;
    state.enemies.forEach(e => {
        const d = Math.sqrt((e.x - x)**2 + (e.y - y)**2);
        if (d < minDist) {
            minDist = d;
            best = e;
        }
    });
    return best;
}

function spawnWave() {
    state.wave++;
    state.isWaveActive = true;
    let count = 5 + state.wave * 3;
    const interval = setInterval(() => {
        if (count-- <= 0) {
            clearInterval(interval);
            state.isWaveActive = false;
            return;
        }
        let type = 'normal';
        const r = Math.random();
        if (state.wave % 5 === 0 && count === 1) type = 'boss';
        else if (r < 0.2 && state.wave > 3) type = 'swarm';
        else if (r < 0.4 && state.wave > 2) type = 'fast';
        else if (r < 0.6 && state.wave > 4) type = 'tank';
        
        state.enemies.push(new Enemy(state.wave, type));
    }, 700);
}

function update() {
    if (player.life <= 0) return;
    
    player.update();
    
    // Wave Management
    if (!state.isWaveActive && state.enemies.length === 0) {
        state.waveTimer--;
        if (state.waveTimer <= 0) {
            spawnWave();
            state.waveTimer = 600;
        }
    }
    
    // Update Objects
    state.enemies.forEach((e, i) => {
        e.update();
        if (e.health <= 0) {
            player.mana += e.reward;
            state.messages.push(new FloatingText(e.x, e.y, `+${e.reward} Mana`, "#ffd700"));
            state.enemies.splice(i, 1);
        } else if (e.reachedBase) {
            player.life--;
            state.enemies.splice(i, 1);
        }
    });
    
    state.towers.forEach((t, i) => {
        t.update();
        if (t.health <= 0) {
            state.grid[t.gridY][t.gridX].object = null;
            state.towers.splice(i, 1);
        }
    });
    
    state.projectiles.forEach((p, i) => {
        p.update();
        if (p.dead) state.projectiles.splice(i, 1);
    });
    
    state.particles.forEach((p, i) => {
        p.update();
        if (p.life <= 0) state.particles.splice(i, 1);
    });
    
    state.messages.forEach((m, i) => {
        m.update();
        if (m.life <= 0) state.messages.splice(i, 1);
    });
    
    // UI Update
    UI.life.innerText = player.life;
    UI.mana.innerText = Math.floor(player.mana);
    UI.wood.innerText = player.wood;
    UI.timer.innerText = state.isWaveActive || state.enemies.length > 0 ? `Wave ${state.wave}` : Math.ceil(state.waveTimer / 60) + "s";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const tile = state.grid[y][x];
            ctx.fillStyle = tile.type === 'path' ? '#5c4033' : '#2b580c';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            
            if (tile.decor === 'grass') {
                ctx.fillStyle = '#1e3d08';
                ctx.fillRect(x * TILE_SIZE + 10, y * TILE_SIZE + 10, 2, 8);
            } else if (tile.decor === 'flower') {
                ctx.fillStyle = '#ff69b4';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + 20, y * TILE_SIZE + 20, 2, 0, Math.PI*2);
                ctx.fill();
            }
            
            if (tile.object) tile.object.draw();
        }
    }
    
    state.enemies.forEach(e => e.draw());
    state.projectiles.forEach(p => p.draw());
    state.particles.forEach(p => p.draw());
    state.messages.forEach(m => m.draw());
    
    // Player Preview and Status
    player.draw(ctx, state, TILE_SIZE, Tower);
    
    if (player.life <= 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText(`Survived ${state.wave} Waves`, canvas.width/2, canvas.height/2 + 50);
        ctx.textAlign = 'left';
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// --- Interaction ---

// Hotkeys
window.addEventListener('keydown', e => {
    // 'B' key to toggle Shop visibility
    if (e.code === 'KeyB') {
        const shop = document.getElementById('ui-bottom');
        const isShowing = shop.classList.toggle('show-shop');
        
        if (isShowing) {
            // Auto-select Upgrade tool when opening shop
            const upgradeBtn = document.getElementById('btn-upgrade');
            if (player.selectedAction !== 'btn-upgrade') {
                upgradeBtn.click();
            }
        } else {
            // Deselect tool when closing shop
            player.selectedAction = null;
            document.querySelectorAll('.shop-btn').forEach(b => b.classList.remove('active'));
        }
    }
    
    // Quick-select hotkeys
    if (e.code === 'Digit1') document.getElementById('btn-tower-basic').click();
    if (e.code === 'Digit2') document.getElementById('btn-tower-fast').click();
    if (e.code === 'Digit3') document.getElementById('btn-tower-aoe').click();
    if (e.code === 'Digit4') document.getElementById('btn-tower-sniper').click();
    if (e.code === 'Digit5') document.getElementById('btn-tower-slow').click();
});

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    player.mouse.x = e.clientX - rect.left;
    player.mouse.y = e.clientY - rect.top;
    player.mouse.gridX = Math.floor(player.mouse.x / TILE_SIZE);
    player.mouse.gridY = Math.floor(player.mouse.y / TILE_SIZE);
});

canvas.addEventListener('mousedown', () => {
    const { gridX, gridY } = player.mouse;
    const tile = state.grid[gridY][gridX];
    
    if (player.selectedAction === 'btn-upgrade') {
        if (tile.object instanceof Tower) {
            tile.object.upgrade();
        }
    } else if (player.selectedAction === 'btn-chop') {
        if (tile.object instanceof Tree) {
            tile.object.health--;
            player.wood += 5;
            state.messages.push(new FloatingText(player.mouse.x, player.mouse.y, "+5 Wood", "#90ee90"));
            if (tile.object.health <= 0) tile.object = null;
        }
    } else if (player.selectedAction?.startsWith('btn-tower-')) {
        const type = player.selectedAction.split('-')[2];
        const costs = { 'basic': 50, 'fast': 100, 'aoe': 150, 'sniper': 250, 'slow': 200 };
        const cost = costs[type];
        
        // If clicking existing tower of same type, upgrade it
        if (tile.object instanceof Tower && tile.object.type === type) {
            tile.object.upgrade();
        } else if (tile.type === 'ground' && !tile.object && player.mana >= cost) {
            player.mana -= cost;
            const t = new Tower(gridX, gridY, type);
            tile.object = t;
            state.towers.push(t);
        }
    } else if (player.selectedAction === 'btn-tower-wall') {
        if (tile.object instanceof Tower && tile.object.type === 'wall') {
            tile.object.upgrade();
        } else if (tile.type === 'path' && !tile.object && player.wood >= 20) {
            player.wood -= 20;
            const t = new Tower(gridX, gridY, 'wall');
            tile.object = t;
            state.towers.push(t);
        }
    } else if (player.selectedAction === 'btn-spell-fire') {
        if (player.mana >= 30) {
            player.mana -= 30;
            state.enemies.forEach(e => {
                const d = Math.sqrt((e.x - player.mouse.x)**2 + (e.y - player.mouse.y)**2);
                if (d < 80) e.health -= 60;
            });
            for(let i=0; i<30; i++) state.particles.push(new Particle(player.mouse.x, player.mouse.y, '#e94560'));
        }
    } else if (player.selectedAction === 'btn-spell-freeze') {
        if (player.mana >= 60) {
            player.mana -= 60;
            state.enemies.forEach(e => {
                const d = Math.sqrt((e.x - player.mouse.x)**2 + (e.y - player.mouse.y)**2);
                if (d < 150) e.slowTimer = 400; // Long slow
            });
            for(let i=0; i<40; i++) state.particles.push(new Particle(player.mouse.x, player.mouse.y, '#00ffff'));
        }
    }
});

document.querySelectorAll('.shop-btn').forEach(btn => {
    if (btn.id === 'btn-next-wave') {
        btn.addEventListener('click', () => {
            if (!state.isWaveActive && state.enemies.length === 0) {
                state.waveTimer = 0;
            }
        });
        return;
    }
    
    btn.addEventListener('click', () => {
        if (player.selectedAction === btn.id) {
            player.selectedAction = null;
            btn.classList.remove('active');
        } else {
            document.querySelectorAll('.shop-btn:not(#btn-next-wave)').forEach(b => b.classList.remove('active'));
            player.selectedAction = btn.id;
            btn.classList.add('active');
        }
    });
});

init();
loop();
