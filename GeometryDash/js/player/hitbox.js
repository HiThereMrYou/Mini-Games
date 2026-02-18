export function getBounds(player) {
    if (player.mode === 'ship') {
        return {
            left: player.x,
            right: player.x + 40,
            top: player.y + 10,
            bottom: player.y + 30
        };
    } else if (player.mode === 'wave') {
        return {
            left: player.x + 5,
            right: player.x + 35,
            top: player.y + 5,
            bottom: player.y + 35
        };
    } else if (player.mode === 'ufo') {
        return {
            left: player.x - 5,
            right: player.x + 45,
            top: player.y + 5,
            bottom: player.y + 35
        };
    } else if (player.mode === 'ball') {
        return {
            left: player.x + 2,
            right: player.x + 38,
            top: player.y + 2,
            bottom: player.y + 38
        };
    } else { // cube
        return {
            left: player.x,
            right: player.x + 40,
            top: player.y,
            bottom: player.y + 40
        };
    }
}
