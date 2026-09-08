# Fumiga — Memória de desenvolvimento

## 2026-09-08 — Fase 2

A matriz do subterrâneo foi separada da cena em `client/src/game/world/MapGenerator.ts`. O módulo é a fonte de verdade do grid e expõe tipos de tile, consulta de caminhabilidade, conversão de coordenadas, contagem de células e escavação por mesh.

A matriz inicial é determinística e usa uma cópia defensiva da constante `INITIAL_MAP`. Isso evita que uma partida altere o template global e prepara o terreno para geração procedural e rotas futuras. O tipo `Indestructible` já está definido para que pedras e restrições de navegação não precisem ser introduzidas por refatoração posterior.

A cena agora se limita a coordenar câmera, luz, entidades temporárias, input e eventos do HUD. Ela não constrói nem muta tiles diretamente.

## 2026-09-08 — Fase 3

`CameraController` foi separado do runtime visual e implementa pan com um ponteiro, zoom por roda e pinch, limites de raio e limites de deslocamento do alvo. `TimeController` usa long press de 300 ms, tolerância de movimento de 10 px e escala temporal de 0.1 durante a decisão. A direção vertical abre a ordem de cavar, a horizontal a ordem de construir e o centro cancela.

O `TimeController` escuta ponteiros na janela, filtrando eventos cujo alvo não é o canvas. Essa escolha mantém o gesto confiável mesmo com os listeners internos do Babylon e facilita testes com eventos sintéticos. O preview foi testado com pointerdown sustentado por 650 ms: o estado exibiu `SLOW / 10%`, o `.radial-menu` apareceu e foi removido após pointerup.

## 2026-09-08 — Auditoria documental e Fase 4

Os quatro documentos foram revisados novamente antes da implementação: o GDD governa as regras e a experiência, o TDD governa os módulos e contratos, a Art Bible governa os assets e o Roadmap governa a ordem. A auditoria está em `COMPLIANCE_AUDIT.md` e deve ser consultada antes de cada nova fase.

`AStarGrid` foi mantido independente do renderer e recebe a matriz por função de leitura. Isso permite testar navegação sem iniciar Babylon. A Operária começa na Câmara Central, calcula uma rota em tiles caminháveis, espera 0.8 s na célula adjacente e escava um único alvo. A Rainha cobra 10 Biomassa por pedido e libera a unidade após 2 s.

O TDD prescreve Phaser 3, mas o WebDev disponível para esta sessão prescreve React + Babylon. A divergência foi registrada como adaptação de infraestrutura, não como alteração de design: os módulos, nomes de responsabilidade, regras de A*, economia, fila e contratos previstos no TDD permanecem separados e migráveis.
