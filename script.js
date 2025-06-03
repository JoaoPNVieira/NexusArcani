import * as THREE from 'three';
import { allSetups, GameState } from './modules/modularIndex.js';

let currentScene, currentCamera, currentRenderer, currentCameraRig;

function cleanupPreviousEnvironment() {
    if (currentRenderer) {
        document.body.removeChild(currentRenderer.domElement);
    }
}

function initNexusRoom() {
    cleanupPreviousEnvironment();

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

    currentScene = scene;
    currentCamera = camera;
    currentRenderer = renderer;
    currentCameraRig = cameraRig;
    GameState.currentEnvironment = 'nexusRoom';

    document.addEventListener('keydown', handleEnvironmentSwitch);
}

function initChessGame() {
    cleanupPreviousEnvironment();

    const { scene, renderer } = allSetups.main.setupScene();
    const chessEnv = allSetups.chessGame.chessEnvironment(scene);
    const { camera, cameraRig, pitchObject, yawObject } = allSetups.main.setupCamera(scene, chessEnv.FLOOR_Y);
    
    const movementParams = allSetups.main.setupMovement();
    
    allSetups.main.setupInput({
        cameraRig,
        camera,
        renderer,
        ROOM_SIZE: chessEnv.ROOM_SIZE,
        FLOOR_Y: chessEnv.FLOOR_Y,
        ...movementParams
    });
    
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    currentScene = scene;
    currentCamera = camera;
    currentRenderer = renderer;
    currentCameraRig = cameraRig;
    GameState.currentEnvironment = 'chessGame';

    document.addEventListener('keydown', handleEnvironmentSwitch);
}

function handleEnvironmentSwitch(e) {
    if (e.code === 'Digit1' && GameState.currentEnvironment !== 'chessGame') {
        initChessGame();
    } else if (e.code === 'Digit0' && GameState.currentEnvironment !== 'nexusRoom') {
        initNexusRoom();
    }
}

initNexusRoom();

window.addEventListener('resize', () => {
    if (currentCamera && currentRenderer) {
        currentCamera.aspect = window.innerWidth / window.innerHeight;
        currentCamera.updateProjectionMatrix();
        currentRenderer.setSize(window.innerWidth, window.innerHeight);
    }
});