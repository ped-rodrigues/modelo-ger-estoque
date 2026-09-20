/**
 * garagem.js — TELA DA GARAGEM
 * ---------------------------------------------------------------------------
 * Responsabilidade: reunir em uma tela só as peças que exigem decisão — as
 * que estão abaixo do estoque mínimo e as que acabaram —, com um resumo em
 * números no alto.
 *
 * É uma tela de leitura: as ações de cadastro, movimentação e exclusão ficam
 * todas na tela de estoque, para existirem em um lugar só (RNF11). Daqui o
 * usuário é levado para lá.
 *
 * Atende: RF12 (classificação), RF15 e RF16 (indicadores), UC02.
 */

const TelaGaragem = {
  el: {},

  // ==========================================================================
  // INICIALIZAÇÃO
  // ==========================================================================

  iniciar() {
    this.el = {
      atencao: document.getElementById('destaque-atencao'),
      valor: document.getElementById('destaque-valor'),
      categorias: document.getElementById('destaque-categorias'),
      filtroTexto: document.getElementById('filtro-texto'),
      filtroSituacao: document.getElementById('filtro-situacao'),
      filtroOrdem: document.getElementById('filtro-ordem'),
      grade: document.getElementById('grade-garagem'),
      contador: document.getElementById('contador-garagem')
    };

    this.ligarEventos();
    this.mostrarDestaques();
    this.renderizar();
  },

  ligarEventos() {
    this.el.filtroTexto.addEventListener('input', () => this.renderizar());
    this.el.filtroSituacao.addEventListener('change', () => this.renderizar());
    this.el.filtroOrdem.addEventListener('change', () => this.renderizar());
  },

  // ==========================================================================
  // RESUMO
  // ==========================================================================

  /** Escreve os três números do alto da página. */
  mostrarDestaques() {
    const produtos = Estoque.listarProdutos();
    const indicadores = Estoque.calcularIndicadores(produtos);

    this.el.atencao.textContent = indicadores.estoqueBaixo + indicadores.esgotados;
    this.el.valor.textContent = UI.formatarMoeda(indicadores.valorTotal);

    // Set descarta as repetições: sobram as categorias realmente em uso.
    const emUso = new Set(produtos.map((produto) => produto.categoria));
    this.el.categorias.textContent = emUso.size;
  },

  // ==========================================================================
  // LISTAGEM
  // ==========================================================================

  /**
   * Aplica a pesquisa e o recorte de situação escolhido.
   * @param {Array<Object>} produtos
   * @returns {Array<Object>}
   */
  filtrar(produtos) {
    const situacao = this.el.filtroSituacao.value;

    // A pesquisa por texto é a mesma da tela de estoque (RNF11).
    const encontrados = Estoque.filtrarProdutos(produtos, {
      texto: this.el.filtroTexto.value
    });

    if (situacao === 'TODOS') return encontrados;

    return encontrados.filter((produto) => {
      const status = Estoque.classificar(produto);

      // "ATENCAO" junta os dois estados que pedem alguma providência.
      if (situacao === 'ATENCAO') {
        return status === Estoque.STATUS.BAIXO || status === Estoque.STATUS.ESGOTADO;
      }
      return status === situacao;
    });
  },

  /**
   * Ordena a lista conforme a escolha do usuário.
   * Devolve sempre um array novo: `sort` ordena no lugar e a lista recebida
   * também alimenta o resumo do topo.
   * @param {Array<Object>} produtos
   * @returns {Array<Object>}
   */
  ordenar(produtos) {
    const ordem = this.el.filtroOrdem.value;
    const lista = produtos.slice();

    if (ordem === 'QUANTIDADE') {
      return lista.sort((a, b) => a.quantidade - b.quantidade);
    }
    if (ordem === 'NOME') {
      return lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    }
    return lista.sort((a, b) =>
      Estoque.valorTotalProduto(b) - Estoque.valorTotalProduto(a));
  },

  renderizar() {
    const todos = Estoque.listarProdutos();
    const visiveis = this.ordenar(this.filtrar(todos));

    this.el.contador.textContent =
      'Exibindo ' + visiveis.length + ' de ' + todos.length + ' peça(s).';

    if (visiveis.length === 0) {
      this.el.grade.innerHTML = '<p class="estado-vazio">' +
        (todos.length === 0
          ? 'Nenhuma peça cadastrada ainda.'
          : 'Nenhuma peça encontrada com os filtros aplicados.') +
        '</p>';
      return;
    }

    this.el.grade.innerHTML = '';
    visiveis.forEach((produto) => {
      this.el.grade.appendChild(this.criarCartao(produto));
    });
  },

  /**
   * Monta o cartão de uma peça. É o mesmo cartão da home, com a etiqueta de
   * situação acrescentada e um rodapé que leva ao estoque.
   * @param {Object} produto
   * @returns {HTMLAnchorElement}
   */
  criarCartao(produto) {
    const status = Estoque.classificar(produto);

    const cartao = document.createElement('a');
    cartao.className = 'cartao-item';
    cartao.href = 'estoque.html';
    cartao.setAttribute('aria-label',
      'Abrir ' + produto.nome + ' no estoque. Situação: ' + Estoque.ROTULOS_STATUS[status] +
      '. Quantidade: ' + produto.quantidade + '.');

    const figura = document.createElement('figure');
    figura.className = 'cartao-item__figura peca__figura';

    const inicial = document.createElement('span');
    inicial.className = 'peca__inicial';
    inicial.setAttribute('aria-hidden', 'true');
    inicial.textContent = produto.nome.charAt(0).toUpperCase();

    const codigo = document.createElement('span');
    codigo.className = 'peca__codigo';
    codigo.textContent = produto.codigo || '—';

    const etiqueta = UI.criarEtiquetaStatus(status);
    etiqueta.classList.add('peca__etiqueta');

    figura.append(inicial, codigo, etiqueta);

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
    rodape.innerHTML =
      '<span>' + produto.quantidade + ' em estoque</span>' +
      '<span aria-hidden="true">&gt;</span>';

    cartao.append(figura, corpo, rodape);
    return cartao;
  }
};

document.addEventListener('DOMContentLoaded', () => TelaGaragem.iniciar());
