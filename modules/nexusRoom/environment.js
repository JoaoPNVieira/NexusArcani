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

    // Load textures with error handling
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
                // Create fallback texture
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

    // Create materials
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
            new THREE.MeshStandardMaterial({ // Right
                map: wallsTex.color,
                normalMap: wallsTex.normal,
                roughnessMap: wallsTex.roughness,
                aoMap: wallsTex.occ,
                displacementMap: wallsTex.height,
                displacementScale: 0.1,
                side: THREE.BackSide
            }),
            new THREE.MeshStandardMaterial({ // Left
                map: wallsTex.color,
                normalMap: wallsTex.normal,
                roughnessMap: wallsTex.roughness,
                aoMap: wallsTex.occ,
                displacementMap: wallsTex.height,
                displacementScale: 0.1,
                side: THREE.BackSide
            }),
            new THREE.MeshStandardMaterial({ // Top (ceiling)
                map: wallsTex.color,
                normalMap: wallsTex.normal,
                roughnessMap: wallsTex.roughness,
                aoMap: wallsTex.occ,
                displacementMap: wallsTex.height,
                displacementScale: 0.1,
                side: THREE.BackSide
            }),
            new THREE.MeshBasicMaterial({ // Bottom (floor - handled separately)
                transparent: true,
                opacity: 0
            }),
            new THREE.MeshStandardMaterial({ // Front
                map: wallsTex.color,
                normalMap: wallsTex.normal,
                roughnessMap: wallsTex.roughness,
                aoMap: wallsTex.occ,
                displacementMap: wallsTex.height,
                displacementScale: 0.1,
                side: THREE.BackSide
            }),
            new THREE.MeshStandardMaterial({ // Back
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

    // Create environment
    createMaterials().then(({ wallMaterials, floorMaterial }) => {
        // Room box
        const roomGeometry = new THREE.BoxGeometry(ROOM_SIZE, ROOM_HEIGHT, ROOM_SIZE);
        const room = new THREE.Mesh(roomGeometry, wallMaterials);
        scene.add(room);

        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
            floorMaterial
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = FLOOR_Y;
        scene.add(floor);

        // Grid helper
        const grid = new THREE.GridHelper(ROOM_SIZE, ROOM_SIZE / 2, 0x333333, 0x222222);
        grid.material.transparent = true;
        grid.material.opacity = 0.5;
        grid.position.y = FLOOR_Y + 0.02;
        scene.add(grid);
    });

    return { ROOM_SIZE, ROOM_HEIGHT, FLOOR_Y };
}