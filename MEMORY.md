# Fumiga — Memória de desenvolvimento

## 2026-09-08 — Fase 1

A sessão possui um pipeline WebDev baseado em React + Babylon.js, enquanto o TDD original descreve Phaser 3 + JavaScript vanilla. A decisão adotada é preservar os limites de responsabilidade e os nomes conceituais do TDD, mas usar Babylon como camada de renderização compatível com o ambiente atual. O gameplay permanece em módulos TypeScript sob `client/src/game/` e não depende de componentes React.

A integração do canvas segue o contrato de lifecycle: um Engine por mount, guarda contra StrictMode, `engine.resize()` em resize, remoção de listeners e `dispose()` no unmount.

A Fase 1 ainda não tenta resolver A*, behavior trees, economia real, feromônios ou persistência. O objetivo é garantir que a cena, o canvas e o primeiro input estejam vivos antes de avançar.

O asset visual gerado para orientar a direção de arte usa pixel art 16-bit moderno, subterrâneo úmido, âmbar bioluminescente, verde orgânico e formigas anatomicamente realistas. O arquivo não deve ser commitado no projeto por causa do tamanho; seu registro está em `ASSETS.md`.
