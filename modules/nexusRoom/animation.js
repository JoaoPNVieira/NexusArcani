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

    let {
        moveSpeed,
        verticalVelocity,
        isGrounded,
        moveState
    } = restParams;

    // For smooth movement
    const movementDamping = 0.2;
    const currentVelocity = new THREE.Vector3();

    function render() {
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
        requestAnimationFrame(render);
        
        // Animate all gates in the scene
        scene.traverse(object => {
            if (object.userData?.isGate) {
                // Find the portal mesh (it's the last child)
                const portal = object.children[object.children.length - 1];
                if (portal.userData?.update) {
                    portal.userData.update(delta);
                }
            }
        });

        // Nexus animation (if exists)
        if (nexus?.userData?.animate) {
            nexus.userData.animate(elapsedTime);
        }

        // ====== Rest of your existing physics/movement code ====== //
        verticalVelocity -= restParams.GRAVITY;
        cameraRig.position.y += verticalVelocity;

        const currentStandHeight = moveState.isCrouching ? restParams.CROUCH_HEIGHT : restParams.STAND_HEIGHT;
        const groundLevel = FLOOR_Y + currentStandHeight;

        if (cameraRig.position.y <= groundLevel) {
            cameraRig.position.y = groundLevel;
            if (verticalVelocity <= 0) {
                verticalVelocity = 0;
                isGrounded = true;
                moveState.isJumping = false;
            }
        }

        // Movement code (unchanged)
        const direction = new THREE.Vector3();
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        
        cameraDirection.y = 0;
        cameraDirection.normalize();

        if (moveState.forward) direction.add(cameraDirection);
        if (moveState.backward) direction.sub(cameraDirection);
        if (moveState.left) direction.add(new THREE.Vector3(cameraDirection.z, 0, -cameraDirection.x));
        if (moveState.right) direction.add(new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x));

        if (direction.length() > 0) {
            direction.normalize();
            const targetVelocity = direction.multiplyScalar(
                moveState.isRunning ? moveSpeed * restParams.RUN_MULTIPLIER : moveSpeed
            );
            currentVelocity.lerp(targetVelocity, movementDamping);
            cameraRig.position.add(currentVelocity);
        } else {
            currentVelocity.lerp(new THREE.Vector3(), movementDamping);
        }

        // Boundary constraints
        const boundary = ROOM_SIZE / 2 - 0.5;
        cameraRig.position.x = THREE.MathUtils.clamp(cameraRig.position.x, -boundary, boundary);
        cameraRig.position.z = THREE.MathUtils.clamp(cameraRig.position.z, -boundary, boundary);

        renderer.render(scene, camera);
    }

    render();
}