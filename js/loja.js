// Depende de importacao.js (Importacao.VEICULOS), que precisa vir antes no HTML.
const Loja = {
  ACESSORIOS: [
    { id: 'rodas', nome: 'Jogo de rodas forjadas 20”', descricao: 'Alumínio forjado, 4 rodas, mais leves que as originais.', preco: 28900, foto: '../assets/rodas.jpg' },
    { id: 'freios', nome: 'Kit de freio de cerâmica de carbono', descricao: 'Discos e pinças dianteiras, resistentes a altas temperaturas.', preco: 42500, foto: '../assets/freios.jpg' },
    { id: 'coilover', nome: 'Kit coilover regulável', descricao: 'Altura e carga ajustáveis nas quatro rodas.', preco: 9800, foto: '../assets/suspensao.jpg' },
    { id: 'turbina', nome: 'Turbina de alta vazão', descricao: 'Mais pressão e resposta para motores turbo.', preco: 12400, foto: '../assets/acessorios/turbina.jpg' },
    { id: 'intercooler', nome: 'Intercooler frontal', descricao: 'Resfria o ar do turbo e mantém a potência estável.', preco: 4600, foto: '../assets/acessorios/intercooler.jpg' },
    { id: 'escape', nome: 'Escape esportivo', descricao: 'Aço inox, ronco mais encorpado e menos restrição.', preco: 11200, foto: '../assets/acessorios/escape.jpg' },
    { id: 'banco', nome: 'Banco concha com cinto de 6 pontos', descricao: 'Mais firmeza nas curvas, com cinto de competição.', preco: 7900, foto: '../assets/acessorios/banco-concha.jpg' },
    { id: 'volante', nome: 'Volante esportivo 350 mm', descricao: 'Aro menor e camurça, com cubo de engate rápido.', preco: 1850, foto: '../assets/acessorios/volante.jpg' },
    { id: 'aerofolio', nome: 'Aerofólio traseiro', descricao: 'Mais pressão aerodinâmica na traseira em alta velocidade.', preco: 6300, foto: '../assets/acessorios/aerofolio.jpg' }
  ],

  produtos() {
    const veiculos = Object.entries(Importacao.VEICULOS).map(([id, carro]) => ({
      id, tipo: 'veiculo', nome: carro.nome, preco: carro.preco,
      descricao: 'Importado sob encomenda. Valor sem frete e impostos.',
      foto: '../assets/carros/' + id + '.jpg'
    }));
    return veiculos.concat(this.ACESSORIOS.map((item) => ({ ...item, tipo: 'acessorio' })));
  },

  adicionar(carrinho, produto, delta = 1) {
    const atual = carrinho.find((item) => item.id === produto.id);
    const maximo = produto.tipo === 'veiculo' ? 1 : 99;
    const quantidade = Math.min(maximo, (atual ? atual.quantidade : 0) + delta);
    const resto = carrinho.filter((item) => item.id !== produto.id);
    if (quantidade <= 0) return resto;
    const novo = { id: produto.id, tipo: produto.tipo, nome: produto.nome, preco: produto.preco, quantidade };
    return atual ? carrinho.map((item) => (item.id === produto.id ? novo : item)) : carrinho.concat(novo);
  },

  total(carrinho) {
    return carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  }
};

const listaLoja = typeof document !== 'undefined' && document.getElementById('lista-loja');

