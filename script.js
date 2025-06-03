import * as THREE from 'three';
import { allSetups, GameState } from './modules/modularIndex.js';

function initNexusRoom() {
    // Clear previous scene if exists
    if (GameState.scenes.nexusRoom) {
        GameState.scenes.nexusRoom.dispose();
    }

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

    // Store references
    GameState.scenes.nexusRoom = scene;
    GameState.cameras.nexusRoom = camera;
    GameState.renderers.nexusRoom = renderer;
    GameState.cameraRigs.nexusRoom = cameraRig;

    // Add keyboard listener for environment switching
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Digit1') {
            initChessGame();
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function initChessGame() {
    // Clear previous scene if exists
    if (GameState.scenes.chessGame) {
        GameState.scenes.chessGame.dispose();
    }

    const { scene, renderer } = allSetups.main.setupScene();
    const { ROOM_SIZE, FLOOR_Y } = allSetups.chessGame.chessEnvironment(scene);
    const { camera, cameraRig, pitchObject, yawObject } = allSetups.main.setupCamera(scene, FLOOR_Y);
    
    const movementParams = allSetups.main.setupMovement();
    
    allSetups.main.setupInput({
        cameraRig,
        camera,
        renderer,
        ROOM_SIZE,
        FLOOR_Y,
        ...movementParams
    });
    
    const clock = new THREE.Clock();
    
    // Simple animation loop for chess game
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    // Store references
    GameState.scenes.chessGame = scene;
    GameState.cameras.chessGame = camera;
    GameState.renderers.chessGame = renderer;
    GameState.cameraRigs.chessGame = cameraRig;
    GameState.currentEnvironment = 'chessGame';

    // Add keyboard listener for environment switching
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Digit0') {
            initNexusRoom();
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize with Nexus Room by default
initNexusRoom();