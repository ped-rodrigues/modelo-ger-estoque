const Testes = {
  afirmar(condicao, mensagem) {
    if (!condicao) {
      throw new Error(mensagem);
    }
  },

  afirmarIgual(obtido, esperado, mensagem) {
    if (obtido !== esperado) {
      throw new Error(mensagem + ' (esperado: ' + esperado + ', obtido: ' + obtido + ')');
    }
  },

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

        // Toda tela lê do localStorage ao abrir, então ler de novo equivale a recarregar a página.
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
    },

    {
      codigo: 'CT15',
      descricao: 'Simulador de importação soma veículo, frete, impostos e taxas (site público)',
      executar() {
        const r = Importacao.calcular('gtr-nismo', 'Japão');

        Testes.afirmarIgual(r.frete, 18500, 'O frete do Japão deveria ser R$ 18.500.');
        Testes.afirmarIgual(r.impostos, 610000, 'Impostos: 63% de (950.000 + 18.500), arredondado ao milhar.');
        Testes.afirmarIgual(r.total, 1585700, 'O total do GT-R Nismo deveria ser o do design: R$ 1.585.700.');
      }
    },

    {
      codigo: 'CT16',
      descricao: 'Financiamento: parcela pela tabela Price, entrada mínima e limite de 30% da renda',
      executar() {
        // GT-R Nismo (R$ 1.585.700) com a entrada mínima de 20%, em 48 meses a 1,49% ao mês.
        const f = Importacao.financiar(1585700, 317140, 48, 130000);

        Testes.afirmarIgual(f.financiado, 1268560, 'Valor financiado: total menos a entrada.');
        Testes.afirmarIgual(f.parcela, 37184.45, 'Parcela pela tabela Price.');
        Testes.afirmarIgual(f.totalPago, 2101993.6, 'Total pago: entrada + 48 parcelas.');
        Testes.afirmar(f.entradaOk, 'Entrada de exatamente 20% deveria ser aceita.');
        Testes.afirmar(f.rendaOk, 'Renda de R$ 130.000 comporta parcela de R$ 37.184,45 (até 30%).');

        Testes.afirmar(!Importacao.financiar(1585700, 317139, 48, 130000).entradaOk,
          'Um real abaixo dos 20% deveria ser recusado.');
        Testes.afirmar(!Importacao.financiar(1585700, 317140, 48, 120000).rendaOk,
          'Renda de R$ 120.000: a parcela passaria de 30% e deveria ser recusada.');
      }
    },

    {
      codigo: 'CT17',
      descricao: 'Carrinho da loja: soma quantidades, limita veículo a 1 e calcula o total',
      executar() {
        const carro = { id: 'supra', tipo: 'veiculo', nome: 'Toyota Supra GR A90', preco: 580000 };
        const volante = { id: 'volante', tipo: 'acessorio', nome: 'Volante esportivo', preco: 1850 };

        let carrinho = Loja.adicionar([], carro);
        carrinho = Loja.adicionar(carrinho, carro); // segundo clique no mesmo carro
        carrinho = Loja.adicionar(carrinho, volante);
        carrinho = Loja.adicionar(carrinho, volante);

        Testes.afirmarIgual(carrinho.length, 2, 'Deveriam existir 2 itens diferentes no carrinho.');
        Testes.afirmarIgual(carrinho[0].quantidade, 1, 'Um veículo é único: a quantidade não passa de 1.');
        Testes.afirmarIgual(carrinho[1].quantidade, 2, 'Acessórios somam a quantidade.');
        Testes.afirmarIgual(Loja.total(carrinho), 583700, 'Total: 580.000 + 2 x 1.850.');

        carrinho = Loja.adicionar(carrinho, carro, -1);
        Testes.afirmarIgual(carrinho.length, 1, 'Tirar a última unidade remove o item.');
        Testes.afirmarIgual(Loja.produtos().length, 20, 'A loja mostra os 11 veículos do simulador e 9 acessórios.');
      }
    }
  ],

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
