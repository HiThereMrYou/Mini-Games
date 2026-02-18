# Joel's Waste of a Game

## Overview
"Joel's Waste of a Game" is a simple 2D shooter game built using HTML, CSS, and JavaScript. The game features player controls, enemy spawning, shooting mechanics, and a scoring system. 

## Project Structure
The project is organized into the following directories and files:

```
joels-waste-of-a-game
├── html
│   └── index.html          # Main HTML structure for the game
├── css
│   └── style.css           # Styles for the game
├── js
│   ├── main.js             # App bootstrap / wiring
│   ├── game.js             # Game loop and state management
│   ├── input.js            # Keyboard / input handling
│   ├── render.js           # Canvas rendering logic
│   ├── ui.js               # DOM UI bindings (buttons, HUD)
│   ├── utils.js            # Helper functions (rand, clamp, collision)
│   └── entities
│       ├── player.js       # Player entity definition
│       ├── enemy.js        # Enemy entity definition
│       ├── bullet.js       # Bullet entity definition
│       └── particle.js     # Particle entity definition
├── .gitignore               # Files to ignore by Git
├── package.json             # npm configuration file
└── README.md                # Project documentation
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd joels-waste-of-a-game
   ```
3. Open `html/index.html` in your web browser to play the game.

## Gameplay
- **Controls:**
  - Move: Arrow keys or A/D
  - Shoot: Spacebar
  - Pause: P
  - Restart: R

- **Objective:**
  Survive waves of enemies while scoring points by shooting them down. Keep an eye on your lives and try to achieve the highest score possible!

## Contributing
Feel free to submit issues or pull requests if you have suggestions or improvements for the game. 

## License
This project is open-source and available under the MIT License.