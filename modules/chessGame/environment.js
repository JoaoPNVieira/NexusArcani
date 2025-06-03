import * as THREE from 'three';
import { createGate } from '../main/gate.js';

export function chessEnvironment(scene) {
    const ROOM_SIZE = 100;
    const ROOM_HEIGHT = 50;
    const FLOOR_Y = -ROOM_HEIGHT / 2;
    const CHESS_PIECE_SCALE = 3;
    
    // Dimensões do tabuleiro de xadrez
    const BOARD_SIZE = 40;
    const SQUARE_SIZE = BOARD_SIZE / 8;
    const PIECE_HEIGHT = SQUARE_SIZE * 1.5;
    
    // Estado do jogo
    let selectedPiece = null;
    let currentPlayer = 'white';
    let gamePieces = [];
    let capturedPieces = [];
    
    // Criar da sala de jogo 
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
    
    // Criar chão de cor branca
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
    
    // -----------------------------------------
    // Grupo que contém o tabuleiro de xadrez
    const boardGroup = new THREE.Group();
    boardGroup.position.y = FLOOR_Y + 0.1;
    scene.add(boardGroup);
    
    // Base para o tabuleiro de xadrez
    const boardBase = new THREE.Mesh(
        new THREE.BoxGeometry(BOARD_SIZE + 2, 1, BOARD_SIZE + 2),
        new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.6
        })
    );
    boardGroup.add(boardBase);
    
    // Criação das casas do tabuleiro de zadrez
    const lightSquareMat = new THREE.MeshStandardMaterial({ color: 0xF0D9B5 });
    const darkSquareMat = new THREE.MeshStandardMaterial({ color: 0xB58863 });
    const highlightMat = new THREE.MeshStandardMaterial({ 
        color: 0x00FF00,
        emissive: 0x00AA00,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7
    });
    
    const chessSquares = [];
    
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
            square.userData = { x: i, y: j };
            boardGroup.add(square);
            chessSquares.push(square);
        }
    }
    
    // -------------------------
    // Criar peças do jogo
    const createChessPiece = (type, color, x, z) => {
        const pieceGroup = new THREE.Group();
        pieceGroup.position.set(
            (x - 3.5) * SQUARE_SIZE,
            FLOOR_Y + PIECE_HEIGHT/2,
            (z - 3.5) * SQUARE_SIZE
        );
        
        pieceGroup.userData = {
            type,
            color,
            boardX: x,
            boardZ: z,
            isSelected: false
        };
        
        const pieceMat = new THREE.MeshStandardMaterial({ 
            color: color === 'white' ? 0xFFFFFF : 0xFFD700, // Gold color for black pieces
            roughness: 0.3,
            metalness: color === 'white' ? 0.7 : 1.0 // More metallic for gold
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
    
    // Inicialização de peças do jogo
    const initializePieces = () => {
        // Brancas:
        gamePieces.push(createChessPiece('rook', 'white', 0, 0));
        gamePieces.push(createChessPiece('knight', 'white', 1, 0));
        gamePieces.push(createChessPiece('bishop', 'white', 2, 0));
        gamePieces.push(createChessPiece('queen', 'white', 3, 0));
        gamePieces.push(createChessPiece('king', 'white', 4, 0));
        gamePieces.push(createChessPiece('bishop', 'white', 5, 0));
        gamePieces.push(createChessPiece('knight', 'white', 6, 0));
        gamePieces.push(createChessPiece('rook', 'white', 7, 0));
        
        for (let i = 0; i < 8; i++) {
            gamePieces.push(createChessPiece('pawn', 'white', i, 1));
        }
        
        // Pretas:
        gamePieces.push(createChessPiece('rook', 'black', 0, 7));
        gamePieces.push(createChessPiece('knight', 'black', 1, 7));
        gamePieces.push(createChessPiece('bishop', 'black', 2, 7));
        gamePieces.push(createChessPiece('queen', 'black', 3, 7));
        gamePieces.push(createChessPiece('king', 'black', 4, 7));
        gamePieces.push(createChessPiece('bishop', 'black', 5, 7));
        gamePieces.push(createChessPiece('knight', 'black', 6, 7));
        gamePieces.push(createChessPiece('rook', 'black', 7, 7));
        
        for (let i = 0; i < 8; i++) {
            gamePieces.push(createChessPiece('pawn', 'black', i, 6));
        }
        
        // add de peças (importante)
        gamePieces.forEach(piece => scene.add(piece));
    };
    
    initializePieces();
    
    // animaçao das peças a mover
    const animatePiece = (piece, targetPosition, callback) => {
        const startPosition = piece.position.clone();
        const duration = 500; // ms
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
    
    // Dar highlight dos movimentos que se podem fazer de acordo com regas do jogo (tradicionais)
    const highlightMoves = (moves) => {
        chessSquares.forEach(square => {
            square.material = (square.userData.x + square.userData.y) % 2 === 0 
                ? lightSquareMat 
                : darkSquareMat;
        });
        
        moves.forEach(move => {
            const square = chessSquares.find(s => 
                s.userData.x === move.x && s.userData.y === move.y
            );
            if (square) {
                square.material = highlightMat;
            }
        });
    };
    
    // [Get]: Movimentos possíveis/legais para determinada peça 
    const getPossibleMoves = (piece) => {
        const moves = [];
        const { type, color, boardX, boardZ } = piece.userData;
        
        switch(type) {
            case 'pawn':
                const direction = color === 'white' ? 1 : -1;
                if (!getPieceAt(boardX, boardZ + direction)) {
                    moves.push({ x: boardX, y: boardZ + direction });
                    if ((color === 'white' && boardZ === 1) || 
                        (color === 'black' && boardZ === 6)) {
                        if (!getPieceAt(boardX, boardZ + 2 * direction)) {
                            moves.push({ x: boardX, y: boardZ + 2 * direction });
                        }
                    }
                }
                [-1, 1].forEach(dx => {
                    const target = getPieceAt(boardX + dx, boardZ + direction);
                    if (target && target.userData.color !== color) {
                        moves.push({ x: boardX + dx, y: boardZ + direction });
                    }
                });
                break;
                
            case 'rook':
                for (let i = 0; i < 8; i++) {
                    if (i !== boardX) moves.push({ x: i, y: boardZ });
                    if (i !== boardZ) moves.push({ x: boardX, y: i });
                }
                break;
                
            case 'knight':
                const knightMoves = [
                    {dx: 2, dy: 1}, {dx: 2, dy: -1},
                    {dx: -2, dy: 1}, {dx: -2, dy: -1},
                    {dx: 1, dy: 2}, {dx: 1, dy: -2},
                    {dx: -1, dy: 2}, {dx: -1, dy: -2}
                ];
                knightMoves.forEach(move => {
                    const x = boardX + move.dx;
                    const y = boardZ + move.dy;
                    if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                        const target = getPieceAt(x, y);
                        if (!target || target.userData.color !== color) {
                            moves.push({ x, y });
                        }
                    }
                });
                break;
                
            case 'bishop':
                for (let i = 1; i < 8; i++) {
                    if (boardX + i < 8 && boardZ + i < 8) moves.push({ x: boardX + i, y: boardZ + i });
                    if (boardX - i >= 0 && boardZ + i < 8) moves.push({ x: boardX - i, y: boardZ + i });
                    if (boardX + i < 8 && boardZ - i >= 0) moves.push({ x: boardX + i, y: boardZ - i });
                    if (boardX - i >= 0 && boardZ - i >= 0) moves.push({ x: boardX - i, y: boardZ - i });
                }
                break;
                
            case 'queen':
                for (let i = 0; i < 8; i++) {
                    if (i !== boardX) moves.push({ x: i, y: boardZ });
                    if (i !== boardZ) moves.push({ x: boardX, y: i });
                }
                for (let i = 1; i < 8; i++) {
                    if (boardX + i < 8 && boardZ + i < 8) moves.push({ x: boardX + i, y: boardZ + i });
                    if (boardX - i >= 0 && boardZ + i < 8) moves.push({ x: boardX - i, y: boardZ + i });
                    if (boardX + i < 8 && boardZ - i >= 0) moves.push({ x: boardX + i, y: boardZ - i });
                    if (boardX - i >= 0 && boardZ - i >= 0) moves.push({ x: boardX - i, y: boardZ - i });
                }
                break;
                
            case 'king':
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (dx === 0 && dy === 0) continue;
                        const x = boardX + dx;
                        const y = boardZ + dy;
                        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                            const target = getPieceAt(x, y);
                            if (!target || target.userData.color !== color) {
                                moves.push({ x, y });
                            }
                        }
                    }
                }
                break;
        }
        
        return moves.filter(move => {
            const target = getPieceAt(move.x, move.y);
            return !target || target.userData.color !== color;
        });
    };
    
    // [GET] Peças em coordenadas do tabuleiro
    const getPieceAt = (x, y) => {
        return gamePieces.find(p => 
            p.userData.boardX === x && 
            p.userData.boardZ === y &&
            !p.userData.captured
        );
    };
    
    // Mover peça para nova posição do tabuleiro
    const movePiece = (piece, newX, newY) => {
        const targetPiece = getPieceAt(newX, newY);
        if (targetPiece) {
            capturePiece(targetPiece);
        }
        
        piece.userData.boardX = newX;
        piece.userData.boardZ = newY;
        
        const targetPosition = new THREE.Vector3(
            (newX - 3.5) * SQUARE_SIZE,
            FLOOR_Y + PIECE_HEIGHT/2,
            (newY - 3.5) * SQUARE_SIZE
        );
        
        animatePiece(piece, targetPosition, () => {
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            selectedPiece = null;
            highlightMoves([]);
        });
    };
    
    // Capturar uma peça (comer)
    const capturePiece = (piece) => {
        piece.userData.captured = true;
        capturedPieces.push(piece);
        
        const capturedIndex = capturedPieces.filter(p => p.userData.color === piece.userData.color).length;
        const offsetX = piece.userData.color === 'white' ? -4 : 4;
        
        animatePiece(piece, new THREE.Vector3(
            offsetX + (capturedIndex % 4) * 1.5,
            FLOOR_Y + PIECE_HEIGHT/2,
            BOARD_SIZE/2 + 5 + Math.floor(capturedIndex / 4) * 1.5
        ));
    };
    
    // Interação com rato
    const handleClick = (event) => {
        if (event.button !== 0) return;
        
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        
        raycaster.setFromCamera(mouse, currentCamera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
            const clickedObj = intersects[0].object;
            
            const clickedPiece = gamePieces.find(p => 
                p === clickedObj || p.children.includes(clickedObj)
            );
            
            if (clickedPiece) {
                if (clickedPiece.userData.color === currentPlayer) {
                    selectedPiece = clickedPiece;
                    const moves = getPossibleMoves(selectedPiece);
                    highlightMoves(moves);
                }
                else if (selectedPiece) {
                    const targetSquare = chessSquares.find(s => 
                        s === clickedObj || s === clickedObj.parent
                    );
                    
                    if (targetSquare) {
                        const moves = getPossibleMoves(selectedPiece);
                        const move = moves.find(m => 
                            m.x === targetSquare.userData.x && 
                            m.y === targetSquare.userData.y
                        );
                        
                        if (move) {
                            movePiece(selectedPiece, move.x, move.y);
                        }
                    }
                }
            }
            else if (chessSquares.includes(clickedObj)) {
                if (selectedPiece) {
                    const moves = getPossibleMoves(selectedPiece);
                    const move = moves.find(m => 
                        m.x === clickedObj.userData.x && 
                        m.y === clickedObj.userData.y
                    );
                    
                    if (move) {
                        movePiece(selectedPiece, move.x, move.y);
                    }
                }
            }
        }
    };
    
    window.addEventListener('click', handleClick);
    
    // Efeitos de luz (lighting)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
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
    
    // Voltar para a sala da Nexus
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


    const circleRadius = 40;
    const circleThickness = 2;
    
    const columnMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 10,
        metalness: 0.2
    });

    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.7,
        emissive: 0x011635,
        emissiveIntensity: 0.4
    });


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

    const orbGeometry = new THREE.SphereGeometry(5, 32, 32);
    const orbMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a237e,
        emissive: 0x4fc3f7,
        emissiveIntensity: 0.5,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.9
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.set(0, FLOOR_Y + ROOM_HEIGHT - 15, 0);
    scene.add(orb);

    const innerRing1 = new THREE.Mesh(
        new THREE.TorusGeometry(8, 0.5, 16, 32),
        new THREE.MeshStandardMaterial({ 
            color: 0x4fc3f7,
            emissive: 0x4fc3f7,
            emissiveIntensity: 0.3
        })
    );
    innerRing1.position.copy(orb.position);
    innerRing1.rotation.x = Math.PI/2;
    scene.add(innerRing1);

    const innerRing2 = new THREE.Mesh(
        new THREE.TorusGeometry(10, 0.3, 16, 32),
        new THREE.MeshStandardMaterial({ 
            color: 0x1a237e,
            emissive: 0x4fc3f7,
            emissiveIntensity: 0.2
        })
    );
    innerRing2.position.copy(orb.position);
    innerRing2.rotation.z = Math.PI/2;
    scene.add(innerRing2);

    const animateOrb = () => {
        requestAnimationFrame(animateOrb);
        const time = Date.now() * 0.001;
        
        orb.rotation.y = time * 0.3;
        innerRing1.rotation.y = time * 0.5;
        innerRing2.rotation.x = time * 0.4;
        
        orb.scale.setScalar(1 + Math.sin(time * 10) * 0.05);
        orbMaterial.emissiveIntensity = 5 + Math.sin(time * 1.5) * 0.2;
    };
    animateOrb();

    // Função para limpar o listener do click do rato (interação)
    const cleanup = () => {
        window.removeEventListener('click', handleClick);
    };
    
    return { 
        ROOM_SIZE, 
        FLOOR_Y,
        chessPieces: gamePieces,
        animatePiece,
        SQUARE_SIZE,
        BOARD_SIZE,
        scene,
        cleanup
    };
}