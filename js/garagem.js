// Módulo Garagem: o que está Esgotado ou Baixo, com quanto falta repor (Estoque.listarParaReposicao).
const TelaGaragem = {
  iniciar() {
    const itens = Estoque.listarParaReposicao();

    this.preencher(
      document.getElementById('lista-esgotados'),
      itens.filter((item) => item.status === Estoque.STATUS.ESGOTADO),
      'Nenhuma peça esgotada.'
    );
    this.preencher(
      document.getElementById('lista-baixos'),
      itens.filter((item) => item.status === Estoque.STATUS.BAIXO),
      'Nenhuma peça com estoque baixo.'
    );
  },

  preencher(lista, itens, textoVazio) {
    lista.replaceChildren();

    if (itens.length === 0) {
      const vazio = document.createElement('li');
      vazio.className = 'reposicao__vazio';
      vazio.textContent = textoVazio;
      lista.appendChild(vazio);
      return;
    }

    itens.forEach((item) => lista.appendChild(this.criarCartao(item)));
  },

  criarCartao(item) {
    const produto = item.produto;
    const cartao = document.createElement('li');
    cartao.className = 'k-cartao reposicao__cartao';

    const topo = document.createElement('p');
    topo.className = 'reposicao__topo';
    const codigo = document.createElement('span');
    codigo.className = 'codigo-peca';
    codigo.textContent = produto.codigo || '—';
    topo.append(codigo, UI.criarEtiquetaStatus(item.status));

    const nome = document.createElement('h3');
    nome.className = 'reposicao__nome';
    nome.textContent = produto.nome;

    const dados = document.createElement('dl');
    dados.className = 'reposicao__dados';
    [
      ['Em estoque', String(produto.quantidade)],
      ['Mínimo', String(produto.estoqueMinimo)],
      ['Repor', item.repor + ' un.'],
      ['Custo da reposição', UI.formatarMoeda(item.repor * produto.preco)]
    ].forEach(([rotulo, valor]) => {
      const linha = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = rotulo;
      dd.textContent = valor;
      linha.append(dt, dd);
      dados.appendChild(linha);
    });

    cartao.append(topo, nome, dados);
    return cartao;
  }
};

document.addEventListener('DOMContentLoaded', () => TelaGaragem.iniciar());
