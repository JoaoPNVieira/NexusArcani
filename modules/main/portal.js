import * as THREE from 'three';

export function createPortal(size, color, options = {}) {
    const defaults = {
        opacity: 0.9,
        emissiveIntensity: 0.7,
        side: THREE.DoubleSide,
        transparent: true
    };
    const settings = { ...defaults, ...options };

    const portalMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        ...settings
    });

    const portalGeometry = new THREE.PlaneGeometry(size.width, size.height);
    const portal = new THREE.Mesh(portalGeometry, portalMaterial);

    return portal;
}