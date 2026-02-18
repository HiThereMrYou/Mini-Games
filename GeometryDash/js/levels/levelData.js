import { generateCompleteLevel } from './levelGenerator.js';
import { gameState, levelTitleElement } from '../core/constants.js';

export const levels = [
    { name: "Stereo Madness", color: "#3498db", type: "basics", mult: 4 },
    { name: "Back on Track", color: "#2ecc71", type: "pads", mult: 4 },
    { name: "Polargeist", color: "#34495e", type: "orbs", mult: 4 },
    { name: "Dry Out", color: "#e67e22", type: "gravity", mult: 5 },
    { name: "Base After Base", color: "#95a5a6", type: "basics", mult: 6 },
    { name: "Can't Let Go", color: "#8e44ad", type: "mixed", mult: 5 },
    { name: "Jumper", color: "#16a085", type: "ship", mult: 5 },
    { name: "Cycles", color: "#c0392b", type: "ball", mult: 5 },
    { name: "xStep", color: "#34495e", type: "orbs", mult: 6 },
    { name: "Time Machine", color: "#d35400", type: "gravity", mult: 6 },
    { name: "Clutterfunk", color: "#7f8c8d", type: "mixed", mult: 6 },
    { name: "Theory of Everything", color: "#e74c3c", type: "mixed", mult: 7 },
    { name: "Electroman Adventures", color: "#27ae60", type: "ufo", mult: 6 },
    { name: "Electrodynamix", color: "#16a085", type: "expert", mult: 6 },
    { name: "Hexagon Force", color: "#f39c12", type: "wave", mult: 6 },
    { name: "Blast Processing", color: "#2980b9", type: "wave", mult: 7 },
    { name: "Geometrical Dominator", color: "#2ecc71", type: "mixed", mult: 8 },
    { name: "Fingerdash", color: "#8e44ad", type: "mixed", mult: 8 },
    { name: "Dash", color: "#c0392b", type: "expert", mult: 9 },
    { name: "Theory of Everything 2", color: "#2c3e50", type: "expert", mult: 10 },
    { name: "Deadlocked", color: "#000000", type: "expert", mult: 12 },
    { name: "Clubstep", color: "#2c3e50", type: "expert", mult: 11 }
];

export function initLevels() {
    levels.forEach(l => {
        try {
            const generated = generateCompleteLevel(l.type, l.mult);
            l.data = generated.data;
            l.end = generated.end;
        } catch (e) {
            console.error("Failed to generate level", l.name, e);
            l.data = [];
            l.end = 1000;
        }
    });
}

export function renderLevelButtons(onSelect) {
    const menu = document.getElementById('menu');
    if (!menu) return;
    menu.innerHTML = '';
    levels.forEach((level, index) => {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.innerText = level.name;
        btn.onclick = () => {
            gameState.currentLevelIndex = index;
            levelTitleElement.innerText = levels[index].name;
            onSelect(index);
        };
        btn.style.backgroundColor = level.color;
        menu.appendChild(btn);
    });
}
