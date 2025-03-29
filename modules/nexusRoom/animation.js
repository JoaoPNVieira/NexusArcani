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
        requestAnimationFrame(render);
        
        // Nexus animation
        if (nexus?.userData?.animate) {
            nexus.userData.animate(clock.getElapsedTime());
        }

        // ========== IMPORTANT JUMP FIXES START HERE ========== //
        
        // 1. Apply gravity FIRST (before movement)
        verticalVelocity -= restParams.GRAVITY;
        
        // 2. Then apply vertical movement (jumping/falling)
        cameraRig.position.y += verticalVelocity;

        // 3. Improved ground collision detection
        const currentStandHeight = moveState.isCrouching ? restParams.CROUCH_HEIGHT : restParams.STAND_HEIGHT;
        const groundLevel = FLOOR_Y + currentStandHeight;

        if (cameraRig.position.y <= groundLevel) {
            // Snap to ground level
            cameraRig.position.y = groundLevel;
            
            // Only reset states if we were falling down (not jumping up)
            if (verticalVelocity <= 0) {
                verticalVelocity = 0;
                isGrounded = true;
                moveState.isJumping = false;
                
                // Debug log (you can remove this later)
                console.log("Landed! Grounded:", isGrounded, "Jumping:", moveState.isJumping);
            }
        }

        // ========== MOVEMENT CODE (UNCHANGED) ========== //
        const direction = new THREE.Vector3();
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        
        // Flatten the direction vector
        cameraDirection.y = 0;
        cameraDirection.normalize();

        if (moveState.forward) direction.add(cameraDirection);
        if (moveState.backward) direction.sub(cameraDirection);
        if (moveState.left) direction.add(new THREE.Vector3(cameraDirection.z, 0, -cameraDirection.x));
        if (moveState.right) direction.add(new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x));

        // Apply movement with damping
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