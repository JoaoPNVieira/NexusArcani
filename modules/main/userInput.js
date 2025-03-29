import * as THREE from 'three';

export function setupInput({
    cameraRig,
    camera,
    renderer,
    ROOM_SIZE,
    FLOOR_Y,
    BASE_MOVE_SPEED,
    RUN_MULTIPLIER,
    JUMP_FORCE,
    GRAVITY,
    CROUCH_HEIGHT,
    STAND_HEIGHT,
    moveSpeed,
    verticalVelocity,
    isGrounded,
    moveState
}) {
    let isPointerLocked = false;

    // Mouse movement handler
    const onMouseMove = (e) => {
        if (isPointerLocked && camera.yawObject && camera.pitchObject) {
            const sensitivity = 0.002;
            camera.yawObject.rotation.y -= e.movementX * sensitivity;
            camera.pitchObject.rotation.x = THREE.MathUtils.clamp(
                camera.pitchObject.rotation.x - (e.movementY * sensitivity),
                -Math.PI / 2.5,
                Math.PI / 2.5
            );
        }
    };

    // Pointer lock controls
    renderer.domElement.addEventListener('click', () => {
        renderer.domElement.requestPointerLock().catch(err => {
            console.error("Pointer lock failed:", err);
        });
    });

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === renderer.domElement;
        if (isPointerLocked) {
            document.addEventListener('mousemove', onMouseMove);
        } else {
            document.removeEventListener('mousemove', onMouseMove);
        }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': moveState.forward = true; break;
            case 'KeyS': moveState.backward = true; break;
            case 'KeyA': moveState.left = true; break;
            case 'KeyD': moveState.right = true; break;
            case 'Space':
                if (isGrounded && !moveState.isJumping) {
                    verticalVelocity = JUMP_FORCE;
                    isGrounded = false;
                    moveState.isJumping = true;
                }
                break;
            case 'ControlLeft':
            case 'ControlRight':
                if (!moveState.isCrouching) {
                    cameraRig.position.y = FLOOR_Y + CROUCH_HEIGHT;
                    moveSpeed = BASE_MOVE_SPEED * 0.6;
                    moveState.isCrouching = true;
                }
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                if (!moveState.isRunning) {
                    moveSpeed = BASE_MOVE_SPEED * RUN_MULTIPLIER;
                    moveState.isRunning = true;
                }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW': moveState.forward = false; break;
            case 'KeyS': moveState.backward = false; break;
            case 'KeyA': moveState.left = false; break;
            case 'KeyD': moveState.right = false; break;
            case 'ControlLeft':
            case 'ControlRight':
                if (moveState.isCrouching) {
                    cameraRig.position.y = FLOOR_Y + STAND_HEIGHT;
                    moveSpeed = BASE_MOVE_SPEED;
                    moveState.isCrouching = false;
                }
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                if (moveState.isRunning) {
                    moveSpeed = BASE_MOVE_SPEED;
                    moveState.isRunning = false;
                }
                break;
             case 'Space':
                if (isGrounded) {
                    verticalVelocity = JUMP_FORCE;
                    isGrounded = false;
                    moveState.isJumping = true;
                    console.log("Jump initiated!"); // Debug log
                }
                break;
        }
    });
}