if (listaLoja) {
  const moeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const produtos = Loja.produtos();
  const porId = Object.fromEntries(produtos.map((p) => [p.id, p]));
  let carrinho = [];

  listaLoja.replaceChildren(...produtos.map((p) => {
    const li = document.createElement('li');
    li.className = 'produto';
    li.dataset.tipo = p.tipo;
    const veiculo = p.tipo === 'veiculo';
    li.innerHTML = `
      <div class="produto__foto">
        <img src="${p.foto}" alt="" loading="lazy">
        <span class="k-etiqueta${veiculo ? '' : ' k-etiqueta--escura'}">${veiculo ? 'Importado' : 'Acessório'}</span>
      </div>
      <div class="produto__corpo">
        <h2 class="produto__nome"></h2>
        <p class="produto__descricao"></p>
        <p class="produto__preco">${moeda(p.preco)}</p>
      </div>
      <div class="produto__acoes">
        ${veiculo ? `<a class="k-botao k-botao--escuro" href="importacao.html?veiculo=${p.id}">Simular importação</a>` : ''}
        <button type="button" class="k-botao" data-adicionar="${p.id}">${veiculo ? 'Reservar' : 'Adicionar ao carrinho'}</button>
      </div>`;
    // Textos com textContent: nada vindo dos dados é interpretado como HTML.
    li.querySelector('.produto__nome').textContent = p.nome;
    li.querySelector('.produto__descricao').textContent = p.descricao;
    li.querySelector('[data-adicionar]').setAttribute('aria-label', (veiculo ? 'Reservar ' : 'Adicionar ao carrinho: ') + p.nome);
    return li;
  }));

  const abas = document.querySelectorAll('.k-aba');
  abas.forEach((aba) => aba.addEventListener('click', () => {
    abas.forEach((a) => a.setAttribute('aria-pressed', String(a === aba)));
    listaLoja.querySelectorAll('.produto').forEach((li) => {
      li.hidden = aba.dataset.filtro !== '' && li.dataset.tipo !== aba.dataset.filtro;
    });
  }));

  const aviso = document.getElementById('aviso-carrinho');

  function desenharCarrinho() {
    const lista = document.getElementById('itens-carrinho');
    lista.replaceChildren(...carrinho.map((item) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="carrinho__nome"></span>
        <span class="carrinho__preco">${moeda(item.preco * item.quantidade)}</span>
        <span class="carrinho__qtd">
          <button type="button" data-mudar="${item.id}" data-delta="-1">−</button>
          <span>${item.quantidade}</span>
          <button type="button" data-mudar="${item.id}" data-delta="1"${item.tipo === 'veiculo' ? ' disabled title="Cada veículo é único"' : ''}>+</button>
        </span>`;
      li.querySelector('.carrinho__nome').textContent = item.nome;
      li.querySelector('[data-delta="-1"]').setAttribute('aria-label', 'Tirar uma unidade de ' + item.nome);
      li.querySelector('[data-delta="1"]').setAttribute('aria-label', 'Somar uma unidade de ' + item.nome);
      return li;
    }));

    const qtd = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
    document.getElementById('carrinho-vazio').hidden = carrinho.length > 0;
    document.getElementById('carrinho-total').textContent = moeda(Loja.total(carrinho));
    document.getElementById('carrinho-contagem').textContent = qtd ? '(' + qtd + ')' : '';
    document.getElementById('carrinho-veiculo').hidden = !carrinho.some((item) => item.tipo === 'veiculo');
  }

  document.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-adicionar], [data-mudar]');
    if (!botao) return;
    const produto = porId[botao.dataset.adicionar || botao.dataset.mudar];
    const delta = Number(botao.dataset.delta || 1);
    if (botao.dataset.adicionar && produto.tipo === 'veiculo' && carrinho.some((item) => item.id === produto.id)) {
      aviso.textContent = produto.nome + ' já está reservado no carrinho.';
    } else {
      aviso.textContent = botao.dataset.adicionar ? produto.nome + ' foi para o carrinho.' : '';
    }
    carrinho = Loja.adicionar(carrinho, produto, delta);
    desenharCarrinho();
  });

  document.getElementById('esvaziar-carrinho').addEventListener('click', () => {
    carrinho = [];
    aviso.textContent = '';
    desenharCarrinho();
  });

  document.getElementById('finalizar-pedido').addEventListener('click', () => {
    aviso.textContent = carrinho.length
      ? 'Demonstração: o pedido não foi enviado. Um consultor entraria em contato para combinar o pagamento.'
      : 'Seu carrinho está vazio.';
  });

  desenharCarrinho();
}
