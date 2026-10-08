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

Status: primeira versão funcional.

## Lava World

Original: `Planets/LavaWorld/Rivers.gdshader` e composição `LavaWorld`.

Novo: `shaders/planets/lava.frag`.

Alterações: crosta, fissuras e regiões emissivas usam campos de ruído separados; a lava mantém brilho no lado escuro sem bloom externo.

Status: primeira versão funcional.

## Ice World

Original: `Planets/IceWorld/`.

Novo: `shaders/planets/ice.frag`.

Alterações: superfície fria, cobertura de gelo e fissuras usam FBM/threshold com paleta azul-ciano derivada da seed.

Status: primeira versão funcional.

## Licença

As adaptações são acompanhadas pela cópia MIT em `THIRD_PARTY_LICENSES/PixelPlanets-LICENSE.txt`.
