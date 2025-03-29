import * as THREE from 'three';

export function nexusEnvironment(scene) {
    const ROOM_SIZE = 100;
    const ROOM_HEIGHT = 50;
    const FLOOR_Y = -ROOM_HEIGHT / 2;

    const wallMaterials = [
        new THREE.MeshStandardMaterial({ color: 0xAAAAAA, side: THREE.BackSide }),
        new THREE.MeshStandardMaterial({ color: 0x666666, side: THREE.BackSide }),
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
        new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.BackSide }),
        new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.BackSide })
    ];

    const roomGeometry = new THREE.BoxGeometry(ROOM_SIZE, ROOM_HEIGHT, ROOM_SIZE);
    const room = new THREE.Mesh(roomGeometry, wallMaterials);
    scene.add(room);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
        new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.8, metalness: 0.2 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = FLOOR_Y;
    scene.add(floor);

    const grid = new THREE.GridHelper(ROOM_SIZE, ROOM_SIZE / 2, 0x333333, 0x222222);
    grid.position.y = FLOOR_Y + 0.01;
    scene.add(grid);

    return { ROOM_SIZE, ROOM_HEIGHT, FLOOR_Y };
}
