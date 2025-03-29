// MAIN IMPORTS
import { setupScene } from '/NexusArcani/main/scene.js';
import { setupCamera } from '/NexusArcani/main/camera.js';
import { setupMovement } from '/NexusArcani/main/movement.js';
import { setupInput } from '/NexusArcani/main/userInput.js';

// NEXUS ROOM IMPORTS
import { nexusEnvironment } from '/NexusArcani/nexusRoom/environment.js';
import { nexusLights } from '/NexusArcani/nexusRoom/lighting.js';
import { createNexus } from '/NexusArcani/nexusRoom/nexusOrb.js';
import { animateNexusRoom } from '/NexusArcani/nexusRoom/animation.js';

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