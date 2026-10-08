# Porte do PixelPlanets

## Estado

Os algoritmos comuns e o primeiro Terran foram adaptados. A pasta `PixelPlanets-Wallpaper-Reference/` permanece intacta e não é carregada pelo navegador.

## Plano de mapeamento Godot → GLSL ES 3.00

| Referência Godot | Destino WebGL2 | Observação |
| --- | --- | --- |
| `shader_type canvas_item` | `#version 300 es` | trocar entradas e saídas por `in`/`out` explícitos |
| `TIME` | `uniform float uTime` | fornecido pelo `Time` em segundos |
| `UV` | coordenada local calculada no vertex shader | adaptada à esfera e à pixelização |
| funções de ruído | `shaders/common/noise.glsl` | hash sem estado mutável |
| FBM | `shaders/common/fbm.glsl` | máximo de oito octaves, configurável |
| rotação e esfera | `shaders/common/sphere.glsl` e `rotate.glsl` | normal esférica e longitude/latitude |
| paleta | `PaletteGenerator.js` + `shaders/common/palette.glsl` | famílias de hue coerentes |
| dithering | `shaders/common/dithering.glsl` | Bayer 4x4 estático |
| layers de cena Godot | passes ou composição WebGL2 | sem dependência do Godot runtime |

## Funções portadas/adaptadas

### noise / FBM

Original: `PixelPlanets-Wallpaper-Reference/Planets/Rivers/LandRivers.gdshader` e `Planets/LandMasses/PlanetLandmass.gdshader`.

Novo: `shaders/common/noise.glsl` e `shaders/common/fbm.glsl`.

Alterações: o `rand` baseado em `sin(dot())` foi substituído por hashes determinísticos sem estado; o FBM usa no máximo oito octaves e recebe o número de octaves como parâmetro.

Status: portado e usado por nebulosa e Terran.

### spherify / sphere / rotation

Original: funções `spherify` e `rotate` nos shaders `Rivers` e `LandMasses`.

Novo: `shaders/common/sphere.glsl` e `shaders/common/rotate.glsl`.

Alterações: a projeção agora fornece uma normal esférica e UV longitude/latitude para que terreno e nuvens possam girar de forma independente.

Status: portado e usado em `shaders/planets/terran.frag`.

### dithering / lighting / palette

Original: dithering de terminador, camadas de cores e bordas de luz em `Rivers`, `LandMasses` e `Clouds`.

Novo: `shaders/common/dithering.glsl`, `shaders/common/lighting.glsl`, `shaders/common/palette.glsl` e `src/procedural/PaletteGenerator.js`.

Alterações: foi usado Bayer 4x4 estático para não criar cintilação temporal. As paletas são geradas por família de hue, saturação e valor, em vez de canais RGB independentes.

Status: portado/adaptado e usado pelo Terran.

### Terran composto

Original: composição de layers `Rivers`, `LandMasses` e `Clouds`.

Novo: `shaders/planets/terran.frag`.

Alterações: oceano, terreno, nuvens, iluminação, atmosfera e dithering foram compostos em uma única passagem fullscreen para manter as draw calls controladas. O planeta é recortado no shader e renderizado diretamente no framebuffer interno.

Status: primeiro Terran funcional.

## Include system

`src/core/ShaderLoader.js` resolve includes relativos, mantém cache de source, elimina includes duplicados dentro de uma compilação e reporta ciclos com a cadeia de arquivos envolvida.

O código derivado/adaptado é acompanhado pela cópia da licença MIT em `THIRD_PARTY_LICENSES/PixelPlanets-LICENSE.txt`; a licença dentro da referência não foi alterada.
