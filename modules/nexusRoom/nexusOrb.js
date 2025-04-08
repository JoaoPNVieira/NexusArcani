import * as THREE from 'three';

export function createNexus(radius = 6) {
    const nexusGroup = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();
    
    const textures = {
        star: {
            map: './textures/surfaces/nexus/lava/color.jpg',
            displacement: './textures/surfaces/nexus/lava/displacement.jpg',
            emission: './textures/surfaces/nexus/lava/emission.jpg',
            normal: './textures/surfaces/nexus/lava/normalGL.jpg',
            roughness: './textures/surfaces/nexus/lava/roughness.jpg'
        },
        rings: {
            color: './textures/surfaces/nexus/water2/color.jpg',
            displacement: './textures/surfaces/nexus/water2/disp.png',
            occ: './textures/surfaces/nexus/water2/occ.jpg',
            normal: './textures/surfaces/nexus/water2/normal.jpg',
            specular: './textures/surfaces/nexus/water2/spec.jpg'
        }
    };

    const loadedTextures = {};
    for (const [type, paths] of Object.entries(textures)) {
        loadedTextures[type] = {};
        for (const [mapType, path] of Object.entries(paths)) {
            const texture = textureLoader.load(path, undefined, undefined, 
                (err) => console.error(`Failed to load ${type} ${mapType}:`, err));
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 8;
            loadedTextures[type][mapType] = texture;
        }
    }

    // Enhanced star core material with brighter emission
    const starCore = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 128, 128),
        new THREE.MeshStandardMaterial({
            map: loadedTextures.star.map,
            displacementMap: loadedTextures.star.displacement,
            displacementScale: 0.1,
            emissiveMap: loadedTextures.star.emission,
            emissiveIntensity: 4.0, 
            emissive: new THREE.Color(0xffaa33), 
            normalMap: loadedTextures.star.normal,
            normalMapType: THREE.TangentSpaceNormalMap,
            roughnessMap: loadedTextures.star.roughness,
            roughness: 0.4, 
            metalness: 0.3, 
            envMapIntensity: 1.0 
        })
    );
    nexusGroup.add(starCore);

    // Add bloom effect target marker
    starCore.layers.enable(1); 

    const createWaterRing = (distance, thickness, speed) => {
        const adjustedThickness = thickness * 1.5;
        
        const ringMaterial = new THREE.MeshStandardMaterial({
            map: loadedTextures.rings.color,
            aoMap: loadedTextures.rings.occ,
            normalMap: loadedTextures.rings.normal,
            metalness: 0.1,
            roughness: 0.5,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide
        });

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(radius + distance, adjustedThickness, 128, 256),
            ringMaterial
        );

        const causticsThickness = adjustedThickness * 0.85;
        const caustics = new THREE.Mesh(
            new THREE.TorusGeometry(radius + distance + 0.03, causticsThickness, 64, 128),
            new THREE.MeshPhongMaterial({
                color: 0x88ffff,
                transparent: true,
                opacity: 0.3,
                specular: 0xffffff,
                shininess: 100,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        ring.add(caustics);

        if (ringMaterial.map) ringMaterial.map.offset.set(0, Math.random());
        if (ringMaterial.normalMap) ringMaterial.normalMap.offset.set(0, Math.random());
        if (ringMaterial.specularMap) ringMaterial.specularMap.repeat.set(2, 1);

        ring.userData = {
            rotationSpeed: speed,
            wobbleSpeed: speed * 1.3,
            wobbleAmount: distance * 0.12,
            causticsRef: caustics,
            textureOffset: Math.random() * 10
        };

        return ring;
    };

    const rings = [
        createWaterRing(0.8, 0.22, 0.025),
        createWaterRing(1.8, 0.32, 0.018),
        createWaterRing(3.0, 0.38, 0.012)
    ];
    nexusGroup.add(...rings);

    nexusGroup.userData.animate = function(time) {
        starCore.rotation.y = time * 0.15;
        starCore.rotation.z = Math.sin(time * 0.25) * 0.08;
        
        // Add emissive pulse effect
        starCore.material.emissiveIntensity = 4.0 + Math.sin(time * 2) * 1.5;
        
        rings.forEach((ring, index) => {
            ring.rotation.y += ring.userData.rotationSpeed;
            ring.rotation.z += 0.02;
            ring.rotation.x = Math.sin(time * ring.userData.wobbleSpeed + index) * ring.userData.wobbleAmount;
            
            if (ring.material.map) ring.material.map.offset.y = time * 0.003 + ring.userData.textureOffset;
            if (ring.material.normalMap) ring.material.normalMap.offset.y = time * 0.006 + ring.userData.textureOffset;
            if (ring.material.specularMap) ring.material.specularMap.offset.y = time * 0.004;
            
            ring.userData.causticsRef.rotation.z += 0.008;
            ring.userData.causticsRef.material.opacity = 0.3 + Math.sin(time * 2.5 + index) * 0.15;
        });
    };

    return nexusGroup;
}
