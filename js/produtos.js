/**
 * produtos.js — TELA DE PEÇAS EM ESTOQUE
 * ---------------------------------------------------------------------------
 * Responsabilidade: ligar a tela `pages/produtos.html` às regras de negócio.
 * Este arquivo cuida do DOM (ler campos, montar a tabela, abrir janelas) e
 * delega toda decisão para `Estoque`, que por sua vez usa `Validacao` e
 * `Storage`.
 *
 * Atende: RF01 a RF12 na interface, RNF07 (feedback) e RNF06 (validação).
 */

const TelaProdutos = {
  // Referências aos elementos da página, preenchidas em iniciar().
  el: {},

  // Guarda qual produto está aguardando confirmação de exclusão.
  idParaExcluir: null,

  // Quantidade de colunas da tabela, usada pela linha de estado vazio.
  COLUNAS_DA_TABELA: 10,

  // Textos de ajuda do campo quantidade, que muda entre cadastro e edição (D2).
  AJUDA_QUANTIDADE_NOVA: 'Registrada como uma entrada de estoque no histórico.',
  AJUDA_QUANTIDADE_EDICAO: 'A quantidade só muda por entrada ou saída de estoque.',

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

    this.preencherFiltros();
    this.preencherCategoriasDoFormulario();
    this.ligarEventos();
    this.renderizar();
  },

  capturarElementos() {
    this.el = {
      // filtros e ações
      filtroTexto: document.getElementById('filtro-texto'),
      filtroCategoria: document.getElementById('filtro-categoria'),
      filtroStatus: document.getElementById('filtro-status'),
      botaoNovo: document.getElementById('botao-novo'),
      botaoLimpar: document.getElementById('botao-limpar'),

      // listagem
      corpoProdutos: document.getElementById('corpo-produtos'),
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

  /** Monta as opções dos filtros a partir das constantes do domínio. */
  preencherFiltros() {
    UI.preencherSelect(
      this.el.filtroCategoria,
      Estoque.CATEGORIAS.map((categoria) => ({ valor: categoria, texto: categoria })),
      'Todas as categorias'
    );

    UI.preencherSelect(
      this.el.filtroStatus,
      Object.keys(Estoque.STATUS).map((status) => ({
        valor: status,
        texto: Estoque.ROTULOS_STATUS[status]
      })),
      'Todas as situações'
    );
  },

  /** Monta as opções de categoria do formulário de produto. */
  preencherCategoriasDoFormulario() {
    UI.preencherSelect(
      this.el.categoriaProduto,
      Estoque.CATEGORIAS.map((categoria) => ({ valor: categoria, texto: categoria })),
      'Selecione...'
    );
  },

  ligarEventos() {
    // Pesquisa e filtros: a lista é refeita a cada digitação ou mudança.
    this.el.filtroTexto.addEventListener('input', () => this.renderizar());
    this.el.filtroCategoria.addEventListener('change', () => this.renderizar());
    this.el.filtroStatus.addEventListener('change', () => this.renderizar());

    this.el.botaoLimpar.addEventListener('click', () => this.limparFiltros());
    this.el.botaoNovo.addEventListener('click', () => this.abrirDialogProduto(null));

    // Um único ouvinte para a tabela inteira (delegação de eventos): as linhas
    // são criadas e destruídas o tempo todo, e assim não precisamos ligar um
    // ouvinte a cada botão criado.
    this.el.corpoProdutos.addEventListener('click', (evento) => this.tratarCliqueNaTabela(evento));

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
  // LISTAGEM (RF03, RF04, RF05, RF12)
  // ==========================================================================

  /** @returns {{texto: string, categoria: string, status: string}} */
  obterFiltros() {
    return {
      texto: this.el.filtroTexto.value,
      categoria: this.el.filtroCategoria.value,
      status: this.el.filtroStatus.value
    };
  },

  limparFiltros() {
    this.el.filtroTexto.value = '';
    this.el.filtroCategoria.value = '';
    this.el.filtroStatus.value = '';
    this.renderizar();
    this.el.filtroTexto.focus();
  },

  /** Refaz a tabela a partir dos dados salvos e dos filtros atuais. */
  renderizar() {
    const todos = Estoque.listarProdutos();
    const visiveis = Estoque.filtrarProdutos(todos, this.obterFiltros());

    this.el.contador.textContent = 'Exibindo ' + visiveis.length + ' de ' + todos.length + ' peça(s).';

    if (todos.length === 0) {
      UI.mostrarEstadoVazio(this.el.corpoProdutos, this.COLUNAS_DA_TABELA,
        'Nenhuma peça cadastrada. Clique em "Nova peça" para começar.');
      return;
    }

    if (visiveis.length === 0) {
      UI.mostrarEstadoVazio(this.el.corpoProdutos, this.COLUNAS_DA_TABELA,
        'Nenhuma peça encontrada com os filtros aplicados.');
      return;
    }

    this.el.corpoProdutos.innerHTML = '';
    visiveis.forEach((produto) => {
      this.el.corpoProdutos.appendChild(this.criarLinha(produto));
    });
  },

  /**
   * Monta a linha da tabela de um produto.
   * @param {Object} produto
   * @returns {HTMLTableRowElement}
   */
  criarLinha(produto) {
    const linha = document.createElement('tr');
    const status = Estoque.classificar(produto);

    linha.appendChild(UI.criarCelula(produto.codigo || '—', 'codigo-peca'));
    linha.appendChild(this.criarCelulaDaPeca(produto));
    linha.appendChild(UI.criarCelula(produto.aplicacao || '—'));
    linha.appendChild(UI.criarCelula(produto.categoria));
    linha.appendChild(UI.criarCelula(UI.formatarMoeda(produto.preco), 'numero'));
    linha.appendChild(UI.criarCelula(String(produto.quantidade), 'numero'));
    linha.appendChild(UI.criarCelula(String(produto.estoqueMinimo), 'numero'));

    const celulaStatus = document.createElement('td');
    celulaStatus.appendChild(UI.criarEtiquetaStatus(status));
    linha.appendChild(celulaStatus);

    linha.appendChild(UI.criarCelula(UI.formatarMoeda(Estoque.valorTotalProduto(produto)), 'numero'));
    linha.appendChild(this.criarCelulaDeAcoes(produto));

    return linha;
  },

  /**
   * Monta a célula que identifica a peça: o nome e, abaixo, o fabricante.
   * Os dois juntos em uma célula evitam mais uma coluna em uma tabela que já é
   * larga, sem esconder uma informação que o balconista usa para conferir o item.
   * @param {Object} produto
   * @returns {HTMLTableCellElement}
   */
  criarCelulaDaPeca(produto) {
    const celula = document.createElement('td');
    celula.textContent = produto.nome;

    const fabricante = document.createElement('span');
    fabricante.className = 'celula-peca__fabricante';
    fabricante.textContent = produto.fabricante || '—';
    celula.appendChild(fabricante);

    return celula;
  },

  /**
   * Monta os botões de ação da linha.
   * Cada botão guarda a ação e o id do produto em atributos `data-`, lidos
   * depois pela delegação de eventos.
   * @param {Object} produto
   * @returns {HTMLTableCellElement}
   */
  criarCelulaDeAcoes(produto) {
    const celula = document.createElement('td');
    celula.className = 'acoes';

    const acoes = [
      { acao: 'entrada', texto: 'Entrada', classe: 'botao botao--secundario botao--pequeno' },
      { acao: 'saida', texto: 'Saída', classe: 'botao botao--secundario botao--pequeno' },
      { acao: 'editar', texto: 'Editar', classe: 'botao botao--secundario botao--pequeno' },
      { acao: 'excluir', texto: 'Excluir', classe: 'botao botao--perigo botao--pequeno' }
    ];

    acoes.forEach((item) => {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = item.classe;
      botao.textContent = item.texto;
      botao.dataset.acao = item.acao;
      botao.dataset.id = produto.id;
      // Sem isto, um leitor de tela ouviria apenas "Editar" repetido em todas
      // as linhas, sem saber de qual peça se trata. O código entra junto porque
      // duas peças podem ter o mesmo nome e mudar só de aplicação.
      botao.setAttribute('aria-label', item.texto + ' ' + produto.nome + ' ' + (produto.codigo || ''));
      celula.appendChild(botao);
    });

    return celula;
  },

  /**
   * Descobre qual botão foi clicado na tabela e executa a ação correspondente.
   * @param {MouseEvent} evento
   */
  tratarCliqueNaTabela(evento) {
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
   * Abre a janela de produto.
   * @param {Object|null} produto null para cadastrar, o produto para editar
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
   * Trata o envio do formulário de produto.
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
document.addEventListener('DOMContentLoaded', () => TelaProdutos.iniciar());
