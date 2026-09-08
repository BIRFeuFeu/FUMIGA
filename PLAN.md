# Fumiga — Plano de desenvolvimento

## Fase atual: 4 — Pathfinding e primeira Operária

A Fase 4 adiciona navegação subterrânea, economia in-run, fila de nascimento da Rainha e a primeira Operária. Esta fase foi iniciada somente após a auditoria do GDD, TDD, Art Bible e Roadmap, registrada em `COMPLIANCE_AUDIT.md`.

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

## Próximo risco prioritário

A próxima fatia prioritária é a Fase 5: superfície, `PheromoneSystem` e Coletora, após validar a navegação da Operária contra paredes.
