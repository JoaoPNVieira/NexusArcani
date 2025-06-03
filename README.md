# NexusArcani





<!-- 
##################################################
### APONTAMENTOS IMPORTANTES SOBRE O PROJECTO: ###
##################################################
==================================================
[ FERRAMENTAS THREE.JS] :
==================================================
1. ) Lighting:
   - PointLightHelper, DirectionalLightHelper: Auxiliam na visualização de posições e direções das luzes durante o desenvolvimento.
   - CubeTextureLoader, PMREMGenerator: Ferramentas para criar skyboxes e ambientes realistas.
   - .castShadow = true: Configuração para ativar sombras em luzes direcionais, ajustando "shadow bias" e resolução.

2. ) Materiais e Texturas:
   - MeshPhysicalMaterial: Material físico para superfícies realistas (metalness, roughness, clear coat).
   - Mapas Normais/Altura/AO: Adicionam profundidade às superfícies sem aumentar a geometria.

3. ) Mesh Effects:
   - DecalGeometry: Projeta texturas em superfícies (ex.: arranhões, furos).
   - Geometrias básicas (SphereGeometry, CylinderGeometry, etc.): Para criar formas 3D simples.

4. ) Postprocessing:
   - EffectComposer: Gera efeitos de pós-processamento como bloom ou glitch.
   - Passes individuais (RenderPass, UnrealBloomPass): Adicionam efeitos específicos.
==================================================
[ BIBLIOTECAS EXTERNAS ]:
==================================================
1. ) Postprocessing Library (vanruesc):
   - Biblioteca otimizada para efeitos avançados como bloom, profundidade de campo e SSAO. 
   - Substitui passes individuais do EffectComposer.

2. ) HDR Environments (RGBE/HDRI):
   - Mapas HDRI carregados com RGBELoader para reflexos e iluminação realistas.

3. ) Rapier:
   - Motor físico para colisões e dinâmicas físicas, complementando o Three.js.
==================================================
[ SOURCES EXTERNAS ]:
==================================================
1. ) Texturas:
   - 3DTextures
   - AmbientCG
   - Polyhaven

2. ) Assets/Modelos 3D:
   - Sketchfab
   - TurboSquid
   - https://sketchfab.com/

3. ) Icon:
   - https://icon-icons.com/
-->
