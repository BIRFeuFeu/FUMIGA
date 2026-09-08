# Fumiga — Plano de desenvolvimento

## Fase atual: 3 — Câmera e pausa tática

A Fase 3 adiciona a camada de interação mobile sobre a matriz da Fase 2. A câmera pode ser deslocada e aproximada por gestos, enquanto o toque longo reduz a escala temporal para permitir decisões e abre o primeiro menu radial contextual.

### Entregas concluídas

- Fase 1 mantida: canvas, lifecycle Babylon, Câmara Central, Rainha, HUD e pausa.
- `TileType` explícito: `Solid = 0`, `Dug = 1`, `Room = 2` e `Indestructible = 3`.
- `INITIAL_MAP` 18 x 12 com túneis iniciais, Câmara Central e áreas de terra sólida.
- `MapGenerator` responsável por clonar a matriz, gerar meshes, converter grid para mundo, consultar tiles e contar células caminháveis.
- Escavação centralizada em `MapGenerator.digMesh`, sem mutação de mapa espalhada pela cena.
- Metadados de cada mesh vinculados às coordenadas `x`, `z` e ao tipo do tile.
- Tiles escavados passam a ser visualmente baixos e caminháveis, mantendo a atualização do HUD.

## Critérios de verificação

1. `pnpm check` termina sem erros de TypeScript.
2. `pnpm build` gera o build de produção.
3. A matriz possui dimensões estáveis de 18 x 12.
4. A Câmara Central é representada por tiles `Room` e os túneis iniciais por tiles `Dug`.
5. Tiles sólidos podem ser escavados uma única vez, atualizando a matriz e a representação visual.
6. A câmera mantém a leitura top-down sem bloquear a interação com os tiles.
7. A cena continua descartando observers, câmera, mapa e materiais no unmount.

## Próximo risco prioritário

A próxima fatia prioritária é a Fase 4: `AStarGrid`, fila inicial de nascimento da Rainha e uma Operária capaz de executar uma tarefa de escavação sem atravessar tiles sólidos.
