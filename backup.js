import * as THREE from 'three';

export function nexusEnvironment(scene) {
    const ROOM_SIZE = 100;
    const ROOM_HEIGHT = 50;
    const FLOOR_Y = -ROOM_HEIGHT / 2;
    const textureLoader = new THREE.TextureLoader();

    // Texture paths
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

    // Function to load textures with error handling
    const loadTextures = async (textureSet) => {
        const loaded = {};
        for (const [key, path] of Object.entries(textureSet)) {
            try {
                const texture = await new Promise((resolve, reject) => {
                    textureLoader.load(
                        path,
                        resolve,
                        undefined,
                        () => reject(new Error(`Failed to load ${path}`))
                    );
                });
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                loaded[key] = texture;
            } catch (error) {
                console.warn(error.message);
                // Create fallback texture in case of an error
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

    // Helper function to create a perfectly square frame gate with portal
    const createSquareGate = (position, size, colorFrame, colorPortal) => {
        const group = new THREE.Group();
        group.position.set(position.x, position.y, position.z);

        // Frame dimensions
        const frameWidth = size.width;
        const frameHeight = size.height;
        const frameDepth = size.depth;
        const frameThickness = size.thickness || 2;

        // Create frame using a single extruded shape to ensure perfect corners
        const frameShape = new THREE.Shape();
        const halfWidth = frameWidth / 2;
        const halfHeight = frameHeight / 2;
        
        // Outer rectangle
        frameShape.moveTo(-halfWidth, -halfHeight);
        frameShape.lineTo(halfWidth, -halfHeight);
        frameShape.lineTo(halfWidth, halfHeight);
        frameShape.lineTo(-halfWidth, halfHeight);
        frameShape.lineTo(-halfWidth, -halfHeight);
        
        // Inner rectangle (hole)
        const innerWidth = frameWidth - frameThickness * 2;
        const innerHeight = frameHeight - frameThickness * 2;
        frameShape.moveTo(-innerWidth/2, -innerHeight/2);
        frameShape.lineTo(innerWidth/2, -innerHeight/2);
        frameShape.lineTo(innerWidth/2, innerHeight/2);
        frameShape.lineTo(-innerWidth/2, innerHeight/2);
        frameShape.lineTo(-innerWidth/2, -innerHeight/2);

        // Extrude the frame
        const frameGeometry = new THREE.ExtrudeGeometry(frameShape, {
            depth: frameDepth,
            bevelEnabled: false
        });
        
        // Center the frame geometry
        frameGeometry.translate(0, 0, -frameDepth/2);
        
        const frameMaterial = new THREE.MeshStandardMaterial({ 
            color: colorFrame,
            side: THREE.DoubleSide
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        group.add(frame);

        // Portal that perfectly fills the inner space
        const portalGeometry = new THREE.PlaneGeometry(
            frameWidth - frameThickness * 2, 
            frameHeight - frameThickness * 2
        );
        const portalMaterial = new THREE.MeshStandardMaterial({ 
            color: colorPortal,
            transparent: true,
            opacity: 0.9,
            emissive: colorPortal,
            emissiveIntensity: 0.7,
            side: THREE.DoubleSide
        });
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.position.z = frameDepth / 2 + 0.1; // Slightly in front of the frame
        group.add(portal);

        scene.add(group);

        return { frame: group, portal };
    };

    // Create environment materials and geometry
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

        // Wall materials (6 sides of box)
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

    createMaterials().then(({ wallMaterials, floorMaterial }) => {
        // Room box
        const roomGeometry = new THREE.BoxGeometry(ROOM_SIZE, ROOM_HEIGHT, ROOM_SIZE);
        const room = new THREE.Mesh(roomGeometry, wallMaterials);
        scene.add(room);

        // Floor
        const floorGeometry = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = FLOOR_Y;
        scene.add(floor);

        // Create perfect square gate with portal
        createSquareGate(
            { x: 0, y: FLOOR_Y + ROOM_HEIGHT / 4, z: -ROOM_SIZE / 2 + 1 },
            { 
                width: 20, 
                height: 30, 
                depth: 2, 
                thickness: 1.5 
            },
            0x333333, // Frame color
            0x0066ff  // Portal color
        );
    });

    return { ROOM_SIZE, FLOOR_Y };
}