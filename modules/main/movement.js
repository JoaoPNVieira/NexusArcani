import * as THREE from 'three';

export function setupMovement() {
    return {
        BASE_MOVE_SPEED: 0.2,
        RUN_MULTIPLIER: 1.8,
        JUMP_FORCE: 5,
        GRAVITY: 0.5, 
        CROUCH_HEIGHT: 1.0,
        STAND_HEIGHT: 1.7,
        moveSpeed: 0.2,
        verticalVelocity: 0,
        isGrounded: true,
        moveState: {
            forward: false,
            backward: false,
            left: false,
            right: false,
            isJumping: false,
            isCrouching: false,
            isRunning: false
        }
    };
}
