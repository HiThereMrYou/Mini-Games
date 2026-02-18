export function draw(player, ctx) {
    ctx.font = `${player.radius * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦄', player.x, player.y);
}
