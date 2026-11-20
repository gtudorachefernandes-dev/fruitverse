# FRUITVERSE® — Beyond the Flavor

Experiência cinematográfica em quatro pôsteres. Cada sabor tem enquadramento, cenário e movimento próprios, com uma galeria editorial e um guia de sabor. As artes das embalagens e as fontes fazem parte do projeto. A página funciona sem serviços externos ou credenciais próprias.

## Desenvolver no Codex

Execute estes comandos no checkout do repositório com Node.js 24. O Windows precisa apenas do navegador para acessar o Codex ou o site publicado.

```bash
npm ci
npm run dev -- --host 0.0.0.0
npm test
npm run build
```

Para validar o build servido por HTTP, execute `npm run preview -- --host 0.0.0.0`.

## Publicar em hospedagem estática

Publique o conteúdo de `dist/`, gerado por `npm run build`. Os caminhos relativos do Vite permitem servir o site na raiz ou em um subdiretório.

Para usar GitHub Pages, envie os arquivos para a branch principal, abra **Settings → Pages**, selecione **GitHub Actions** como fonte e execute **Publicar Fruitverse** na aba **Actions**. O fluxo instala as dependências, roda os testes, compila e publica `dist/`.

## Estrutura

- `index.html` contém a estrutura semântica da página e do manifesto.
- `src/main.js` gerencia a seleção dos sabores, o carregamento e as animações com GSAP e ScrollTrigger.
- `src/flavors.js` reúne o conteúdo, as cores e as imagens de cada sabor.
- `src/artwork.js` e `src/fruit-layout.json` compõem as frutas separadas sobre as artes originais em desktops compatíveis.
- `src/can-model.js` constrói a lata, os rótulos e a textura de condensação.
- `src/3d/` reúne as frutas procedurais, a câmera, a rotação manual e a seleção de renderizador.
- `src/scene.js` controla a iluminação, o ciclo de renderização e a recuperação visual após perda de contexto.
- `src/flavor-flow.js` mantém a solicitação mais recente durante o carregamento dos sabores.
- `src/scenes.js` define os trajetos de entrada e saída dos pôsteres.
- `src/cinematic.css` anima as artes em perspectiva quando não há um renderizador 3D ativo.
- `src/style.css` organiza os pôsteres, a exploração da embalagem, a galeria, o guia e o encerramento.
- `public/flavors/` contém os packshots originais em WebP e as camadas opcionais para desktop.

### Modos de visualização

- **WebGL 2** usa Three.js r180 com materiais PBR, mapa de ambiente e relevo de condensação.
- **WebGL 1** carrega separadamente o Three.js r162. Mantém os modelos e controles, com iluminação direta, material metálico aproximado e menos detalhes.
- **Sem WebGL** mantém a composição e a troca de sabores em CSS e GSAP. A preferência por movimento reduzido desliga a animação contínua e mantém a exploração manual disponível.

Em **Explorar em 3D**, arraste com o mouse ou toque, ou use as quatro setas. Use **Home** ou **Centralizar** para voltar à frente e **Esc** para fechar.

As artes de origem são imagens renderizadas em perspectiva. Os rótulos 3D foram reconstruídos com tipografia e paletas da marca e as frutas são modelos procedurais estilizados. O modo compatível preserva a exploração da geometria com materiais simplificados.
