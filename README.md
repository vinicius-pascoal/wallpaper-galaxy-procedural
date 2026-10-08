# Procedural Galaxy Wallpaper

Wallpaper procedural para Wallpaper Engine usando apenas HTML5, CSS3, JavaScript ES Modules, WebGL2 e GLSL ES 3.00.

## Executar

O destino principal é o ambiente Web do Wallpaper Engine: selecione a pasta do projeto e abra `index.html`.

Para testar em um navegador comum, sirva a pasta por HTTP:

```text
python -m http.server 8080
```

Depois abra `http://localhost:8080/index.html`.

Parâmetros úteis:

```text
index.html?seed=583721&quality=high&debug=true
index.html?view=stars
index.html?view=galaxy
```

Qualidades disponíveis: `low`, `medium`, `high` e `ultra`. A seed padrão está em `main.js`:

```js
const DEFAULT_SEED = 583721;
```

## Current Features

- Procedural spiral galaxy.
- Procedural starfield com twinkle determinístico.
- Nebulosas procedurais com FBM e domain warping.
- Geração por seed usando derivações de 32 bits.
- Renderização pixel art por framebuffer interno com filtro nearest-neighbor.
- Mouse parallax e cinematic drift lento.
- Planeta Terran procedural com oceano, continentes, nuvens, atmosfera, iluminação e dithering.

## Arquitetura atual

- `Engine` coordena tempo, câmera, cena e render loop.
- `Renderer` renderiza nebulosas, partículas e o Terran em framebuffer interno e faz upscale com textura `NEAREST`.
- `SeededRandom` e `hashSeed` formam a hierarquia determinística de seeds de 32 bits.
- `StarField` cria as estrelas distantes em um `Float32Array` intercalado.
- `SpiralGalaxy` cria núcleo, braços, halo e estrelas fora dos braços no mesmo formato de partículas.
- `Nebula` agrupa até quatro configurações em uma passagem fullscreen.
- `TerranPlanet` mantém dados/configuração separados do shader de planeta.
- `ShaderLoader` resolve includes GLSL antes da compilação WebGL2.
- `MouseParallax` suaviza indiretamente o deslocamento por meio da `Camera`.

Na visualização completa há aproximadamente cinco draw calls por frame: nebulosa, starfield, galáxia, Terran e upscale.

## Referência PixelPlanets

`PixelPlanets-Wallpaper-Reference/` é somente leitura e não participa do runtime. Os utilitários comuns foram adaptados conceitualmente para GLSL ES 3.00; o mapeamento está em `docs/PIXELPLANETS_PORT.md`.

## Next Milestone

O próximo milestone recomendado é implementar:

- estrela procedural;
- geração de `SolarSystem`;
- sistema de órbitas;
- Gas Giant;
- Lava World;
- Ice World.
