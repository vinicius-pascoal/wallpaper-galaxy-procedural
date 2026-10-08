# Procedural Galaxy Wallpaper

Wallpaper procedural para Wallpaper Engine usando HTML5, CSS3, JavaScript ES Modules, WebGL2 e GLSL ES 3.00.

## Executar

No Wallpaper Engine, selecione a pasta e abra `index.html`. Para testar em navegador comum:

```text
python -m http.server 8080
```

Abra `http://localhost:8080/index.html`.

Parâmetros úteis:

```text
index.html?seed=583721&quality=high&debug=true
index.html?orbits=true
index.html?view=stars
index.html?view=galaxy
index.html?planetGallery=true
index.html?planetGallery=true&planetLayer=1
index.html?planetGallery=true&referencePalette=false&referenceParams=false&animationDebugSpeed=10
index.html?specialGallery=true
index.html?blackHoleGallery=true&blackHoleLayer=disk
```

Qualidades: `low`, `medium`, `high`, `ultra`.

## Current Features

- Galáxia espiral procedural e starfield em lote.
- Nebulosas procedurais com FBM/domain warping.
- Estrelas procedurais com tipos RED, ORANGE, YELLOW, WHITE e BLUE.
- Solar Systems determinísticos com estrela, planetas e órbitas.
- Tipos Terran, Dry Terran, Islands, No Atmosphere/Rocky, Gas Giant, Lava World e Ice World.
- Luas rochosas/gélidas determinísticas e cinturões de asteroides em lote, com profundidade frente/trás.
- Iluminação planetária baseada na posição da estrela do sistema.
- Movimento orbital lento com profundidade frente/trás.
- LOD 0–3 e culling por área visível.
- Linhas orbitais opcionais com `?orbits=true`.
- Renderização pixel art por framebuffer interno `NEAREST`.
- Seed de 32 bits, parallax, resize responsivo e debug mode.

- Rotação axial procedural independente da órbita, com camadas de superfície/atmosfera em velocidades separadas.
- Layers PixelPlanets portadas em multipass para Terran, Dry Terran, Islands, No Atmosphere, Gas, Lava, Ice e Star.
- Black Holes procedurais com event horizon, disco de acreção animado e distorção local quantizada.
- Cometas orbitais com núcleo, coma, cauda de poeira e cauda iônica opcional.
- Shooting stars temporários, pulsars, sistemas binários e eventos cósmicos raros.
- `cosmicActivity` determinística controla a personalidade de eventos sem alterar a estrutura base.

## Arquitetura

- `Engine` coordena tempo, câmera, cena e loop.
- `Universe` compõe galaxy, nebulae e Solar Systems.
- `SystemGenerator` cria sistemas a partir de seeds hierárquicas.
- `OrbitSystem` atualiza posições usando arrays existentes, incluindo luas em hierarquia planeta → lua.
- `AsteroidBelt` usa TypedArrays pré-alocados, uma camada batched por lado da órbita e LOD implícito por ponto.
- `PlanetFactory` seleciona o shader/configuração pelo tipo.
- `Renderer` mantém os passes fullscreen, VBOs, scissor culling e upscale.
- `LODManager` decide ponto, esfera simples, shader intermediário ou shader completo.
- `ShaderLoader` resolve e cacheia includes GLSL.
- `PlanetGallery` isola Terran, Gas, Lava, Ice, Dry Terran, Islands, No Atmosphere, luas e asteroide para validação layer-by-layer.
- `CosmicEventSystem` agenda eventos pelo clock da Engine e mantém pool fixo para shooting stars.

## PixelPlanets

`PixelPlanets-Wallpaper-Reference/` continua sendo somente referência e não é alterada nem usada em runtime. As adaptações estão documentadas em `docs/PIXELPLANETS_PORT.md` e acompanhadas pela licença em `THIRD_PARTY_LICENSES/`.

## Limitações atuais

Luas, cinturões e objetos especiais usam o orçamento de corpos LOD do preset. Eventos não usam `setTimeout`; Black Hole, cometas e shooting stars são raros por seed e não há supernova destrutiva nesta etapa.
