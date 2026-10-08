# Arquitetura

## Hierarquia

```text
Universe
├── Galaxy
│   ├── StarField
│   ├── Nebula
│   └── SolarSystem[]
│       ├── Star
│       ├── Planet[]
│       ├── Moon[] (OrbitSystem)
│       └── AsteroidBelt (front/back batches)
└── LODManager
```

`TerranPlanet` continua podendo existir como hero object, mas agora o Terran principal pertence ao primeiro `SolarSystem` gerado. A API `Universe.terran` permanece como alias de compatibilidade.

## Pipeline de renderização

1. Nebula fullscreen no framebuffer interno.
2. Starfield e galáxia como pontos em VBOs.
3. Linhas orbitais opcionais.
4. Cinturões traseiros, corpos de sistemas ordenados por profundidade orbital, estrela, corpos dianteiros e cinturões frontais.
5. Cada corpo usa ponto simples, shader intermediário ou shader completo conforme LOD.
6. Quad fullscreen faz upscale com textura `NEAREST`.

Em LOD 1/2/3, os corpos usam um pass por layer, sem limpar o framebuffer entre passes; LOD 0 continua sendo o ponto simples. A ordem é Terran `Water → Land → Cloud`, Gas `GasLayers → Ring`, Lava `Land → Craters → LavaRivers`, Ice `Land → Lakes → Clouds` e Star `Blobs → Star → StarFlares`. O scissor usa a extensão da composição: 3× para anéis de Gas e 2× para Blobs/Flares de Star.

Os passes de corpos usam scissor culling baseado no raio em screen space, evitando rasterizar a tela inteira para objetos pequenos.

## Seeds

```text
Universe seed
└── solar-systems
    └── system-N
        ├── star
        ├── planet-0
        │   └── type / palette / orbit
        └── planet-N
```

Cada identificador é passado a `hashSeed`, portanto adicionar ou remover um sistema não depende do estado sequencial do PRNG dos sistemas anteriores.

## SolarSystem e OrbitSystem

`SolarSystem` é apenas modelo e simulação. Ele contém `Star`, `Planet[]`, posição, profundidade e `OrbitSystem`. O `OrbitSystem` pré-calcula a geometria das linhas orbitais e atualiza apenas propriedades/TypedArrays existentes no frame:

```js
angle = initialAngle + elapsed * speed * direction;
x = centerX + cos(angle) * semiMajorAxis;
y = centerY + sin(angle) * semiMinorAxis * inclination;
```

O sinal de `sin(angle)` fornece o depth sorting simplificado: planetas atrás são desenhados antes da estrela, planetas à frente depois.

## PlanetFactory

`PlanetFactory` seleciona entre `TERRAN`, `GAS`, `LAVA` e `ICE`, criando dados determinísticos e paletas específicas. Os shaders compartilham `uTime`, `uSeed`, `uCenter`, `uRadius`, `uLightDirection`, `uLod` e a grade interna quando esses uniforms são relevantes.

## Animação das superfícies

Movimento orbital e rotação axial são estados distintos. O `OrbitSystem` altera a posição do corpo; os shaders recebem `uInitialRotation` e velocidades axiais determinísticas para animar o material na esfera. As coordenadas procedurais usam `rotateSphereY()` sobre a normal esférica 3D, em vez de deslocar uma UV 2D. Isso evita costura visível na longitude e deixa o campo acompanhar a curvatura.

Cada camada pode ter seu próprio relógio: no Terran, terreno/oceano e nuvens usam rotações e seeds separadas; no Gas Giant, bandas e turbulência usam velocidades diferenciais; no Lava, crosta e fissuras possuem fluxo próprio; na estrela, superfície, granulação e flares são independentes. A `normal` original continua sendo usada para diffuse, terminator e rim lighting, portanto a direção da luz não gira junto com o material.

`Time.shaderElapsed` limita o tempo enviado aos shaders a uma janela cíclica longa, evitando perda de precisão de ponto flutuante em wallpapers que ficam abertos por muitos dias. A simulação continua usando `elapsed` completo para órbitas e estatísticas.

## Galeria de debug

`?planetGallery=true` substitui a composição normal por cinco corpos grandes, em LOD 3: Terran, Gas, Lava, Ice e Star. `planetLayer=composite` mostra a composição; `planetLayer=0`, `1` e `2` mostram o índice correspondente de cada corpo, e também são aceitos nomes como `water`, `land`, `clouds`, `ring`, `craters`, `lakes`, `blobs`, `surface` e `flares`. A galeria usa por padrão os parâmetros e paletas da referência; `referencePalette=false` e `referenceParams=false` reativam os valores procedurais. `animationDebugSpeed=10` acelera apenas o tempo dos layers.

## Luas e cinturões

`SolarSystem` contém `Moon[]` além de `Planet[]`. Cada lua recebe `hashSeed(planetSeed, "moon-N")`, orbita o planeta pai no mesmo `OrbitSystem`, recebe luz da estrela e não cria linhas orbitais por padrão. A ordenação usa a profundidade orbital combinada para evitar que luas atrás de planetas apareçam na frente.

`AsteroidBelt` pré-aloca TypedArrays e buffers WebGL. O update separa asteroides em batches back/front, mantendo gaps, clusters, jitter, inclinação e densidade determinísticos. Cada batch gera uma draw call de point sprites; o asteroide individual usa o shader fullscreen com silhueta irregular e crateras.

