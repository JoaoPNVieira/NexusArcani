// MAIN IMPORTS
import { setupScene } from './main/scene.js';
import { setupCamera } from './main/camera.js';
import { setupMovement } from './main/movement.js';
import { setupInput } from './main/userInput.js';

// NEXUS ROOM IMPORTS
import { nexusEnvironment } from './nexusRoom/environment.js';
import { nexusLights } from './nexusRoom/lighting.js';
import { createNexus } from './nexusRoom/nexusOrb.js';
import { animateNexusRoom } from './nexusRoom/animation.js';

export const allSetups = {
    main: {
        setupScene,
        setupCamera,
        setupMovement,
        setupInput
    },
    nexusRoom: {
        nexusEnvironment,
        nexusLights,
        createNexus,
        animateNexusRoom
    }
};

