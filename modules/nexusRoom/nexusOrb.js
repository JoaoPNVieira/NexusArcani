import * as THREE from 'three';

export function createNexus(radius = 6) {
    const nexusGroup = new THREE.Group();
    
    // Initialize userData immediately
    nexusGroup.userData = nexusGroup.userData || {};
    nexusGroup.userData.initialized = true;

    // Core setup
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.3, 0.3, 0.5),
        emissive: new THREE.Color(0.1, 0.1, 0.2),
        emissiveIntensity: 1,
        side: THREE.DoubleSide
    });
    nexusGroup.add(new THREE.Mesh(geometry, material));

    // Ring creation helper
    const createRing = (distance, thickness, speed) => {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(radius + distance, thickness, 16, 100),
            new THREE.MeshStandardMaterial({/*...*/})
        );
        ring.userData = {
            rotationSpeed: speed,
            wobbleSpeed: speed * 2,
            wobbleAmount: distance * 0.1
        };
        return ring;
    };

    const rings = [
        createRing(0.5, 0.1, 0.02),
        createRing(1.5, 0.15, 0.015),
        createRing(2.5, 0.2, 0.01)
    ];
    nexusGroup.add(...rings);

    // Guaranteed animation function
    nexusGroup.userData.animate = function(time) {
        rings.forEach(ring => {
            if (!ring.userData) return;
            ring.rotation.x = Math.sin(time * ring.userData.wobbleSpeed) * ring.userData.wobbleAmount;
            ring.rotation.y += ring.userData.rotationSpeed;
            ring.rotation.z = Math.cos(time * ring.userData.wobbleSpeed) * ring.userData.wobbleAmount;
        });
    };

    return nexusGroup;
}