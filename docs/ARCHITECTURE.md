# Arquitetura

## Pipeline de renderização

1. O canvas usa o tamanho físico da janela, limitado a device pixel ratio 2.
2. O `Renderer` calcula uma resolução interna pela altura do preset: 360, 540, 720 ou 1080 pixels.
3. O framebuffer interno recebe o starfield e a galáxia como pontos aditivos.
4. A textura interna usa `TEXTURE_MIN_FILTER` e `TEXTURE_MAG_FILTER` em `NEAREST`.
5. Um quad fullscreen copia a textura para o canvas sem blur.

O aspecto é calculado a cada resize; a cena não assume 16:9.

## Dados de partículas

Cada partícula ocupa sete floats no VBO:

```text
x, y, size, brightness, temperature, twinkleSpeed, depth
```

O `Float32Array` é criado apenas durante a geração da cena. O render loop reutiliza os VBOs e não cria objetos por estrela ou por frame.

## Seed

`hashSeed(parentSeed, identifier)` combina um seed de 32 bits com um identificador numérico ou textual. A `Universe` deriva separadamente as seeds de `galaxy` e `background-stars`. Assim, alterar uma parte da geração não exige usar `seed % 1000` e não muda a identidade de forma implícita.

## Animação

A estrutura da galáxia é estática depois da geração. O vertex shader aplica:

- twinkle individual usando fase e velocidade armazenadas;
- rotação lenta dependente da profundidade para as estrelas da galáxia;
- deslocamento de câmera proporcional à profundidade;
- drift cinematográfico de baixa amplitude.

`Time` limita o delta time a 50 ms para evitar saltos após pausas ou perda de foco.

## Responsabilidades

| Módulo | Responsabilidade |
| --- | --- |
| `Engine` | ciclo de vida e loop principal |
| `Renderer` | WebGL2, framebuffer, shaders, VBOs e upscale |
| `Scene` | ordem de renderização e modos de visualização |
| `Universe` | composição determinística da geração |
| `Galaxy` / `SpiralGalaxy` | parâmetros e distribuição espiral |
| `StarField` | estrelas distantes em lote |
| `Camera` | parallax e drift com smoothing |
| `ShaderLoader` | includes GLSL relativos |

Planetas, nebulosas, sistemas solares, áudio e propriedades do Wallpaper Engine ainda não são executados. A estrutura pode recebê-los sem colocar sua lógica no `main.js`.
