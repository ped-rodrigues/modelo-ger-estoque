/**
 * estoque.js — NÚCLEO DO SISTEMA (regras de negócio)
 * ---------------------------------------------------------------------------
 * Responsabilidade: aplicar as regras de negócio do estoque de peças
 * automotivas e coordenar as operações (cadastrar, editar, excluir, movimentar).
 *
 * Este arquivo NÃO acessa o DOM: ele não sabe que existe uma tela.
 * Ele usa `Storage` para persistir e `Validacao` para validar.
 *
 * Padrão de retorno das operações:
 *   - Formulários de produto: { ok: boolean, erros: { campo: mensagem }, produto }
 *   - Demais operações:       { ok: boolean, erro: string|null, ... }
 *
 * Atende: RF01, RF02, RF06 a RF16, RF19 a RF21, RN01 a RN10.
 */

const Estoque = {
  // Lista fixa de categorias de peças automotivas (decisão D4: campo controlado,
  // sem entidade própria; decisão D6: domínio de autopeças).
  CATEGORIAS: [
    'Motor',
    'Freios',
    'Suspensão e Direção',
    'Transmissão',
    'Filtros',
    'Elétrica',
    'Arrefecimento',
    'Pneus e Rodas',
    'Lubrificantes e Fluidos',
    'Acessórios',
    'Outros'
  ],

  // Situações possíveis do estoque de um produto (RF12).
  STATUS: {
    NORMAL: 'NORMAL',
    BAIXO: 'BAIXO',
    ESGOTADO: 'ESGOTADO'
  },

  // Texto exibido na tela para cada situação.
  ROTULOS_STATUS: {
    NORMAL: 'Normal',
    BAIXO: 'Baixo',
    ESGOTADO: 'Esgotado'
  },

  // Tipos de movimentação.
  TIPOS: {
    ENTRADA: 'ENTRADA',
    SAIDA: 'SAIDA'
  },

  // ==========================================================================
  // 1. FUNÇÕES PURAS (não leem nem gravam nada; apenas calculam)
  // ==========================================================================

  /**
   * Gera um identificador único simples (RF02).
   * Combina o instante atual com um trecho aleatório, em base 36.
   * Exemplo: "p_m0x3k1a_7f2qd"
   * @param {string} prefixo "p" para produto, "m" para movimentação
   * @returns {string}
   */
  gerarId(prefixo) {
    const tempo = Date.now().toString(36);
    const aleatorio = Math.random().toString(36).slice(2, 7);
    return prefixo + '_' + tempo + '_' + aleatorio;
  },

  /**
   * Classifica a situação do estoque de um produto (RF12).
   * RN03: quantidade igual a 0                     -> ESGOTADO
   * RN04: quantidade entre 1 e o estoque mínimo    -> BAIXO
   * RN05: quantidade acima do estoque mínimo       -> NORMAL
   * @param {Object} produto
   * @returns {string} um dos valores de Estoque.STATUS
   */
  classificar(produto) {
    if (produto.quantidade === 0) return this.STATUS.ESGOTADO;
    if (produto.quantidade <= produto.estoqueMinimo) return this.STATUS.BAIXO;
    return this.STATUS.NORMAL;
  },

  /**
   * Valor total em estoque de um produto (RN06): preço vezes quantidade.
   * @param {Object} produto
   * @returns {number}
   */
  valorTotalProduto(produto) {
    return produto.preco * produto.quantidade;
  },

  /**
   * Calcula os indicadores exibidos no dashboard (RF15 e RF16).
   * @param {Array<Object>} [produtos] se omitido, usa os produtos salvos
   * @returns {{ totalProdutos: number, totalItens: number,
   *             estoqueBaixo: number, esgotados: number, valorTotal: number }}
   */
  calcularIndicadores(produtos) {
    const lista = produtos || this.listarProdutos();

    const indicadores = {
      totalProdutos: lista.length,
      totalItens: 0,
      estoqueBaixo: 0,
      esgotados: 0,
      valorTotal: 0
    };

    lista.forEach((produto) => {
      indicadores.totalItens += produto.quantidade;
      indicadores.valorTotal += this.valorTotalProduto(produto);

      const status = this.classificar(produto);
      if (status === this.STATUS.BAIXO) indicadores.estoqueBaixo += 1;
      if (status === this.STATUS.ESGOTADO) indicadores.esgotados += 1;
    });

    return indicadores;
  },

  /**
   * Deixa o texto em minúsculas e sem acentos, para a pesquisa funcionar mesmo
   * quando o usuário digita "suspensao" e a peça é "Amortecedor de Suspensão".
   * O intervalo ̀-ͯ corresponde aos sinais de acentuação que o método
   * normalize('NFD') separa das letras.
   * @param {string} texto
   * @returns {string}
   */
  normalizarTexto(texto) {
    return String(texto)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  },

  /**
   * Aplica pesquisa e filtros sobre uma lista de produtos (RF04 e RF05).
   *
   * A pesquisa por texto olha o nome da peça E o código da peça: no balcão de
   * uma autopeça o item costuma ser procurado pelo código impresso na
   * embalagem, e não pelo nome.
   *
   * @param {Array<Object>} produtos
   * @param {{ texto?: string, categoria?: string, status?: string }} filtros
   * @returns {Array<Object>}
   */
  filtrarProdutos(produtos, filtros) {
    const criterios = filtros || {};
    const busca = this.normalizarTexto(criterios.texto || '').trim();

    return produtos.filter((produto) => {
      if (busca !== '') {
        const alvo = this.normalizarTexto(produto.nome + ' ' + (produto.codigo || ''));
        if (!alvo.includes(busca)) return false;
      }
      if (criterios.categoria && produto.categoria !== criterios.categoria) {
        return false;
      }
      if (criterios.status && this.classificar(produto) !== criterios.status) {
        return false;
      }
      return true;
    });
  },

  // ==========================================================================
  // 2. CONSULTAS (leem do Storage)
  // ==========================================================================

  /** @returns {Array<Object>} todos os produtos (RF03, RF18) */
  listarProdutos() {
    return Storage.carregarProdutos();
  },

  /**
   * @param {string} id
   * @returns {Object|null} o produto ou null se não existir
   */
  obterProduto(id) {
    const produto = this.listarProdutos().find((item) => item.id === id);
    return produto || null;
  },

  /**
   * Diz se algum produto já usa o código de peça informado (RN10).
   *
   * A checagem fica aqui, e não em `validacao.js`, porque depende dos produtos
   * já cadastrados — e as funções de validação são puras, sem acesso aos dados.
   *
   * @param {string} codigo código já normalizado pela validação
   * @param {string|null} [idIgnorado] id do produto em edição, que não conta como conflito
   * @returns {boolean}
   */
  codigoEmUso(codigo, idIgnorado) {
    return this.listarProdutos().some(
      (produto) => produto.id !== idIgnorado && produto.codigo === codigo
    );
  },

  /**
   * @returns {Array<Object>} movimentações da mais recente para a mais antiga (RF14)
   */
  listarMovimentacoes() {
    const movimentacoes = Storage.carregarMovimentacoes();
    return movimentacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
  },

  /**
   * @param {string} produtoId
   * @returns {Array<Object>} movimentações de um produto específico
   */
  listarMovimentacoesDoProduto(produtoId) {
    return this.listarMovimentacoes().filter((item) => item.produtoId === produtoId);
  },

  // ==========================================================================
  // 3. OPERAÇÕES (validam, alteram e salvam)
  // ==========================================================================

  /**
   * Cadastra um produto (RF01, RF02).
   *
   * Decisão D2 do projeto: se a quantidade inicial for maior que zero, ela entra
   * no sistema como uma movimentação de ENTRADA. Assim o histórico sempre
   * explica o estoque atual (RN07).
   *
   * @param {Object} dados { codigo, nome, fabricante, aplicacao, categoria,
   *                          preco, quantidade, estoqueMinimo }
   * @returns {{ ok: boolean, erros: Object, produto: Object|null }}
   */
  cadastrarProduto(dados) {
    const resultado = Validacao.validarProduto(dados);
    if (!resultado.valido) {
      return { ok: false, erros: resultado.erros, produto: null };
    }

    // RN10: o código identifica a peça no catálogo e não pode se repetir.
    if (this.codigoEmUso(resultado.produto.codigo, null)) {
      return {
        ok: false,
        erros: { codigo: 'Já existe uma peça cadastrada com este código.' },
        produto: null
      };
    }

    const quantidadeInicial = resultado.produto.quantidade;

    // O produto nasce com quantidade 0; a carga inicial vira uma ENTRADA.
    const novoProduto = {
      id: this.gerarId('p'),
      codigo: resultado.produto.codigo,
      nome: resultado.produto.nome,
      fabricante: resultado.produto.fabricante,
      aplicacao: resultado.produto.aplicacao,
      categoria: resultado.produto.categoria,
      preco: resultado.produto.preco,
      quantidade: 0,
      estoqueMinimo: resultado.produto.estoqueMinimo
    };

    const produtos = this.listarProdutos();
    produtos.push(novoProduto);
    Storage.salvarProdutos(produtos);

    if (quantidadeInicial > 0) {
      this.registrarEntrada(novoProduto.id, quantidadeInicial);
    }

    return { ok: true, erros: {}, produto: this.obterProduto(novoProduto.id) };
  },

  /**
   * Edita os dados cadastrais de um produto (RF06).
   * A quantidade NÃO é alterada aqui (decisão D2): ela só muda por meio de uma
   * movimentação de entrada ou saída.
   *
   * @param {string} id
   * @param {Object} dados { codigo, nome, fabricante, aplicacao, categoria,
   *                         preco, estoqueMinimo }
   * @returns {{ ok: boolean, erros: Object, produto: Object|null }}
   */
  editarProduto(id, dados) {
    const produtos = this.listarProdutos();
    const indice = produtos.findIndex((item) => item.id === id);

    if (indice === -1) {
      return { ok: false, erros: { geral: 'Produto não encontrado.' }, produto: null };
    }

    // Monta os dados a validar SEM a quantidade, garantindo a regra D2 mesmo que
    // a tela envie o campo por engano.
    const resultado = Validacao.validarProduto({
      codigo: dados.codigo,
      nome: dados.nome,
      fabricante: dados.fabricante,
      aplicacao: dados.aplicacao,
      categoria: dados.categoria,
      preco: dados.preco,
      estoqueMinimo: dados.estoqueMinimo
    });

    if (!resultado.valido) {
      return { ok: false, erros: resultado.erros, produto: null };
    }

    // RN10: o código continua único; o próprio produto editado não conta.
    if (this.codigoEmUso(resultado.produto.codigo, id)) {
      return {
        ok: false,
        erros: { codigo: 'Já existe outra peça cadastrada com este código.' },
        produto: null
      };
    }

    produtos[indice] = {
      id: produtos[indice].id,
      codigo: resultado.produto.codigo,
      nome: resultado.produto.nome,
      fabricante: resultado.produto.fabricante,
      aplicacao: resultado.produto.aplicacao,
      categoria: resultado.produto.categoria,
      preco: resultado.produto.preco,
      quantidade: produtos[indice].quantidade, // preservada
      estoqueMinimo: resultado.produto.estoqueMinimo
    };

    Storage.salvarProdutos(produtos);
    return { ok: true, erros: {}, produto: produtos[indice] };
  },

  /**
   * Exclui um produto (RF07).
   *
   * Decisão D3 do projeto: as movimentações do produto são MANTIDAS no
   * histórico. O histórico é o registro do que aconteceu e não deve ser
   * reescrito. Por isso cada movimentação guarda o nome do produto na
   * propriedade `produtoNome`.
   *
   * A confirmação com o usuário é responsabilidade da tela, não desta função.
   *
   * @param {string} id
   * @returns {{ ok: boolean, erro: string|null }}
   */
  excluirProduto(id) {
    const produtos = this.listarProdutos();
    const restantes = produtos.filter((item) => item.id !== id);

    if (restantes.length === produtos.length) {
      return { ok: false, erro: 'Produto não encontrado.' };
    }

    Storage.salvarProdutos(restantes);
    return { ok: true, erro: null };
  },

  /**
   * Registra uma movimentação de estoque (RF08, RF09, RF10, RF13, RN07).
   *
   * @param {string} produtoId
   * @param {string} tipo Estoque.TIPOS.ENTRADA ou Estoque.TIPOS.SAIDA
   * @param {*} quantidadeInformada valor vindo do formulário
   * @returns {{ ok: boolean, erro: string|null, produto: Object|null, movimentacao: Object|null }}
   */
  registrarMovimentacao(produtoId, tipo, quantidadeInformada) {
    if (tipo !== this.TIPOS.ENTRADA && tipo !== this.TIPOS.SAIDA) {
      return { ok: false, erro: 'Tipo de movimentação inválido.', produto: null, movimentacao: null };
    }

    const validacao = Validacao.validarQuantidadeMovimentacao(quantidadeInformada);
    if (!validacao.valido) {
      return { ok: false, erro: validacao.erro, produto: null, movimentacao: null };
    }

    const produtos = this.listarProdutos();
    const indice = produtos.findIndex((item) => item.id === produtoId);
    if (indice === -1) {
      return { ok: false, erro: 'Produto não encontrado.', produto: null, movimentacao: null };
    }

    const produto = produtos[indice];
    const quantidade = validacao.quantidade;

    // RN02 e RF11: a saída não pode ser maior que o disponível.
    if (tipo === this.TIPOS.SAIDA && quantidade > produto.quantidade) {
      return {
        ok: false,
        erro: 'Saída maior que o estoque disponível. Disponível: ' + produto.quantidade + '.',
        produto: null,
        movimentacao: null
      };
    }

    const novaQuantidade = tipo === this.TIPOS.ENTRADA
      ? produto.quantidade + quantidade
      : produto.quantidade - quantidade;

    // RN01: proteção final contra quantidade negativa.
    if (novaQuantidade < 0) {
      return {
        ok: false,
        erro: 'A quantidade em estoque não pode ficar negativa.',
        produto: null,
        movimentacao: null
      };
    }

    produto.quantidade = novaQuantidade;
    Storage.salvarProdutos(produtos);

    const movimentacao = {
      id: this.gerarId('m'),
      produtoId: produto.id,
      produtoNome: produto.nome, // guardado para o histórico sobreviver à exclusão (D3)
      tipo: tipo,
      quantidade: quantidade,
      data: new Date().toISOString() // RF13
    };

    const movimentacoes = Storage.carregarMovimentacoes();
    movimentacoes.push(movimentacao);
    Storage.salvarMovimentacoes(movimentacoes);

    return { ok: true, erro: null, produto: produto, movimentacao: movimentacao };
  },

  /** Atalho que deixa a leitura mais clara nas telas (RF08). */
  registrarEntrada(produtoId, quantidade) {
    return this.registrarMovimentacao(produtoId, this.TIPOS.ENTRADA, quantidade);
  },

  /** Atalho que deixa a leitura mais clara nas telas (RF09). */
  registrarSaida(produtoId, quantidade) {
    return this.registrarMovimentacao(produtoId, this.TIPOS.SAIDA, quantidade);
  }
};
