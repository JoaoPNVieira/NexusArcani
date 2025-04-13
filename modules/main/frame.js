import * as THREE from 'three';

export function createSquareFrame(size, material) {
    const group = new THREE.Group();
    
    const frameWidth = size.width;
    const frameHeight = size.height;
    const frameDepth = size.depth;
    const frameThickness = size.thickness;

    // Create three sides of the frame (top, left, right)
    // Top beam
    const topBeam = new THREE.Mesh(
        new THREE.BoxGeometry(frameWidth, frameThickness, frameDepth),
        material
    );
    topBeam.position.y = frameHeight/2 - frameThickness/2;
    group.add(topBeam);

    // Left beam
    const leftBeam = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, frameHeight - frameThickness, frameDepth),
        material
    );
    leftBeam.position.x = -frameWidth/2 + frameThickness/2;
    leftBeam.position.y = -frameThickness/2;
    group.add(leftBeam);

    // Right beam
    const rightBeam = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, frameHeight - frameThickness, frameDepth),
        material
    );
    rightBeam.position.x = frameWidth/2 - frameThickness/2;
    rightBeam.position.y = -frameThickness/2;
    group.add(rightBeam);

    return group;
}