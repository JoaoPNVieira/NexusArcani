import * as THREE from 'three';

export function nexusLights(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 50 / 2, 0);
    scene.add(directionalLight);
}
