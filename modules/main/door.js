import * as THREE from 'three';

export function createdoor(length, width, height) {

    const textureLoader = new THREE.TextureLoader();

    const textures = {
        door : {
            map: 'textures/surfaces/mains/wood/color.jpg',
            displacement: 'textures/surfaces/mains/wood/displacement.jpg',
            ambOcc: 'textures/surfaces/mains/wood/occ.jpg',
            emission: 'textures/surfaces/mains/wood/emission.jpg',
            normal: 'textures/surfaces/mains/wood/normalGL.jpg',
            roughness: 'textures/surfaces/mains/wood/rough.jpg',
            specular: 'textures/surfaces/mains/wood/specular.jpg'
        },
        knob: {
            map: 'textures/surfaces/mains/silver/color.jpg',
            displacement: 'textures/surfaces/mains/silver/displacement.jpg',
            ambOcc: 'textures/surfaces/mains/silver/occ.jpg',
            emission: 'textures/surfaces/mains/silver/emission.jpg',
            normal: 'textures/surfaces/mains/silver/normalGL.jpg',
            roughness: 'textures/surfaces/mains/silver/rough.jpg',
            specular: 'textures/surfaces/mains/silver/specular.jpg'
        }
    };

    // Load textures with optimized settings
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
    
        // Star core (unchanged)
        const doorMaterial = new THREE.MeshStandardMaterial({
            map: loadedTextures.door.map,
            displacementMap: loadedTextures.door.displacement,
            displacementScale: 0.5,
            emissiveMap: loadedTextures.door.emission,
            emissiveIntensity: 0.2,
            normalMap: loadedTextures.door.normal,
            normalMapType: THREE.TangentSpaceNormalMap,
            roughnessMap: loadedTextures.door.roughness,
            roughness: 1.0,
            metalness: 0.1
        });
    
        

    const geometry = new THREE.BoxGeometry(length, width, height);



}