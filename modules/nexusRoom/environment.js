import * as THREE from 'three';
// import { createSquareFrame } from '../main/frame.js';
// import { createPortal } from '../main/portal.js';

export function nexusEnvironment(scene) {
    const ROOM_SIZE = 100;
    const ROOM_HEIGHT = 50;
    const FLOOR_Y = -ROOM_HEIGHT / 2;
    const textureLoader = new THREE.TextureLoader();

    // Textures configuration
    const textures = {
        floor: {
            color: './textures/surfaces/wood/old_planks/color.jpg',
            displacement: './textures/surfaces/wood/old_planks/disp.png',
            occ: './textures/surfaces/wood/old_planks/occ.jpg',
            normal: './textures/surfaces/wood/old_planks/normal.jpg',
            roughness: './textures/surfaces/wood/old_planks/roughness.jpg'
        },
        walls: {
            color: './textures/surfaces/stone/walls_3/color.jpg',
            occ: './textures/surfaces/stone/walls_3/occ.jpg',
            height: './textures/surfaces/stone/walls_3/height.png',
            normal: './textures/surfaces/stone/walls_3/normal.jpg',
            roughness: './textures/surfaces/stone/walls_3/roughness.jpg'
        }
    };

    // Texture loader with error handling
    const loadTextures = async (textureSet) => {
        const loaded = {};
        for (const [key, path] of Object.entries(textureSet)) {
            try {
                const texture = await new Promise((resolve, reject) => {
                    textureLoader.load(path, resolve, undefined, () => reject(new Error(`Failed to load ${path}`)));
                });
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                loaded[key] = texture;
            } catch (error) {
                console.warn(error.message);
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = 4;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = key.includes('color') ? '#888888' : '#7F7F7F';
                ctx.fillRect(0, 0, 4, 4);
                loaded[key] = new THREE.CanvasTexture(canvas);
            }
        }
        return loaded;
    };

    // Create materials for room
    const createMaterials = async () => {
        const [floorTex, wallsTex] = await Promise.all([
            loadTextures(textures.floor),
            loadTextures(textures.walls)
        ]);

        // Configure texture repeats
        const floorRepeat = ROOM_SIZE / 10;
        const wallRepeat = ROOM_HEIGHT / 10;
        Object.values(floorTex).forEach(t => t.repeat.set(floorRepeat, floorRepeat));
        Object.values(wallsTex).forEach(t => t.repeat.set(floorRepeat, wallRepeat));

        // Wall materials (6 sides)
        const wallMaterials = [
            new THREE.MeshStandardMaterial({
                map: wallsTex.color,
                normalMap: wallsTex.normal,
                roughnessMap: wallsTex.roughness,
                aoMap: wallsTex.occ,
                displacementMap: wallsTex.height,
                displacementScale: 0.1,
                side: THREE.BackSide
            }),
            new THREE.MeshStandardMaterial({
                map: wallsTex.color,
                normalMap: wallsTex.normal,
                roughnessMap: wallsTex.roughness,
                aoMap: wallsTex.occ,
                displacementMap: wallsTex.height,
                displacementScale: 0.1,
                side: THREE.BackSide
            }),
            new THREE.MeshStandardMaterial({
                map: wallsTex.color,
                normalMap: wallsTex.normal,
                roughnessMap: wallsTex.roughness,
                aoMap: wallsTex.occ,
                displacementMap: wallsTex.height,
                displacementScale: 0.1,
                side: THREE.BackSide
            }),
            new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0
            }),
            new THREE.MeshStandardMaterial({
                map: wallsTex.color,
                normalMap: wallsTex.normal,
                roughnessMap: wallsTex.roughness,
                aoMap: wallsTex.occ,
                displacementMap: wallsTex.height,
                displacementScale: 0.1,
                side: THREE.BackSide
            }),
            new THREE.MeshStandardMaterial({
                map: wallsTex.color,
                normalMap: wallsTex.normal,
                roughnessMap: wallsTex.roughness,
                aoMap: wallsTex.occ,
                displacementMap: wallsTex.height,
                displacementScale: 0.1,
                side: THREE.BackSide
            })
        ];

        // Floor material
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTex.color,
            normalMap: floorTex.normal,
            roughnessMap: floorTex.roughness,
            aoMap: floorTex.occ,
            displacementMap: floorTex.displacement,
            displacementScale: 0.1,
            roughness: 0.8,
            metalness: 0.2
        });

        return { wallMaterials, floorMaterial };
    };

    // Create the room environment
    createMaterials().then(({ wallMaterials, floorMaterial }) => {
        // Room box
        const room = new THREE.Mesh(
            new THREE.BoxGeometry(ROOM_SIZE, ROOM_HEIGHT, ROOM_SIZE),
            wallMaterials
        );
        scene.add(room);

        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
            floorMaterial
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = FLOOR_Y;
        scene.add(floor);

        // Gate parameters
        const gateSize = { width: 20, height: 30, depth: 0.5, thickness: 1.5 };
        const gateVerticalPos = FLOOR_Y + ROOM_HEIGHT/4;
        const gateOffset = ROOM_SIZE/2 - 1; // 1 unit from wall
        const gateSpacing = ROOM_SIZE/3; // Space between gates

        // Create all 8 gates (2 per wall)
        // Front wall (Z negative) - Blue portals
        scene.add(createGate(
            { x: -gateSpacing, y: gateVerticalPos, z: -gateOffset },
            gateSize,
            0x333333,
            0x0066ff,
            Math.PI
        ));
        scene.add(createGate(
            { x: gateSpacing, y: gateVerticalPos, z: -gateOffset },
            gateSize,
            0x333333,
            0x0066ff,
            Math.PI
        ));

        // Back wall (Z positive) - Green portals
        scene.add(createGate(
            { x: -gateSpacing, y: gateVerticalPos, z: gateOffset },
            gateSize,
            0x333333,
            0x00ff66,
            0
        ));
        scene.add(createGate(
            { x: gateSpacing, y: gateVerticalPos, z: gateOffset },
            gateSize,
            0x333333,
            0x00ff66,
            0
        ));

        // Left wall (X negative) - Orange portals
        scene.add(createGate(
            { x: -gateOffset, y: gateVerticalPos, z: -gateSpacing },
            gateSize,
            0x333333,
            0xff6600,
            Math.PI/2
        ));
        scene.add(createGate(
            { x: -gateOffset, y: gateVerticalPos, z: gateSpacing },
            gateSize,
            0x333333,
            0xff6600,
            Math.PI/2
        ));

        // Right wall (X positive) - Purple portals
        scene.add(createGate(
            { x: gateOffset, y: gateVerticalPos, z: -gateSpacing },
            gateSize,
            0x333333,
            0xcc00ff,
            -Math.PI/2
        ));
        scene.add(createGate(
            { x: gateOffset, y: gateVerticalPos, z: gateSpacing },
            gateSize,
            0x333333,
            0xcc00ff,
            -Math.PI/2
        ));
    });

    // Gate creation function
    function createGate(position, size, frameColor, portalColor, rotationY) {
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

        return group;
    }

    return { ROOM_SIZE, FLOOR_Y };
}