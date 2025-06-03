import * as THREE from 'three';

export function setupScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x111111, 0.01); // Nevoeiro escuro para dar ambiente mais sombrio
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return { scene, renderer }; 
}
