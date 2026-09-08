# Fumiga — Auditoria de Conformidade do Projeto

**Data:** 8 de setembro de 2026  
**Responsável:** Manus AI  
**Escopo:** GDD oficial, TDD, Art Bible e Roadmap de Desenvolvimento.

## Conclusão executiva

O desenvolvimento não deve ser guiado apenas pelo Roadmap. O Roadmap define a ordem de entrega; o GDD define a experiência e as regras do jogo; o TDD define os módulos e os contratos técnicos; e a Art Bible define a direção visual e os critérios de rejeição de assets. A revisão foi feita novamente antes da Fase 4.

A implementação atual está alinhada com os fundamentos de gameplay do GDD e com a sequência das Fases 1 a 4 do Roadmap. A matriz explícita, o pan/zoom, o long press, a câmera lenta e o menu radial já estão representados. A Fase 4 agora introduz os três contratos críticos previstos: navegação A*, economia inicial de 100 Biomassa e fila de nascimento da Rainha com uma Operária que recebe uma tarefa de escavação.

Existe uma incompatibilidade estrutural entre o TDD e o ambiente desta sessão. O TDD especifica Phaser 3, JavaScript e Capacitor, enquanto o pipeline WebDev disponível foi inicializado com React, TypeScript, Vite e Babylon.js. A decisão registrada é manter a engine de renderização Babylon nesta sessão, mas preservar os limites conceituais do TDD: `AStarGrid`, `EconomyManager`, `TimeController`, entidades separadas, estado de mundo isolado e futura integração com persistência, áudio, shaders e build mobile. Essa decisão é explícita e revisável; ela não altera as regras do GDD.

## Matriz de requisitos

| Documento | Requisito verificado | Estado atual | Decisão de implementação |
|---|---|---|---|
| GDD | Roguelite de colônia com estratégia indireta | Alinhado | O input é indireto e a camada tática não permite arrastar tropas diretamente. |
| GDD | Plataforma mobile e controle por toque | Parcialmente implementado | Pan, pinch, long press e menu radial funcionam no canvas; Capacitor será tratado na Fase 10. |
| GDD | Pausa tática em 10% e vinheta | Implementado | `TimeController` usa escala 0.1 e o HUD aplica vinheta e redução de saturação. |
| GDD | Biomassa in-run e Geleia Real metaprogressiva | Fundamento iniciado | Biomassa inicial e custo de Operária estão ativos; persistência de Geleia Real entra com `SaveManager`. |
| GDD | Rainha estática e núcleo da colônia | Implementado como protótipo | A Rainha possui mesh, ovos, fila de spawn e produção de Operárias. Pânico, HP e Game Over entram na camada de combate. |
| GDD | Operária passiva e restrita ao subterrâneo | Fase 4 iniciada | A Operária recebe uma tarefa de escavação e usa A* sem atravessar sólidos. Behavior Tree será adicionada antes das classes de superfície. |
| GDD | Identidade visual 2D pixel art, anatomia realista e sem antropomorfismo | Direção aplicada, assets finais pendentes | A UI segue a direção escura, orgânica e minimalista; spritesheets da Art Bible serão integradas na Fase 9. |
| TDD | Grid 0/1/2/3 e A* com heurística Manhattan | Implementado | `MapGenerator` expõe a matriz e `AStarGrid` navega apenas em `Dug` e `Room`. |
| TDD | TimeController com 300 ms e tolerância de 10 px | Implementado | O controlador usa os mesmos limiares e restaura 1.0 ao soltar. |
| TDD | EconomyManager com 100 Biomassa inicial | Implementado | A economia possui capacidade, gasto seguro e atualização de HUD. |
| TDD | Entidades separadas | Implementado em TypeScript | `Queen` e `WorkerAnt` são módulos independentes da cena. |
| TDD | Phaser, Arcade Physics, JS e Capacitor | Divergência registrada | Babylon/React/TypeScript é a adaptação obrigatória do pipeline WebDev desta sessão; os contratos de gameplay permanecem equivalentes. |
| Art Bible | Fundo verde para spritesheets, anatomia hexapoda e proibição de humanização | Pendente de assets finais | Nenhum asset final deve ser aceito sem revisão contra essas regras. |
| Roadmap | Não avançar sem validar A* contra paredes | Critério da Fase 4 | O teste funcional precisa verificar que a Operária não atravessa `Solid` ou `Indestructible`. |

## Critérios obrigatórios para as próximas fases

Cada nova fase será iniciada somente após a leitura dos quatro documentos e uma comparação com esta auditoria. O Roadmap será usado para decidir a sequência, mas não substituirá os requisitos do GDD, do TDD ou da Art Bible.

A Fase 4 será considerada sólida quando a busca A* retornar caminhos válidos somente em tiles caminháveis, retornar vazio quando não houver rota, e a Operária completar uma escavação sem mover-se através de paredes. A economia deverá impedir spawn sem Biomassa suficiente. A Rainha deverá respeitar a fila e o cooldown de nascimento.

Antes da Fase 5, serão revisados os requisitos de superfície, Coletora, feromônios e economia de Biomassa. Antes da Fase 6, serão revisados HP, armadura, dano, morte, drops e Game Over. Antes da Fase 9, cada asset será comparado com a Art Bible, incluindo anatomia, formato de spritesheet e fundo técnico.

## Limites conhecidos

A implementação atual ainda não contém persistência IndexedDB, Behavior Trees, PheromoneSystem, RoomBuilder, superfície, combate, MutationSystem, AudioManager, spritesheets finais ou Capacitor. Esses itens não foram considerados concluídos apenas por existirem no planejamento. Eles permanecem explicitamente marcados para as fases correspondentes.

A implementação também não usa o shader de chroma key porque os personagens atuais são meshes procedurais, sem spritesheets com fundo verde. O shader será necessário somente quando o pipeline de arte da Fase 9 for integrado.

## Referências

[1]: /home/ubuntu/projects/fumiga-project-ae2179d0/🎮%20GAME%20DESIGN%20DOCUMENT%20(GDD)%20OFICIAL_%20FUMIGA_.docx "Game Design Document oficial de Fumiga"
[2]: /home/ubuntu/projects/fumiga-project-ae2179d0/📄%20DOCUMENTO%20DE%20ARQUITETURA%20TÉCNICA%20(TDD)_%20FUMIGA_.docx "Documento de Arquitetura Técnica de Fumiga"
[3]: /home/ubuntu/projects/fumiga-project-ae2179d0/🎨%20ART%20BIBLE%20E%20PROMPTS%20VISUAIS%20(VERSÃO%20ESTRUTURADA%20E%20REALISTA).docx "Art Bible e prompts visuais de Fumiga"
[4]: /home/ubuntu/projects/fumiga-project-ae2179d0/🗺️%20ROADMAP%20DE%20DESENVOLVIMENTO%20_%20FUMIGA_..docx "Roadmap de Desenvolvimento de Fumiga"
