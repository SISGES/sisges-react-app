# SISGES — Kit de identidade visual do livro aberto

O livro aberto em contorno foi reconstruído como desenho vetorial editável a partir da segunda imagem de referência da interface (Civic Blue para dispositivos móveis). Ele representa a identidade visual em uso no SISGES.

## Arquivos do kit

- `svg/` contém 20 matrizes vetoriais. Há cinco composições: símbolo, assinatura horizontal, horizontal com descritivo, vertical e vertical com descritivo. Cada composição tem versões em azul-marinho, preto, branco (negativo) e dourado opcional.
- `png/` contém 40 imagens com fundo transparente. O lado maior tem 1.200 px ou 2.400 px, conforme o sufixo `@1x` ou `@2x`. Para visualizar a versão branca, use um fundo escuro.
- `pdf/` contém um PDF vetorial de cinco páginas com as matrizes em azul-marinho, uma composição por página. As cores estão em RGB. Para impressão, peça à gráfica que faça a conversão para o perfil ICC do papel e do processo de impressão.
- `icons/` reúne o SVG, o ICO em várias resoluções e os ícones PNG quadrados de 16 a 1.024 px. O livro é branco sobre fundo azul-marinho opaco. O conjunto inclui o ícone Apple de 180 px e os ícones de 192 e 512 px para inicializadores de aplicativos.
- `index.html` é o catálogo para consultar as variações e baixar os arquivos.
- `preview.png` mostra as principais versões em uma única imagem.
- `generate.py` recria as matrizes e exporta os arquivos. Requer Python, fonttools, cairosvg, Pillow, pypdf e a fonte DejaVu Sans nas versões regular e negrito em `/usr/share/fonts/truetype/dejavu/`.

## Especificações da marca

O azul-marinho principal é `#142D4E` (RGB 20, 45, 78). Use `#FFFFFF` para branco, `#000000` para preto e `#B79753` (RGB 183, 151, 83) para o dourado cerimonial opcional.

O nome SISGES usa DejaVu Sans Bold e o descritivo usa DejaVu Sans. As letras foram convertidas em contornos, portanto os arquivos SVG e PDF podem ser usados sem instalar as fontes. O traço do livro tem cinco unidades na área vetorial de 100 unidades, com junções e extremidades arredondadas. Preserve essa proporção ao redimensionar a marca.

Use azul-marinho sobre fundos claros, branco sobre fundos escuros e preto em reproduções monocromáticas. Reserve o dourado para aplicações especiais. Mantenha ao redor da marca uma área livre de pelo menos duas vezes a largura do traço do livro. Preserve a orientação e a proporção originais, evite sombras e redesenhos e escolha fundos sem detalhes que prejudiquem a leitura.

Em telas, use o símbolo a partir de 24 px (16 px para o favicon), a assinatura horizontal a partir de 120 px de largura e as assinaturas com descritivo a partir de 280 px. Abaixo desse último limite, use a versão sem descritivo. Preserve as margens internas do `viewBox` do SVG.

## Uso na aplicação

O componente `src/components/SisgesLogo/SisgesLogo.tsx` usa as mesmas matrizes SVG em contornos de `public/brand/`. A marca muda automaticamente para branco no tema escuro. A opção `tone="inverse"` mantém a versão branca na barra lateral fixa escura e no menu lateral móvel. O componente é compartilhado pela tela de login, pela barra lateral no computador e pelo cabeçalho e menu lateral no celular.

Os arquivos `public/sisges-icon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` e `site.webmanifest` identificam a aplicação nos navegadores e inicializadores. Ao gerar o kit novamente, o script sincroniza a arte usada na aplicação. O manifesto fornece metadados dos ícones; o funcionamento offline exige implementação própria.
