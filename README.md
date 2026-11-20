# FRUITVERSE® — Beyond the Flavor

Página inicial interativa para uma coleção de quatro bebidas frutadas. As artes das embalagens e as fontes fazem parte do projeto. A página funciona sem serviços externos ou credenciais próprias.

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
- `src/can-model.js` constrói a embalagem metálica, o rótulo procedural por sabor e os pedaços de manga.
- `src/scene.js` controla iluminação, câmera e renderização WebGL. O módulo é carregado ao abrir **Explorar em 3D**, depois que o navegador fornece um contexto WebGL 2.
- `src/cinematic.css` usa planos em perspectiva, flutuação e iluminação para animar as artes sem WebGL.

O modo 3D preserva o packshot como visual padrão e usa uma interpretação própria do rótulo. Arraste a lata ou use as setas para girar. Pressione **Esc** ou **Ver arte original** para voltar. Sem WebGL 2, a perspectiva cinematográfica usa as artes existentes com paralaxe, flutuação e transições de sabor sincronizadas. As frutas são separadas em planos nos desktops com ponteiro fino. Em telas menores, a composição usa a arte original em um único plano. Com movimento reduzido, a troca preserva as imagens e as cores com animações de deslocamento desativadas.
- `src/style.css` define a direção de arte, o layout responsivo e as regras de movimento reduzido.
- `public/flavors/` contém os quatro packshots em WebP e as camadas opcionais para desktop.
