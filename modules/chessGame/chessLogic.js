import * as THREE from 'three';

export class ChessGame {
    constructor(scene, SQUARE_SIZE, BOARD_SIZE, FLOOR_Y, PIECE_HEIGHT) {
        this.scene = scene;
        this.SQUARE_SIZE = SQUARE_SIZE;
        this.BOARD_SIZE = BOARD_SIZE;
        this.FLOOR_Y = FLOOR_Y;
        this.PIECE_HEIGHT = PIECE_HEIGHT;
        this.camera = null;
        
        // Parametros realistas
        this.PIECE_BASE_HEIGHT = 1.2;
        this.PIECE_LIFT_AMOUNT = PIECE_HEIGHT * 0.25;
        this.BOARD_SURFACE_OFFSET = 0.5;
        
        this.selectedPiece = null;
        this.currentPlayer = 'white';
        this.gamePieces = [];
        this.capturedPieces = [];
        this.chessSquares = [];
        
        // Materiais
        this.lightSquareMat = new THREE.MeshStandardMaterial({ color: 0xF0D9B5 });
        this.darkSquareMat = new THREE.MeshStandardMaterial({ color: 0xB58863 });
        this.highlightMat = new THREE.MeshStandardMaterial({ 
            color: 0x00FF00,
            emissive: 0x00AA00,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        
        this.whitePieceMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF,
            roughness: 0.1,
            metalness: 0.9
        });
        
        this.blackPieceMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700,
            roughness: 0.1,
            metalness: 0.9
        });
        
        this.selectedMat = new THREE.MeshStandardMaterial({
            color: 0xFFFF00,
            emissive: 0x888800,
            emissiveIntensity: 0.5
        });
    }

    setCamera(camera) {
        this.camera = camera;
    }

    createBoard(boardGroup) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = new THREE.Mesh(
                    new THREE.PlaneGeometry(this.SQUARE_SIZE, this.SQUARE_SIZE),
                    (i + j) % 2 === 0 ? this.lightSquareMat : this.darkSquareMat
                );
                square.rotation.x = -Math.PI / 2;
                square.position.set(
                    (i - 3.5) * this.SQUARE_SIZE,
                    this.BOARD_SURFACE_OFFSET,
                    (j - 3.5) * this.SQUARE_SIZE
                );
                square.userData = { x: i, y: j };
                boardGroup.add(square);
                this.chessSquares.push(square);
            }
        }
    }

    createChessPiece(type, color, x, z) {
        const pieceGroup = new THREE.Group();
        
        pieceGroup.position.set(
            (x - 3.5) * this.SQUARE_SIZE,
            this.FLOOR_Y + this.BOARD_SURFACE_OFFSET + this.PIECE_BASE_HEIGHT,
            (z - 3.5) * this.SQUARE_SIZE
        );
        
        // Orientação de peças 
        if (color === 'white') {
            pieceGroup.rotation.y = Math.PI;  
        } else {
            pieceGroup.rotation.y = 0;
        }
        
        pieceGroup.userData = {
            type,
            color,
            boardX: x,
            boardZ: z,
            isSelected: false,
            hasMoved: false
        };
        
        const pieceMat = color === 'white' ? this.whitePieceMat : this.blackPieceMat;
        
        // Base para todas as peças
        const baseHeight = this.PIECE_HEIGHT * 0.15;
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(
                this.SQUARE_SIZE/3, 
                this.SQUARE_SIZE/2.5, 
                baseHeight,
                16
            ),
            pieceMat
        );
        base.position.y = -baseHeight/2;
        pieceGroup.add(base);
        
        // Modelos de peças
        switch(type) {
            case 'pawn':
                const pawnBody = new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        this.SQUARE_SIZE/4, 
                        this.SQUARE_SIZE/3, 
                        this.PIECE_HEIGHT * 0.6, 
                        16
                    ),
                    pieceMat
                );
                pawnBody.position.y = this.PIECE_HEIGHT * 0.3;
                
                const pawnTop = new THREE.Mesh(
                    new THREE.SphereGeometry(
                        this.SQUARE_SIZE/4,
                        16,
                        16,
                        0,
                        Math.PI * 2,
                        0,
                        Math.PI/2
                    ),
                    pieceMat
                );
                pawnTop.position.y = this.PIECE_HEIGHT * 0.6;
                
                pieceGroup.add(pawnBody);
                pieceGroup.add(pawnTop);
                break;
                
            case 'rook':
                const rookBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        this.SQUARE_SIZE/3,
                        this.SQUARE_SIZE/3,
                        this.PIECE_HEIGHT * 0.5,
                        16
                    ),
                    pieceMat
                );
                rookBase.position.y = this.PIECE_HEIGHT * 0.25;
                
                const crenelHeight = this.PIECE_HEIGHT * 0.2;
                const crenelWidth = this.SQUARE_SIZE/6;
                for (let i = 0; i < 4; i++) {
                    const crenel = new THREE.Mesh(
                        new THREE.BoxGeometry(
                            crenelWidth,
                            crenelHeight,
                            crenelWidth
                        ),
                        pieceMat
                    );
                    crenel.position.y = this.PIECE_HEIGHT * 0.5 + crenelHeight/2;
                    crenel.position.x = (this.SQUARE_SIZE/3 - crenelWidth/2) * Math.cos(i * Math.PI/2);
                    crenel.position.z = (this.SQUARE_SIZE/3 - crenelWidth/2) * Math.sin(i * Math.PI/2);
                    pieceGroup.add(crenel);
                }
                
                pieceGroup.add(rookBase);
                break;
                
            case 'knight':
                const knightBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        this.SQUARE_SIZE/3,
                        this.SQUARE_SIZE/2.5,
                        this.PIECE_HEIGHT * 0.4,
                        16
                    ),
                    pieceMat
                );
                knightBase.position.y = this.PIECE_HEIGHT * 0.2;
                
                const head = new THREE.Mesh(
                    new THREE.SphereGeometry(
                        this.SQUARE_SIZE/3.5,
                        16,
                        16,
                        0,
                        Math.PI * 2,
                        0,
                        Math.PI/1.5
                    ),
                    pieceMat
                );
                head.position.y = this.PIECE_HEIGHT * 0.6;
                head.position.z = -this.SQUARE_SIZE/4;
                
                const earGeometry = new THREE.ConeGeometry(
                    this.SQUARE_SIZE/8,
                    this.SQUARE_SIZE/5,
                    8
                );
                const leftEar = new THREE.Mesh(earGeometry, pieceMat);
                leftEar.position.set(
                    -this.SQUARE_SIZE/6,
                    this.PIECE_HEIGHT * 0.75,
                    -this.SQUARE_SIZE/4
                );
                leftEar.rotation.x = -Math.PI/4;
                
                const rightEar = new THREE.Mesh(earGeometry, pieceMat);
                rightEar.position.set(
                    this.SQUARE_SIZE/6,
                    this.PIECE_HEIGHT * 0.75,
                    -this.SQUARE_SIZE/4
                );
                rightEar.rotation.x = -Math.PI/4;
                
                pieceGroup.add(knightBase);
                pieceGroup.add(head);
                pieceGroup.add(leftEar);
                pieceGroup.add(rightEar);
                break;
                
            case 'bishop':
                const bishopBody = new THREE.Mesh(
                    new THREE.ConeGeometry(
                        this.SQUARE_SIZE/3,
                        this.PIECE_HEIGHT * 0.8,
                        16
                    ),
                    pieceMat
                );
                bishopBody.position.y = this.PIECE_HEIGHT * 0.4;
                
                const slit = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        this.SQUARE_SIZE/10,
                        this.PIECE_HEIGHT * 0.6,
                        this.SQUARE_SIZE/4
                    ),
                    new THREE.MeshStandardMaterial({ color: 0x000000 })
                );
                slit.position.y = this.PIECE_HEIGHT * 0.4;
                slit.position.z = this.SQUARE_SIZE/5;
                
                const top = new THREE.Mesh(
                    new THREE.SphereGeometry(
                        this.SQUARE_SIZE/8,
                        8,
                        8
                    ),
                    pieceMat
                );
                top.position.y = this.PIECE_HEIGHT * 0.8;
                
                pieceGroup.add(bishopBody);
                pieceGroup.add(slit);
                pieceGroup.add(top);
                break;
                
            case 'queen':
                const queenBody = new THREE.Mesh(
                    new THREE.SphereGeometry(
                        this.SQUARE_SIZE/3,
                        16,
                        16,
                        0,
                        Math.PI * 2,
                        Math.PI/4,
                        Math.PI/1.5
                    ),
                    pieceMat
                );
                queenBody.position.y = this.PIECE_HEIGHT * 0.3;
                
                const crownBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        this.SQUARE_SIZE/4,
                        this.SQUARE_SIZE/5,
                        this.PIECE_HEIGHT * 0.2,
                        8
                    ),
                    pieceMat
                );
                crownBase.position.y = this.PIECE_HEIGHT * 0.5;

                const pointHeight = this.PIECE_HEIGHT * 0.3;
                for (let i = 0; i < 5; i++) {
                    const point = new THREE.Mesh(
                        new THREE.ConeGeometry(
                            this.SQUARE_SIZE/10,
                            pointHeight,
                            4
                        ),
                        pieceMat
                    );
                    point.position.y = this.PIECE_HEIGHT * 0.6 + pointHeight/2;
                    point.position.x = (this.SQUARE_SIZE/4) * Math.cos(i * Math.PI * 0.4);
                    point.position.z = (this.SQUARE_SIZE/4) * Math.sin(i * Math.PI * 0.4);
                    point.rotation.y = i * Math.PI * 0.4;
                    pieceGroup.add(point);
                }
                
                pieceGroup.add(queenBody);
                pieceGroup.add(crownBase);
                break;
                
            case 'king':
                const kingBody = new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        this.SQUARE_SIZE/3.5,
                        this.SQUARE_SIZE/3,
                        this.PIECE_HEIGHT * 0.7,
                        16
                    ),
                    pieceMat
                );
                kingBody.position.y = this.PIECE_HEIGHT * 0.35;

                const crossBase = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        this.SQUARE_SIZE/2.5,
                        this.PIECE_HEIGHT * 0.1,
                        this.SQUARE_SIZE/2.5
                    ),
                    pieceMat
                );
                crossBase.position.y = this.PIECE_HEIGHT * 0.75;

                const crossVert = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        this.SQUARE_SIZE/8,
                        this.PIECE_HEIGHT * 0.3,
                        this.SQUARE_SIZE/8
                    ),
                    pieceMat
                );
                crossVert.position.y = this.PIECE_HEIGHT * 0.9;

                const crossHoriz = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        this.SQUARE_SIZE/4,
                        this.PIECE_HEIGHT * 0.1,
                        this.SQUARE_SIZE/8
                    ),
                    pieceMat
                );
                crossHoriz.position.y = this.PIECE_HEIGHT * 0.9;
                
                pieceGroup.add(kingBody);
                pieceGroup.add(crossBase);
                pieceGroup.add(crossVert);
                pieceGroup.add(crossHoriz);
                break;
        }
        
        return pieceGroup;
    }

    initializePieces() {
        this.gamePieces.forEach(piece => this.scene.remove(piece));
        this.gamePieces = [];
        
        const whitePieces = [
            {type: 'rook', x: 0, y: 0}, {type: 'knight', x: 1, y: 0},
            {type: 'bishop', x: 2, y: 0}, {type: 'queen', x: 3, y: 0},
            {type: 'king', x: 4, y: 0}, {type: 'bishop', x: 5, y: 0},
            {type: 'knight', x: 6, y: 0}, {type: 'rook', x: 7, y: 0}
        ];
        
        for (let i = 0; i < 8; i++) {
            whitePieces.push({type: 'pawn', x: i, y: 1});
        }
        
        const blackPieces = [
            {type: 'rook', x: 0, y: 7}, {type: 'knight', x: 1, y: 7},
            {type: 'bishop', x: 2, y: 7}, {type: 'queen', x: 3, y: 7},
            {type: 'king', x: 4, y: 7}, {type: 'bishop', x: 5, y: 7},
            {type: 'knight', x: 6, y: 7}, {type: 'rook', x: 7, y: 7}
        ];
        
        for (let i = 0; i < 8; i++) {
            blackPieces.push({type: 'pawn', x: i, y: 6});
        }
        
        whitePieces.forEach(p => {
            const piece = this.createChessPiece(p.type, 'white', p.x, p.y);
            this.gamePieces.push(piece);
            this.scene.add(piece);
        });
        
        blackPieces.forEach(p => {
            const piece = this.createChessPiece(p.type, 'black', p.x, p.y);
            this.gamePieces.push(piece);
            this.scene.add(piece);
        });
    }

    getPieceAt(x, y) {
        return this.gamePieces.find(p => 
            Math.round(p.userData.boardX) === x && 
            Math.round(p.userData.boardZ) === y &&
            !p.userData.captured
        );
    }

    highlightMoves(moves) {
        this.chessSquares.forEach(square => {
            square.material = (square.userData.x + square.userData.y) % 2 === 0 
                ? this.lightSquareMat 
                : this.darkSquareMat;
        });
        
        moves.forEach(move => {
            const square = this.chessSquares.find(s => 
                s.userData.x === move.x && s.userData.y === move.y
            );
            if (square) {
                square.material = this.highlightMat;
            }
        });
        
        if (this.selectedPiece) {
            this.selectedPiece.children.forEach(child => {
                if (child.isMesh) {
                    child.material = this.selectedMat;
                }
            });
        }
    }

    getPossibleMoves(piece) {
        const moves = [];
        const { type, color, boardX, boardZ } = piece.userData;
        
        const direction = color === 'white' ? 1 : -1;
        const enemyColor = color === 'white' ? 'black' : 'white';
        
        switch(type) {
            case 'pawn':
                if (!this.getPieceAt(boardX, boardZ + direction)) {
                    moves.push({ x: boardX, y: boardZ + direction });
                    
                    if ((color === 'white' && boardZ === 1) || 
                        (color === 'black' && boardZ === 6)) {
                        if (!this.getPieceAt(boardX, boardZ + 2 * direction)) {
                            moves.push({ x: boardX, y: boardZ + 2 * direction });
                        }
                    }
                }
                
                [-1, 1].forEach(dx => {
                    const targetX = boardX + dx;
                    const targetY = boardZ + direction;
                    const targetPiece = this.getPieceAt(targetX, targetY);
                    
                    if (targetPiece && targetPiece.userData.color === enemyColor) {
                        moves.push({ x: targetX, y: targetY });
                    }
                });
                break;
                
            case 'rook':
                const rookDirections = [
                    {dx: 1, dy: 0}, {dx: -1, dy: 0},
                    {dx: 0, dy: 1}, {dx: 0, dy: -1}
                ];
                
                rookDirections.forEach(dir => {
                    for (let i = 1; i < 8; i++) {
                        const targetX = boardX + dir.dx * i;
                        const targetY = boardZ + dir.dy * i;
                        
                        if (targetX < 0 || targetX > 7 || targetY < 0 || targetY > 7) break;
                        
                        const targetPiece = this.getPieceAt(targetX, targetY);
                        if (!targetPiece) {
                            moves.push({ x: targetX, y: targetY });
                        } else {
                            if (targetPiece.userData.color === enemyColor) {
                                moves.push({ x: targetX, y: targetY });
                            }
                            break;
                        }
                    }
                });
                break;
                
            case 'knight':
                const knightMoves = [
                    {dx: 2, dy: 1}, {dx: 2, dy: -1},
                    {dx: -2, dy: 1}, {dx: -2, dy: -1},
                    {dx: 1, dy: 2}, {dx: 1, dy: -2},
                    {dx: -1, dy: 2}, {dx: -1, dy: -2}
                ];
                
                knightMoves.forEach(move => {
                    const targetX = boardX + move.dx;
                    const targetY = boardZ + move.dy;
                    
                    if (targetX >= 0 && targetX < 8 && targetY >= 0 && targetY < 8) {
                        const targetPiece = this.getPieceAt(targetX, targetY);
                        if (!targetPiece || targetPiece.userData.color === enemyColor) {
                            moves.push({ x: targetX, y: targetY });
                        }
                    }
                });
                break;
                
            case 'bishop':
                const bishopDirections = [
                    {dx: 1, dy: 1}, {dx: 1, dy: -1},
                    {dx: -1, dy: 1}, {dx: -1, dy: -1}
                ];
                
                bishopDirections.forEach(dir => {
                    for (let i = 1; i < 8; i++) {
                        const targetX = boardX + dir.dx * i;
                        const targetY = boardZ + dir.dy * i;
                        
                        if (targetX < 0 || targetX > 7 || targetY < 0 || targetY > 7) break;
                        
                        const targetPiece = this.getPieceAt(targetX, targetY);
                        if (!targetPiece) {
                            moves.push({ x: targetX, y: targetY });
                        } else {
                            if (targetPiece.userData.color === enemyColor) {
                                moves.push({ x: targetX, y: targetY });
                            }
                            break;
                        }
                    }
                });
                break;
                
            case 'queen':
                const queenDirections = [
                    {dx: 1, dy: 0}, {dx: -1, dy: 0},
                    {dx: 0, dy: 1}, {dx: 0, dy: -1},
                    {dx: 1, dy: 1}, {dx: 1, dy: -1},
                    {dx: -1, dy: 1}, {dx: -1, dy: -1}
                ];
                
                queenDirections.forEach(dir => {
                    for (let i = 1; i < 8; i++) {
                        const targetX = boardX + dir.dx * i;
                        const targetY = boardZ + dir.dy * i;
                        
                        if (targetX < 0 || targetX > 7 || targetY < 0 || targetY > 7) break;
                        
                        const targetPiece = this.getPieceAt(targetX, targetY);
                        if (!targetPiece) {
                            moves.push({ x: targetX, y: targetY });
                        } else {
                            if (targetPiece.userData.color === enemyColor) {
                                moves.push({ x: targetX, y: targetY });
                            }
                            break;
                        }
                    }
                });
                break;
                
            case 'king':
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (dx === 0 && dy === 0) continue;
                        
                        const targetX = boardX + dx;
                        const targetY = boardZ + dy;
                        
                        if (targetX >= 0 && targetX < 8 && targetY >= 0 && targetY < 8) {
                            const targetPiece = this.getPieceAt(targetX, targetY);
                            if (!targetPiece || targetPiece.userData.color === enemyColor) {
                                moves.push({ x: targetX, y: targetY });
                            }
                        }
                    }
                }
                break;
        }
        
        return moves;
    }

    animatePiece(piece, targetPosition, callback) {
        const startPosition = piece.position.clone();
        const duration = 300;
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
    }

    movePiece(piece, newX, newY) {
        const targetPiece = this.getPieceAt(newX, newY);
        if (targetPiece) {
            this.capturePiece(targetPiece);
        }
        
        piece.userData.boardX = newX;
        piece.userData.boardZ = newY;
        piece.userData.hasMoved = true;
        
        const targetPosition = new THREE.Vector3(
            (newX - 3.5) * this.SQUARE_SIZE,
            this.FLOOR_Y + this.BOARD_SURFACE_OFFSET + this.PIECE_BASE_HEIGHT,
            (newY - 3.5) * this.SQUARE_SIZE
        );
        
        const midPosition = new THREE.Vector3(
            (targetPosition.x + piece.position.x) / 2,
            this.FLOOR_Y + this.BOARD_SURFACE_OFFSET + this.PIECE_BASE_HEIGHT + this.PIECE_LIFT_AMOUNT,
            (targetPosition.z + piece.position.z) / 2
        );
        
        const sequence = [
            { position: midPosition, duration: 150 },
            { position: targetPosition, duration: 150 }
        ];
        
        let currentStep = 0;
        const animateSequence = () => {
            if (currentStep < sequence.length) {
                const step = sequence[currentStep];
                this.animatePiece(piece, step.position, () => {
                    currentStep++;
                    animateSequence();
                });
            } else {
                this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
                this.selectedPiece = null;
                this.highlightMoves([]);
                
                const pieceMat = piece.userData.color === 'white' 
                    ? this.whitePieceMat 
                    : this.blackPieceMat;
                
                piece.children.forEach(child => {
                    if (child.isMesh) {
                        child.material = pieceMat;
                    }
                });
            }
        };
        
        animateSequence();
    }

    capturePiece(piece) {
        piece.userData.captured = true;
        this.capturedPieces.push(piece);
        
        const capturedIndex = this.capturedPieces.filter(p => 
            p.userData.color === piece.userData.color
        ).length;
        
        const offsetX = piece.userData.color === 'white' ? -4 : 4;
        
        this.animatePiece(piece, new THREE.Vector3(
            offsetX + (capturedIndex % 4) * 1.5,
            this.FLOOR_Y + this.BOARD_SURFACE_OFFSET + this.PIECE_BASE_HEIGHT,
            this.BOARD_SIZE/2 + 5 + Math.floor(capturedIndex / 4) * 1.5
        ));
    }

    handleClick(event) {
        if (event.button !== 0 || !this.camera) return;
        
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        
        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(
            [...this.chessSquares, ...this.gamePieces], 
            true
        );
        
        if (intersects.length > 0) {
            const clickedObj = intersects[0].object;
            
            const clickedPiece = this.gamePieces.find(p => 
                p === clickedObj || p.children.includes(clickedObj)
            );
            
            if (clickedPiece) {
                if (clickedPiece.userData.color === this.currentPlayer) {
                    this.selectedPiece = clickedPiece;
                    const moves = this.getPossibleMoves(this.selectedPiece);
                    this.highlightMoves(moves);
                } else if (this.selectedPiece) {
                    const targetSquare = this.chessSquares.find(s => 
                        s === clickedObj || s === clickedObj.parent
                    );
                    
                    if (targetSquare) {
                        const moves = this.getPossibleMoves(this.selectedPiece);
                        const move = moves.find(m => 
                            m.x === targetSquare.userData.x && 
                            m.y === targetSquare.userData.y
                        );
                        
                        if (move) {
                            this.movePiece(this.selectedPiece, move.x, move.y);
                        }
                    }
                }
            } else {
                const clickedSquare = this.chessSquares.find(s => 
                    s === clickedObj || s === clickedObj.parent
                );
                
                if (clickedSquare && this.selectedPiece) {
                    const moves = this.getPossibleMoves(this.selectedPiece);
                    const move = moves.find(m => 
                        m.x === clickedSquare.userData.x && 
                        m.y === clickedSquare.userData.y
                    );
                    
                    if (move) {
                        this.movePiece(this.selectedPiece, move.x, move.y);
                    }
                }
            }
        }
    }

    cleanup() {
        this.gamePieces.forEach(piece => this.scene.remove(piece));
        this.gamePieces = [];
        
        this.chessSquares.forEach(square => {
            if (square.parent) {
                square.parent.remove(square);
            }
        });
        this.chessSquares = [];
    }
}