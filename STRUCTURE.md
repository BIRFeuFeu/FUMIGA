# Fumiga

## Runtime

- Babylon.js 9.x
- React + TypeScript + Vite
- Browser preview gerenciado pelo WebDev
- Dimensão: 3D com leitura top-down e estética pixel art

## App Entry

- `client/index.html` -> `client/src/main.tsx`
- `client/src/main.tsx` -> inicializa a aplicação React
- `client/src/App.tsx` -> monta o `GameCanvas` como conteúdo único da rota `/`
- `client/src/components/GameCanvas.tsx` -> possui o canvas, o HUD, o ciclo de vida do Engine e os listeners de UI

## Game Entry

- `client/src/game/scene.ts` -> exporta `createGameScene(engine, canvas)` e `GameHandle`
- `client/src/game/core/GameState.ts` -> estado mínimo e eventos da fundação
- `client/src/game/core/CameraController.ts` -> pan, zoom por roda/pinch e limites do alvo
- `client/src/game/core/EconomyManager.ts` -> Biomassa e custo de nascimento
- `client/src/game/core/TimeController.ts` -> long press, escala 0.1x e resolução de ordens radiais
- `client/src/game/ai/AStarGrid.ts` -> caminhos subterrâneos com heurística Manhattan
- `client/src/game/ai/AStarGrid.test.ts` -> regressões de paredes, isolamento e economia
- `client/src/game/ai/PheromoneSystem.ts` -> zonas de coleta com raio e TTL
- `client/src/game/entities/Queen.ts` -> fila e cooldown de nascimento
- `client/src/game/entities/WorkerAnt.ts` -> execução da tarefa de escavação
- `client/src/game/entities/CollectorAnt.ts` -> coleta de folhas e retorno à entrada
- `client/src/game/world/MapGenerator.ts` -> matriz explícita, geração de tiles, consulta de caminhabilidade e escavação
- `client/src/game/world/SurfaceManager.ts` -> superfície, entrada, folhas e respawn
- `client/src/game/**` -> regras de gameplay desacopladas da camada React

## Fundação visual

- `MapGenerator` cria uma matriz determinística de 18 x 12 com tipos `Solid`, `Dug`, `Room` e `Indestructible`.
- A cena consome o gerador e não muta tiles diretamente.
- A Câmara Central é aberta no centro do grid.
- A câmera aceita arrasto para pan, roda/pinch para zoom e mantém limites para leitura do mapa.
- A pausa tática é controlada por `TimeController`, que abre o menu radial e não aciona escavação acidental no release.
- O menu radial identifica o alvo sob o toque e troca a ordem lateral entre spawn de Operária no subterrâneo e feromônio de coleta na superfície.
- A Coletora não recebe comando direto: consulta uma zona de feromônio ativa, coleta por tempo fixo e retorna à entrada.
- A Rainha e os ovos são representados por meshes procedurais enquanto o pipeline de arte final ainda não foi integrado.
- O asset de referência visual é mantido fora do repositório e acessado via `/manus-storage` quando necessário.

## Planned Modules

- `world/MapGenerator` -> matriz de tiles e regras de bioma
- `world/RoomBuilder` -> construção e efeitos das salas
- `ai/AStarGrid` -> navegação subterrânea
- `ai/PheromoneSystem` -> zonas e ordens indiretas
- `entities/Queen`, `entities/WorkerAnt`, `entities/CollectorAnt` -> unidades da primeira fatia jogável
- `systems/TimeController` -> pausa tática e câmera lenta
- `systems/EconomyManager` -> Biomassa e custos

## Assets

- Assets pesados não são commitados no diretório do projeto.
- Originais locais: `/home/ubuntu/webdev-static-assets/`
- Armazenamento WebDev: `/manus-storage/`
- Manifesto: `ASSETS.md`

## Verification

- `pnpm check`
- `pnpm build`
- Preview WebDev
- Screenshot visual via `webdev_take_screenshot`
