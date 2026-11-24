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

    this.mostrarEquipe();

    const corpo = document.getElementById('corpo-ultimas');
    const ultimas = Estoque.listarMovimentacoes().slice(0, this.ULTIMAS);

    if (ultimas.length === 0) {
      UI.mostrarEstadoVazio(corpo, 4, 'Nenhuma movimentação registrada ainda.');
      return;
    }

    corpo.innerHTML = '';
    ultimas.forEach((movimentacao) => corpo.appendChild(UI.criarLinhaMovimentacao(movimentacao)));
  },

  // Vendas = saídas de estoque registradas pela conta.
  mostrarEquipe() {
    const corpo = document.getElementById('corpo-equipe');
    corpo.innerHTML = '';

    Estoque.desempenhoPorUsuario().forEach((item) => {
      const linha = document.createElement('tr');

      const nome = UI.criarCelula(item.nome);
      const perfil = document.createElement('span');
      perfil.className = 'celula-peca__fabricante';
      perfil.textContent = Estoque.ROTULOS_PERFIS[item.perfil];
      nome.appendChild(perfil);
      linha.appendChild(nome);

      [item.pecasCadastradas, item.entradas, item.vendas, item.unidadesVendidas].forEach((valor) => {
        linha.appendChild(UI.criarCelula(String(valor), 'numero'));
      });
      linha.appendChild(UI.criarCelula(UI.formatarMoeda(item.valorVendido), 'numero'));
      linha.appendChild(UI.criarCelula(String(item.carrosAdicionados), 'numero'));

      corpo.appendChild(linha);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => TelaHome.iniciar());
