function saveGame() {
    const gameData = {
        playerStats: {
            maxHealth: player.maxHealth,
            speed: player.speed,
            regen: player.regen,
            bulletSpeed: player.bulletSpeed,
            bulletDamage: player.bulletDamage,
            fireRate: player.fireRate,
            rainbowSize: player.rainbowSize,
            multishot: player.multishot,
            lifesteal: player.lifesteal,
            orbs: player.orbs,
            lightning: player.lightning,
            trail: player.trail,
            nova: player.nova
        },
        camera: {
            zoom: camera.zoom
        },
        gold: gold,
        upgradeCosts: upgrades.map(up => up.cost)
    };
    localStorage.setItem('unicornSurvivorSave', JSON.stringify(gameData));
}

function loadGame() {
    const savedData = localStorage.getItem('unicornSurvivorSave');
    if (!savedData) {
        // Initial gold for new players
        if (typeof gold === 'undefined' || gold === 0) gold = 250;
        return;
    }

    try {
        const gameData = JSON.parse(savedData);
        
        // Load Player Stats
        if (gameData.playerStats) {
            Object.assign(player, gameData.playerStats);
        }

        // Load Camera Data
        if (gameData.camera && typeof gameData.camera.zoom === 'number') {
            camera.zoom = gameData.camera.zoom;
        }

        // Load Gold
        if (typeof gameData.gold === 'number') {
            gold = gameData.gold;
            if (typeof goldEl !== 'undefined') goldEl.textContent = Math.floor(gold);
        }

        // Load Upgrade Costs
        if (gameData.upgradeCosts && gameData.upgradeCosts.length === upgrades.length) {
            gameData.upgradeCosts.forEach((cost, index) => {
                upgrades[index].cost = cost;
            });
        }
    } catch (e) {
        console.error("Failed to load save data:", e);
    }
}
