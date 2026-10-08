# Procedural Galaxy Wallpaper

Wallpaper procedural para Wallpaper Engine usando apenas HTML5, CSS3, JavaScript ES Modules, WebGL2 e GLSL ES 3.00. A primeira versão implementa os milestones 1–5: pipeline WebGL2, resolução interna pixel art, seed determinística, starfield, galáxia espiral e câmera com parallax.

## Executar

O destino principal é o ambiente Web do Wallpaper Engine: selecione a pasta do projeto e abra `index.html`.

Para testar em um navegador comum, sirva a pasta por HTTP para que os módulos e shaders GLSL possam ser carregados:

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

## Arquitetura atual

- `Engine` coordena tempo, câmera, cena e render loop.
- `Renderer` renderiza partículas em framebuffer interno e faz upscale com textura `NEAREST`.
- `SeededRandom` e `hashSeed` formam a hierarquia determinística de seeds de 32 bits.
- `StarField` cria as estrelas distantes em um `Float32Array` intercalado.
- `SpiralGalaxy` cria núcleo, braços, halo e estrelas fora dos braços no mesmo formato de partículas.
- `ShaderLoader` resolve includes GLSL antes da compilação WebGL2.
- `MouseParallax` suaviza indiretamente o deslocamento por meio da `Camera`.

Cada camada de partículas usa uma draw call. Na visualização completa há aproximadamente três draw calls por frame: starfield, galáxia e upscale.

## Referência PixelPlanets

`PixelPlanets-Wallpaper-Reference/` é somente leitura e não participa do runtime. Nenhum shader Godot ou código derivado foi utilizado nesta primeira fase; o porte dos algoritmos de planetas será documentado em `docs/PIXELPLANETS_PORT.md` quando começar.

## Próxima etapa

O próximo milestone recomendado é a nebulosa procedural em GLSL, mantendo a mesma resolução interna e a mesma política de alocação. Depois disso, os utilitários comuns de ruído, esfera, dithering, paleta e iluminação poderão receber o porte dos shaders PixelPlanets.
