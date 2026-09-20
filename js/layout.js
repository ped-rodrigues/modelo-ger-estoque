/**
 * layout.js — CABEÇALHO E RODAPÉ COMPARTILHADOS
 * ---------------------------------------------------------------------------
 * Responsabilidade única: montar a barra de navegação e o rodapé, que são
 * iguais em todas as telas.
 *
 * Por que em JavaScript e não copiado em cada HTML? O projeto não usa
 * servidor nem gerador de páginas (decisão D1), então não existe `include` de
 * HTML. Copiar o mesmo cabeçalho em seis arquivos significaria seis lugares
 * para corrigir a cada mudança — exatamente a duplicação que a RNF11 pede
 * para evitar. Aqui o cabeçalho existe uma vez só.
 *
 * Como usar: basta o `<body>` declarar em qual seção está e qual é o caminho
 * até a raiz do projeto:
 *
 *     <body data-secao="estoque" data-base="../">
 *
 * `data-secao` marca o link atual (aria-current) e escreve o nome da seção ao
 * lado do logotipo. `data-base` vale "" para a página da raiz (index.html) e
 * "../" para as páginas dentro de `pages/`.
 *
 * Atende: RNF10 (consistência visual), RNF11 (sem duplicação).
 */

const Layout = {
  /**
   * Itens da barra de navegação, na ordem em que aparecem.
   * `chave` casa com o `data-secao` do `<body>`; `href` é relativo à raiz.
   */
  SECOES: [
    { chave: 'inicio', texto: 'Início', href: 'index.html' },
    { chave: 'garagem', texto: 'Garagem', href: 'pages/garagem.html' },
    { chave: 'estoque', texto: 'Estoque', href: 'pages/estoque.html' },
    { chave: 'historico', texto: 'Histórico', href: 'pages/historico.html' },
    { chave: 'sobre', texto: 'Sobre', href: 'pages/sobre.html' },
    { chave: 'contato', texto: 'Contato', href: 'pages/contato.html' }
  ],

  /**
   * Nome exibido ao lado do logotipo em cada página interna.
   * A home não entra: lá o logotipo aparece sozinho, como no Figma.
   */
  TITULOS: {
    garagem: 'Garagem',
    estoque: 'Estoque',
    historico: 'Histórico',
    sobre: 'Sobre',
    contato: 'Contato'
  },

  /**
   * Logotipo Kaisen: contorno de carro e nome, desenhados em SVG.
   * Fica aqui, e não em cada HTML, para não repetir o desenho seis vezes.
   * `aria-hidden` porque o nome da marca já é lido no texto do link.
   * @returns {string} marcação SVG
   */
  logotipo() {
    return '' +
      '<svg class="marca__simbolo" viewBox="0 0 240 70" role="presentation" aria-hidden="true" focusable="false">' +
        '<g fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round">' +
          // Capô, teto e traseira: uma única linha contínua, como no Figma.
          '<path d="M10 40 C 22 38 30 30 46 22 C 70 10 104 4 138 6 C 172 8 202 18 226 32"></path>' +
          // Para-choque dianteiro arrematando a linha embaixo, à esquerda.
          '<path d="M10 40 C 4 42 2 47 8 49 C 14 51 22 50 28 47"></path>' +
        '</g>' +
        '<text x="42" y="60" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" ' +
              'font-size="26" font-weight="700" letter-spacing="2.5">Kaisen</text>' +
      '</svg>';
  },

  /**
   * Monta o cabeçalho e o insere no início do `<body>`.
   * @param {string} secaoAtual chave da seção (ex.: 'estoque')
   * @param {string} base caminho até a raiz ('' ou '../')
   */
  montarCabecalho(secaoAtual, base) {
    const titulo = this.TITULOS[secaoAtual];

    const links = this.SECOES.map((secao) => {
      // O link da própria página é marcado para leitores de tela e recebe a
      // cor laranja pelo seletor [aria-current] do CSS.
      const atual = secao.chave === secaoAtual ? ' aria-current="page"' : '';
      return '<a href="' + base + secao.href + '"' + atual + '>' + secao.texto + '</a>';
    }).join('');

    const cabecalho = document.createElement('header');
    cabecalho.className = 'cabecalho';
    cabecalho.innerHTML = '' +
      '<div class="cabecalho__conteudo">' +
        '<a class="marca" href="' + base + 'index.html">' +
          this.logotipo() +
          '<span class="apenas-leitor-tela">Kaisen — início</span>' +
        '</a>' +
        (titulo ? '<p class="cabecalho__secao">' + titulo + '</p>' : '') +
        '<nav class="navegacao" aria-label="Navegação principal">' +
          links +
          '<a class="navegacao__sair" href="' + base + 'pages/login.html">Sair</a>' +
        '</nav>' +
      '</div>';

    // O cabeçalho entra depois do link "pular para o conteúdo", e não no topo
    // absoluto: esse link precisa continuar sendo o primeiro elemento focável
    // da página, senão ele deixa de cumprir a função (RNF04).
    const pular = document.body.querySelector('.pular-para-conteudo');
    const referencia = pular ? pular.nextSibling : document.body.firstChild;

    document.body.insertBefore(cabecalho, referencia);
  },

  /**
   * Monta o rodapé e o acrescenta ao fim do `<body>`.
   * Não recebe o caminho da raiz porque o rodapé não tem mais link nenhum.
   */
  montarRodape() {
    const rodape = document.createElement('footer');
    rodape.className = 'rodape';
    rodape.innerHTML = '' +
      'Kaisen &middot; Projeto acadêmico de Engenharia de Software &middot; ' +
      'Gerenciador de Estoque';

    document.body.appendChild(rodape);
  },

  /**
   * Lê os dados do `<body>` e monta cabeçalho e rodapé.
   * Chamado automaticamente no fim deste arquivo.
   */
  iniciar() {
    const secao = document.body.dataset.secao || '';
    // Sem data-base, assume a raiz do projeto.
    const base = document.body.dataset.base || '';

    this.montarCabecalho(secao, base);
    this.montarRodape();
  }
};

// O cabeçalho é inserido antes do conteúdo, então precisa que o <body> já
// exista. Todas as páginas carregam os scripts no fim do body, mas o
// DOMContentLoaded deixa isso explícito e independente da ordem.
document.addEventListener('DOMContentLoaded', () => Layout.iniciar());
