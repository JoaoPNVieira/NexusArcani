# NexusArcani

> Uma experiência 3D modular desenvolvida com **Three.js**, que combina ambientes arquitetónicos, iluminação dinâmica e interações jogáveis.

---

## 🌐 Demonstração Online
[Jogar NexusArcani](https://joaopnvieira.github.io/NexusArcani/)

---

## 🎮 Funcionalidades

### 🏰 Ambientes
- **Sala Nexus**: Espaço arquitetónico modular com nevoeiro, luz dinâmica e uma estátua de feiticeiro animada.
- **Jogo de Xadrez**: Tabuleiro 3D com peças para exploração (seleção com o rato, movimentos válidos destacados e sistema de captura estão semi implementados - Bug).

### 🎥 Sistema de Câmara
- Perspetiva em primeira pessoa com hierarquia de `yaw/pitch`.
- Suporte para agachar, correr e saltar.

### 🧠 Mecânicas de Jogo
- Clique do rato para selecionar peças de xadrez.
- Destaque de movimentos válidos.
- Movimento animado e lógica de captura.

### 💡 Iluminação e Efeitos
- Luzes spot, ambiente e direcionais com sombras.
- **NexusOrb** com brilho emissivo pulsante.
- Portais animados com distorção UV.
- Janela cloroboia com emissividade e iluminação interna.

### 🧱 Arquitetura Modular
- Funções reutilizáveis para criação de:
  - **Portais**
  - **Salas**
  - **Rodapés (Skirts)**
  - **Colunas**
  - **Arcos**

---

## 🛠️ Tecnologias

### 🎨 Materiais e Texturas
- Uso extensivo de `MeshStandardMaterial`.
- Mapeamento UV paramétrico baseado nas dimensões dos objetos.
- Sistema de fallback automático para texturas em falta.
- Tipos de textura: `color`, `normal`, `roughness`, `displacement`, `metalness`, `opacity`, `aoMap`.

### 🔁 Animação
- Animações baseadas no tempo para:
  - **NexusOrb** e anéis.
  - Scroll UV em portais.
  - Movimento suave de peças de xadrez
  - Halo de luz e emissividade variável.

### 🔁 Sources

**Textures**  
- [3dtextures.me](https://3dtextures.me/)  
  Free, high-quality seamless PBR textures for 3D projects (CC0 license).

**3D Models**  
- [PBR Stylized Statue Mage Wizard by Ignas (Sketchfab)](https://sketchfab.com/3d-models/pbr-stylized-statue-mage-wizard-f0293fab679e44d1bfa38798e06db307)  
  - Ignas: Wizard Statue  
  - Tror: Queen, King, Knight, Pawn, Bishop chess pieces  
  - Gnossiennes: Rook chess piece  

**Reference Book**  
- [Learning Three.js: The JavaScript 3D Library for WebGL (Second Edition) (PDF)](https://aitskadapa.ac.in/e-books/CSE/JAVA/Learning%20Three.js_%20The%20JavaScript%203D%20Library%20for%20WebGL%20-%20Second%20Edition%20(%20PDFDrive%20).pdf)
---

## 📁 Estrutura do Projeto

```bash
/modules
  /main
    camera.js         # Sistema de câmara em primeira pessoa
    movement.js       # Movimento com agachar, andar e correr
    scene.js          # Setup da cena e renderer
    userInput.js      # Controlo de rato e teclado
  /nexusRoom
    environment.js    # Criação do espaço, materiais e portais para a sala principal (Nexus Room)
    nexusOrb.js       # Orb emissivo e as animações aplicáveis à mesma
    animation.js      # Loop de animação e lógica para a nexusRoom
    lighting.js       # Luzes globais com fog
  /chessGame
    environment.js    # Sala de jogo de xadrez
    chessLogic.js     # Lógica de jogo de xadrez
script.js             # Lógica de troca de ambientes
modularIndex.js       # Agregador modular de imports
