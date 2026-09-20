/**
 * historico.js — TELA DE HISTÓRICO DE MOVIMENTAÇÕES
 * ---------------------------------------------------------------------------
 * Responsabilidade: mostrar as entradas e saídas registradas, com pesquisa por
 * peça, filtro por tipo e por período.
 *
 * Esta tela é só de leitura: ela não cadastra, não altera e não apaga nada.
 * O histórico é o registro do que aconteceu, e apagar um registro deixaria o
 * estoque atual sem explicação (RN07).
 *
 * Atende: RF13 (data e hora), RF14 (histórico disponível), UC07.
 */

const TelaHistorico = {
  // Quantas colunas a tabela tem, usada pela linha de estado vazio.
  COLUNAS_DA_TABELA: 4,

  // Quantos milissegundos tem um dia, para o filtro de período.
  MS_POR_DIA: 24 * 60 * 60 * 1000,

  el: {},

  // ==========================================================================
  // INICIALIZAÇÃO
  // ==========================================================================

  iniciar() {
    this.el = {
      filtroTexto: document.getElementById('filtro-texto'),
      filtroTipo: document.getElementById('filtro-tipo'),
      filtroPeriodo: document.getElementById('filtro-periodo'),
      corpo: document.getElementById('corpo-movimentacoes'),
      contador: document.getElementById('contador-movimentacoes')
    };

    this.preencherFiltroDeTipo();
    this.ligarEventos();
    this.renderizar();
  },

  /**
   * Monta as opções de tipo a partir de `Estoque.TIPOS`, para não repetir aqui
   * uma lista que já existe nas regras de negócio.
   */
  preencherFiltroDeTipo() {
    UI.preencherSelect(
      this.el.filtroTipo,
      [
        { valor: Estoque.TIPOS.ENTRADA, texto: 'Entradas' },
        { valor: Estoque.TIPOS.SAIDA, texto: 'Saídas' }
      ],
      'Entradas e saídas'
    );
  },

  ligarEventos() {
    this.el.filtroTexto.addEventListener('input', () => this.renderizar());
    this.el.filtroTipo.addEventListener('change', () => this.renderizar());
    this.el.filtroPeriodo.addEventListener('change', () => this.renderizar());
  },

  // ==========================================================================
  // FILTRO E LISTAGEM
  // ==========================================================================

  /**
   * Aplica os três filtros da tela sobre a lista de movimentações.
   *
   * A pesquisa reaproveita `Estoque.normalizarTexto`, a mesma usada na tela de
   * estoque: assim "suspensao" encontra "Amortecedor de Suspensão" aqui
   * também (RNF11).
   *
   * @param {Array<Object>} movimentacoes
   * @returns {Array<Object>}
   */
  filtrar(movimentacoes) {
    const busca = Estoque.normalizarTexto(this.el.filtroTexto.value).trim();
    const tipo = this.el.filtroTipo.value;
    const dias = Number(this.el.filtroPeriodo.value);

    // Calculado uma vez, fora do filtro: o limite é o mesmo para todos.
    const limite = dias > 0 ? Date.now() - (dias * this.MS_POR_DIA) : null;

    return movimentacoes.filter((item) => {
      if (busca !== '') {
        if (!Estoque.normalizarTexto(item.produtoNome).includes(busca)) return false;
      }
      if (tipo !== '' && item.tipo !== tipo) return false;
      if (limite !== null && new Date(item.data).getTime() < limite) return false;
      return true;
    });
  },

  /** Refaz a tabela a partir dos dados salvos e dos filtros atuais. */
  renderizar() {
    const todas = Estoque.listarMovimentacoes();
    const visiveis = this.filtrar(todas);

    this.el.contador.textContent =
      'Exibindo ' + visiveis.length + ' de ' + todas.length + ' movimentação(ões).';

    if (todas.length === 0) {
      UI.mostrarEstadoVazio(this.el.corpo, this.COLUNAS_DA_TABELA,
        'Nenhuma movimentação registrada. Elas aparecem aqui assim que houver uma entrada ou saída.');
      return;
    }

    if (visiveis.length === 0) {
      UI.mostrarEstadoVazio(this.el.corpo, this.COLUNAS_DA_TABELA,
        'Nenhuma movimentação encontrada com os filtros aplicados.');
      return;
    }

    this.el.corpo.innerHTML = '';
    visiveis.forEach((item) => {
      this.el.corpo.appendChild(this.criarLinha(item));
    });
  },

  /**
   * Monta a linha da tabela de uma movimentação.
   * @param {Object} movimentacao
   * @returns {HTMLTableRowElement}
   */
  criarLinha(movimentacao) {
    const linha = document.createElement('tr');
    const entrada = movimentacao.tipo === Estoque.TIPOS.ENTRADA;

    linha.appendChild(UI.criarCelula(UI.formatarDataHora(movimentacao.data)));
    linha.appendChild(UI.criarCelula(movimentacao.produtoNome));

    // O tipo é comunicado por texto além da cor, como as etiquetas de situação.
    const celulaTipo = document.createElement('td');
    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta ' + (entrada ? 'etiqueta--entrada' : 'etiqueta--saida');
    etiqueta.textContent = entrada ? 'Entrada' : 'Saída';
    celulaTipo.appendChild(etiqueta);
    linha.appendChild(celulaTipo);

    // O sinal deixa a leitura imediata em uma coluna só de números.
    linha.appendChild(UI.criarCelula(
      (entrada ? '+' : '−') + movimentacao.quantidade,
      'numero'
    ));

    return linha;
  }
};

document.addEventListener('DOMContentLoaded', () => TelaHistorico.iniciar());
