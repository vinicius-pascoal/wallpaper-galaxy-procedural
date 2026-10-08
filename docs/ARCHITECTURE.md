# Arquitetura

## Hierarquia

```text
Universe
├── Galaxy
│   ├── StarField
│   ├── Nebula
│   └── SolarSystem[]
│       ├── Star
│       └── Planet[]
└── LODManager
```

`TerranPlanet` continua podendo existir como hero object, mas agora o Terran principal pertence ao primeiro `SolarSystem` gerado. A API `Universe.terran` permanece como alias de compatibilidade.

## Pipeline de renderização

1. Nebula fullscreen no framebuffer interno.
2. Starfield e galáxia como pontos em VBOs.
3. Linhas orbitais opcionais.
4. Corpos de sistemas ordenados por profundidade orbital.
5. Cada corpo usa ponto simples, shader intermediário ou shader completo conforme LOD.
6. Quad fullscreen faz upscale com textura `NEAREST`.

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

## Performance

- Geração e paletas acontecem somente na criação do `Universe`.
- Órbitas atualizam TypedArrays existentes.
- VBOs não são recriados por frame.
- Culling e scissor reduzem custo de fragmentos.
- Não há `Math.random()` nem dependências externas.
