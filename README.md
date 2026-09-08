# Fumiga

Fumiga é um roguelite de gerenciamento de colônia com estratégia indireta, permadeath da Rainha, construção de formigueiro e progressão genética. Esta branch contém a **Fase 5 — Superfície, feromônios e Coletora**.

## Estado atual

A fundação executável roda no navegador por meio de React, TypeScript, Vite e Babylon.js. Ela possui um canvas em tela cheia, uma cena subterrânea procedural, uma área de superfície com entrada e folhas, uma Câmara Central com a Rainha, HUD de recursos, matriz explícita de tiles gerenciada por `MapGenerator`, pan/zoom por toque e mouse, pausa total, pausa tática por long press, economia de Biomassa, fila de spawn, uma Operária com A* e uma Coletora orientada por feromônio.

A arquitetura de gameplay permanece separada da camada React em `client/src/game/`, seguindo os limites conceituais definidos no GDD e no TDD. A escolha por Babylon nesta primeira implementação adapta o projeto ao pipeline WebDev disponível nesta sessão; os sistemas futuros continuarão desacoplados para preservar a migração e a evolução mobile.

## Rodar localmente

```bash
pnpm install
pnpm dev
```

Verificações:

```bash
pnpm check
pnpm build
```

## Fase 5 entregue

A página principal exibe a cena subterrânea, a Rainha e seus ovos, a contagem inicial de Biomassa e Geleia Real, o estado do núcleo, o botão de pausa e uma contagem de células abertas. O clique em um bloco sólido consulta os metadados do tile, altera a matriz para `Dug`, reduz visualmente o bloco e atualiza o HUD. Arrastar desloca a câmera, roda do mouse e pinch alteram o zoom, e segurar o toque abre uma pausa em 10% com ações radiais de cavar, construir ou cancelar.

Os arquivos `PLAN.md`, `STRUCTURE.md`, `MEMORY.md` e `ASSETS.md` registram o plano, a arquitetura, as decisões técnicas e o manifesto de arte para permitir retomada segura nas próximas fases.

## Próxima etapa

`SurfaceManager` cria folhas verdes, entrada do formigueiro e respawn de recursos. O menu radial é contextual: ao segurar sobre a superfície, a opção lateral cria um feromônio de coleta. `PheromoneSystem` representa a zona com raio e TTL. `CollectorAnt` encontra a folha dentro da zona, extrai Biomassa por 1 segundo e retorna à entrada para depositar a carga.

## Próxima etapa

A Fase 6 implementará inimigos, Soldado, feromônio de ataque, dano, HP, armadura, drop e Game Over.
