export function draw(player, ctx, state, TILE_SIZE, Tower) {
    if (player.selectedAction) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(player.mouse.gridX * TILE_SIZE, player.mouse.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.setLineDash([]);
        
        // Range indicator
        const ranges = { 
            'btn-tower-basic': 150, 
            'btn-tower-fast': 120, 
            'btn-tower-aoe': 100, 
            'btn-tower-sniper': 350, 
            'btn-tower-slow': 130, 
            'btn-spell-fire': 80,
            'btn-spell-freeze': 150
        };
        
        let r = ranges[player.selectedAction];
        
        // Show current tower range and upgrade cost if hovering over an existing tower
        const hoverTile = state.grid[player.mouse.gridY]?.[player.mouse.gridX];
        if (hoverTile && hoverTile.object instanceof Tower) {
            const isUpgradeMode = player.selectedAction === 'btn-upgrade';
            const isMatchingTool = player.selectedAction?.includes(hoverTile.object.type);
            const isWallTool = player.selectedAction === 'btn-tower-wall' && hoverTile.object.type === 'wall';

            if (isUpgradeMode || isMatchingTool || isWallTool) {
                r = hoverTile.object.range;
                
                // Show cost tooltip
                const cost = hoverTile.object.upCost * hoverTile.object.level;
                const resource = hoverTile.object.type === 'wall' ? 'W' : 'M';
                const typeName = hoverTile.object.type.toUpperCase();
                
                ctx.fillStyle = 'white';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(`LVL ${hoverTile.object.level} ${typeName}`, player.mouse.x + 15, player.mouse.y - 25);
                ctx.fillStyle = (player.mana >= cost || (resource === 'W' && player.wood >= cost)) ? '#90ee90' : '#ff6b6b';
                ctx.fillText(`UPGRADE: ${cost}${resource}`, player.mouse.x + 15, player.mouse.y - 10);
            }
        }

        if (r) {
            ctx.beginPath();
            ctx.arc(player.mouse.x, player.mouse.y, r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fill();
            ctx.stroke();
        }
    }
}
