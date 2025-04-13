import * as THREE from 'three';

export function createGate(position, size, frameColor, portalColor, rotationY) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);
    group.rotation.y = rotationY;

    // Create three-sided frame (top, left, right)
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: frameColor,
        side: THREE.DoubleSide
    });

    // Top beam
    const topBeam = new THREE.Mesh(
        new THREE.BoxGeometry(size.width, size.thickness, size.depth),
        frameMaterial
    );
    topBeam.position.y = size.height/2 - size.thickness/2;
    group.add(topBeam);

    // Left beam
    const leftBeam = new THREE.Mesh(
        new THREE.BoxGeometry(size.thickness, size.height - size.thickness, size.depth),
        frameMaterial
    );
    leftBeam.position.x = -size.width/2 + size.thickness/2;
    leftBeam.position.y = -size.thickness/2;
    group.add(leftBeam);

    // Right beam
    const rightBeam = new THREE.Mesh(
        new THREE.BoxGeometry(size.thickness, size.height - size.thickness, size.depth),
        frameMaterial
    );
    rightBeam.position.x = size.width/2 - size.thickness/2;
    rightBeam.position.y = -size.thickness/2;
    group.add(rightBeam);

    // Create full-height portal
    const portalMaterial = new THREE.MeshStandardMaterial({ 
        color: portalColor,
        transparent: true,
        opacity: 0.9,
        emissive: portalColor,
        emissiveIntensity: 0.7,
        side: THREE.DoubleSide
    });
    
    const portalWidth = size.width - size.thickness * 2;
    const portalHeight = size.height - size.thickness; // Full height minus top beam
    
    const portal = new THREE.Mesh(
        new THREE.PlaneGeometry(portalWidth, portalHeight),
        portalMaterial
    );
    portal.position.z = size.depth/2 + 0.1;
    portal.position.y = -size.thickness/2; // Align with bottom
    group.add(portal);

    // Add interactivity properties
    group.userData = {
        isGate: true,
        portalColor: portalColor,
        position: position,
        size: size,
        showPrompt: function() {
            // This would be called when player is near the gate
            console.log("Press L Mouse to travel");
            // In your game, you'd probably want to show this in the UI
        },
        hidePrompt: function() {
            // This would be called when player moves away
            console.log("Hide travel prompt");
        },
        activate: function() {
            // This would be called when player clicks the gate
            console.log(`Traveling through ${portalColor.toString(16)} gate`);
        }
    };

    return group;
}