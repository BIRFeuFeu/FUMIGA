# Fumiga

Fumiga é um roguelite de gerenciamento de colônia com estratégia indireta, permadeath da Rainha, construção de formigueiro e progressão genética. Esta branch contém a **Fase 2 — Subterrâneo e matriz de mapa**.

## Estado atual

A fundação executável roda no navegador por meio de React, TypeScript, Vite e Babylon.js. Ela possui um canvas em tela cheia, uma cena subterrânea procedural, uma Câmara Central com a Rainha, HUD de recursos, input de escavação, pausa da cena, ciclo de vida seguro do Engine e uma matriz explícita de tiles gerenciada por `MapGenerator`.

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

## Fase 2 entregue

A página principal exibe a cena subterrânea, a Rainha e seus ovos, a contagem inicial de Biomassa e Geleia Real, o estado do núcleo, o botão de pausa e uma contagem de células abertas. O clique em um bloco sólido consulta os metadados do tile, altera a matriz para `Dug`, reduz visualmente o bloco e atualiza o HUD. A matriz também já reserva os tipos `Room` e `Indestructible` para as próximas fases.

Os arquivos `PLAN.md`, `STRUCTURE.md`, `MEMORY.md` e `ASSETS.md` registram o plano, a arquitetura, as decisões técnicas e o manifesto de arte para permitir retomada segura nas próximas fases.

## Próxima etapa

A Fase 3 implementará a câmera móvel com pan/zoom pensado para toque e o `TimeController` com long press, câmera lenta e primeiro menu radial contextual. Depois virão a Rainha como núcleo de produção, a primeira Operária e o pathfinding A*.
