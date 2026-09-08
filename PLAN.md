# Fumiga — Plano de desenvolvimento

## Fase atual: 2 — Subterrâneo e matriz de mapa

A Fase 2 transforma o grid demonstrativo da fundação em uma matriz explícita, determinística e reutilizável. O mapa agora possui tipos de tile definidos no código e um gerador que é responsável por criar a representação visual e manter a correspondência entre matriz, mesh e input.

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

A Fase 3 deve introduzir a câmera com pan/zoom pensado para toque e o `TimeController` com long press, câmera lenta e primeiro menu radial contextual.
