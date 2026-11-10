// Histórico de movimentações (RF14). Ordem decrescente vem de Estoque.listarMovimentacoes.
const TelaHistorico = {
  el: {},

  iniciar() {
    this.el = {
      texto: document.getElementById('filtro-texto'),
      tipo: document.getElementById('filtro-tipo'),
      limpar: document.getElementById('botao-limpar'),
      contador: document.getElementById('contador'),
      corpo: document.getElementById('corpo-historico')
    };

    this.el.texto.addEventListener('input', () => this.renderizar());
    this.el.tipo.addEventListener('change', () => this.renderizar());
    this.el.limpar.addEventListener('click', () => {
      this.el.texto.value = '';
      this.el.tipo.value = '';
      this.renderizar();
      this.el.texto.focus();
    });

    this.renderizar();
  },

  renderizar() {
    const todas = Estoque.listarMovimentacoes();
    const visiveis = Estoque.filtrarMovimentacoes(todas, {
      texto: this.el.texto.value,
      tipo: this.el.tipo.value
    });

    this.el.contador.textContent = 'Exibindo ' + visiveis.length + ' de ' + todas.length + ' movimentação(ões).';

    if (visiveis.length === 0) {
      UI.mostrarEstadoVazio(this.el.corpo, 4, todas.length === 0
        ? 'Nenhuma movimentação registrada ainda.'
        : 'Nenhuma movimentação encontrada com os filtros aplicados.');
      return;
    }

    this.el.corpo.innerHTML = '';
    visiveis.forEach((movimentacao) => this.el.corpo.appendChild(UI.criarLinhaMovimentacao(movimentacao)));
  }
};

document.addEventListener('DOMContentLoaded', () => TelaHistorico.iniciar());
