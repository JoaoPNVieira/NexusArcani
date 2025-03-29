// ========================================================================
// SCENE SETUP
// ========================================================================
const scene = new THREE.Scene(); // Container for all 3D objects


const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);


// Perspective Camera (units: degrees for FOV, meters for distances)
const camera = new THREE.PerspectiveCamera(
    75, // Field of View (human vision: 60-90°)
    window.innerWidth / window.innerHeight, // Aspect ratio (screen proportion)
    0.1, // Near clipping plane (meters - min render distance)
    1000 // Far clipping plane (meters - max render distance)
);

// WebGL Renderer (pixel-based display)
const renderer = new THREE.WebGLRenderer({
    antialias: true // Smooths jagged edges (4xMSAA)
});
renderer.setSize(window.innerWidth, window.innerHeight); // Match viewport size
document.body.appendChild(renderer.domElement); // Inject canvas into DOM

// ========================================================================
// ENVIRONMENT CONSTRUCTION (Your original room setup)
// ========================================================================
const ROOM_SIZE = 100; // Floor dimensions (X/Z axes in meters)
const ROOM_HEIGHT = 50; // Wall height (Y axis in meters)
const FLOOR_Y = -ROOM_HEIGHT / 2; // Floor position calculation (center at Y=0)

// WALL MATERIALS (Hex colors, THREE.BackSide renders interior faces)
const wallMaterials = [
    new THREE.MeshStandardMaterial({ color: 0xAAAAAA, side: THREE.BackSide }), // Right
    new THREE.MeshStandardMaterial({ color: 0x666666, side: THREE.BackSide }), // Left
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.BackSide }), // Ceiling
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }), // Floor (hidden)
    new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.BackSide }), // Front
    new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.BackSide })  // Back
];

// ROOM MESH (Box geometry with custom materials)
const roomGeometry = new THREE.BoxGeometry(ROOM_SIZE, ROOM_HEIGHT, ROOM_SIZE);
const room = new THREE.Mesh(roomGeometry, wallMaterials);
scene.add(room);

// FLOOR CONSTRUCTION (Separate plane for better control)
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE), // Dimensions match room
    new THREE.MeshStandardMaterial({
        color: 0x5a5a5a, // Dark gray base color
        roughness: 0.8, // Surface texture (0 = smooth, 1 = rough)
        metalness: 0.2 // Material reflectivity (0 = non-metal, 1 = metal)
    })
);
floor.rotation.x = -Math.PI / 2; // Rotate to horizontal plane
floor.position.y = FLOOR_Y; // Align with bottom of walls
scene.add(floor);

// GRID HELPER (Visual reference for scale)
const grid = new THREE.GridHelper(
    ROOM_SIZE, // Size matches floor
    ROOM_SIZE / 2, // Division count (100x100 grid)
    0x333333, // Center line color
    0x222222 // Grid line color
);
grid.position.y = FLOOR_Y + 0.01; // Elevate slightly to prevent z-fighting
scene.add(grid);

// ========================================================================
// CAMERA SYSTEM (Your original first-person controls)
// ========================================================================
const cameraRig = new THREE.Group(); // Parent object for movement
scene.add(cameraRig);

// Camera positioning (human eye level)
cameraRig.position.set(0, FLOOR_Y + 1.7, 10); // Start 10 meters back from the eye
camera.position.set(0, 0, 0.5); // Offset from rig center

// Rotation controllers
const pitchObject = new THREE.Object3D(); // Vertical rotation (pitch)
const yawObject = new THREE.Object3D(); // Horizontal rotation (yaw)
yawObject.add(pitchObject);
pitchObject.add(camera);
cameraRig.add(yawObject);

// ========================================================================
// MOVEMENT SYSTEM (Your original physics-based controls)
// ========================================================================
// Physical constants (meters per frame)
const BASE_MOVE_SPEED = 0.2; // Base walk speed (0.2m/frame ≈ 3.6km/h at 60fps)
const RUN_MULTIPLIER = 1.8; // Sprint multiplier (0.36m/frame ≈ 6.48km/h)
const JUMP_FORCE = 0.4; // Initial jump velocity (meters/frame)
const GRAVITY = 0.02; // Downward acceleration (m/frame²)
const CROUCH_HEIGHT = 1.0; // Crouched eye level (meters)
const STAND_HEIGHT = 1.7; // Standing eye level (meters)

// Movement state tracking
let moveSpeed = BASE_MOVE_SPEED;
let verticalVelocity = 0;
let isGrounded = true;

const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    isJumping: false,
    isCrouching: false,
    isRunning: false
};

// ========================================================================
// INPUT HANDLING (Your original user interaction)
// ========================================================================
// Mouse controls
let isPointerLocked = false;

document.addEventListener('mousemove', (e) => {
    if (isPointerLocked) {
        const sensitivity = 0.002; // Rotation speed (radians per pixel)
        yawObject.rotation.y -= e.movementX * sensitivity; // Yaw rotation
        pitchObject.rotation.x = THREE.MathUtils.clamp( // Pitch with limits
            pitchObject.rotation.x - (e.movementY * sensitivity),
            -Math.PI / 2.5, // Max upward angle (~72°)
            Math.PI / 2.5 // Max downward angle (~72°)
        );
    }
});

