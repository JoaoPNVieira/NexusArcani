import * as THREE from 'three';

export function setupMovement() {
    const BASE_MOVE_SPEED = 0.2;
    const RUN_MULTIPLIER = 1.8;
    const JUMP_FORCE = 0.4;
    const GRAVITY = 0.02;
    const CROUCH_HEIGHT = 1.0;
    const STAND_HEIGHT = 1.7;

    // Return mutable objects
    return {
        BASE_MOVE_SPEED,
        RUN_MULTIPLIER,
        JUMP_FORCE,
        GRAVITY,
        CROUCH_HEIGHT,
        STAND_HEIGHT,
        moveSpeed: BASE_MOVE_SPEED,
        verticalVelocity: 0,
        isGrounded: true,
        moveState: {
            forward: false,
            backward: false,
            left: false,
            right: false,
            isJumping: false,
            isCrouching: false,
            isRunning: false,
            isJumping: false
        }
    };
}