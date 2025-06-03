import * as THREE from 'three';
import { createGate } from '../main/gate.js';

export function chessEnvironment(scene) {
    const ROOM_SIZE = 100;
    const ROOM_HEIGHT = 50;
    const FLOOR_Y = -ROOM_HEIGHT / 2;
    const CHESS_PIECE_SCALE = 3;
    
    // Parametros do tabuleiro
    const BOARD_SIZE = 40;
    const SQUARE_SIZE = BOARD_SIZE / 8;
    const PIECE_HEIGHT = SQUARE_SIZE * 1.5;
    
    // Parametros de controlo
    const PANEL_WIDTH = BOARD_SIZE * 1.2;
    const PANEL_HEIGHT = 10;
    const PANEL_DEPTH = 2;
    const PANEL_Y = FLOOR_Y + PANEL_HEIGHT/2 + 1;
    
    // Criar a sala
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
    
    // Create the floor with a chessboard pattern
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
        new THREE.MeshStandardMaterial({ 
            color: 0x555555,
            roughness: 0.7,
            metalness: 0.1
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = FLOOR_Y;
    scene.add(floor);
    
    // Tabuleiro do zadrez
    const boardGroup = new THREE.Group();
    boardGroup.position.y = FLOOR_Y + 0.1;
    scene.add(boardGroup);
    
    const boardBase = new THREE.Mesh(
        new THREE.BoxGeometry(BOARD_SIZE + 2, 1, BOARD_SIZE + 2),
        new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, // madeira 
            roughness: 0.6
        })
    );
    boardGroup.add(boardBase);
    
    // Quadrados
    const lightSquareMat = new THREE.MeshStandardMaterial({ color: 0xF0D9B5 });
    const darkSquareMat = new THREE.MeshStandardMaterial({ color: 0xB58863 });
    
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = new THREE.Mesh(
                new THREE.PlaneGeometry(SQUARE_SIZE, SQUARE_SIZE),
                (i + j) % 2 === 0 ? lightSquareMat : darkSquareMat
            );
            square.rotation.x = -Math.PI / 2;
            square.position.set(
                (i - 3.5) * SQUARE_SIZE,
                0.6,
                (j - 3.5) * SQUARE_SIZE
            );
            boardGroup.add(square);
        }
    }
    
    // Simples (peao)
    const createChessPiece = (type, color, x, z) => {
        const pieceGroup = new THREE.Group();
        pieceGroup.position.set(
            (x - 3.5) * SQUARE_SIZE,
            FLOOR_Y + PIECE_HEIGHT/2,
            (z - 3.5) * SQUARE_SIZE
        );
        
        const pieceMat = new THREE.MeshStandardMaterial({ 
            color: color === 'white' ? 0xFFFFFF : 0x222222,
            roughness: 0.3,
            metalness: 0.7
        });
        
        let geometry;
        switch(type) {
            case 'pawn':
                geometry = new THREE.CylinderGeometry(SQUARE_SIZE/3, SQUARE_SIZE/2, PIECE_HEIGHT, 16);
                break;
            case 'rook':
                geometry = new THREE.BoxGeometry(SQUARE_SIZE/1.5, PIECE_HEIGHT, SQUARE_SIZE/1.5);
                break;
            case 'knight':
                // Cavaleiros
                const head = new THREE.Mesh(
                    new THREE.SphereGeometry(SQUARE_SIZE/3, 16, 16),
                    pieceMat
                );
                head.position.y = PIECE_HEIGHT * 0.7;
                head.position.z = -SQUARE_SIZE/4;
                pieceGroup.add(head);
                
                geometry = new THREE.CylinderGeometry(SQUARE_SIZE/3, SQUARE_SIZE/2, PIECE_HEIGHT*0.7, 16);
                break;
            case 'bishop':
                geometry = new THREE.ConeGeometry(SQUARE_SIZE/2, PIECE_HEIGHT, 16);
                break;
            case 'queen':
                // Coroa
                const base = new THREE.Mesh(
                    new THREE.SphereGeometry(SQUARE_SIZE/2, 16, 16),
                    pieceMat
                );
                base.position.y = PIECE_HEIGHT * 0.3;
                pieceGroup.add(base);
                
                const top = new THREE.Mesh(
                    new THREE.ConeGeometry(SQUARE_SIZE/3, PIECE_HEIGHT*0.7, 16),
                    pieceMat
                );
                top.position.y = PIECE_HEIGHT * 0.65;
                pieceGroup.add(top);
                
                // Coroa
                for (let i = 0; i < 5; i++) {
                    const spike = new THREE.Mesh(
                        new THREE.ConeGeometry(SQUARE_SIZE/6, PIECE_HEIGHT*0.3, 8),
                        pieceMat
                    );
                    spike.position.y = PIECE_HEIGHT * 0.85;
                    spike.position.x = Math.cos(i * Math.PI * 0.4) * SQUARE_SIZE/3;
                    spike.position.z = Math.sin(i * Math.PI * 0.4) * SQUARE_SIZE/3;
                    pieceGroup.add(spike);
                }
                return pieceGroup;
            case 'king':
                // Cruz no topo da peça
                geometry = new THREE.CylinderGeometry(SQUARE_SIZE/3, SQUARE_SIZE/2, PIECE_HEIGHT, 16);
                const crossBase = new THREE.Mesh(
                    new THREE.BoxGeometry(SQUARE_SIZE/4, PIECE_HEIGHT*0.3, SQUARE_SIZE/4),
                    pieceMat
                );
                crossBase.position.y = PIECE_HEIGHT * 0.85;
                pieceGroup.add(crossBase);
                
                const crossVertical = new THREE.Mesh(
                    new THREE.BoxGeometry(SQUARE_SIZE/8, PIECE_HEIGHT*0.4, SQUARE_SIZE/8),
                    pieceMat
                );
                crossVertical.position.y = PIECE_HEIGHT * 1.05;
                pieceGroup.add(crossVertical);
                
                const crossHorizontal = new THREE.Mesh(
                    new THREE.BoxGeometry(SQUARE_SIZE/3, PIECE_HEIGHT*0.15, SQUARE_SIZE/8),
                    pieceMat
                );
                crossHorizontal.position.y = PIECE_HEIGHT * 1.05;
                pieceGroup.add(crossHorizontal);
                break;
        }
        
        if (geometry) {
            const piece = new THREE.Mesh(geometry, pieceMat);
            pieceGroup.add(piece);
        }
        
        return pieceGroup;
    };
    
    // posição inicial 
    const chessPieces = [];
    
    // Peças brancas
    chessPieces.push(createChessPiece('rook', 'white', 0, 0));
    chessPieces.push(createChessPiece('knight', 'white', 1, 0));
    chessPieces.push(createChessPiece('bishop', 'white', 2, 0));
    chessPieces.push(createChessPiece('queen', 'white', 3, 0));
    chessPieces.push(createChessPiece('king', 'white', 4, 0));
    chessPieces.push(createChessPiece('bishop', 'white', 5, 0));
    chessPieces.push(createChessPiece('knight', 'white', 6, 0));
    chessPieces.push(createChessPiece('rook', 'white', 7, 0));
    
    for (let i = 0; i < 8; i++) {
        chessPieces.push(createChessPiece('pawn', 'white', i, 1));
    }
    
    // Peças pretas
    chessPieces.push(createChessPiece('rook', 'black', 0, 7));
    chessPieces.push(createChessPiece('knight', 'black', 1, 7));
    chessPieces.push(createChessPiece('bishop', 'black', 2, 7));
    chessPieces.push(createChessPiece('queen', 'black', 3, 7));
    chessPieces.push(createChessPiece('king', 'black', 4, 7));
    chessPieces.push(createChessPiece('bishop', 'black', 5, 7));
    chessPieces.push(createChessPiece('knight', 'black', 6, 7));
    chessPieces.push(createChessPiece('rook', 'black', 7, 7));
    
    for (let i = 0; i < 8; i++) {
        chessPieces.push(createChessPiece('pawn', 'black', i, 6));
    }
    
    // Todas as peças presentes
    chessPieces.forEach(piece => scene.add(piece));
    
    // Painel de controlo
    const controlPanel = new THREE.Mesh(
        new THREE.BoxGeometry(PANEL_WIDTH, PANEL_HEIGHT, PANEL_DEPTH),
        new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            roughness: 0.5,
            metalness: 0.3
        })
    );
    controlPanel.position.set(0, PANEL_Y, BOARD_SIZE/2 + 10);
    scene.add(controlPanel);
    

    const buttonGeometry = new THREE.CylinderGeometry(2, 2, 1, 32);
    const buttonMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const activeButtonMaterial = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
    
    // movimento
    const directions = [
        { name: 'forward', x: 0, z: -3, rotation: Math.PI/2 },
        { name: 'back', x: 0, z: 3, rotation: Math.PI/2 },
        { name: 'left', x: -3, z: 0, rotation: 0 },
        { name: 'right', x: 3, z: 0, rotation: 0 }
    ];
    
    directions.forEach(dir => {
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.rotation.x = dir.rotation;
        button.position.set(
            dir.x,
            PANEL_Y,
            BOARD_SIZE/2 + 10 + dir.z
        );
        scene.add(button);
    });
    
    // Botões de ação no centro
    const actionButton = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, 1, 32),
        buttonMaterial
    );
    actionButton.position.set(0, PANEL_Y, BOARD_SIZE/2 + 10);
    scene.add(actionButton);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const boardLight = new THREE.SpotLight(0xFFFFFF, 1, 50, Math.PI/4, 0.5);
    boardLight.position.set(0, 30, 0);
    boardLight.target.position.set(0, 0, 0);
    boardLight.castShadow = true;
    scene.add(boardLight);
    scene.add(boardLight.target);
    
    // Portal para voltar para a nexus room
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
    
    // Animação para cada peça de xadez 
    const animatePiece = (piece, targetPosition, callback) => {
        const startPosition = piece.position.clone();
        const duration = 1000; // ms
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const t = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            piece.position.lerpVectors(startPosition, targetPosition, t);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };
        
        animate();
    };

    return { 
    ROOM_SIZE, 
    FLOOR_Y,
    chessPieces,
    animatePiece,
    SQUARE_SIZE,
    BOARD_SIZE,
    scene
    };
}