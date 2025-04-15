import * as THREE from 'three';

export function createGate(position, size, frameMaterial, portalMaterial, portalColor, rotationY) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);
    group.rotation.y = rotationY;

    // Frame construction (unchanged)
    const topBeam = new THREE.Mesh(
        new THREE.BoxGeometry(size.width, size.thickness, size.depth),
        frameMaterial
    );
    topBeam.position.y = size.height/2 - size.thickness/2;
    group.add(topBeam);

    const leftBeam = new THREE.Mesh(
        new THREE.BoxGeometry(size.thickness, size.height - size.thickness, size.depth),
        frameMaterial
    );
    leftBeam.position.x = -size.width/2 + size.thickness/2;
    leftBeam.position.y = -size.thickness/2;
    group.add(leftBeam);

    const rightBeam = new THREE.Mesh(
        new THREE.BoxGeometry(size.thickness, size.height - size.thickness, size.depth),
        frameMaterial
    );
    rightBeam.position.x = size.width/2 - size.thickness/2;
    rightBeam.position.y = -size.thickness/2;
    group.add(rightBeam);

    // Create portal with proper geometry for animation
    const portalWidth = size.width - size.thickness * 2;
    const portalHeight = size.height - size.thickness;
    
    // Higher segment count for smooth waves
    const portalGeometry = new THREE.PlaneGeometry(
        portalWidth, 
        portalHeight, 
        32, 32 // Width and height segments
    );
    
    // Store original positions for animation
    const originalPositions = portalGeometry.attributes.position.clone();
    portalGeometry.userData = { originalPositions };

    const portal = new THREE.Mesh(
        portalGeometry,
        portalMaterial.clone()
    );
    portal.material.emissive.setHex(portalColor);
    portal.material.roughness = 20;
    portal.position.z = size.depth/2 + 0.1;
    portal.position.y = -size.thickness/2;
    
    // Animation properties
    portal.userData = {
        time: 0,
        speed: 0.5,
        waveHeight: 0.15,
        update: function(delta) {
            this.time += delta * this.speed;
            
            const positions = portal.geometry.attributes.position;
            const original = portal.geometry.userData.originalPositions;
            
            for (let i = 0; i < positions.count; i++) {
                const x = original.getX(i);
                const y = original.getY(i);
                const wave = Math.sin(this.time + x * 0.5) * this.waveHeight;
                positions.setXYZ(i, x, y + wave, original.getZ(i));
            }
            
            positions.needsUpdate = true;
            
            // Texture animation
            portal.material.map.offset.y += delta * 0.05;
            if (portal.material.normalMap) {
                portal.material.normalMap.offset.y += delta * 0.05;
            }
        }
    };

    group.add(portal);
    group.userData.isGate = true;
    group.userData.portalColor = portalColor;

    return group;
}