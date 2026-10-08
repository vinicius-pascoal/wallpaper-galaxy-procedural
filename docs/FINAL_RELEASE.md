# Final release checklist

## Runtime

- `index.html`, `main.js`, `src/` e `shaders/` sao suficientes para executar o wallpaper.
- `PixelPlanets-Wallpaper-Reference/` nao e carregada em runtime.
- `project.json` declara o wallpaper Web e as propriedades do Wallpaper Engine.
- `THIRD_PARTY_LICENSES/PixelPlanets-LICENSE.txt` acompanha os conceitos portados.

## Audio

`WallpaperAudio` recebe o spectrum opcional, detecta a quantidade de bins, cria
bass, lowMid, mid, highMid e treble, aplica threshold/clamp e suavizacao
attack/release. Bass atua levemente em estrelas, flares, nucleo galactico e
disco de acrecao; low-mid/mid atuam em nebulosa e cometas; high-mid/treble
atuam em brilho de estrelas e pulsars. Orbitas, luas e rotacao axial nao usam
audio. `audioReactive=false` zera a camada visual sem parar a animacao normal.

## Performance e lifecycle

O frame limiter usa delta temporal para 30/45/60 FPS ou ilimitado. `AUTO`
usa janela de medicao com hysteresis: downgrade apos cerca de 4 s abaixo de
50 FPS e recovery apos cerca de 12 s acima de 58 FPS. Visibility pause evita
updates, rendering e scheduler de eventos quando a janela nao esta visivel.
Regeneracoes liberam layers/VAOs/VBOs antigos; context loss e restore sao
tratados pelo `Engine`.

## Testes automatizados executados

- `node --check` em todos os JavaScript do projeto, excluindo a referencia.
- `git diff --check`.
- Validacao de todos os presets, qualidades, seed, FPS, audio bands e
  regeneracao deterministica de `Universe`.

## Limites conhecidos

Nao foi possivel executar aqui um compositor WebGL2 real nem o Wallpaper Engine
propriamente dito. A validacao visual final, medicao de FPS por resolucao e
teste de perda de contexto devem ser repetidos no hardware alvo. O callback de
audio depende da API presente na versao instalada do Wallpaper Engine; sem ele,
o fallback silencioso e intencional.
