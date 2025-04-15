import * as THREE from 'three';
import { allSetups } from './modules/modularIndex.js';

function init() {
    const { scene, renderer } = allSetups.main.setupScene();
    const { ROOM_SIZE, ROOM_HEIGHT, FLOOR_Y } = allSetups.nexusRoom.nexusEnvironment(scene);
    const { camera, cameraRig, pitchObject, yawObject } = allSetups.main.setupCamera(scene, FLOOR_Y);
    
    allSetups.nexusRoom.nexusLights(scene);
    const movementParams = allSetups.main.setupMovement();
    
    const nexus = allSetups.nexusRoom.createNexus();
    scene.add(nexus);
    
    allSetups.main.setupInput({
        cameraRig,
        camera,
        renderer,
        ROOM_SIZE,
        FLOOR_Y,
        ...movementParams
    });
    
    const clock = new THREE.Clock();
    allSetups.nexusRoom.animateNexusRoom({
        scene,
        camera,
        renderer,
        cameraRig,
        pitchObject,
        yawObject,
        clock,
        nexus,
        ROOM_SIZE,
        FLOOR_Y,
        ...movementParams
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

init();