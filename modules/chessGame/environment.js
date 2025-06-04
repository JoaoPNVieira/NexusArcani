import * as THREE from 'three';
import { createGate } from '../main/gate.js';
import { ChessGame } from './chessLogic.js';

export function chessEnvironment(scene, camera) {
    const ROOM_SIZE = 100;
    const ROOM_HEIGHT = 50;
    const FLOOR_Y = -ROOM_HEIGHT / 2;
    
    // Chess board dimensions
    const BOARD_SIZE = 40;
    const SQUARE_SIZE = BOARD_SIZE / 8;
    const PIECE_HEIGHT = SQUARE_SIZE * 1.5;
    
    // Create chess game instance
    const chessGame = new ChessGame(scene, SQUARE_SIZE, BOARD_SIZE, FLOOR_Y, PIECE_HEIGHT);
    
    // Create room
    const room = new THREE.Mesh(
        new THREE.BoxGeometry(ROOM_SIZE, ROOM_HEIGHT, ROOM_SIZE),
        new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            side: THREE.BackSide,
            roughness: 0.8,
            metalness: 0.1
        })
    );
    scene.add(room);
    
    // Create floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
        new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF,
            roughness: 0.7,
            metalness: 0.1
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = FLOOR_Y + 0.1;
    scene.add(floor);
    
    // Chess board group positioning
    const boardGroup = new THREE.Group();
    boardGroup.position.y = FLOOR_Y + 0.1;  // Adjust this to raise/lower entire board
    scene.add(boardGroup);
    
    // Board surface (adjust last parameter for thickness)
    const boardSurface = new THREE.Mesh(
        new THREE.BoxGeometry(BOARD_SIZE + 2, 0.2, BOARD_SIZE + 2),
        new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.6
        })
    );
    boardGroup.add(boardSurface);
    
    // Create chess board
    chessGame.createBoard(boardGroup);
    
    // Initialize pieces
    chessGame.initializePieces();
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const boardLight = new THREE.SpotLight(0xFFFFFF, 1, 50, Math.PI/4, 0.5);
    boardLight.position.set(0, 30, 0);
    boardLight.target.position.set(0, 0, 0);
    boardLight.castShadow = true;
    scene.add(boardLight);
    scene.add(boardLight.target);
    
    // Gate to return to nexus
    const gateSize = { width: 20, height: 30, depth: 8, thickness: 1.5 };
    const gateVerticalPos = FLOOR_Y + ROOM_HEIGHT/4;
    const gateOffset = ROOM_SIZE/2 - 1;
    
    scene.add(createGate(
        { x: 0, y: gateVerticalPos, z: -gateOffset },
        gateSize,
        new THREE.MeshStandardMaterial({ color: 0x333333 }),
        new THREE.MeshStandardMaterial({ color: 0x1A237E }),
        0x1A237E,
        0
    ));
    
    // Click handler
    const handleClick = (event) => chessGame.handleClick(event, camera);
    window.addEventListener('click', handleClick);
    
    return { 
        ROOM_SIZE, 
        FLOOR_Y,
        chessGame,
        cleanup: () => {
            window.removeEventListener('click', handleClick);
            chessGame.cleanup();
        }
    };
}