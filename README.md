# Fumiga

Fumiga é um roguelite de gerenciamento de colônia com estratégia indireta, permadeath da Rainha, construção de formigueiro e progressão genética. Esta branch contém a **Fase 4 — Pathfinding e primeira Operária**.

## Estado atual

A fundação executável roda no navegador por meio de React, TypeScript, Vite e Babylon.js. Ela possui um canvas em tela cheia, uma cena subterrânea procedural, uma Câmara Central com a Rainha, HUD de recursos, matriz explícita de tiles gerenciada por `MapGenerator`, pan/zoom por toque e mouse, pausa total, pausa tática por long press, economia de Biomassa, fila de spawn e uma Operária com A*.

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

## Fase 4 entregue

A página principal exibe a cena subterrânea, a Rainha e seus ovos, a contagem inicial de Biomassa e Geleia Real, o estado do núcleo, o botão de pausa e uma contagem de células abertas. O clique em um bloco sólido consulta os metadados do tile, altera a matriz para `Dug`, reduz visualmente o bloco e atualiza o HUD. Arrastar desloca a câmera, roda do mouse e pinch alteram o zoom, e segurar o toque abre uma pausa em 10% com ações radiais de cavar, construir ou cancelar.

Os arquivos `PLAN.md`, `STRUCTURE.md`, `MEMORY.md` e `ASSETS.md` registram o plano, a arquitetura, as decisões técnicas e o manifesto de arte para permitir retomada segura nas próximas fases.

## Próxima etapa

`AStarGrid` usa custo de movimento unitário e heurística Manhattan, e só considera `Dug` e `Room` caminháveis. `EconomyManager` começa com 100 Biomassa e cobra 10 por Operária. A Rainha mantém uma fila e um cooldown de nascimento. A Operária sai da Câmara Central, segue a rota até uma célula adjacente, aguarda o tempo de trabalho e escava o alvo sem atravessar paredes. O teste automatizado verifica desvio de obstáculos, destino isolado e saldo não negativo.

## Próxima etapa

A Fase 5 implementará a superfície, o `PheromoneSystem` e a primeira Coletora.
