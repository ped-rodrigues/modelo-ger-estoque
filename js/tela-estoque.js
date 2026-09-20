/**
 * tela-estoque.js — TELA DE PEÇAS EM ESTOQUE
 * ---------------------------------------------------------------------------
 * Responsabilidade: ligar a tela `pages/estoque.html` às regras de negócio.
 * Este arquivo cuida do DOM (ler os filtros, montar os cartões, abrir as
 * janelas) e delega toda decisão para `Estoque`, que por sua vez usa
 * `Validacao` e `Storage`.
 *
 * Substitui o antigo `produtos.js`: a listagem deixou de ser uma tabela e
 * passou a ser a grade de cartões das telas de alta fidelidade. As regras de
 * negócio não mudaram — só a forma de mostrá-las.
 *
 * Atende: RF01 a RF12 na interface, RNF06 (validação), RNF07 (feedback).
 */

const TelaEstoque = {
  // Referências aos elementos da página, preenchidas em iniciar().
  el: {},

  // Guarda qual peça está aguardando confirmação de exclusão.
  idParaExcluir: null,

  /**
   * Filtros escolhidos no painel. Situação e categoria são de escolha única:
   * clicar na opção já marcada desmarca e volta a "todas".
   */
  filtros: {
    texto: '',
    categoria: '',
    status: ''
  },

  // Textos de ajuda do campo quantidade, que muda entre cadastro e edição (D2).
  AJUDA_QUANTIDADE_NOVA: 'Registrada como uma entrada de estoque no histórico.',
  AJUDA_QUANTIDADE_EDICAO: 'A quantidade só muda por entrada ou saída de estoque.',

  /**
   * Desenho de cada categoria, em traço simples.
   * A chave é a categoria de `Estoque.CATEGORIAS`; o valor é o miolo de um
   * <svg viewBox="0 0 24 24">. Uma categoria sem desenho cai no 'Outros'.
   */
  ICONES: {
    'Motor': '<circle cx="12" cy="12" r="3.2"></circle><path d="M12 4.2v3M12 16.8v3M4.2 12h3M16.8 12h3M6.5 6.5l2.1 2.1M15.4 15.4l2.1 2.1M17.5 6.5l-2.1 2.1M8.6 15.4l-2.1 2.1"></path>',
    'Freios': '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 4v5M12 15v5M4 12h5M15 12h5"></path>',
    'Suspensão e Direção': '<path d="M8 3v18M16 3v18"></path><path d="M8 7l8 3M8 11l8 3M8 15l8 3"></path>',
    'Transmissão': '<circle cx="9" cy="9" r="4"></circle><circle cx="16" cy="16" r="3"></circle><path d="M9 3v2M9 13v2M3 9h2M13 9h2"></path>',
    'Filtros': '<path d="M3 5h18l-7 8v6l-4 2v-8z"></path>',
    'Elétrica': '<path d="M13 2L5 14h6l-1 8 8-12h-6z"></path>',
    'Arrefecimento': '<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"></path><path d="M9 4l3 2 3-2M9 20l3-2 3 2"></path>',
    'Pneus e Rodas': '<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="3.5"></circle><path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21"></path>',
    'Lubrificantes e Fluidos': '<path d="M12 3c3.5 4.5 5.5 7.4 5.5 10a5.5 5.5 0 0 1-11 0C6.5 10.4 8.5 7.5 12 3z"></path>',
    'Acessórios': '<path d="M4 15l2-6h12l2 6"></path><path d="M3 15h18v4H3z"></path><circle cx="7.5" cy="19" r="1.6"></circle><circle cx="16.5" cy="19" r="1.6"></circle>',
    'Outros': '<rect x="4" y="7" width="16" height="12" rx="2"></rect><path d="M4 11h16M9 7V5h6v2"></path>'
  },

  // ==========================================================================
  // INICIALIZAÇÃO
  // ==========================================================================

  iniciar() {
    this.capturarElementos();

    // Se o navegador bloqueia o armazenamento, avisamos em vez de falhar em
    // silêncio a cada operação.
    if (!Storage.disponivel()) {
      UI.mostrarMensagem(
        this.el.mensagem,
        'Este navegador está bloqueando o armazenamento local. Os dados não serão salvos.',
        'erro'
      );
    }

    this.montarFichasDeSituacao();
    this.montarCategorias();
    this.preencherCategoriasDoFormulario();
    this.ligarEventos();
    this.renderizar();
  },

  capturarElementos() {
    this.el = {
      // painel de filtro
      painelCorpo: document.getElementById('painel-corpo'),
      botaoRecolher: document.getElementById('botao-recolher'),
      filtroTexto: document.getElementById('filtro-texto'),
      botaoLimparTexto: document.getElementById('botao-limpar-texto'),
      fichas: document.querySelector('.fichas'),
      categorias: document.getElementById('categorias'),
      contagemCategorias: document.getElementById('contagem-categorias'),
      contagemPecas: document.getElementById('contagem-pecas'),
      botaoNovo: document.getElementById('botao-novo'),
      botaoLimpar: document.getElementById('botao-limpar'),

      // listagem
      lista: document.getElementById('lista-pecas'),
      contador: document.getElementById('contador-produtos'),
      mensagem: document.getElementById('mensagem'),

      // janela de peça
      dialogProduto: document.getElementById('dialog-produto'),
      formProduto: document.getElementById('form-produto'),
      tituloDialogProduto: document.getElementById('titulo-dialog-produto'),
      campoQuantidade: document.getElementById('produto-quantidade'),
      ajudaQuantidade: document.getElementById('ajuda-produto-quantidade'),
      categoriaProduto: document.getElementById('produto-categoria'),

      // janela de movimentação
      dialogMovimentacao: document.getElementById('dialog-movimentacao'),
      formMovimentacao: document.getElementById('form-movimentacao'),
      tituloDialogMovimentacao: document.getElementById('titulo-dialog-movimentacao'),
      resumoMovimentacao: document.getElementById('movimentacao-resumo'),

      // janela de exclusão
      dialogExclusao: document.getElementById('dialog-exclusao'),
      resumoExclusao: document.getElementById('exclusao-resumo'),
      botaoConfirmarExclusao: document.getElementById('botao-confirmar-exclusao')
    };
  },

  // ==========================================================================
  // MONTAGEM DO PAINEL
  // ==========================================================================

  /**
   * Cria uma ficha por situação de estoque, a partir de `Estoque.STATUS`.
   * A lista não é repetida no HTML: ela já existe nas regras de negócio.
   */
  montarFichasDeSituacao() {
    Object.keys(Estoque.STATUS).forEach((status) => {
      const ficha = document.createElement('button');
      ficha.type = 'button';
      ficha.className = 'ficha';
      ficha.textContent = Estoque.ROTULOS_STATUS[status];
      ficha.dataset.status = status;
      // aria-pressed comunica o estado a quem usa leitor de tela; o CSS usa o
      // mesmo atributo para pintar a ficha ativa.
      ficha.setAttribute('aria-pressed', 'false');
      this.el.fichas.appendChild(ficha);
    });
  },

  /** Cria um azulejo por categoria, a partir de `Estoque.CATEGORIAS`. */
  montarCategorias() {
    Estoque.CATEGORIAS.forEach((categoria) => {
      const azulejo = document.createElement('button');
      azulejo.type = 'button';
      azulejo.className = 'categoria';
      azulejo.dataset.categoria = categoria;
      azulejo.setAttribute('aria-pressed', 'false');
      azulejo.innerHTML =
        '<svg class="categoria__icone" viewBox="0 0 24 24" role="presentation" ' +
        'aria-hidden="true" focusable="false">' +
        (this.ICONES[categoria] || this.ICONES['Outros']) +
        '</svg>' +
        '<span class="categoria__nome"></span>';

      // textContent (e não innerHTML) no nome: a categoria vem de uma lista
      // fixa, mas escrever texto como texto é o hábito certo.
      azulejo.querySelector('.categoria__nome').textContent = categoria;

      this.el.categorias.appendChild(azulejo);
    });

    this.el.contagemCategorias.textContent = 'Total (' + Estoque.CATEGORIAS.length + ')';
  },

  /** Monta as opções de categoria do formulário de peça. */
  preencherCategoriasDoFormulario() {
    UI.preencherSelect(
      this.el.categoriaProduto,
      Estoque.CATEGORIAS.map((categoria) => ({ valor: categoria, texto: categoria })),
      'Selecione...'
    );
  },

  ligarEventos() {
    // Pesquisa: a lista é refeita a cada digitação (RF04).
    this.el.filtroTexto.addEventListener('input', () => {
      this.filtros.texto = this.el.filtroTexto.value;
      this.el.botaoLimparTexto.hidden = this.filtros.texto === '';
      this.renderizar();
    });

    this.el.botaoLimparTexto.addEventListener('click', () => {
      this.el.filtroTexto.value = '';
      this.filtros.texto = '';
      this.el.botaoLimparTexto.hidden = true;
      this.renderizar();
      this.el.filtroTexto.focus();
    });

    // Um ouvinte por grupo (delegação de eventos): as fichas e os azulejos
    // são criados uma vez, mas o padrão vale para os cartões também.
    this.el.fichas.addEventListener('click', (evento) => this.aoClicarNaFicha(evento));
    this.el.categorias.addEventListener('click', (evento) => this.aoClicarNaCategoria(evento));

    this.el.botaoLimpar.addEventListener('click', () => this.limparFiltros());
    this.el.botaoNovo.addEventListener('click', () => this.abrirDialogProduto(null));
    this.el.botaoRecolher.addEventListener('click', () => this.alternarPainel());

    // O painel é um <form> só para agrupar os controles; ele nunca é enviado.
    document.getElementById('painel-filtro')
      .addEventListener('submit', (evento) => evento.preventDefault());

    // Um único ouvinte para a grade inteira: os cartões são criados e
    // destruídos o tempo todo, e assim não ligamos um ouvinte por botão.
    this.el.lista.addEventListener('click', (evento) => this.tratarCliqueNaLista(evento));

    this.el.formProduto.addEventListener('submit', (evento) => this.salvarProduto(evento));
    this.el.formMovimentacao.addEventListener('submit', (evento) => this.salvarMovimentacao(evento));
    this.el.botaoConfirmarExclusao.addEventListener('click', () => this.confirmarExclusao());

    // Todos os botões "Cancelar" das janelas.
    document.querySelectorAll('[data-fechar]').forEach((botao) => {
      botao.addEventListener('click', () => {
        document.getElementById(botao.dataset.fechar).close();
      });
    });
  },

  // ==========================================================================
  // FILTROS (RF04, RF05)
  // ==========================================================================

  /**
   * Marca ou desmarca uma situação. Clicar na que já está marcada volta a
   * mostrar todas — é o caminho mais curto para desfazer o filtro.
   * @param {MouseEvent} evento
   */
  aoClicarNaFicha(evento) {
    const ficha = evento.target.closest('.ficha');
    if (!ficha) return;

    const escolhido = ficha.dataset.status;
    this.filtros.status = this.filtros.status === escolhido ? '' : escolhido;

    this.el.fichas.querySelectorAll('.ficha').forEach((item) => {
      item.setAttribute('aria-pressed', String(item.dataset.status === this.filtros.status));
    });

    this.renderizar();
  },

  /**
   * Marca ou desmarca uma categoria, com a mesma regra das fichas.
   * @param {MouseEvent} evento
   */
  aoClicarNaCategoria(evento) {
    const azulejo = evento.target.closest('.categoria');
    if (!azulejo) return;

    const escolhida = azulejo.dataset.categoria;
    this.filtros.categoria = this.filtros.categoria === escolhida ? '' : escolhida;

    this.el.categorias.querySelectorAll('.categoria').forEach((item) => {
      item.setAttribute('aria-pressed', String(item.dataset.categoria === this.filtros.categoria));
    });

    this.renderizar();
  },

  limparFiltros() {
    this.filtros = { texto: '', categoria: '', status: '' };

    this.el.filtroTexto.value = '';
    this.el.botaoLimparTexto.hidden = true;

    this.el.fichas.querySelectorAll('.ficha')
      .forEach((item) => item.setAttribute('aria-pressed', 'false'));
    this.el.categorias.querySelectorAll('.categoria')
      .forEach((item) => item.setAttribute('aria-pressed', 'false'));

    this.renderizar();
    this.el.filtroTexto.focus();
  },

  /** Mostra ou esconde o corpo do painel, mantendo o rodapé sempre visível. */
  alternarPainel() {
    const escondido = this.el.painelCorpo.hidden;

    this.el.painelCorpo.hidden = !escondido;
    this.el.botaoRecolher.setAttribute('aria-expanded', String(escondido));
    this.el.botaoRecolher.innerHTML = escondido ? '&times;' : '+';
    this.el.botaoRecolher.setAttribute(
      'aria-label',
      escondido ? 'Recolher o painel de filtro' : 'Expandir o painel de filtro'
    );
  },

  // ==========================================================================
  // LISTAGEM (RF03, RF04, RF05, RF12)
  // ==========================================================================

  /** Refaz a grade a partir dos dados salvos e dos filtros atuais. */
  renderizar() {
    const todos = Estoque.listarProdutos();
    const visiveis = Estoque.filtrarProdutos(todos, this.filtros);

    this.el.contador.textContent =
      'Exibindo ' + visiveis.length + ' de ' + todos.length + ' peça(s).';
    this.el.contagemPecas.textContent = visiveis.length;

    if (todos.length === 0) {
      this.mostrarEstadoVazio(
        'Nenhuma peça cadastrada. Use o botão + do painel para cadastrar a primeira.'
      );
      return;
    }

    if (visiveis.length === 0) {
      this.mostrarEstadoVazio('Nenhuma peça encontrada com os filtros aplicados.');
      return;
    }

    this.el.lista.innerHTML = '';
    visiveis.forEach((produto) => {
      this.el.lista.appendChild(this.criarCartao(produto));
    });
  },

  /**
   * Substitui a grade por uma única mensagem centralizada.
   * @param {string} texto
   */
  mostrarEstadoVazio(texto) {
    this.el.lista.innerHTML = '';

    const aviso = document.createElement('p');
    aviso.className = 'estado-vazio';
    aviso.textContent = texto;

    this.el.lista.appendChild(aviso);
  },

  /**
   * Monta o cartão de uma peça.
   * @param {Object} produto
   * @returns {HTMLElement}
   */
  criarCartao(produto) {
    const status = Estoque.classificar(produto);

    const cartao = document.createElement('article');
    cartao.className = 'peca';

    cartao.appendChild(this.criarFigura(produto, status));
    cartao.appendChild(this.criarCorpo(produto));

    return cartao;
  },

  /**
   * Faixa superior do cartão: código, etiqueta de situação e a inicial da peça
   * no lugar da fotografia, que o sistema não guarda.
   * @param {Object} produto
   * @param {string} status
   * @returns {HTMLElement}
   */
  criarFigura(produto, status) {
    const figura = document.createElement('figure');
    figura.className = 'peca__figura';

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
    return figura;
  },

  /**
   * Corpo do cartão: nome, fabricante, preço, números e botões de ação.
   * @param {Object} produto
   * @returns {HTMLElement}
   */
  criarCorpo(produto) {
    const corpo = document.createElement('div');
    corpo.className = 'peca__corpo';

    const nome = document.createElement('h3');
    nome.className = 'peca__nome';
    nome.textContent = produto.nome;

    const fabricante = document.createElement('span');
    fabricante.className = 'peca__fabricante';
    // A aplicação entra junto do fabricante: é o que o balconista usa para
    // conferir se a peça serve no carro do cliente.
    fabricante.textContent = (produto.fabricante || '—') +
      (produto.aplicacao ? ' · ' + produto.aplicacao : '');
    nome.appendChild(fabricante);

    const preco = document.createElement('p');
    preco.className = 'peca__preco';
    preco.textContent = UI.formatarMoeda(produto.preco);

    corpo.append(nome, preco, this.criarDados(produto), this.criarAcoes(produto));
    return corpo;
  },

  /**
   * Lista de definição com quantidade, estoque mínimo e valor total (RF16).
   * @param {Object} produto
   * @returns {HTMLElement}
   */
  criarDados(produto) {
    const dados = document.createElement('dl');
    dados.className = 'peca__dados';

    const itens = [
      { rotulo: 'Qtd.', valor: String(produto.quantidade) },
      { rotulo: 'Mínimo', valor: String(produto.estoqueMinimo) },
      { rotulo: 'Total', valor: UI.formatarMoeda(Estoque.valorTotalProduto(produto)) }
    ];

    itens.forEach((item) => {
      const bloco = document.createElement('div');
      const termo = document.createElement('dt');
      termo.textContent = item.rotulo;
      const valor = document.createElement('dd');
      valor.textContent = item.valor;
      bloco.append(termo, valor);
      dados.appendChild(bloco);
    });

    return dados;
  },

  /**
   * Botões de ação do cartão.
   * Cada botão guarda a ação e o id da peça em atributos `data-`, lidos depois
   * pela delegação de eventos.
   * @param {Object} produto
   * @returns {HTMLElement}
   */
  criarAcoes(produto) {
    const acoes = document.createElement('div');
    acoes.className = 'peca__acoes';

    const botoes = [
      { acao: 'entrada', texto: 'Entrada', classe: 'botao botao--secundario botao--pequeno' },
      { acao: 'saida', texto: 'Saída', classe: 'botao botao--secundario botao--pequeno' },
      { acao: 'editar', texto: 'Editar', classe: 'botao botao--secundario botao--pequeno' },
      { acao: 'excluir', texto: 'Excluir', classe: 'botao botao--perigo botao--pequeno' }
    ];

    botoes.forEach((item) => {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = item.classe;
      botao.textContent = item.texto;
      botao.dataset.acao = item.acao;
      botao.dataset.id = produto.id;
      // Sem isto, um leitor de tela ouviria apenas "Editar" repetido em todos
      // os cartões, sem saber de qual peça se trata. O código entra junto
      // porque duas peças podem ter o mesmo nome e mudar só de aplicação.
      botao.setAttribute('aria-label',
        item.texto + ' ' + produto.nome + ' ' + (produto.codigo || ''));
      acoes.appendChild(botao);
    });

    return acoes;
  },

  /**
   * Descobre qual botão foi clicado na grade e executa a ação correspondente.
   * @param {MouseEvent} evento
   */
  tratarCliqueNaLista(evento) {
    const botao = evento.target.closest('button[data-acao]');
    if (!botao) return;

    const produto = Estoque.obterProduto(botao.dataset.id);
    if (!produto) {
      UI.mostrarMensagem(this.el.mensagem, 'Peça não encontrada. A lista será atualizada.', 'erro');
      this.renderizar();
      return;
    }

    if (botao.dataset.acao === 'editar') this.abrirDialogProduto(produto);
    if (botao.dataset.acao === 'excluir') this.abrirDialogExclusao(produto);
    if (botao.dataset.acao === 'entrada') this.abrirDialogMovimentacao(produto, Estoque.TIPOS.ENTRADA);
    if (botao.dataset.acao === 'saida') this.abrirDialogMovimentacao(produto, Estoque.TIPOS.SAIDA);
  },

  // ==========================================================================
  // CADASTRO E EDIÇÃO (RF01, RF06)
  // ==========================================================================

  /**
   * Abre a janela de peça.
   * @param {Object|null} produto null para cadastrar, a peça para editar
   */
  abrirDialogProduto(produto) {
    const form = this.el.formProduto;
    form.reset();
    UI.limparErros(form);
    UI.limparMensagem(this.el.mensagem);

    if (produto === null) {
      this.el.tituloDialogProduto.textContent = 'Nova peça';
      form.elements.id.value = '';
      this.el.campoQuantidade.disabled = false;
      this.el.ajudaQuantidade.textContent = this.AJUDA_QUANTIDADE_NOVA;
    } else {
      this.el.tituloDialogProduto.textContent = 'Editar peça';
      form.elements.id.value = produto.id;
      form.elements.codigo.value = produto.codigo || '';
      form.elements.nome.value = produto.nome;
      form.elements.fabricante.value = produto.fabricante || '';
      form.elements.aplicacao.value = produto.aplicacao || '';
      form.elements.categoria.value = produto.categoria;
      // toFixed(2) garante "199,90" em vez de "199,9" no campo de edição.
      form.elements.preco.value = produto.preco.toFixed(2).replace('.', ',');
      this.el.campoQuantidade.value = produto.quantidade;
      form.elements.estoqueMinimo.value = produto.estoqueMinimo;

      // Decisão D2: na edição a quantidade é apenas informativa.
      this.el.campoQuantidade.disabled = true;
      this.el.ajudaQuantidade.textContent = this.AJUDA_QUANTIDADE_EDICAO;
    }

    this.el.dialogProduto.showModal();
    form.elements.codigo.focus();
  },

  /**
   * Trata o envio do formulário de peça.
   * @param {SubmitEvent} evento
   */
  salvarProduto(evento) {
    evento.preventDefault();

    const form = this.el.formProduto;
    const id = form.elements.id.value;

    const dados = {
      codigo: form.elements.codigo.value,
      nome: form.elements.nome.value,
      fabricante: form.elements.fabricante.value,
      aplicacao: form.elements.aplicacao.value,
      categoria: form.elements.categoria.value,
      preco: form.elements.preco.value,
      estoqueMinimo: form.elements.estoqueMinimo.value
    };

    // Na edição o campo está desabilitado e a quantidade nem é enviada (D2).
    if (id === '') {
      dados.quantidade = this.el.campoQuantidade.value;
    }

    const resultado = id === ''
      ? Estoque.cadastrarProduto(dados)
      : Estoque.editarProduto(id, dados);

    if (!resultado.ok) {
      UI.mostrarErros(form, resultado.erros);
      return;
    }

    this.el.dialogProduto.close();
    this.renderizar();

    const identificacao = resultado.produto.codigo + ' — ' + resultado.produto.nome;

    UI.mostrarMensagem(
      this.el.mensagem,
      id === ''
        ? 'Peça "' + identificacao + '" cadastrada com sucesso.'
        : 'Peça "' + identificacao + '" atualizada com sucesso.',
      'sucesso'
    );
  },

  // ==========================================================================
  // MOVIMENTAÇÕES (RF08, RF09, RF11)
  // ==========================================================================

  /**
   * Abre a janela de entrada ou saída de estoque.
   * @param {Object} produto
   * @param {string} tipo Estoque.TIPOS.ENTRADA ou Estoque.TIPOS.SAIDA
   */
  abrirDialogMovimentacao(produto, tipo) {
    const form = this.el.formMovimentacao;
    form.reset();
    UI.limparErros(form);
    UI.limparMensagem(this.el.mensagem);

    const entrada = tipo === Estoque.TIPOS.ENTRADA;

    this.el.tituloDialogMovimentacao.textContent = entrada ? 'Registrar entrada' : 'Registrar saída';
    this.el.resumoMovimentacao.textContent =
      (produto.codigo ? produto.codigo + ' — ' : '') + produto.nome +
      ' — estoque atual: ' + produto.quantidade + ' unidade(s).';

    form.elements.produtoId.value = produto.id;
    form.elements.tipo.value = tipo;

    this.el.dialogMovimentacao.showModal();
    form.elements.quantidade.focus();
  },

  /**
   * Trata o envio do formulário de movimentação.
   * @param {SubmitEvent} evento
   */
  salvarMovimentacao(evento) {
    evento.preventDefault();

    const form = this.el.formMovimentacao;
    const resultado = Estoque.registrarMovimentacao(
      form.elements.produtoId.value,
      form.elements.tipo.value,
      form.elements.quantidade.value
    );

    if (!resultado.ok) {
      // A operação devolve uma única mensagem; ela é exibida no campo
      // quantidade, que é onde o usuário pode corrigir o problema.
      UI.mostrarErros(form, { quantidade: resultado.erro });
      return;
    }

    const entrada = resultado.movimentacao.tipo === Estoque.TIPOS.ENTRADA;

    this.el.dialogMovimentacao.close();
    this.renderizar();

    UI.mostrarMensagem(
      this.el.mensagem,
      (entrada ? 'Entrada' : 'Saída') + ' de ' + resultado.movimentacao.quantidade +
      ' unidade(s) registrada em "' + resultado.movimentacao.produtoNome +
      '". Estoque atual: ' + resultado.produto.quantidade + '.',
      'sucesso'
    );
  },

  // ==========================================================================
  // EXCLUSÃO (RF07)
  // ==========================================================================

  /**
   * Pede confirmação antes de excluir (usabilidade: ação irreversível).
   * @param {Object} produto
   */
  abrirDialogExclusao(produto) {
    UI.limparMensagem(this.el.mensagem);

    this.idParaExcluir = produto.id;
    this.el.resumoExclusao.textContent =
      'Deseja realmente excluir a peça "' + (produto.codigo ? produto.codigo + ' — ' : '') +
      produto.nome + '"? Esta ação não pode ser desfeita.';

    this.el.dialogExclusao.showModal();
    this.el.botaoConfirmarExclusao.focus();
  },

  confirmarExclusao() {
    const produto = Estoque.obterProduto(this.idParaExcluir);
    const resultado = Estoque.excluirProduto(this.idParaExcluir);

    this.el.dialogExclusao.close();
    this.idParaExcluir = null;
    this.renderizar();

    if (!resultado.ok) {
      UI.mostrarMensagem(this.el.mensagem, resultado.erro, 'erro');
      return;
    }

    UI.mostrarMensagem(
      this.el.mensagem,
      'Peça "' + produto.nome + '" excluída. As movimentações continuam no histórico.',
      'sucesso'
    );
  }
};

// A tela só pode ser montada depois que o HTML existir na página.
document.addEventListener('DOMContentLoaded', () => TelaEstoque.iniciar());
