# Fumiga

Fumiga é um roguelite de gerenciamento de colônia com estratégia indireta, permadeath da Rainha, construção de formigueiro e progressão genética. Esta branch contém a **Fase 6 — Combate básico, inimigos e Soldado**.

## Estado atual

A fundação executável roda no navegador por meio de React, TypeScript, Vite e Babylon.js. Ela possui um canvas em tela cheia, uma cena subterrânea procedural, uma área de superfície com entrada e folhas, uma Câmara Central com a Rainha, HUD de recursos e HP, matriz explícita de tiles gerenciada por `MapGenerator`, pan/zoom por toque e mouse, pausa total, pausa tática por long press, economia de Biomassa, fila de spawn, uma Operária com A*, uma Coletora orientada por feromônio, uma Centopeia inimiga e um Soldado orientado por feromônio de ataque.

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

## Fase 6 entregue

A página principal exibe a cena subterrânea e a superfície, a Rainha e seus ovos, a Centopeia, o Soldado, folhas, a contagem de Biomassa, HP da Rainha, Geleia Real, estado do núcleo e contagem de células abertas. O clique em um bloco sólido consulta os metadados do tile, altera a matriz para `Dug`, reduz visualmente o bloco e atualiza o HUD. Arrastar desloca a câmera, roda do mouse e pinch alteram o zoom, e segurar o toque abre a pausa tática em 10%.

Os arquivos `PLAN.md`, `STRUCTURE.md`, `MEMORY.md` e `ASSETS.md` registram o plano, a arquitetura, as decisões técnicas e o manifesto de arte para permitir retomada segura nas próximas fases.

## Combate indireto

`EnemyBase` cria uma Centopeia que vaga pela superfície e pode ameaçar a Rainha. `SoldierAnt` custa 25 Biomassa e permanece em prontidão até o jogador marcar uma zona de ataque. `PheromoneSystem` suporta o tipo `attack`, com raio 6 e TTL de 12 segundos; o Soldado segue a ameaça e desfere mordidas de 14 de dano. `CombatMath` mitiga o dano pela armadura, a Centopeia dropa 12 Biomassa ao morrer e a Rainha ativa Game Over quando seu HP chega a zero.

## Próxima etapa

A Fase 7 implementará `RoomBuilder`, salas com custos e o sistema de cartas de mutação.