`PlanetFactory` agora cobre `TERRAN`, `DRY_TERRAN`, `ISLANDS`, `NO_ATMOSPHERE`, `ROCKY`, `GAS`, `LAVA` e `ICE`. Black hole permanece reservado e não é implementado nesta etapa.

## Objetos especiais

`Universe` cria no máximo um `BlackHole` por seed: aproximadamente 25% das seeds recebem um objeto central e aproximadamente 5% recebem um objeto de foreground. O renderer usa dois passes: `Event Horizon` opaco e disco de acreção com noise, FBM, movimento diferencial, máscara radial, dithering e distorção quantizada apenas na região local do disco.

`Comet` pertence a um `SolarSystem` e usa órbita excêntrica. A cauda é calculada por `normalize(cometPosition - starPosition)`, garantindo orientação para longe da estrela. O shader combina núcleo irregular, coma, cauda de poeira quente e cauda iônica opcional.

`Pulsar` é uma variante rara de estrela com núcleo, pulso de amplitude limitada e dois beams opostos de rotação lenta. `BinaryStarPair` atualiza duas estrelas ao redor do centro comum; planetas continuam orbitando o centro do sistema e usam a estrela primária como fonte dominante de luz.

`CosmicEventSystem` usa um stream derivado da seed, clock da Engine, cooldown global e pool fixo de até três shooting stars. Os eventos atuais são shooting star, stellar flare, meteor shower e nebula pulse. Eventos não alteram seeds ou a estrutura de estrelas/planetas/luas/cinturões.

## Ordem de renderização especial

Nebula/starfield/galáxia → Black Hole local → cinturões traseiros → corpos e estrelas de sistemas → cinturões dianteiros → cometas → shooting stars. O pulsar e os binários participam da ordem normal de estrelas, e a câmera/parallax é aplicada por corpo.

O debug `?specialGallery=true` (ou `?blackHoleGallery=true`) mostra Black Hole, cometa, pulsar, binário e shooting star. `blackHoleLayer=event-horizon`, `disk` ou `composite` isolam as camadas principais.

## LOD

`LODManager` classifica pelo raio em pixels internos:

| Raio na tela | LOD | Renderização |
| --- | --- | --- |
| `< 2 px` | 0 | ponto simples |
| `2–8 px` | 1 | esfera/paleta simplificada |
| `8–24 px` | 2 | shader intermediário |
| `> 24 px` | 3 | shader completo |

Há orçamento de planetas LOD 3 por preset: LOW 1, MEDIUM 2, HIGH 4, ULTRA 6. O shader recebe menos octaves e desativa nuvens/anéis complexos nos níveis inferiores.

## Qualidade e draw calls

Os presets controlam resolução interna, estrelas, nebulosas, quantidade de sistemas e orçamento de full-detail planets. Sem linhas orbitais e com todos os corpos visíveis, o número aproximado é:

```text
1 nebula + 1 starfield + 1 galaxy + 1 upscale
+ 1 pass por estrela/planeta visível
```

`?orbits=true` adiciona uma draw call por sistema visível. Corpos LOD 0 usam uma draw call de ponto, sem shader planetário.

## Ciclo final de produto

`main.js` normaliza query parameters e registra o listener opcional do Wallpaper Engine. `WallpaperState` mantem uma configuracao validada e separa propriedades LIVE de propriedades que exigem regeneracao. `PresetManager` aplica ranges uma unica vez; o seed continua sendo a raiz deterministica da geracao.

`WallpaperAudio` e a unica camada que recebe spectrum. Ela aceita Array ou TypedArray sem fixar o numero de bins, calcula cinco bandas, aplica threshold, clamp e smoothing attack/release e publica apenas valores normalizados. O `Scene` passa esses valores para o `Renderer`; orbitas, rotacao axial e estrutura procedural nao sao controladas pelo audio.

O `Engine` usa delta temporal e um frame limiter de 30/45/60 FPS ou ilimitado. `PerformanceManager` mede janela de FPS/frame time e, em `AUTO`, reduz qualidade apos aproximadamente quatro segundos abaixo de 50 FPS e recupera uma etapa apos aproximadamente doze segundos acima de 58 FPS. A qualidade muda pela ordem dos presets, preservando a composicao antes de remover funcoes fundamentais.

Quando a janela fica invisivel, o loop, audio smoothing e eventos sao pausados; ao voltar, o relogio e reiniciado para impedir delta gigante e eventos atrasados. Recursos de cena sao liberados ao regenerar seed/qualidade, incluindo VAOs, VBOs, framebuffers, texturas e programas. Eventos de contexto WebGL sao interceptados e os shaders/recursos sao reconstruidos quando o contexto retorna.

### Ordem efetiva dos passes

Nebula -> StarField -> Spiral Galaxy -> Black Hole -> belts traseiros -> corpos e estrelas dos sistemas -> belts dianteiros -> cometas -> shooting stars -> upscale pixel-art.

## Performance

- Geração e paletas acontecem somente na criação do `Universe`.
- Órbitas atualizam TypedArrays existentes.
- VBOs não são recriados por frame.
- Culling e scissor reduzem custo de fragmentos.
- Não há `Math.random()` nem dependências externas.
