# Fumiga — Plano de desenvolvimento

## Fase atual: 1 — Fundação e setup

A Fase 1 entrega uma base executável no navegador, com o ciclo de vida do canvas protegido contra o duplo mount do React StrictMode, uma cena Babylon inicializada e uma superfície mínima de HUD para confirmar que o runtime está vivo.

### Entregas concluídas

- Scaffold WebDev `web-static` com React 19, TypeScript e Vite.
- Babylon.js adicionado como dependência.
- Canvas de tela cheia montado como conteúdo exclusivo da rota principal.
- Cena de fundação subterrânea criada com câmera, iluminação, tiles e marcador da Rainha.
- Input de clique conectado ao grid para validar o primeiro handshake de interação.
- Botão de pausa conectado ao runtime da cena.
- HUD mínimo com Biomassa, Geleia Real, estado do núcleo e contagem de células abertas.
- Arquivos de contexto do pipeline criados para permitir retomada sem perda de decisões.

## Critérios de verificação

1. `pnpm check` termina sem erros de TypeScript.
2. `pnpm build` gera o build de produção.
3. O preview abre sem erros fatais de runtime.
4. A cena exibe o subterrâneo, a Câmara Central e a Rainha.
5. Clicar em um bloco sólido o transforma em célula escavada e atualiza o HUD.
6. Pausar e retomar interrompe e reinicia a animação da cena.
7. O canvas é descartado corretamente no unmount.

## Próximo risco prioritário

A Fase 2 deve substituir a demonstração visual por um `MapGenerator` e uma matriz de tiles explícita, além de introduzir câmera móvel com pan/zoom controlado para mobile.
