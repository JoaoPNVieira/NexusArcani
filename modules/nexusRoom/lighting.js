import * as THREE from 'three';

export function nexusLights(scene) {
    // Redução de luz ambiente para fazer o ambiente mais escuro
    const ambientLight = new THREE.AmbientLight(0x222222, 0.3); // Ambiente mais escuro
    scene.add(ambientLight); 

    // Luz direcionada
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(0, 50 / 2, 0);
    scene.add(directionalLight);
}