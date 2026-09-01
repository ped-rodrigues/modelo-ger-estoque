/**
 * testes.js — CASOS DE TESTE AUTOMATIZADOS
 * ---------------------------------------------------------------------------
 * Executa os casos de teste CT01 a CT14 sobre as camadas Storage, Validacao e
 * Estoque. Não usa nenhuma biblioteca: são apenas funções que comparam o
 * resultado obtido com o resultado esperado.
 *
 * Como rodar: abra `pages/testes.html` no navegador e clique em "Executar testes".
 *
 * IMPORTANTE: os testes precisam de um estoque vazio para funcionar. Por isso
 * `executar()` guarda os dados atuais antes de começar e os devolve ao final,
 * mesmo que algum teste falhe (bloco `finally`). Nenhum dado do usuário é
 * perdido ao rodar os testes.
 */

const Testes = {
  // --------------------------------------------------------------------------
  // Ferramentas de verificação: lançam um erro quando a condição não se cumpre.
  // --------------------------------------------------------------------------

  /**
   * @param {boolean} condicao
   * @param {string} mensagem descrição do que deveria ter acontecido
   */
  afirmar(condicao, mensagem) {
    if (!condicao) {
      throw new Error(mensagem);
    }
  },

  /**
   * @param {*} obtido valor que o sistema devolveu
   * @param {*} esperado valor que o teste espera
   * @param {string} mensagem contexto da verificação
   */
  afirmarIgual(obtido, esperado, mensagem) {
    if (obtido !== esperado) {
      throw new Error(mensagem + ' (esperado: ' + esperado + ', obtido: ' + obtido + ')');
    }
  },

  // --------------------------------------------------------------------------
  // Atalho usado pelos testes para criar um produto rapidamente.
  // --------------------------------------------------------------------------

  /**
   * @param {Object} [dados] sobrescreve campos do produto padrão
   * @returns {Object} o produto cadastrado
   */
  criarProduto(dados) {
    const padrao = {
      nome: 'Mouse Logitech',
      categoria: 'Periféricos',
      preco: 89.9,
      quantidade: 15,
      estoqueMinimo: 5
    };
    const resultado = Estoque.cadastrarProduto(Object.assign(padrao, dados || {}));
    this.afirmar(resultado.ok, 'Falha ao preparar o produto de teste.');
    return resultado.produto;
  },

  // ==========================================================================
  // CASOS DE TESTE
  // Cada caso tem: código, descrição e a função que executa a verificação.
  // ==========================================================================

  casos: [
    {
      codigo: 'CT01',
      descricao: 'Cadastro válido de produto (RF01, RF02, D2)',
      executar() {
        const resultado = Estoque.cadastrarProduto({
          nome: 'Monitor LG',
          categoria: 'Eletrônicos',
          preco: 899.9,
          quantidade: 10,
          estoqueMinimo: 3
        });

        Testes.afirmar(resultado.ok, 'O cadastro deveria ter sido aceito.');
        Testes.afirmar(!!resultado.produto.id, 'O produto deveria receber um id único (RF02).');
        Testes.afirmarIgual(resultado.produto.quantidade, 10, 'A quantidade inicial deveria ser 10.');
        Testes.afirmarIgual(Estoque.listarProdutos().length, 1, 'Deveria existir 1 produto salvo.');

        // Decisão D2: a carga inicial vira uma movimentação de ENTRADA.
        const movimentacoes = Estoque.listarMovimentacoes();
        Testes.afirmarIgual(movimentacoes.length, 1, 'A quantidade inicial deveria gerar 1 movimentação.');
        Testes.afirmarIgual(movimentacoes[0].tipo, 'ENTRADA', 'A movimentação inicial deveria ser de ENTRADA.');
      }
    },

    {
      codigo: 'CT02',
      descricao: 'Cadastro com campo obrigatório vazio é recusado (RNF06)',
      executar() {
        const resultado = Estoque.cadastrarProduto({
          nome: '   ',
          categoria: 'Eletrônicos',
          preco: 10,
          quantidade: 1,
          estoqueMinimo: 1
        });

        Testes.afirmar(!resultado.ok, 'O cadastro sem nome deveria ser recusado.');
        Testes.afirmar(!!resultado.erros.nome, 'Deveria existir uma mensagem de erro para o campo nome.');
        Testes.afirmarIgual(Estoque.listarProdutos().length, 0, 'Nenhum produto inválido pode ser salvo.');
      }
    },

    {
      codigo: 'CT03',
      descricao: 'Edição de produto preserva a quantidade (RF06, D2)',
      executar() {
        const produto = Testes.criarProduto({ nome: 'Teclado', quantidade: 8 });

        const resultado = Estoque.editarProduto(produto.id, {
          nome: 'Teclado Mecânico',
          categoria: 'Periféricos',
          preco: 199.9,
          estoqueMinimo: 4
        });

        Testes.afirmar(resultado.ok, 'A edição deveria ter sido aceita.');
        Testes.afirmarIgual(resultado.produto.nome, 'Teclado Mecânico', 'O nome deveria ter sido alterado.');
        Testes.afirmarIgual(resultado.produto.preco, 199.9, 'O preço deveria ter sido alterado.');
        Testes.afirmarIgual(resultado.produto.quantidade, 8, 'A quantidade não pode mudar na edição (D2).');
      }
    },

    {
      codigo: 'CT04',
      descricao: 'Exclusão remove o produto e mantém o histórico (RF07, D3)',
      executar() {
        const produto = Testes.criarProduto({ nome: 'Cadeira', quantidade: 4 });

        const resultado = Estoque.excluirProduto(produto.id);

        Testes.afirmar(resultado.ok, 'A exclusão deveria ter sido concluída.');
        Testes.afirmarIgual(Estoque.listarProdutos().length, 0, 'O produto deveria ter sido removido.');

        // Decisão D3: o histórico é preservado, com o nome guardado na movimentação.
        const movimentacoes = Estoque.listarMovimentacoes();
        Testes.afirmarIgual(movimentacoes.length, 1, 'O histórico deveria continuar existindo.');
        Testes.afirmarIgual(movimentacoes[0].produtoNome, 'Cadeira', 'A movimentação deveria guardar o nome do produto.');
      }
    },

    {
      codigo: 'CT05',
      descricao: 'Entrada de estoque aumenta a quantidade (RF08, RF10, RF13)',
      executar() {
        const produto = Testes.criarProduto({ quantidade: 15 });

        const resultado = Estoque.registrarEntrada(produto.id, 10);

        Testes.afirmar(resultado.ok, 'A entrada deveria ter sido registrada.');
        Testes.afirmarIgual(Estoque.obterProduto(produto.id).quantidade, 25, 'O estoque deveria ir de 15 para 25.');
        Testes.afirmar(!!resultado.movimentacao.data, 'A movimentação deveria registrar data e hora (RF13).');
        Testes.afirmarIgual(Estoque.listarMovimentacoes().length, 2, 'Deveriam existir 2 movimentações (inicial e entrada).');
      }
    },

    {
      codigo: 'CT06',
      descricao: 'Saída válida diminui a quantidade (RF09, RF10)',
      executar() {
        const produto = Testes.criarProduto({ quantidade: 25 });

        const resultado = Estoque.registrarSaida(produto.id, 3);

        Testes.afirmar(resultado.ok, 'A saída deveria ter sido registrada.');
        Testes.afirmarIgual(Estoque.obterProduto(produto.id).quantidade, 22, 'O estoque deveria ir de 25 para 22.');
        Testes.afirmarIgual(resultado.movimentacao.tipo, 'SAIDA', 'A movimentação deveria ser do tipo SAIDA.');
      }
    },

    {
      codigo: 'CT07',
      descricao: 'Saída maior que o estoque é recusada (RF11, RN01, RN02)',
      executar() {
        const produto = Testes.criarProduto({ quantidade: 5 });

        const resultado = Estoque.registrarSaida(produto.id, 6);

        Testes.afirmar(!resultado.ok, 'A saída maior que o disponível deveria ser recusada.');
        Testes.afirmar(!!resultado.erro, 'Deveria existir uma mensagem de erro clara.');
        Testes.afirmarIgual(Estoque.obterProduto(produto.id).quantidade, 5, 'A quantidade não pode ser alterada.');
        Testes.afirmarIgual(Estoque.listarMovimentacoes().length, 1, 'Nenhuma movimentação nova pode ser criada.');
      }
    },

    {
      codigo: 'CT08',
      descricao: 'Produto sem estoque é classificado como ESGOTADO (RF12, RN03)',
      executar() {
        const produto = Testes.criarProduto({ quantidade: 3, estoqueMinimo: 2 });
        Estoque.registrarSaida(produto.id, 3);

        const atualizado = Estoque.obterProduto(produto.id);
        Testes.afirmarIgual(atualizado.quantidade, 0, 'A quantidade deveria ser zero.');
        Testes.afirmarIgual(Estoque.classificar(atualizado), 'ESGOTADO', 'Quantidade 0 significa ESGOTADO.');
      }
    },

    {
      codigo: 'CT09',
      descricao: 'Classificação BAIXO e NORMAL pelo estoque mínimo (RF12, RN04, RN05)',
      executar() {
        // Igual ao mínimo: BAIXO
        Testes.afirmarIgual(
          Estoque.classificar({ quantidade: 5, estoqueMinimo: 5 }),
          'BAIXO',
          'Quantidade igual ao mínimo significa BAIXO (RN04).'
        );
        // Abaixo do mínimo: BAIXO
        Testes.afirmarIgual(
          Estoque.classificar({ quantidade: 2, estoqueMinimo: 5 }),
          'BAIXO',
          'Quantidade abaixo do mínimo significa BAIXO (RN04).'
        );
        // Acima do mínimo: NORMAL
        Testes.afirmarIgual(
          Estoque.classificar({ quantidade: 6, estoqueMinimo: 5 }),
          'NORMAL',
          'Quantidade acima do mínimo significa NORMAL (RN05).'
        );
      }
    },

    {
      codigo: 'CT10',
      descricao: 'Pesquisa de produto pelo nome (RF04)',
      executar() {
        Testes.criarProduto({ nome: 'Monitor LG', categoria: 'Eletrônicos' });
        Testes.criarProduto({ nome: 'Mouse Logitech', categoria: 'Periféricos' });
        Testes.criarProduto({ nome: 'Cadeira Giratória', categoria: 'Escritório' });

        const produtos = Estoque.listarProdutos();

        const porNome = Estoque.filtrarProdutos(produtos, { texto: 'mo' });
        Testes.afirmarIgual(porNome.length, 2, 'A busca por "mo" deveria encontrar Monitor e Mouse.');

        const maiusculas = Estoque.filtrarProdutos(produtos, { texto: 'CADEIRA' });
        Testes.afirmarIgual(maiusculas.length, 1, 'A busca deveria ignorar maiúsculas e minúsculas.');

        const semAcento = Estoque.filtrarProdutos(produtos, { texto: 'giratoria' });
        Testes.afirmarIgual(semAcento.length, 1, 'A busca deveria encontrar "Giratória" mesmo digitada sem acento.');

        const semResultado = Estoque.filtrarProdutos(produtos, { texto: 'impressora' });
        Testes.afirmarIgual(semResultado.length, 0, 'A busca sem correspondência deveria retornar vazio.');
      }
    },

    {
      codigo: 'CT11',
      descricao: 'Filtro por categoria e por situação do estoque (RF05)',
      executar() {
        Testes.criarProduto({ nome: 'Monitor LG', categoria: 'Eletrônicos', quantidade: 10, estoqueMinimo: 2 });
        Testes.criarProduto({ nome: 'Mouse Logitech', categoria: 'Periféricos', quantidade: 2, estoqueMinimo: 5 });
        Testes.criarProduto({ nome: 'Teclado', categoria: 'Periféricos', quantidade: 20, estoqueMinimo: 5 });

        const produtos = Estoque.listarProdutos();

        const perifericos = Estoque.filtrarProdutos(produtos, { categoria: 'Periféricos' });
        Testes.afirmarIgual(perifericos.length, 2, 'Deveriam existir 2 periféricos.');

        const baixos = Estoque.filtrarProdutos(produtos, { status: 'BAIXO' });
        Testes.afirmarIgual(baixos.length, 1, 'Apenas o Mouse está com estoque baixo.');

        const combinado = Estoque.filtrarProdutos(produtos, { categoria: 'Periféricos', status: 'NORMAL' });
        Testes.afirmarIgual(combinado.length, 1, 'Os filtros combinados deveriam encontrar apenas o Teclado.');
      }
    },

    {
      codigo: 'CT12',
      descricao: 'Os dados são realmente gravados no localStorage (RF17)',
      executar() {
        Testes.criarProduto({ nome: 'Impressora', quantidade: 2 });

        // Lê o conteúdo bruto da chave, sem passar pelo Estoque, para provar que
        // a gravação aconteceu de fato no navegador.
        const produtosSalvos = Storage.ler(Storage.CHAVE_PRODUTOS);
        const movimentacoesSalvas = Storage.ler(Storage.CHAVE_MOVIMENTACOES);

        Testes.afirmarIgual(produtosSalvos.length, 1, 'O produto deveria estar gravado no localStorage.');
        Testes.afirmarIgual(produtosSalvos[0].nome, 'Impressora', 'O nome gravado deveria ser "Impressora".');
        Testes.afirmarIgual(movimentacoesSalvas.length, 1, 'A movimentação deveria estar gravada no localStorage.');
      }
    },

    {
      codigo: 'CT13',
      descricao: 'Os dados são recuperados após recarregar a página (RF18, RNF08)',
      executar() {
        const produto = Testes.criarProduto({ nome: 'Notebook', quantidade: 7, preco: 3500 });
        Estoque.registrarSaida(produto.id, 2);

        // A aplicação não guarda estado em memória entre as telas: toda tela lê
        // do localStorage ao abrir. Chamar obterProduto() novamente reproduz
        // exatamente o que acontece quando a página é recarregada.
        const recuperado = Estoque.obterProduto(produto.id);

        Testes.afirmar(recuperado !== null, 'O produto deveria continuar disponível após recarregar.');
        Testes.afirmarIgual(recuperado.quantidade, 5, 'A quantidade recuperada deveria refletir a saída (7 menos 2).');
        Testes.afirmarIgual(recuperado.preco, 3500, 'O preço deveria ser recuperado como número.');
        Testes.afirmarIgual(Estoque.listarMovimentacoes().length, 2, 'O histórico deveria ser recuperado por completo.');
      }
    },

    {
      codigo: 'CT14',
      descricao: 'Indicadores do dashboard calculados a partir dos dados (RF15, RF16, RN06)',
      executar() {
        Testes.criarProduto({ nome: 'Monitor LG', preco: 1000, quantidade: 10, estoqueMinimo: 2 }); // NORMAL
        Testes.criarProduto({ nome: 'Mouse', preco: 50, quantidade: 3, estoqueMinimo: 5 });         // BAIXO
        const esgotado = Testes.criarProduto({ nome: 'Cabo HDMI', preco: 30, quantidade: 4, estoqueMinimo: 1 });
        Estoque.registrarSaida(esgotado.id, 4);                                                     // ESGOTADO

        const indicadores = Estoque.calcularIndicadores();

        Testes.afirmarIgual(indicadores.totalProdutos, 3, 'Deveriam existir 3 produtos cadastrados.');
        Testes.afirmarIgual(indicadores.totalItens, 13, 'O total de itens deveria ser 10 + 3 + 0 = 13.');
        Testes.afirmarIgual(indicadores.estoqueBaixo, 1, 'Deveria existir 1 produto com estoque baixo.');
        Testes.afirmarIgual(indicadores.esgotados, 1, 'Deveria existir 1 produto esgotado.');
        Testes.afirmarIgual(indicadores.valorTotal, 10150, 'Valor total: (1000 x 10) + (50 x 3) + (30 x 0) = 10150.');
      }
    }
  ],

  // ==========================================================================
  // EXECUÇÃO
  // ==========================================================================

  /**
   * Roda todos os casos de teste em um estoque limpo e devolve os resultados.
   * Os dados reais do usuário são salvos antes e restaurados no final.
   *
   * @returns {{ resultados: Array, total: number, aprovados: number, reprovados: number }}
   */
  executar() {
    const backupProdutos = Storage.carregarProdutos();
    const backupMovimentacoes = Storage.carregarMovimentacoes();

    const resultados = [];

    try {
      this.casos.forEach((caso) => {
        Storage.limparTudo(); // cada teste começa do zero, sem influência do anterior

        try {
          caso.executar();
          resultados.push({
            codigo: caso.codigo,
            descricao: caso.descricao,
            passou: true,
            mensagem: 'OK'
          });
        } catch (erro) {
          resultados.push({
            codigo: caso.codigo,
            descricao: caso.descricao,
            passou: false,
            mensagem: erro.message
          });
        }
      });
    } finally {
      // Devolve os dados do usuário, mesmo que algo tenha dado errado acima.
      Storage.limparTudo();
      if (backupProdutos.length > 0) Storage.salvarProdutos(backupProdutos);
      if (backupMovimentacoes.length > 0) Storage.salvarMovimentacoes(backupMovimentacoes);
    }

    const aprovados = resultados.filter((item) => item.passou).length;

    return {
      resultados: resultados,
      total: resultados.length,
      aprovados: aprovados,
      reprovados: resultados.length - aprovados
    };
  }
};
