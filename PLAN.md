# Fumiga — Plano de desenvolvimento

## Fase atual: 6 — Combate básico, inimigos e Soldado

A Fase 6 introduz a primeira ameaça de superfície. Uma Centopeia vaga pelo terreno, o Soldado permanece na entrada até receber uma ordem indireta de ataque, e a Rainha possui HP, armadura e condição de Game Over.

### Entregas concluídas

- Fase 1 mantida: canvas, lifecycle Babylon, Câmara Central, Rainha, HUD e pausa.
- `TileType` explícito: `Solid = 0`, `Dug = 1`, `Room = 2` e `Indestructible = 3`.
- `INITIAL_MAP` 18 x 12 com túneis iniciais, Câmara Central e áreas de terra sólida.
- `MapGenerator` responsável por clonar a matriz, gerar meshes, converter grid para mundo, consultar tiles e contar células caminháveis.
- Escavação centralizada em `MapGenerator.digMesh`, sem mutação de mapa espalhada pela cena.
- Metadados de cada mesh vinculados às coordenadas `x`, `z` e ao tipo do tile.
- Tiles escavados passam a ser visualmente baixos e caminháveis, mantendo a atualização do HUD.
- `AStarGrid` calcula rotas com custo G e heurística Manhattan, aceitando apenas tiles `Dug` e `Room`.
- `EconomyManager` começa com 100 Biomassa, aplica custo de 10 por Operária e impede saldo negativo.
- `Queen` mantém uma fila de spawn e libera uma Operária após cooldown.
- `WorkerAnt` recebe uma tarefa, segue a rota A* até a borda do sólido e escava sem atravessar paredes.
- `SurfaceManager` cria a área de superfície, a entrada do formigueiro, folhas de Biomassa e respawn de recursos.
- `PheromoneSystem` mantém zonas de coleta com raio, TTL, substituição por tipo e visual de anel discreto.
- `CollectorAnt` segue o feromônio, extrai por 1 segundo e devolve a carga à Despensa via `EconomyManager`.
- `CombatMath` resolve dano mitigado por armadura, HP mínimo e derrota.
- `EnemyBase` cria a Centopeia, movimenta-a pela superfície, causa dano à Rainha e dropa 12 Biomassa ao morrer.
- `SoldierAnt` custa 25 Biomassa, aguarda o feromônio de ataque, persegue a ameaça e aplica mordidas de 14 de dano.

## Critérios de verificação

1. `pnpm check` termina sem erros de TypeScript.
2. `pnpm build` gera o build de produção.
3. A matriz possui dimensões estáveis de 18 x 12.
4. A Câmara Central é representada por tiles `Room` e os túneis iniciais por tiles `Dug`.
5. Tiles sólidos podem ser escavados uma única vez, atualizando a matriz e a representação visual.
6. A câmera mantém a leitura top-down sem bloquear a interação com os tiles.
7. A cena continua descartando observers, câmera, mapa e materiais no unmount.
8. O A* nunca inclui tiles `Solid` ou `Indestructible` em um caminho.
9. O saldo de Biomassa nunca fica negativo após uma ordem de nascimento.
10. A Operária só altera um tile sólido ao alcançar uma célula caminhável adjacente.
11. Um feromônio de coleta tem raio e TTL finitos e não duplica zonas do mesmo tipo.
12. A Coletora só adiciona Biomassa após retornar à entrada com uma carga colhida.
13. Dano respeita armadura e nunca reduz HP abaixo de zero.
14. Soldado só abandona a prontidão após um feromônio de ataque ativo.
15. Centopeia derrotada desaparece e concede Biomassa; Rainha derrotada ativa Game Over.

## Próximo risco prioritário

A próxima fatia prioritária é a Fase 7: RoomBuilder, salas construídas e cartas de mutação.
