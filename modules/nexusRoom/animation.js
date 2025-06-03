import * as THREE from 'three';

export function animateNexusRoom(params) {
    const {
        scene,
        camera,
        renderer,
        cameraRig,
        pitchObject,
        yawObject,
        clock = new THREE.Clock(),
        nexus = null,
        ROOM_SIZE,
        FLOOR_Y,
        ...restParams
    } = params;

    let moveSpeed = restParams.moveSpeed;
    let moveState = restParams.moveState;

    const movementDamping = 0.2;
    const currentVelocity = new THREE.Vector3();

    function render() {
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
        requestAnimationFrame(render);
        
        scene.traverse(object => {
            if (object.userData?.isGate) {
                const portal = object.children[object.children.length - 1];
                if (portal.userData?.update) {
                    portal.userData.update(delta);
                }
            }
        });

        if (nexus?.userData?.animate) {
            nexus.userData.animate(elapsedTime);
        }

        // Calculo de salto (physiscs)
        if (restParams.moveState.isJumping) {
            restParams.verticalVelocity -= restParams.GRAVITY * delta * 60;
            cameraRig.position.y += restParams.verticalVelocity * delta * 60;
        }

        const groundLevel = FLOOR_Y + (
            restParams.moveState.isCrouching ? restParams.CROUCH_HEIGHT : restParams.STAND_HEIGHT
        );

        if (cameraRig.position.y <= groundLevel) {
            if (restParams.verticalVelocity <= 0) {
                cameraRig.position.y = groundLevel;
                restParams.verticalVelocity = 0;
                restParams.isGrounded = true;
                restParams.moveState.isJumping = false;
            }
        }

        // Movimentação da personagem ~(primeira pessoa)
        const direction = new THREE.Vector3();
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        if (restParams.moveState.forward) direction.add(cameraDirection);
        if (restParams.moveState.backward) direction.sub(cameraDirection);
        if (restParams.moveState.left) direction.add(new THREE.Vector3(cameraDirection.z, 0, -cameraDirection.x));
        if (restParams.moveState.right) direction.add(new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x));

        if (direction.length() > 0) {
            direction.normalize();
            const targetVelocity = direction.multiplyScalar(
                restParams.moveState.isRunning ? restParams.moveSpeed * restParams.RUN_MULTIPLIER : restParams.moveSpeed
            );
            currentVelocity.lerp(targetVelocity, movementDamping);
            cameraRig.position.add(currentVelocity);
        } else {
            currentVelocity.lerp(new THREE.Vector3(), movementDamping);
        }

        const boundary = ROOM_SIZE / 2 - 0.5;
        cameraRig.position.x = THREE.MathUtils.clamp(cameraRig.position.x, -boundary, boundary);
        cameraRig.position.z = THREE.MathUtils.clamp(cameraRig.position.z, -boundary, boundary);

        renderer.render(scene, camera);
    }

    render();
}