// Dashboard (RF15, RF16). Só lê: os números saem de Estoque.calcularIndicadores.
const TelaHome = {
  ULTIMAS: 5,

  iniciar() {
    // Seção 1.8: o Dashboard é do Administrador. O Funcionário volta para o estoque.
    if (!Estoque.ehAdministrador(UI.perfilAtual())) {
      window.location.replace('produtos.html');
      return;
    }

    const indicadores = Estoque.calcularIndicadores();

    document.getElementById('ind-total-produtos').textContent = indicadores.totalProdutos;
    document.getElementById('ind-total-itens').textContent = indicadores.totalItens;
    document.getElementById('ind-estoque-baixo').textContent = indicadores.estoqueBaixo;
    document.getElementById('ind-esgotados').textContent = indicadores.esgotados;
    document.getElementById('ind-valor-total').textContent = UI.formatarMoeda(indicadores.valorTotal);

    const corpo = document.getElementById('corpo-ultimas');
    const ultimas = Estoque.listarMovimentacoes().slice(0, this.ULTIMAS);

    if (ultimas.length === 0) {
      UI.mostrarEstadoVazio(corpo, 4, 'Nenhuma movimentação registrada ainda.');
      return;
    }

    corpo.innerHTML = '';
    ultimas.forEach((movimentacao) => corpo.appendChild(UI.criarLinhaMovimentacao(movimentacao)));
  }
};

document.addEventListener('DOMContentLoaded', () => TelaHome.iniciar());
