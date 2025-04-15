import * as THREE from 'three';

export function setupInput(params) { 
    let isPointerLocked = false;

    const onMouseMove = (e) => {
        if (isPointerLocked && params.camera.yawObject && params.camera.pitchObject) {
            const sensitivity = 0.002;
            params.camera.yawObject.rotation.y -= e.movementX * sensitivity;
            params.camera.pitchObject.rotation.x = THREE.MathUtils.clamp(
                params.camera.pitchObject.rotation.x - (e.movementY * sensitivity),
                -Math.PI / 2.5,
                Math.PI / 2.5
            );
        }
    };

    params.renderer.domElement.addEventListener('click', () => {
        params.renderer.domElement.requestPointerLock().catch(err => {
            console.error("Pointer lock failed:", err);
        });
    });

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === params.renderer.domElement;
        if (isPointerLocked) {
            document.addEventListener('mousemove', onMouseMove);
        } else {
            document.removeEventListener('mousemove', onMouseMove);
        }
    });

    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': params.moveState.forward = true; break;
            case 'KeyS': params.moveState.backward = true; break;
            case 'KeyA': params.moveState.left = true; break;
            case 'KeyD': params.moveState.right = true; break;
            case 'Space':
                if (params.isGrounded) {
                    params.verticalVelocity = params.JUMP_FORCE;
                    params.isGrounded = false;
                    params.moveState.isJumping = true;
                    console.log("JUMP INITIATED");
                }
                break;
            case 'ControlLeft':
            case 'ControlRight':
                if (!params.moveState.isCrouching) {
                    params.cameraRig.position.y = params.FLOOR_Y + params.CROUCH_HEIGHT;
                    params.moveSpeed = params.BASE_MOVE_SPEED * 0.6;
                    params.moveState.isCrouching = true;
                }
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                if (!params.moveState.isRunning) {
                    params.moveSpeed = params.BASE_MOVE_SPEED * params.RUN_MULTIPLIER;
                    params.moveState.isRunning = true;
                }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW': params.moveState.forward = false; break;
            case 'KeyS': params.moveState.backward = false; break;
            case 'KeyA': params.moveState.left = false; break;
            case 'KeyD': params.moveState.right = false; break;
            case 'ControlLeft':
            case 'ControlRight':
                if (params.moveState.isCrouching) {
                    params.cameraRig.position.y = params.FLOOR_Y + params.STAND_HEIGHT;
                    params.moveSpeed = params.BASE_MOVE_SPEED;
                    params.moveState.isCrouching = false;
                }
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                if (params.moveState.isRunning) {
                    params.moveSpeed = params.BASE_MOVE_SPEED;
                    params.moveState.isRunning = false;
                }
                break;

        }
    });
}
