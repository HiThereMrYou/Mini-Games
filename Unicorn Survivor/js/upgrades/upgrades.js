const upgrades = [
    { name: "Golden Horn", desc: "+5 Damage", cost: 50, effect: () => player.bulletDamage += 5 },
    { name: "Rainbow Dash", desc: "+10% Speed", cost: 75, effect: () => player.speed *= 1.1 },
    { name: "Sparkle Shield", desc: "+50 Max HP", cost: 100, effect: () => { player.maxHealth += 50; player.health += 50; } },
    { name: "Rapid Fire", desc: "-15% Reload Time", cost: 150, effect: () => player.fireRate *= 0.85 },
    { name: "Multi-Horn", desc: "+1 Projectile", cost: 500, effect: () => player.multishot += 1 },
    { name: "Magic Orbs", desc: "Circling damage orbs", cost: 300, effect: () => player.orbs += 1 },
    { name: "Lightning Bolt", desc: "Periodic random strike", cost: 450, effect: () => player.lightning += 1 },
    { name: "Glitter Trail", desc: "Damaging walk path", cost: 250, effect: () => player.trail += 1 },
    { name: "Magical Nova", desc: "Huge periodic blast", cost: 600, effect: () => player.nova += 1 },
    { name: "Magic Regen", desc: "+1.0 HP/sec", cost: 200, effect: () => player.regen += 1 },
    { name: "Vampiric Magic", desc: "Heal on kill", cost: 400, effect: () => player.lifesteal += 3 }
];

function initShop() {
    const upgradeList = document.getElementById('upgrade-list');
    upgradeList.innerHTML = '';

    // Add FOV slider at the top of the shop
    const fovDiv = document.createElement('div');
    fovDiv.className = 'upgrade-item';
    fovDiv.innerHTML = `
        <div class="btn-top"><strong>Camera Zoom (FOV)</strong> 💰FREE</div>
        <div class="btn-desc">Adjust your field of view</div>
        <input type="range" id="fov-slider" min="0.5" max="2" step="0.1" value="${camera.zoom || 1}" 
               style="width: 100%; cursor: pointer;" 
               oninput="updateFOV(this.value)">
    `;
    upgradeList.appendChild(fovDiv);

    upgrades.forEach((up, index) => {
        const div = document.createElement('div');
        div.className = 'upgrade-item';
        div.innerHTML = `
            <div class="btn-top"><strong>${up.name}</strong> 💰${up.cost}</div>
            <div class="btn-desc">${up.desc}</div>
            <button class="upgrade-btn" id="up-${index}" onclick="buyUpgrade(${index})">Upgrade</button>
        `;
        upgradeList.appendChild(div);
    });
}

function buyUpgrade(index) {
    const up = upgrades[index];
    if (gold >= up.cost) {
        gold -= up.cost;
        up.effect();
        up.cost = Math.floor(up.cost * 1.7);
        initShop();
        saveGame();
    }
}

function toggleShop() {
    const shopMenu = document.getElementById('shop-menu');
    shopMenu.style.display = shopMenu.style.display === 'block' ? 'none' : 'block';
}

function updateFOV(val) {
    camera.zoom = parseFloat(val);
    saveGame();
}
