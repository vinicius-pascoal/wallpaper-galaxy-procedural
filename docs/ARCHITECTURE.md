# Arquitetura

## Pipeline de renderização

1. O canvas usa o tamanho físico da janela, limitado a device pixel ratio 2.
2. O `Renderer` calcula uma resolução interna pela altura do preset: 360, 540, 720 ou 1080 pixels.
3. O framebuffer interno recebe nebulosas, starfield, galáxia e o Terran em ordem de profundidade.
4. A textura interna usa `TEXTURE_MIN_FILTER` e `TEXTURE_MAG_FILTER` em `NEAREST`.
5. Um quad fullscreen copia a textura para o canvas sem blur.

O aspecto é calculado a cada resize; a cena não assume 16:9.

## Passes atuais

| Ordem | Pass | Modo |
| --- | --- | --- |
| 1 | Nebula fullscreen | alpha sobre fundo escuro |
| 2 | Starfield | pontos aditivos |
| 3 | Spiral galaxy | pontos aditivos |
| 4 | Terran hero | alpha sobre a cena |
| 5 | Pixel upscale | textura `NEAREST` |

Nebulosas usam uma única chamada com uniform arrays para até quatro instâncias. O Terran usa o mesmo quad fullscreen, mas calcula a esfera, a superfície e o recorte dentro do fragment shader.

## Dados de partículas

Cada partícula ocupa sete floats no VBO:

```text
x, y, size, brightness, temperature, twinkleSpeed, depth
```

O `Float32Array` é criado apenas durante a geração da cena. O render loop reutiliza os VBOs e não cria objetos por estrela ou por frame.

## Seed

`hashSeed(parentSeed, identifier)` combina um seed de 32 bits com um identificador numérico ou textual. A `Universe` deriva separadamente as seeds de `galaxy`, `background-stars`, `nebulae` e `hero-terran`. Assim, alterar uma parte da geração não exige usar `seed % 1000` e não muda a identidade de forma implícita.

## Animação

A estrutura da galáxia é estática depois da geração. O vertex shader aplica:

- twinkle individual usando fase e velocidade armazenadas;
- rotação lenta dependente da profundidade para as estrelas da galáxia;
- deslocamento de câmera proporcional à profundidade;
- drift cinematográfico de baixa amplitude.

Nebulosas evoluem por UV drift e domain warping em baixa velocidade. O Terran gira a coordenada de longitude do terreno e usa outra velocidade para nuvens.

`Time` limita o delta time a 50 ms para evitar saltos após pausas ou perda de foco.

## Responsabilidades

| Módulo | Responsabilidade |
| --- | --- |
| `Engine` | ciclo de vida, teclado de debug e loop principal |
| `Renderer` | WebGL2, framebuffer, passes, shaders, VBOs e upscale |
| `Scene` | ordem de renderização e modos de visualização |
| `Universe` | composição determinística da geração |
| `Galaxy` / `SpiralGalaxy` | parâmetros e distribuição espiral |
| `StarField` | estrelas distantes em lote |
| `Nebula` | parâmetros compactos de nebulosas procedurais |
| `TerranPlanet` | configuração e paleta do hero planet |
| `Camera` | parallax e drift com smoothing |
| `ShaderLoader` | includes GLSL relativos, cache, duplicatas e ciclos |

Sistemas solares, outros planetas, áudio e propriedades completas do Wallpaper Engine ainda não são executados. A estrutura pode recebê-los sem colocar sua lógica no `main.js`.
