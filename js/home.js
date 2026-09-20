/**
 * home.js — PÁGINA INICIAL (DASHBOARD)
 * ---------------------------------------------------------------------------
 * Responsabilidade: preencher a página inicial com os dados reais do estoque.
 * São duas coisas: os indicadores do topo e a faixa de últimos cadastros.
 *
 * Como as demais telas, este arquivo conhece o DOM e delega todo o cálculo
 * para `Estoque`, que não conhece tela nenhuma.
 *
 * Atende: RF15 (indicadores), RF16 (valor total), RF18 (recuperar os dados
 * salvos ao iniciar).
 */

const TelaHome = {
  // Quantos cartões a faixa "Últimos cadastros" mostra.
  QUANTIDADE_LANCAMENTOS: 3,

  el: {},

  iniciar() {
    this.el = {
      produtos: document.getElementById('indicador-produtos'),
      itens: document.getElementById('indicador-itens'),
      baixo: document.getElementById('indicador-baixo'),
      esgotados: document.getElementById('indicador-esgotados'),
      valor: document.getElementById('indicador-valor'),
      grade: document.getElementById('grade-lancamentos')
    };

    const produtos = Estoque.listarProdutos();

    this.mostrarIndicadores(produtos);
    this.mostrarLancamentos(produtos);
  },

  /**
   * Escreve os indicadores calculados a partir dos produtos salvos (RF15).
   * @param {Array<Object>} produtos
   */
  mostrarIndicadores(produtos) {
    const indicadores = Estoque.calcularIndicadores(produtos);

    this.el.produtos.textContent = indicadores.totalProdutos;
    this.el.itens.textContent = indicadores.totalItens;
    this.el.baixo.textContent = indicadores.estoqueBaixo;
    this.el.esgotados.textContent = indicadores.esgotados;
    this.el.valor.textContent = UI.formatarMoeda(indicadores.valorTotal);
  },

  /**
   * Monta os cartões das peças cadastradas mais recentemente.
   *
   * O id gerado por `Estoque.gerarId` começa pelo instante do cadastro em
   * base 36, então a ordem alfabética decrescente dos ids é a ordem do mais
   * novo para o mais antigo — sem precisar guardar uma data de cadastro que o
   * modelo de dados não tem.
   *
   * @param {Array<Object>} produtos
   */
  mostrarLancamentos(produtos) {
    if (produtos.length === 0) {
      this.el.grade.innerHTML =
        '<p class="estado-vazio">Nenhuma peça cadastrada ainda. ' +
        'Comece pelo <a href="pages/estoque.html">estoque</a>.</p>';
      return;
    }

    // slice() antes de sort(): sort ordena no lugar, e a lista recebida é a
    // mesma usada pelos indicadores.
    const recentes = produtos
      .slice()
      .sort((a, b) => String(b.id).localeCompare(String(a.id)))
      .slice(0, this.QUANTIDADE_LANCAMENTOS);

    this.el.grade.innerHTML = '';
    recentes.forEach((produto) => {
      this.el.grade.appendChild(this.criarCartao(produto));
    });
  },

  /**
   * Monta o cartão de uma peça: faixa de imagem, nome, preço e rodapé.
   * @param {Object} produto
   * @returns {HTMLAnchorElement}
   */
  criarCartao(produto) {
    const cartao = document.createElement('a');
    cartao.className = 'cartao-item';
    cartao.href = 'pages/estoque.html';

    // Sem fotografia das peças, a inicial do nome ocupa o lugar da imagem.
    const figura = document.createElement('figure');
    figura.className = 'cartao-item__figura';
    const inicial = document.createElement('span');
    inicial.className = 'cartao-item__inicial';
    inicial.setAttribute('aria-hidden', 'true');
    inicial.textContent = produto.nome.charAt(0).toUpperCase();
    figura.appendChild(inicial);

    const corpo = document.createElement('div');
    corpo.className = 'cartao-item__corpo';

    const nome = document.createElement('h3');
    nome.className = 'cartao-item__nome';
    nome.textContent = produto.nome;

    const preco = document.createElement('p');
    preco.className = 'cartao-item__preco';
    preco.textContent = UI.formatarMoeda(produto.preco);

    corpo.append(nome, preco);

    const rodape = document.createElement('p');
    rodape.className = 'cartao-item__rodape';
    rodape.innerHTML = 'Veja mais <span aria-hidden="true">&gt;</span>';

    cartao.append(figura, corpo, rodape);
    // Sem isto o leitor de tela ouviria só "Veja mais" em todos os cartões.
    cartao.setAttribute('aria-label', 'Veja mais sobre ' + produto.nome + ' no estoque');

    return cartao;
  }
};

document.addEventListener('DOMContentLoaded', () => TelaHome.iniciar());