// Pointer lock controls
renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch (e.code) {
        // Movement keys
        case 'KeyW': moveState.forward = true; break;
        case 'KeyS': moveState.backward = true; break;
        case 'KeyA': moveState.left = true; break;
        case 'KeyD': moveState.right = true; break;

        // Jump mechanic
        case 'Space':
            if (isGrounded) {
                verticalVelocity = JUMP_FORCE;
                isGrounded = false;
            }
            break;

        // Crouch mechanic
        case 'ControlLeft':
        case 'ControlRight':
            cameraRig.position.y = FLOOR_Y + CROUCH_HEIGHT;
            moveSpeed = BASE_MOVE_SPEED * 0.6; // 40% speed reduction
            break;

        // Sprint mechanic
        case 'ShiftLeft':
        case 'ShiftRight':
            moveSpeed = BASE_MOVE_SPEED * RUN_MULTIPLIER;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.code) {
        // Movement keys
        case 'KeyW': moveState.forward = false; break;
        case 'KeyS': moveState.backward = false; break;
        case 'KeyA': moveState.left = false; break;
        case 'KeyD': moveState.right = false; break;

        // Crouch reset
        case 'ControlLeft':
        case 'ControlRight':
            cameraRig.position.y = FLOOR_Y + STAND_HEIGHT;
            moveSpeed = BASE_MOVE_SPEED;
            break;

        // Sprint reset
        case 'ShiftLeft':
        case 'ShiftRight':
            moveSpeed = BASE_MOVE_SPEED;
            break;
    }
});

// ========================================================================
// GAME LOOP (Your original physics and rendering with eye animation)
// ========================================================================
const clock = new THREE.Clock();

// ========================================================================
// NEXUS
// ========================================================================

function createNexus(radius = 6) {
    const nexusGroup = new THREE.Group();

    // Core Geometry
    const segments = 64; // latitude & longitude
    const geometry = new THREE.SphereGeometry(radius, segments, segments);

    // Main Materials
    const nexusMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.3, 0.3, 0.5),
        emissive: new THREE.Color(0.1, 0.1, 0.2),
        emissiveIntensity: 1,
        side: THREE.DoubleSide
    });

    const nexusCore = new THREE.Mesh(geometry, nexusMaterial);
    nexusGroup.add(nexusCore);

    // Ring creation function
    function createRing(distance, thickness, speed) {
        const ringGeometry = new THREE.TorusGeometry(radius + distance, thickness, 16, 100);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0.3, 0.3, 0.5),
            emissive: new THREE.Color(0.1, 0.1, 0.2),
            emissiveIntensity: 0.5
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.userData.rotationSpeed = speed;
        ring.userData.wobbleSpeed = speed * 2;
        ring.userData.wobbleAmount = distance * 0.1;
        return ring;
    }

    // Create three rings
    const ring1 = createRing(0.5, 0.1, 0.02);
    const ring2 = createRing(1.5, 0.15, 0.015);
    const ring3 = createRing(2.5, 0.2, 0.01);

    nexusGroup.add(ring1, ring2, ring3);

    // Animation function
    nexusGroup.userData.animate = function (time) {
        [ring1, ring2, ring3].forEach(ring => {
            ring.rotation.x = Math.sin(time * ring.userData.wobbleSpeed) * ring.userData.wobbleAmount;
            ring.rotation.y += ring.userData.rotationSpeed;
            ring.rotation.z = Math.cos(time * ring.userData.wobbleSpeed) * ring.userData.wobbleAmount;
        });
    };

    return nexusGroup;
}

const nexus = createNexus();
scene.add(nexus);

// ========================================================================
// Animate
// ========================================================================

function animate() {
    requestAnimationFrame(animate);

    // Update Nexus animation
    if (nexus.userData.animate) {
        nexus.userData.animate(clock.getElapsedTime());
    }

    cameraRig.position.y += verticalVelocity; // Apply jump/gravity
    verticalVelocity -= GRAVITY; // Simulate gravity

    // Ground collision
    if (cameraRig.position.y <= FLOOR_Y + STAND_HEIGHT) {
        verticalVelocity = 0; // Stop falling
        cameraRig.position.y = FLOOR_Y + (moveState.isCrouching ? CROUCH_HEIGHT : STAND_HEIGHT);
        isGrounded = true;
    }

    // Horizontal movement calculation
    const direction = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection); // Get view direction

    // Movement vectors
    if (moveState.forward) direction.add(cameraDirection);
    if (moveState.backward) direction.sub(cameraDirection);
    if (moveState.left) direction.add(new THREE.Vector3(cameraDirection.z, 0, -cameraDirection.x)); // Left strafe
    if (moveState.right) direction.add(new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x)); // Right strafe

    direction.normalize(); // Maintain diagonal speed consistency
    cameraRig.position.addScaledVector(direction, moveSpeed);

    // Boundary constraints
    const boundary = ROOM_SIZE / 2 - 0.5; // 0.5m buffer from walls
    cameraRig.position.x = THREE.MathUtils.clamp(cameraRig.position.x, -boundary, boundary);
    cameraRig.position.z = THREE.MathUtils.clamp(cameraRig.position.z, -boundary, boundary);

    renderer.render(scene, camera); // Draw frame
}

animate(); // Start simulation

// Window resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // Adjust camera frustum
    renderer.setSize(window.innerWidth, window.innerHeight); // Reset resolution
});
