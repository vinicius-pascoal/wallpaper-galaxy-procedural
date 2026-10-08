# Porte do PixelPlanets

## Estado

Nenhum shader de planeta foi portado na primeira execução. A pasta `PixelPlanets-Wallpaper-Reference/` permanece intacta e não é carregada pelo navegador.

## Plano de mapeamento Godot → GLSL ES 3.00

| Referência Godot | Destino WebGL2 | Observação |
| --- | --- | --- |
| `shader_type canvas_item` | `#version 300 es` | trocar entradas e saídas por `in`/`out` explícitos |
| `TIME` | `uniform float uTime` | fornecido pelo `Time` em segundos |
| `UV` | coordenada local calculada no vertex shader | adaptada à esfera e à pixelização |
| funções de ruído | `shaders/common/noise.glsl` | ainda não criado nesta fase |
| FBM | `shaders/common/fbm.glsl` | ainda não criado nesta fase |
| rotação e esfera | `shaders/common/sphere.glsl` | usar ray/sphere math em GLSL ES |
| paleta | `PaletteGenerator.js` + `shaders/common/palette.glsl` | a paleta da estrela atual é apenas um utilitário inicial |
| dithering | `shaders/common/dithering.glsl` | será aplicado após a superfície procedural |
| layers de cena Godot | passes ou draw calls WebGL2 | evitar dependência do Godot runtime |

## Processo para o primeiro planeta

O próximo porte de planeta deve começar por `Planets/Rivers/` e `Planets/LandMasses/`, isolando ruído, `spherify`, iluminação, rotação, continentes, oceanos, nuvens e dithering. Cada conversão deverá registrar aqui:

```text
Original: PixelPlanets-Wallpaper-Reference/...
Novo: shaders/planets/...
Mudanças: ...
Uniforms: ...
Observações: ...
```

O código derivado só deve ser acompanhado pela licença MIT original em `THIRD_PARTY_LICENSES/`; a licença dentro da referência não deve ser alterada.
