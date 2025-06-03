// MAIN IMPORTS
import { setupCamera } from './main/camera.js';
import { setupMovement } from './main/movement.js';
import { setupScene } from './main/scene.js';
import { setupInput } from './main/userInput.js';

// NEXUS ROOM IMPORTS
import { nexusEnvironment } from './nexusRoom/environment.js';
import { nexusLights } from './nexusRoom/lighting.js';
import { createNexus } from './nexusRoom/nexusOrb.js';
import { animateNexusRoom } from './nexusRoom/animation.js';

// CHESS GAME IMPORTS
import { chessEnvironment } from './chessGame/environment.js';

export const allSetups = {
    main: {
        setupCamera,
        setupMovement,
        setupScene,
        setupInput
    },
    nexusRoom: {
        nexusEnvironment,
        nexusLights,
        createNexus,
        animateNexusRoom
    },
    chessGame: {
        chessEnvironment
    }
};

export const GameState = {
    currentEnvironment: 'nexusRoom',
    scenes: {},
    cameras: {},
    renderers: {},
    cameraRigs: {}
};