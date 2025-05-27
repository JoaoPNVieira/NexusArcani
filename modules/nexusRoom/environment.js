import * as THREE from 'three';
import { createGate } from '../main/gate.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export function nexusEnvironment(scene) {
    const ROOM_SIZE = 100;
    const ROOM_HEIGHT = 50;
    const FLOOR_Y = -ROOM_HEIGHT / 2;
    const textureLoader = new THREE.TextureLoader();

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
            color: './textures/surfaces/glass/blue_window/color.jpg',
            occ: './textures/surfaces/glass/blue_window/occ.jpg',
            height: './textures/surfaces/glass/blue_window/height.png',
            normal: './textures/surfaces/glass/blue_window/normal.jpg',
            roughness: './textures/surfaces/glass/blue_window/roughness.jpg',
            metallic: './textures/surfaces/glass/blue_window/metallic.jpg',
            opacity: './textures/surfaces/glass/blue_window/opacity.jpg'
        },
        frame: {
            color: './textures/surfaces/stone/walls_2/color.png',
            occ: './textures/surfaces/stone/walls_2/occ.png',
            height: './textures/surfaces/stone/walls_2/height.png',
            normal: './textures/surfaces/stone/walls_2/normal.png',
            roughness: './textures/surfaces/stone/walls_2/roughness.png',
        },
        gold: {
            color: './textures/surfaces/metals/gold_foil/color.png',
            occ: './textures/surfaces/metals/gold_foil/occ.png',
            height: './textures/surfaces/metals/gold_foil/height.png',
            normal: './textures/surfaces/metals/gold_foil/normal.png',
            roughness: './textures/surfaces/metals/gold_foil/roughness.png',
            metalness: './textures/surfaces/metals/gold_foil/metallic.png'
        },
        skirt: {
            color: './textures/surfaces/stone/walls_2/color.png',
            occ: './textures/surfaces/stone/walls_2/occ.png',
            height: './textures/surfaces/stone/walls_2/height.png',
            normal: './textures/surfaces/stone/walls_2/normal.png',
            roughness: './textures/surfaces/stone/walls_2/roughness.png'
        },
        columns: {
            color: './textures/surfaces/stone/columns2/color.jpg',
            occ: './textures/surfaces/stone/columns2/occ.jpg',
            height: './textures/surfaces/stone/columns2/height.png',
            normal: './textures/surfaces/stone/columns2/normal.jpg',
            roughness: './textures/surfaces/stone/columns2/roughness.jpg'
        }
    };

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

    const createMaterials = async () => {
        const [floorTex, wallsTex, windowTex, frameTex, goldTex, skirtTex, columnsTex] = await Promise.all([
            loadTextures(textures.floor),
            loadTextures(textures.walls),
            loadTextures(textures.window),
            loadTextures(textures.frame),
            loadTextures(textures.gold),
            loadTextures(textures.skirt),
            loadTextures(textures.columns)
        ]);

        const floorRepeat = ROOM_SIZE / 10;
        const wallRepeat = ROOM_HEIGHT / 10;
        const goldRepeat = 2;
        const skirtRepeat = 1;
        const columnsRepeat = 1;
        
        Object.values(floorTex).forEach(t => t.repeat.set(floorRepeat, floorRepeat));
        Object.values(wallsTex).forEach(t => t.repeat.set(floorRepeat, wallRepeat));
        Object.values(goldTex).forEach(t => t.repeat.set(goldRepeat, goldRepeat));
        Object.values(skirtTex).forEach(t => t.repeat.set(skirtRepeat, skirtRepeat));
        Object.values(columnsTex).forEach(t => t.repeat.set(columnsRepeat, columnsRepeat));

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

        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTex.color,
            normalMap: floorTex.normal,
            roughnessMap: floorTex.roughness,
            aoMap: floorTex.occ,
            displacementMap: floorTex.displacement,
            displacementScale: 0.1,
            roughness: 0.9,  
            metalness: 0.1
        });

        const windowMaterial = new THREE.MeshStandardMaterial({
            map: windowTex.color,
            normalMap: windowTex.normal,
            roughnessMap: windowTex.roughness,
            alphaMap: windowTex.opacity,
            transparent: false,
            side: THREE.DoubleSide,
            emissive: 0x011635,
            emissiveIntensity: 0.4
        });

        const goldPortalMaterial = new THREE.MeshStandardMaterial({
            map: goldTex.color,
            normalMap: goldTex.normal,
            roughnessMap: goldTex.roughness,
            metalnessMap: goldTex.metalness,
            emissive: 0x333333, 
            emissiveIntensity: 0.2,
            transparent: false,
            opacity: 1,
            roughness: 200,
            metalness: 1.2,
            side: THREE.DoubleSide,
            wireframe: false 
        });

        goldTex.color.wrapS = goldTex.color.wrapT = THREE.RepeatWrapping;
        goldTex.normal.wrapS = goldTex.normal.wrapT = THREE.RepeatWrapping;
        goldTex.color.repeat.set(2, 2);
        goldTex.normal.repeat.set(2, 2);

        const frameMaterial = new THREE.MeshStandardMaterial({
            map: frameTex.color,
            normalMap: frameTex.normal,
            roughnessMap: frameTex.roughness,
            metalnessMap: frameTex.metallic,
            aoMap: frameTex.occ,
            displacementMap: frameTex.height,
            displacementScale: 0
        });

        const skirtMaterial = new THREE.MeshStandardMaterial({
            map: skirtTex.color,
            normalMap: skirtTex.normal,
            roughnessMap: skirtTex.roughness,
            displacementMap: skirtTex.height,
            displacementScale: 0.1,
            roughness: 2,
            metalness: 0.1
        });

        const columnMaterial = new THREE.MeshStandardMaterial({
            map: columnsTex.color,
            normalMap: columnsTex.normal,
            roughnessMap: columnsTex.roughness,
            displacementMap: columnsTex.height,
            displacementScale: 3,
            roughness: 10,
            metalness: 0.2
        });

        return { 
            wallMaterials, 
            floorMaterial, 
            windowMaterial,
            goldPortalMaterial,
            frameMaterial,
            skirtMaterial,
            columnMaterial
        };
    };

    const loadWizardStatue = () => {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loader.setDRACOLoader(dracoLoader);
        loader.setMeshoptDecoder(MeshoptDecoder);

        return new Promise((resolve) => {
            loader.load(
                './assets/wizard_statue/wizard_statue_25.glb',
                (gltf) => {
                    const model = gltf.scene;
                    model.position.set(0, FLOOR_Y + 10, 0); // Center of room
                    model.scale.set(5, 5, 5);
                    
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            if (child.material) {
                                child.material.roughness = 0.9;
                                child.material.metalness = 0.1;
                                child.material.color.setHex(0x555555);
                            }
                        }
                    });
                    resolve(model);
                },
                undefined,
                (error) => {
                    console.error('ERRO: Estatua central de feiticeiro não carregada! :', error);
                    resolve(null);
                }
            );
        });
    };

    createMaterials().then(({ 
        wallMaterials, 
        floorMaterial, 
        windowMaterial,
        goldPortalMaterial,
        frameMaterial,
        skirtMaterial,
        columnMaterial
    }) => {
        const room = new THREE.Mesh(
            new THREE.BoxGeometry(ROOM_SIZE, ROOM_HEIGHT, ROOM_SIZE),
            wallMaterials
        );
        scene.add(room);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
            floorMaterial
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = FLOOR_Y;
        scene.add(floor);

        const skirtHeight = 5;
        const skirtDepth = 0.8;
        const skirtOffset = 0.1;
        const wallLength = ROOM_SIZE - 2 * skirtDepth;

        const createSegmentedSkirt = (length, height, depth, position, rotationY = 0) => {
            const group = new THREE.Group();
            const blockWidth = 5;
            const blockCount = Math.ceil(length / blockWidth);
            const actualBlockWidth = length / blockCount;
            
            for (let i = 0; i < blockCount; i++) {
                const block = new THREE.Mesh(
                    new THREE.BoxGeometry(actualBlockWidth, height, depth),
                    skirtMaterial
                );
                const xPos = -length/2 + i * actualBlockWidth + actualBlockWidth/2;
                block.position.set(xPos, 0, 0);
                group.add(block);
            }
            
            group.position.copy(position);
            if (rotationY !== 0) group.rotation.y = rotationY;
            return group;
        };

        const skirtY = FLOOR_Y + skirtHeight/2;
        
        scene.add(createSegmentedSkirt(
            wallLength, skirtHeight, skirtDepth,
            new THREE.Vector3(0, skirtY, -ROOM_SIZE/2 + skirtDepth/2 + skirtOffset)
        ));
        
        scene.add(createSegmentedSkirt(
            wallLength, skirtHeight, skirtDepth,
            new THREE.Vector3(0, skirtY, ROOM_SIZE/2 - skirtDepth/2 - skirtOffset)
        ));
        
        scene.add(createSegmentedSkirt(
            wallLength, skirtHeight, skirtDepth,
            new THREE.Vector3(-ROOM_SIZE/2 + skirtDepth/2 + skirtOffset, skirtY, 0),
            Math.PI/2
        ));
        
        scene.add(createSegmentedSkirt(
            wallLength, skirtHeight, skirtDepth,
            new THREE.Vector3(ROOM_SIZE/2 - skirtDepth/2 - skirtOffset, skirtY, 0),
            Math.PI/2
        ));

        const cornerBlockSize = skirtDepth * 1.5;
        const cornerBlock = new THREE.Mesh(
            new THREE.BoxGeometry(cornerBlockSize, skirtHeight, cornerBlockSize),
            skirtMaterial
        );
        
        const cornerXZ = ROOM_SIZE/2 - cornerBlockSize/2 - skirtOffset;
        cornerBlock.position.set(-cornerXZ, skirtY, -cornerXZ);
        scene.add(cornerBlock.clone());
        cornerBlock.position.set(cornerXZ, skirtY, -cornerXZ);
        scene.add(cornerBlock.clone());
        cornerBlock.position.set(-cornerXZ, skirtY, cornerXZ);
        scene.add(cornerBlock.clone());
        cornerBlock.position.set(cornerXZ, skirtY, cornerXZ);
        scene.add(cornerBlock.clone());

        const gateSize = { width: 20, height: 30, depth: 8, thickness: 1.5 };
        const gateVerticalPos = FLOOR_Y + ROOM_HEIGHT/4;
        const gateOffset = ROOM_SIZE/2 - 1 + skirtDepth; 

        const totalWallLength = ROOM_SIZE;
        const gateWidth = gateSize.width;
        const totalGates = 2;
        const totalGaps = totalGates + 1;
        const remainingSpace = totalWallLength - (totalGates * gateWidth);
        const gapSize = remainingSpace / totalGaps;

        const firstGatePos = -totalWallLength/2 + gapSize + gateWidth/2;
        const secondGatePos = firstGatePos + gateWidth + gapSize;
        const gatePositions = [firstGatePos, secondGatePos];

        scene.add(createGate(
            { x: gatePositions[0], y: gateVerticalPos, z: -gateOffset },
            gateSize,
            frameMaterial,
            goldPortalMaterial,
            0x1A237E,
            0
        ));

        scene.add(createGate(
            { x: gatePositions[1], y: gateVerticalPos, z: -gateOffset },
            gateSize,
            frameMaterial,
            goldPortalMaterial,
            0x1565C0,
            0
        ));

        scene.add(createGate(
            { x: gatePositions[0], y: gateVerticalPos, z: gateOffset },
            gateSize,
            frameMaterial,
            goldPortalMaterial,
            0x1B5E20,
            Math.PI
        ));

        scene.add(createGate(
            { x: gatePositions[1], y: gateVerticalPos, z: gateOffset },
            gateSize,
            frameMaterial,
            goldPortalMaterial,
            0x2E7D32,
            Math.PI
        ));

        scene.add(createGate(
            { x: -gateOffset, y: gateVerticalPos, z: gatePositions[0] },
            gateSize,
            frameMaterial,
            goldPortalMaterial,
            0x4A148C,
            Math.PI/2
        ));

        scene.add(createGate(
            { x: -gateOffset, y: gateVerticalPos, z: gatePositions[1] },
            gateSize,
            frameMaterial,
            goldPortalMaterial,
            0xC2185B,
            Math.PI/2
        ));

        scene.add(createGate(
            { x: gateOffset, y: gateVerticalPos, z: gatePositions[0] },
            gateSize,
            frameMaterial,
            goldPortalMaterial,
            0x8D6E63,
            -Math.PI/2
        ));

        scene.add(createGate(
            { x: gateOffset, y: gateVerticalPos, z: gatePositions[1] },
            gateSize,
            frameMaterial,
            goldPortalMaterial,
            0xFFAB00,
            -Math.PI/2
        ));
        
        const createCornerColumn = (x, z) => {
            const group = new THREE.Group();
            
            const columnHeight = ROOM_HEIGHT * 0.85;
            const column = new THREE.Mesh(
                new THREE.CylinderGeometry(2, 2, columnHeight, 16),
                columnMaterial
            );
            column.position.set(x, FLOOR_Y + columnHeight/2, z);
            group.add(column);

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

        const cornerPos = ROOM_SIZE/2 - 2;
        scene.add(createCornerColumn(-cornerPos, -cornerPos));
        scene.add(createCornerColumn(-cornerPos, cornerPos));
        scene.add(createCornerColumn(cornerPos, -cornerPos));
        scene.add(createCornerColumn(cornerPos, cornerPos));

        const circleRadius = 40;
        const circleThickness = 2;
        
        const circle = new THREE.Mesh(
            new THREE.TorusGeometry(circleRadius, circleThickness, 32, 64),
            columnMaterial
        );
        circle.position.set(0, FLOOR_Y + ROOM_HEIGHT - 2, 0);
        circle.rotation.x = Math.PI/2;
        scene.add(circle);

        const windowDisc = new THREE.Mesh(
            new THREE.CircleGeometry(circleRadius - circleThickness, 64),
            windowMaterial
        );
        windowDisc.position.copy(circle.position);
        windowDisc.rotation.x = -Math.PI/2;
        windowDisc.position.y -= circleThickness + 1;
        scene.add(windowDisc);

        const windowLight = new THREE.PointLight(0x88ccff, 0.5, 30);
        windowLight.position.copy(circle.position);
        windowLight.position.y -= 5;
        scene.add(windowLight);

        const windowAmbient = new THREE.AmbientLight(0x88ccff, 0.1);
        scene.add(windowAmbient);

       loadWizardStatue().then((wizardStatue) => {
            if (wizardStatue) {
                
                wizardStatue.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.material) {
                            
                            child.material.roughness = 0.5;  
                            child.material.metalness = 0.9;  
                            child.material.color.setHex(0xFFFFFF);  
                            child.material.envMapIntensity = 0.9;  
                           
                            child.material.emissive = new THREE.Color(0x111111);
                            child.material.emissiveIntensity = 0.6;
                        }
                    }
                });

                
                scene.add(wizardStatue);
                
                // SPOTLIGHT: 
                const statueLight = new THREE.SpotLight(0xffdd99, 5, 30, Math.PI/6, 0.7);
                statueLight.position.set(10, 25, 10);
                statueLight.target.position.set(0, FLOOR_Y + 3, 0);
                statueLight.castShadow = true;
                statueLight.shadow.mapSize.width = 2048;
                statueLight.shadow.mapSize.height = 2048;
                scene.add(statueLight);  
                scene.add(statueLight.target);
                
                // Luz para deduzir contraste
                const fillLight = new THREE.DirectionalLight(0x445588, 0.8);
                fillLight.position.set(-10, 15, -10);
                scene.add(fillLight);
                
                // luz nas bordas para dar uma melhor definição
                const rimLight = new THREE.DirectionalLight(0xffeedd, 0.6);
                rimLight.position.set(5, 10, -15);
                scene.add(rimLight);
            }
        });

        return { ROOM_SIZE, FLOOR_Y };
    });

    return { ROOM_SIZE, FLOOR_Y };
}