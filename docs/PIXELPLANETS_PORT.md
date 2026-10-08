# Porte do PixelPlanets

## Regra de referência

`PixelPlanets-Wallpaper-Reference/` é somente leitura. Nenhum arquivo Godot é carregado em runtime e a licença original não foi alterada.

## Biblioteca comum

| Conceito original | Novo arquivo | Status |
| --- | --- | --- |
| `rand` / `noise` | `shaders/common/noise.glsl` | hash sem estado, portado |
| `fbm` | `shaders/common/fbm.glsl` | máximo de 8 octaves, portado |
| `spherify` | `shaders/common/sphere.glsl` | normal e UV esférica, adaptado |
| `rotate` | `shaders/common/rotate.glsl` | GLSL ES 3.00, portado |
| `dither` | `shaders/common/dithering.glsl` | Bayer 4×4 estático, adaptado |
| paletas | `PaletteGenerator.js` / `palette.glsl` | famílias coerentes, adaptado |
| iluminação | `shaders/common/lighting.glsl` | diffuse, terminator e rim, adaptado |

O `ShaderLoader` resolve includes recursivos, elimina duplicatas dentro da compilação, usa cache e detecta ciclos.

## Star

Original: `Planets/Star/Star.gdshader`, `StarBlobs.gdshader` e `StarFlares.gdshader`.

Novo: `src/celestial/Star.js` e `shaders/star/star.frag`.

Alterações: as layers Godot foram compostas em uma passagem fullscreen com superfície procedural, blobs FBM, atividade, flares radiais, paleta por tipo estelar e dithering. Os tipos suportados são RED, ORANGE, YELLOW, WHITE e BLUE.

Status: portado/adaptado.

## Terran

Original: `Planets/Rivers/`, `Planets/LandMasses/` e `Planets/LandMasses/Clouds.gdshader`.

Novo: `shaders/planets/terran.frag` e `src/celestial/planets/TerranPlanet.js`.

Alterações: oceano, terreno, continentes, nuvens, iluminação dependente da estrela e atmosfera foram compostos em uma passagem. LOD reduz octaves e desativa nuvens em corpos pequenos.

Status: portado/adaptado.

## Gas Giant

Original: `Planets/GasPlanet/GasPlanet.gdshader`, `Planets/GasPlanetLayers/GasLayers.gdshader` e `Ring.gdshader`.

Novo: `shaders/planets/gas.frag`.

Alterações: bandas verticais recebem ruído/FBM, rotação independente, iluminação e dithering. Anéis são opcionais por seed e a máscara separa trecho traseiro e frontal no mesmo shader.

Status: portado em multipass.

## Lava World

Original: `Planets/LavaWorld/Rivers.gdshader` e composição `LavaWorld`.

Novo: `shaders/planets/lava.frag`.

Alterações: crosta, fissuras e regiões emissivas usam campos de ruído separados; a lava mantém brilho no lado escuro sem bloom externo.

Status: portado em multipass.

## Ice World

Original: `Planets/IceWorld/`.

Novo: `shaders/planets/ice.frag`.

Alterações: superfície fria, cobertura de gelo e fissuras usam FBM/threshold com paleta azul-ciano derivada da seed.

Status: portado em multipass.

## Animação e composição das camadas

As camadas de estrela e planetas são animadas em coordenadas esféricas 3D com `rotateSphereY()`. A superfície, nuvens, turbulência, fissuras e flares possuem velocidades separadas e determinísticas. A normal geométrica não é rotacionada para a iluminação, preservando diffuse, terminator e rim lighting estáveis enquanto o material se move. No Terran, a composição é oceano → terra → nuvens, com lighting/dithering em cada shader; no Gas Giant, bandas e turbulência usam rotação diferencial; no Lava, a fissura tem fluxo próprio. A abordagem 3D também elimina a costura de longitude que ocorria com deslocamento direto de UV.

## Matriz de layers portadas

| BODY | ORIGINAL LAYER | ORIGINAL SHADER | WEBGL SHADER | STATUS |
| --- | --- | --- | --- | --- |
| Terran | Water | `LandMasses/PlanetUnder.gdshader` | `planets/terran/water.frag` | PORTED |
| Terran | Land | `LandMasses/PlanetLandmass.gdshader` | `planets/terran/land.frag` | PORTED |
| Terran | Cloud | `LandMasses/Clouds.gdshader` | `planets/terran/clouds.frag` | PORTED |
| Gas | GasLayers | `GasPlanetLayers/GasLayers.gdshader` | `planets/gas/layers.frag` | PORTED |
| Gas | Ring | `GasPlanetLayers/Ring.gdshader` | `planets/gas/ring.frag` | PORTED |
| Lava | Land | `NoAtmosphere/NoAtmosphere.gdshader` | `planets/lava/land.frag` | PORTED |
| Lava | Craters | `NoAtmosphere/Craters.gdshader` | `planets/lava/craters.frag` | PORTED |
| Lava | LavaRivers | `LavaWorld/Rivers.gdshader` | `planets/lava/rivers.frag` | PORTED |
| Ice | Land | `LandMasses/PlanetUnder.gdshader` | `planets/ice/land.frag` | PORTED |
| Ice | Lakes | inline shader in `IceWorld.tscn` | `planets/ice/lakes.frag` | PORTED |
| Ice | Clouds | `LandMasses/Clouds.gdshader` | `planets/ice/clouds.frag` | PORTED |
| Star | Blobs | `Star/StarBlobs.gdshader` | `star/blobs.frag` | PORTED |
| Star | Surface | `Star/Star.gdshader` | `star/surface.frag` | PORTED |
| Star | Flares | `Star/StarFlares.gdshader` | `star/flares.frag` | PORTED |

## Dry Terran, Islands e No Atmosphere

Dry Terran usa `Planets/DryTerran/DryTerran.tscn` como referência: um único passe de terreno árido com spherify, FBM, posterização em cinco famílias e sem camada oceânica/nuvens. O port equivalente é `shaders/planets/dry-terran/land.frag`.

Islands reutiliza os três shaders de LandMasses (`Water → Land → Clouds`), mas eleva o `land_cutoff` para manter o oceano dominante e usa paleta oceânica/terrestre própria. No Atmosphere/Rocky usa os shaders portados de `Planets/NoAtmosphere/`: superfície e crateras, sem clouds/halo. Rocky é a variante dessaturada usada por luas rochosas.

## Asteroids

Original: `Planets/Asteroids/Asteroid.tscn`, `Asteroid.gd` e `Asteroids.gdshader`.

Novo: `src/celestial/Asteroid.js`, `src/systems/AsteroidBelt.js`, `shaders/asteroid/asteroid.frag`, `shaders/asteroid/belt.vert` e `shaders/asteroid/belt.frag`.

A forma usa ruído para deformar a silhueta circular, variação de superfície, crateras, luz, rotação e dithering/pixelização. O cinturão pré-aloca TypedArrays e separa asteroides atrás/à frente do sistema; cada lado é enviado em lote por point sprites. Gaps, clusters, jitter, inclinação e densidade são derivados do seed.

Os ports preservam os campos específicos de cada shader: wrapping por tamanho, `spherify`, `circleNoise`, FBM com octaves por layer, thresholds, light borders, alpha masks e dithering. O arquivo comum `shaders/common/pixelplanets.glsl` apenas centraliza implementações equivalentes de suporte; a composição e os uniforms permanecem separados por layer.

## Licença

As adaptações são acompanhadas pela cópia MIT em `THIRD_PARTY_LICENSES/PixelPlanets-LICENSE.txt`.
