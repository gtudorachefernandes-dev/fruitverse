# Revisões FRUITVERSE

[Prévia, modelos, capturas e relatório da versão 5.1](5.1/README.md)

# FRUITVERSE 4.1 — Director’s Cut

Extraia o ZIP da branch e abra **FRUITVERSE-4.1.html** nesta pasta. O arquivo contém fontes, texturas, artes e módulos do build. Funciona sem instalar Node ou iniciar um servidor.

**Abrir estúdio** apresenta as quatro embalagens. Selecione uma delas para entrar no pôster do sabor. **Explorar em 3D** abre a inspeção individual. Arraste, use as setas ou escolha uma das quatro vistas. **Home** centraliza e **Escape** sai.

A frente dos rótulos vem da fotografia aprovada. O script de recuperação alinha a lata e desfaz a projeção cilíndrica da face visível. As laterais fazem a transição para tinta lisa. O verso, o lacre e a geometria da tampa são aproximações. Não havia arte-final de impressão, vista traseira ou medidas industriais no material disponível.

O estúdio carrega os modelos a pedido. Sem WebGL, oferece a seleção por fotografias e animação de perspectiva. O modo de movimento reduzido preserva a escolha e a inspeção manual. O navegador escolhe entre Three r180 e r162 conforme o contexto WebGL disponível.

## Capturas da versão de revisão

- [Estúdio](estudio.webp)
- [Originais e inspeção de cada lata](embalagens.webp). Colunas em ordem de leitura mostram a fotografia original, a frente, a lateral, a traseira e a tampa.
- [Quatro sabores em desktop](desktop.webp)
- [Quatro sabores em celular](celular.webp)
- [Exploração, coleção, manifesto e rodapé](secoes.webp)

## Reprodução dos testes

Execute `npm ci`, `npm test` e `npm run build` no ambiente Node. Para repetir as capturas, inicie `npm run preview` e execute `node scripts/check-studio.cjs http://localhost:4173 captures` em um ambiente de testes com playwright-core e Chromium disponíveis. A variável CHROME_BIN permite indicar outro executável. A geração das texturas a partir das artes está em scripts/recover-labels.py e usa Pillow e NumPy.

Para licenças das bibliotecas e fontes, consulte LICENCAS.txt e a [licença do GSAP](https://gsap.com/standard-license/).

A revisão baseada no vídeo de referência dispõe as quatro latas em arco no estúdio. O foco pelo teclado ou pelo ponteiro destaca uma embalagem. Ao confirmar, a câmera se aproxima enquanto o pôster escolhido é preparado. Em telas pequenas, o título, a embalagem e a descrição ocupam linhas próprias. Os controles de inspeção ficam entre o palco e o seletor de sabores.
