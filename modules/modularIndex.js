// MAIN IMPORTS
import { setupCamera } from './main/camera.js';
// import { createSquareFrame } from './main/frame.js';
import { setupMovement } from './main/movement.js';
// import { createPortal } from './main/portal.js';
import { setupScene } from './main/scene.js';
import { setupInput } from './main/userInput.js';

// NEXUS ROOM IMPORTS
import { nexusEnvironment } from './nexusRoom/environment.js';
import { nexusLights } from './nexusRoom/lighting.js';
import { createNexus } from './nexusRoom/nexusOrb.js';
import { animateNexusRoom } from './nexusRoom/animation.js';

export const allSetups = {
    main: {
        setupCamera,
        // createSquareFrame,
        setupMovement,
        // createPortal,
        setupScene,
        setupInput
    },
    nexusRoom: {
        nexusEnvironment,
        nexusLights,
        createNexus,
        animateNexusRoom
    }
};

