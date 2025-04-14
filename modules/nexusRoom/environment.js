import * as THREE from 'three';
import { createGate } from '../main/gate.js';

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
        },
        window: {
            color: './textures/surfaces/glass/color_window/color.jpg',
            occ: './textures/surfaces/glass/color_window/occ.jpg',
            height: './textures/surfaces/glass/color_window/height.png',
            normal: './textures/surfaces/glass/color_window/normal.jpg',
            roughness: './textures/surfaces/glass/color_window/roughness.jpg',
            metalness: './textures/surfaces/glass/color_window/metallic.jpg',
            opacity: './textures/surfaces/glass/color_window/opacity.jpg'
        },
        gold: {
            color: './textures/surfaces/metals/gold-foil/color.jpg',
            occ: './textures/surfaces/metals/gold-foil/occ.jpg',
            height: './textures/surfaces/metals/gold-foil/height.png',
            normal: './textures/surfaces/metals/gold-foil/normal.jpg',
            roughness: './textures/surfaces/metals/gold-foil/roughness.jpg',
            metalness: './textures/surfaces/metals/gold-foil/metallic.jpg'
        },
        skirt: {
            color: './textures/surfaces/stone/walls_2/color.jpg',
            occ: './textures/surfaces/stone/walls_2/occ.jpg',
            height: './textures/surfaces/stone/walls_2/height.png',
            normal: './textures/surfaces/stone/walls_2/normal.jpg',
            roughness: './textures/surfaces/stone/walls_2/roughness.jpg'
        },
        columns: {
            color: './textures/surfaces/stone/columns1/color.jpg',
            occ: './textures/surfaces/stone/columns1/occ.jpg',
            height: './textures/surfaces/stone/columns1/height.png',
            normal: './textures/surfaces/stone/columns1/normal.jpg',
            roughness: './textures/surfaces/stone/columns1/roughness.jpg'
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
        const [floorTex, wallsTex, windowTex, goldTex, skirtTex, columnsTex] = await Promise.all([
            loadTextures(textures.floor),
            loadTextures(textures.walls),
            loadTextures(textures.window),
            loadTextures(textures.gold),
            loadTextures(textures.skirt),
            loadTextures(textures.columns)
        ]);

        // Configure texture repeats
        const floorRepeat = ROOM_SIZE / 10;
        const wallRepeat = ROOM_HEIGHT / 10;
        const goldRepeat = 2;
        const skirtRepeat = 4;
        const columnsRepeat = 1;
        
        Object.values(floorTex).forEach(t => t.repeat.set(floorRepeat, floorRepeat));
        Object.values(wallsTex).forEach(t => t.repeat.set(floorRepeat, wallRepeat));
        Object.values(goldTex).forEach(t => t.repeat.set(goldRepeat, goldRepeat));
        Object.values(skirtTex).forEach(t => t.repeat.set(skirtRepeat, skirtRepeat));
        Object.values(columnsTex).forEach(t => t.repeat.set(columnsRepeat, columnsRepeat));

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

        // Window material
        const windowMaterial = new THREE.MeshStandardMaterial({
            map: windowTex.color,
            normalMap: windowTex.normal,
            roughnessMap: windowTex.roughness,
            metalnessMap: windowTex.metalness,
            alphaMap: windowTex.opacity,
            transparent: true,
            side: THREE.DoubleSide,
            emissive: 0xffffff,
            emissiveIntensity: 0.5
        });

        // Gold material for gates
        const goldMaterial = new THREE.MeshStandardMaterial({
            map: goldTex.color,
            normalMap: goldTex.normal,
            roughnessMap: goldTex.roughness,
            metalnessMap: goldTex.metalness,
            displacementMap: goldTex.height,
            displacementScale: 0.1,
            metalness: 1.0,
            roughness: 0.3
        });

        // Skirt material
        const skirtMaterial = new THREE.MeshStandardMaterial({
            map: skirtTex.color,
            normalMap: skirtTex.normal,
            roughnessMap: skirtTex.roughness,
            displacementMap: skirtTex.height,
            displacementScale: 0.1,
            roughness: 0.7,
            metalness: 0.1
        });

        // Column material
        const columnMaterial = new THREE.MeshStandardMaterial({
            map: columnsTex.color,
            normalMap: columnsTex.normal,
            roughnessMap: columnsTex.roughness,
            displacementMap: columnsTex.height,
            displacementScale: 0.1,
            roughness: 0.6,
            metalness: 0.2
        });

        return { 
            wallMaterials, 
            floorMaterial, 
            windowMaterial,
            goldMaterial,
            skirtMaterial,
            columnMaterial
        };
    };

    // Create the room environment
    createMaterials().then(({ 
        wallMaterials, 
        floorMaterial, 
        windowMaterial,
        goldMaterial,
        skirtMaterial,
        columnMaterial
    }) => {
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

        // ========== TEXTURED WALL SKIRTS ==========
        const skirtHeight = 5;
        const skirtDepth = 0.8;
        const skirtOffset = 0.1;
        const wallLength = ROOM_SIZE - 2 * skirtDepth;

        // Helper function to create skirt segments
        const createWallSkirt = (width, height, depth, position, rotation) => {
            const skirt = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, depth),
                skirtMaterial
            );
            skirt.position.copy(position);
            if (rotation) skirt.rotation.copy(rotation);
            return skirt;
        };

        // Position skirts along all walls
        const skirtY = FLOOR_Y + skirtHeight/2;
        
        // Front wall (Z negative)
        scene.add(createWallSkirt(
            wallLength, skirtHeight, skirtDepth,
            new THREE.Vector3(0, skirtY, -ROOM_SIZE/2 + skirtDepth/2 + skirtOffset)
        ));
        
        // Back wall (Z positive)
        scene.add(createWallSkirt(
            wallLength, skirtHeight, skirtDepth,
            new THREE.Vector3(0, skirtY, ROOM_SIZE/2 - skirtDepth/2 - skirtOffset)
        ));
        
        // Left wall (X negative)
        const leftSkirt = createWallSkirt(
            wallLength, skirtHeight, skirtDepth,
            new THREE.Vector3(-ROOM_SIZE/2 + skirtDepth/2 + skirtOffset, skirtY, 0)
        );
        leftSkirt.rotation.y = Math.PI/2;
        scene.add(leftSkirt);
        
        // Right wall (X positive)
        const rightSkirt = createWallSkirt(
            wallLength, skirtHeight, skirtDepth,
            new THREE.Vector3(ROOM_SIZE/2 - skirtDepth/2 - skirtOffset, skirtY, 0)
        );
        rightSkirt.rotation.y = Math.PI/2;
        scene.add(rightSkirt);

        // Corner blocks
        const cornerBlockSize = skirtDepth * 1.5;
        const cornerBlock = new THREE.Mesh(
            new THREE.BoxGeometry(cornerBlockSize, skirtHeight, cornerBlockSize),
            skirtMaterial
        );
        
        // Position corner blocks
        const cornerXZ = ROOM_SIZE/2 - cornerBlockSize/2 - skirtOffset;
        cornerBlock.position.set(-cornerXZ, skirtY, -cornerXZ);
        scene.add(cornerBlock.clone());
        cornerBlock.position.set(cornerXZ, skirtY, -cornerXZ);
        scene.add(cornerBlock.clone());
        cornerBlock.position.set(-cornerXZ, skirtY, cornerXZ);
        scene.add(cornerBlock.clone());
        cornerBlock.position.set(cornerXZ, skirtY, cornerXZ);
        scene.add(cornerBlock.clone());

        // ========== TEXTURED GATES ==========
        const gateSize = { width: 20, height: 30, depth: 8, thickness: 1.5 };
        const gateVerticalPos = FLOOR_Y + ROOM_HEIGHT/4;
        const gateOffset = ROOM_SIZE/2 - 1 + skirtDepth; 

        // Calculate gate positions
        const totalWallLength = ROOM_SIZE;
        const gateWidth = gateSize.width;
        const totalGates = 2;
        const totalGaps = totalGates + 1;
        const remainingSpace = totalWallLength - (totalGates * gateWidth);
        const gapSize = remainingSpace / totalGaps;

        const firstGatePos = -totalWallLength/2 + gapSize + gateWidth/2;
        const secondGatePos = firstGatePos + gateWidth + gapSize;
        const gatePositions = [firstGatePos, secondGatePos];

        // Front wall (Z negative) - Blue portals
        scene.add(createGate(
            { x: gatePositions[0], y: gateVerticalPos, z: -gateOffset },
            gateSize,
            goldMaterial,
            0x0066ff,
            0
        ));
        scene.add(createGate(
            { x: gatePositions[1], y: gateVerticalPos, z: -gateOffset },
            gateSize,
            goldMaterial,
            0x0066ff,
            0
        ));

        // Back wall (Z positive) - Green portals
        scene.add(createGate(
            { x: gatePositions[0], y: gateVerticalPos, z: gateOffset },
            gateSize,
            goldMaterial,
            0x00ff66,
            Math.PI
        ));
        scene.add(createGate(
            { x: gatePositions[1], y: gateVerticalPos, z: gateOffset },
            gateSize,
            goldMaterial,
            0x00ff66,
            Math.PI
        ));

        // Left wall (X negative) - Orange portals
        scene.add(createGate(
            { x: -gateOffset, y: gateVerticalPos, z: gatePositions[0] },
            gateSize,
            goldMaterial,
            0xff6600,
            Math.PI/2
        ));
        scene.add(createGate(
            { x: -gateOffset, y: gateVerticalPos, z: gatePositions[1] },
            gateSize,
            goldMaterial,
            0xff6600,
            Math.PI/2
        ));

        // Right wall (X positive) - Purple portals
        scene.add(createGate(
            { x: gateOffset, y: gateVerticalPos, z: gatePositions[0] },
            gateSize,
            goldMaterial,
            0xcc00ff,
            -Math.PI/2
        ));
        scene.add(createGate(
            { x: gateOffset, y: gateVerticalPos, z: gatePositions[1] },
            gateSize,
            goldMaterial,
            0xcc00ff,
            -Math.PI/2
        ));

        // ========== TEXTURED PILLARS ==========
        const createCornerColumn = (x, z) => {
            const group = new THREE.Group();
            
            // Main column
            const columnHeight = ROOM_HEIGHT * 0.85;
            const column = new THREE.Mesh(
                new THREE.CylinderGeometry(2, 2, columnHeight, 16),
                columnMaterial
            );
            column.position.set(x, FLOOR_Y + columnHeight/2, z);
            group.add(column);

            // Arch to center
            const splitY = FLOOR_Y + columnHeight;
            const centerY = FLOOR_Y + ROOM_HEIGHT - 2;

            const createArch = () => {
                const points = [];
                const segments = 32;
                const start = new THREE.Vector3(x, splitY, z);
                const end = new THREE.Vector3(0, centerY, 0);
                const controlHeight = Math.max(splitY, centerY) + (ROOM_HEIGHT * 0.08);
                const control = new THREE.Vector3(x * 0.6, controlHeight, z * 0.6);

                for (let i = 0; i <= segments; i++) {
                    const t = i / segments;
                    const xPos = (1-t)*(1-t)*start.x + 2*(1-t)*t*control.x + t*t*end.x;
                    const zPos = (1-t)*(1-t)*start.z + 2*(1-t)*t*control.z + t*t*end.z;
                    const yPos = (1-t)*(1-t)*start.y + 2*(1-t)*t*control.y + t*t*end.y;
                    points.push(new THREE.Vector3(xPos, yPos, zPos));
                }

                const curve = new THREE.CatmullRomCurve3(points);
                const tube = new THREE.TubeGeometry(curve, 64, 1.5, 8, false);
                return new THREE.Mesh(tube, columnMaterial);
            };

            group.add(createArch());
            return group;
        };

        // Add columns close to corners (2 units from walls)
        const cornerPos = ROOM_SIZE/2 - 2;
        scene.add(createCornerColumn(-cornerPos, -cornerPos));
        scene.add(createCornerColumn(-cornerPos, cornerPos));
        scene.add(createCornerColumn(cornerPos, -cornerPos));
        scene.add(createCornerColumn(cornerPos, cornerPos));

        // ========== TEXTURED CEILING CIRCLE WITH WINDOW ==========
        const circleRadius = 40;
        const circleThickness = 2;
        
        // Main torus (the ring)
        const circle = new THREE.Mesh(
            new THREE.TorusGeometry(circleRadius, circleThickness, 32, 64),
            columnMaterial
        );
        circle.position.set(0, FLOOR_Y + ROOM_HEIGHT - 2, 0);
        circle.rotation.x = Math.PI/2;
        scene.add(circle);

        // Window disc (the bottom part)
        const windowDisc = new THREE.Mesh(
            new THREE.CircleGeometry(circleRadius - circleThickness, 64),
            windowMaterial
        );
        windowDisc.position.copy(circle.position);
        windowDisc.rotation.x = -Math.PI/2;
        windowDisc.position.y -= circleThickness/2;
        scene.add(windowDisc);

        // Window lighting effects
        const windowLight = new THREE.PointLight(0xffffff, 1, 50);
        windowLight.position.copy(circle.position);
        windowLight.position.y -= 5;
        scene.add(windowLight);

        const windowAmbient = new THREE.AmbientLight(0x88ccff, 0.3);
        scene.add(windowAmbient);
    });

    return { ROOM_SIZE, FLOOR_Y };
}