// Input handling for keyboard controls

export class InputHandler {
  constructor() {
    this.keys = {};
    this.setupListeners();
  }

  setupListeners() {
    document.addEventListener('keydown', (e) => {
      // Handle spacebar specially
      if (e.code === 'Space') {
        this.keys['space'] = true;
        e.preventDefault();
      } else {
        this.keys[e.key.toLowerCase()] = true;
      }
    });

    document.addEventListener('keyup', (e) => {
      // Handle spacebar specially
      if (e.code === 'Space') {
        this.keys['space'] = false;
        e.preventDefault();
      } else {
        this.keys[e.key.toLowerCase()] = false;
      }
    });
  }

  isKeyPressed(key) {
    return this.keys[key.toLowerCase()] === true;
  }

  isMovingLeft() {
    return this.isKeyPressed('arrowleft') || this.isKeyPressed('a');
  }

  isMovingRight() {
    return this.isKeyPressed('arrowright') || this.isKeyPressed('d');
  }

  isMovingUp() {
    return this.isKeyPressed('arrowup') || this.isKeyPressed('w');
  }

  isMovingDown() {
    return this.isKeyPressed('arrowdown') || this.isKeyPressed('s');
  }

  isShooting() {
    return this.isKeyPressed('space');
  }

  isPausing() {
    return this.isKeyPressed('p');
  }

  isRestarting() {
    return this.isKeyPressed('r');
  }
}
