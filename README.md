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
```

Qualidades: `low`, `medium`, `high`, `ultra`.

## Current Features

- Galáxia espiral procedural e starfield em lote.
- Nebulosas procedurais com FBM/domain warping.
- Estrelas procedurais com tipos RED, ORANGE, YELLOW, WHITE e BLUE.
- Solar Systems determinísticos com estrela, planetas e órbitas.
- Tipos Terran, Gas Giant, Lava World e Ice World.
- Iluminação planetária baseada na posição da estrela do sistema.
- Movimento orbital lento com profundidade frente/trás.
- LOD 0–3 e culling por área visível.
- Linhas orbitais opcionais com `?orbits=true`.
- Renderização pixel art por framebuffer interno `NEAREST`.
- Seed de 32 bits, parallax, resize responsivo e debug mode.

- Rotação axial procedural independente da órbita, com camadas de superfície/atmosfera em velocidades separadas.
- Layers PixelPlanets portadas em multipass para Terran, Gas, Lava, Ice e Star.

## Arquitetura

- `Engine` coordena tempo, câmera, cena e loop.
- `Universe` compõe galaxy, nebulae e Solar Systems.
- `SystemGenerator` cria sistemas a partir de seeds hierárquicas.
- `OrbitSystem` atualiza posições usando arrays existentes.
- `PlanetFactory` seleciona o shader/configuração pelo tipo.
- `Renderer` mantém os passes fullscreen, VBOs, scissor culling e upscale.
- `LODManager` decide ponto, esfera simples, shader intermediário ou shader completo.
- `ShaderLoader` resolve e cacheia includes GLSL.
- `PlanetGallery` isola Terran, Gas, Lava, Ice e Star para validação layer-by-layer.

## PixelPlanets

`PixelPlanets-Wallpaper-Reference/` continua sendo somente referência e não é alterada nem usada em runtime. As adaptações estão documentadas em `docs/PIXELPLANETS_PORT.md` e acompanhadas pela licença em `THIRD_PARTY_LICENSES/`.

## Next Milestone

Adicionar luas detalhadas, cinturões de asteroides, cometas, estrelas cadentes, áudio reativo e propriedades completas do Wallpaper Engine.
