import * as THREE from 'three';

/**
 * Configura o sistema de câmara para o ambiente 3D
 * @param {THREE.Scene} scene - O objeto de cena Three.js
 * @param {number} FLOOR_Y - Posição Y do plano do chão
 * @returns {Object} - Contém a câmara e os seus elementos de controlo
 */

export function setupCamera(scene, FLOOR_Y) {
    
    // CÂMARA: Perspetiva com valores padrão
    const camera = new THREE.PerspectiveCamera(
        75,                                     // Campo de visão (em graus)
        window.innerWidth / window.innerHeight, // Proporção de aspeto
        0.1,                                    // Plano de corte próximo
        1000                                    // Plano de corte distante
    );
    
    // Grupo para servir como base do sistema de câmara
    const cameraRig = new THREE.Group();
    scene.add(cameraRig);
    
    // Posiciona o rig ligeiramente acima do chão (1.7 unidades ≈ altura dos olhos)
    cameraRig.position.set(0, FLOOR_Y + 1.7, 10);

    /**
     * Sistema de rotação da câmara:
     * yawObject (rotação horizontal) -> pitchObject (inclinação vertical) -> câmara
     * Esta separação evita problemas de gimbal lock e permite controlo independente
     */
    const pitchObject = new THREE.Object3D(); // Controla a rotação vertical
    const yawObject = new THREE.Object3D();   // Controla a rotação horizontal
    
    // Hierarquia: yaw -> pitch -> câmara
    yawObject.add(pitchObject);
    pitchObject.add(camera);
    cameraRig.add(yawObject);

    // Expõe os objetos de rotação para o sistema de input
    camera.yawObject = yawObject;    // Referência para controlo horizontal
    camera.pitchObject = pitchObject; // Referência para controlo vertical

    return { 
        camera,      // Objeto principal da câmara
        cameraRig,   // Objeto pai para movimento posicional
        pitchObject, // Controlador de rotação vertical
        yawObject    // Controlador de rotação horizontal
    };
}