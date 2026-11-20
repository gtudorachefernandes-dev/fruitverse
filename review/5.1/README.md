# FRUITVERSE 5.1 · revisão dos produtos

A base é a branch fruitverse-4-1-directors-cut no commit 002f33a. Na consulta de origem, a main apontava para 37778ea. Nenhuma branch ou tag 5.0 estava disponível.

## Teste no navegador

Extraia FRUITVERSE-5.1.zip e abra FRUITVERSE-5.1.html no Chrome. Selecione um sabor e clique em **Explorar em 3D**. O seletor de vistas inclui frente, 45°, lateral, traseira, superior, inferior e detalhe. A vista livre mostra as frutas. A introdução com os quatro produtos fica em **Abrir estúdio**.

## Inspeção

Cada prancha traz a fotografia existente no projeto, sete vistas do modelo e a cena completa. Os links de cena abrem o enquadramento em resolução maior.

| Sabor | Prancha comparativa | Cena | Modelo para inspeção |
|---|---|---|---|
| Strawberry Rush | [Comparar](strawberry.webp) | [Cena](strawberry-cena.webp) | [GLB](../models/strawberry.glb) |
| Mango Sunset | [Comparar](mango.webp) | [Cena](mango-cena.webp) | [GLB](../models/mango.glb) |
| Blueberry Galaxy | [Comparar](blueberry.webp) | [Cena](blueberry-cena.webp) | [GLB](../models/blueberry.glb) |
| Lime Energy | [Comparar](lime.webp) | [Cena](lime-cena.webp) | [GLB](../models/lime.glb) |

[Estúdio](estudio.webp) · [Seções em 390 px](390.webp) · [Seções em 1440 px](1440.webp)

## Assets e decisões de reconstrução

Os quatro atlas UV medem 2048 × 1024. A projeção inversa recupera o grafismo frontal das artes do repositório. Frutas laterais e composição traseira foram diagramadas no espaço UV. A marca no verso usa DejaVu Sans Condensed incorporada aos pixels. A referência conceitual orientou a continuidade da impressão e o metal exposto. O verso é uma proposta gráfica sujeita à aprovação da marca. Dados de volume, QR, códigos comerciais e tabelas nutricionais da imagem conceitual não foram incorporados ao novo desenho.

As peças de alumínio têm perfil de revolução, tampa com degraus, anel dobrado, rebaixo e cúpula inferior. O abridor tem um furo geométrico, rebite e painel demarcado. A superfície recebe granulação e relevo de gotas. WebGL 2 usa reflexão ambiental pré-filtrada e mapas de rugosidade. O modo WebGL 1 usa iluminação direta, brilho especular e relevo no casco. Os arquivos GLB contêm as geometrias e as texturas exportáveis. Iluminação, condensação em bump e comportamento interativo são específicos do visualizador web.

As frutas usam dez recortes existentes do projeto. A silhueta de cada recorte define a malha, e a fotografia fornece cor, detalhes de polpa, sementes e casca. O volume posterior, a espessura das folhas e a orientação das faces ocultas são estimativas. A face posterior reaproveita a fotografia. Manga e limão reutilizam uma peça na terceira posição. A rotação limitada mantém o lado observado em destaque. Para reproduzir os frutos com fidelidade em qualquer ângulo, são necessários scans licenciados ou fotografias em volta de cada peça, de preferência com luz difusa e escala. A arte de impressão aberta e medidas da embalagem permitiriam substituir as estimativas do rótulo, tampa e base.

No navegador, as duas versões de Three.js constroem as malhas diretamente. Os quatro GLB foram exportados dessas mesmas geometrias, com as texturas embutidas. Nenhum asset externo de procedência desconhecida foi incorporado.

## Verificação executada

- 16 testes unitários aprovados e build de produção gerado. Vite sinalizou o tamanho dos módulos de rótulos e do renderizador compatível, ambos sob demanda.
- Abertura dos quatro GLB com GLTFLoader, com malhas de frutas e texturas de rótulo de 2048 px.
- Inspeção inicial da Strawberry Rush e inspeção final das 32 vistas das quatro embalagens e cenas.
- Verificação geométrica do pôster em oito larguras de 320 a 1920 px. Rolagem e largura das seções em 320, 390, 768 e 1440 px.
- Chromium moderno com WebGL 2, arraste, teclado, cliques rápidos, perda e reabertura do contexto. Doze transições direcionadas entre sabores. Alternativa CSS sem WebGL e movimento reduzido.
- Chromium 109 em Linux com WebGL 2 desativado abriu o arquivo de prévia pelo disco e renderizou WebGL 1. A validação em Windows 7 e GPU física continua pendente.

Scripts de produção e inspeção: scripts/recover-labels.py, scripts/reconstruct-fruits.py, scripts/export-models.cjs, scripts/check-studio.cjs, scripts/check-framing.cjs e scripts/package-review.py.
