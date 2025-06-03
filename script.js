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
    
    // Configurar input p/movimento
    const inputParams = {
        cameraRig,
        camera,
        renderer,
        ROOM_SIZE: chessEnv.ROOM_SIZE,
        FLOOR_Y: chessEnv.FLOOR_Y,
        ...movementParams
    };
    
    allSetups.main.setupInput(inputParams);
    
    // Loop de animação (movimento)
    const clock = new THREE.Clock();
    const movementDamping = 0.2;
    const currentVelocity = new THREE.Vector3();
    
    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        
        // Moovimento: 
        const direction = new THREE.Vector3();
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        if (inputParams.moveState.forward) direction.add(cameraDirection);
        if (inputParams.moveState.backward) direction.sub(cameraDirection);
        if (inputParams.moveState.left) direction.add(new THREE.Vector3(cameraDirection.z, 0, -cameraDirection.x));
        if (inputParams.moveState.right) direction.add(new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x));

        if (direction.length() > 0) {
            direction.normalize();
            const targetVelocity = direction.multiplyScalar(
                inputParams.moveState.isRunning ? inputParams.moveSpeed * inputParams.RUN_MULTIPLIER : inputParams.moveSpeed
            );
            currentVelocity.lerp(targetVelocity, movementDamping);
            cameraRig.position.add(currentVelocity);
        } else {
            currentVelocity.lerp(new THREE.Vector3(), movementDamping);
        }

        // Check de limites
        const boundary = chessEnv.ROOM_SIZE / 2 - 0.5;
        cameraRig.position.x = THREE.MathUtils.clamp(cameraRig.position.x, -boundary, boundary);
        cameraRig.position.z = THREE.MathUtils.clamp(cameraRig.position.z, -boundary, boundary);

        renderer.render(scene, camera);
    }
    
    animate();

    // Referencias salvaguardadas
    currentScene = scene;
    currentCamera = camera;
    currentRenderer = renderer;
    currentCameraRig = cameraRig;
    GameState.currentEnvironment = 'chessGame';
    GameState.cleanupChess = chessEnv.cleanup;

    // Keyboard listener para a troca de ambiente (necessário)
    document.addEventListener('keydown', handleEnvironmentSwitch);
}

// Função para troca de environment (ir para jogo de xadrez ou voltar)
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