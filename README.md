# Fumiga

Fumiga é um roguelite de gerenciamento de colônia com estratégia indireta, permadeath da Rainha, construção de formigueiro e progressão genética. Esta branch contém a **Fase 1 — Fundação e setup**.

## Estado atual

A fundação executável roda no navegador por meio de React, TypeScript, Vite e Babylon.js. Ela já possui um canvas em tela cheia, uma cena subterrânea procedural, uma Câmara Central com a Rainha, HUD de recursos, input de escavação, pausa da cena e ciclo de vida seguro do Engine.

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

## Fase 1 entregue

A página principal exibe a cena da fundação, a Rainha e seus ovos, a contagem inicial de Biomassa e Geleia Real, o estado do núcleo, o botão de pausa e uma contagem de células abertas. O clique em um bloco sólido altera sua representação para uma célula escavada e atualiza o HUD.

Os arquivos `PLAN.md`, `STRUCTURE.md`, `MEMORY.md` e `ASSETS.md` registram o plano, a arquitetura, as decisões técnicas e o manifesto de arte para permitir retomada segura nas próximas fases.

## Próxima etapa

A Fase 2 implementará a matriz de mapa explícita, geração de terreno e câmera móvel com pan/zoom. Depois virão a Rainha como núcleo de produção, a primeira Operária e o pathfinding A*.
