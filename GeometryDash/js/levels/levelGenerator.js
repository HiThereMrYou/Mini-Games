import { GROUND_Y } from '../core/constants.js';

export function createCubeSegment(startX, length) {
    const segment = [{ x: startX, type: 'portal-cube' }];
    for (let x = startX + 100; x < startX + length; x += 300) {
        const density = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < density; i++) {
            segment.push({ x: x + (i * 40), type: 'spike' });
        }
        
        if (Math.random() > 0.6) {
            segment.push({ x: x + 150, type: 'block' });
            segment.push({ x: x + 190, type: 'block' });
            segment.push({ x: x + 190, type: 'spike', y: GROUND_Y - 80 });
        }
    }
    return segment;
}

export function createWaveSegment(startX, length) {
    const segment = [{ x: startX, type: 'portal-wave' }];
    for (let x = startX + 100; x < startX + length; x += 300) {
        const type = Math.floor(Math.random() * 3);
        if (type === 0) {
            const centerY = 150 + Math.random() * 100;
            for (let i = 0; i < 200; i += 40) {
                segment.push({ x: x + i, type: 'block', y: centerY - 120 });
                segment.push({ x: x + i, type: 'block', y: centerY + 80 });
                segment.push({ x: x + i, type: 'spike', y: centerY + 40 });
            }
        } else if (type === 1) {
            segment.push({ x: x, type: 'block', y: 50, height: 100 });
            segment.push({ x: x, type: 'block', y: 300, height: 100 });
            segment.push({ x: x + 150, type: 'block', y: 150, height: 100 });
        } else {
            for (let i = 0; i < 200; i += 40) {
                segment.push({ x: x + i, type: 'block', y: 50 + (i/2) });
                segment.push({ x: x + i, type: 'block', y: 350 - (i/2) });
            }
        }
    }
    return segment;
}

export function createShipSegment(startX, length) {
    const segment = [{ x: startX, type: 'portal-ship' }];
    for (let x = startX + 100; x < startX + length; x += 350) {
        const type = Math.floor(Math.random() * 3);
        const gapY = 100 + Math.random() * 200;
        if (type === 0) {
            segment.push({ x: x, type: 'block', y: gapY - 150, height: 100 });
            segment.push({ x: x, type: 'block', y: gapY + 100, height: 100 });
        } else if (type === 1) {
            segment.push({ x: x, type: 'spike', y: gapY - 40 });
            segment.push({ x: x + 100, type: 'ceiling-spike', y: gapY + 40 });
        } else {
            segment.push({ x: x, type: 'block', y: 50, width: 200 });
            segment.push({ x: x, type: 'block', y: GROUND_Y - 40, width: 200 });
            segment.push({ x: x + 100, type: 'orb-yellow', y: 225 });
        }
    }
    return segment;
}

export function createBallSegment(startX, length) {
    const segment = [{ x: startX, type: 'portal-ball' }];
    for (let x = startX + 100; x < startX + length; x += 300) {
        const type = Math.floor(Math.random() * 3);
        if (type === 0) {
            segment.push({ x: x, type: 'block', y: 100, width: 100 });
            segment.push({ x: x, type: 'block', y: 300, width: 100 });
        } else if (type === 1) {
            segment.push({ x: x, type: 'pad-blue', y: GROUND_Y - 10 });
            segment.push({ x: x + 150, type: 'spike' });
        } else {
            segment.push({ x: x, type: 'block', y: 200, width: 40, height: 40 });
            segment.push({ x: x + 40, type: 'spike', y: 160 });
        }
    }
    return segment;
}

export function createUfoSegment(startX, length) {
    const segment = [{ x: startX, type: 'portal-ufo' }];
    for (let x = startX + 100; x < startX + length; x += 400) {
        const type = Math.floor(Math.random() * 3);
        const h = 100 + Math.random() * 200;
        if (type === 0) {
            segment.push({ x: x, type: 'block', y: h, width: 120 });
            segment.push({ x: x + 40, type: 'spike', y: h - 40 });
        } else if (type === 1) {
            segment.push({ x: x, type: 'orb-pink', y: h });
            segment.push({ x: x + 100, type: 'block', y: h + 100 });
        } else {
            segment.push({ x: x, type: 'spike', y: 50 });
            segment.push({ x: x, type: 'spike', y: GROUND_Y - 40 });
        }
    }
    return segment;
}

export function generateCompleteLevel(theme = "mixed", multiplier = 5) {
    let data = [];
    let currentX = 500;
    const segmentLength = 1000;
    
    const segmentMap = {
        cube: createCubeSegment,
        ship: createShipSegment,
        wave: createWaveSegment,
        ball: createBallSegment,
        ufo: createUfoSegment,
        basics: createCubeSegment,
        pads: createCubeSegment,
        orbs: createCubeSegment,
        gravity: createCubeSegment,
        mixed: null,
        expert: null
    };

    const allSegments = [
        createCubeSegment, 
        createShipSegment, 
        createWaveSegment, 
        createBallSegment, 
        createUfoSegment
    ];

    const totalSegments = Math.max(4, Math.floor(multiplier * 1.5));
    
    for (let i = 0; i < totalSegments; i++) {
        let typeFunc;
        if (Math.random() < 0.8 || !segmentMap[theme]) {
            typeFunc = allSegments[Math.floor(Math.random() * allSegments.length)];
        } else {
            typeFunc = segmentMap[theme];
        }

        data = data.concat(typeFunc(currentX, segmentLength));
        currentX += segmentLength + 200;
    }
    
    return { data, end: currentX + 500 };
}
