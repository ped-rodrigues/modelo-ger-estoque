const Estoque = {
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

  STATUS: {
    NORMAL: 'NORMAL',
    BAIXO: 'BAIXO',
    ESGOTADO: 'ESGOTADO'
  },

  ROTULOS_STATUS: {
    NORMAL: 'Normal',
    BAIXO: 'Baixo',
    ESGOTADO: 'Esgotado'
  },

  TIPOS: {
    ENTRADA: 'ENTRADA',
    SAIDA: 'SAIDA'
  },

  // Seção 1.8 e 2.1 do Documento de Visão.
  PERFIS: {
    ADM: 'ADM',
    OPR: 'OPR'
  },

  ROTULOS_PERFIS: {
    ADM: 'Administrador',
    OPR: 'Funcionário'
  },

  // Contas de demonstração. Sem servidor, a senha fica no código: isto separa os perfis e
  // identifica quem fez cada ação, mas não é segurança de verdade.
  USUARIOS: [
    { email: 'admin@kaisen.com', senha: 'admin123', nome: 'Administrador', perfil: 'ADM' },
    { email: 'carla@kaisen.com', senha: 'carla123', nome: 'Carla Souza', perfil: 'OPR' },
    { email: 'rafael@kaisen.com', senha: 'rafael123', nome: 'Rafael Lima', perfil: 'OPR' }
  ],

  // RF06, RF07 e Dashboard (seção 1.8) são só do Administrador.
  ehAdministrador(perfil) {
    return perfil === this.PERFIS.ADM;
  },

  autenticar(email, senha) {
    const conta = this.USUARIOS.find((item) => item.email === email.toLowerCase());
    return conta && conta.senha === senha ? conta : null;
  },

  usuarioAtual() {
    const email = Storage.lerUsuario();
    return this.USUARIOS.find((item) => item.email === email) || null;
  },

  // E-mail de quem está logado, gravado em cada ação para o desempenho por funcionário.
  emailAtual() {
    const conta = this.usuarioAtual();
    return conta ? conta.email : null;
  },

  // Painel geral: o que cada conta fez. Registros sem usuário (anteriores às contas) não contam.
  desempenhoPorUsuario() {
    const movimentacoes = Storage.carregarMovimentacoes();
    const produtos = this.listarProdutos();
    const carros = Storage.carregarCarros();

    return this.USUARIOS.map((conta) => {
      const linha = {
        nome: conta.nome,
        perfil: conta.perfil,
        pecasCadastradas: produtos.filter((p) => p.cadastradoPor === conta.email).length,
        entradas: 0,
        vendas: 0,
        unidadesVendidas: 0,
        valorVendido: 0,
        carrosAdicionados: carros.filter((c) => c.usuario === conta.email).length
      };

      movimentacoes.forEach((m) => {
        if (m.usuario !== conta.email) return;
        if (m.tipo === this.TIPOS.ENTRADA) {
          linha.entradas += m.quantidade;
        } else {
          linha.vendas += 1;
          linha.unidadesVendidas += m.quantidade;
          linha.valorVendido += (m.valorUnitario || 0) * m.quantidade;
        }
      });

      return linha;
    });
  },

  gerarId(prefixo) {
    const tempo = Date.now().toString(36);
    const aleatorio = Math.random().toString(36).slice(2, 7);
    return prefixo + '_' + tempo + '_' + aleatorio;
  },

  classificar(produto) {
    if (produto.quantidade === 0) return this.STATUS.ESGOTADO;
    if (produto.quantidade <= produto.estoqueMinimo) return this.STATUS.BAIXO;
    return this.STATUS.NORMAL;
  },

  valorTotalProduto(produto) {
    return produto.preco * produto.quantidade;
  },

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

  normalizarTexto(texto) {
    return String(texto)
      .toLowerCase()
      .normalize('NFD')
      // Apaga os acentos que o NFD separou das letras (U+0300 a U+036F, invisíveis aqui).
      .replace(/[̀-ͯ]/g, '');
  },

  // RF04: além dos acentos, ignora hífen, ponto, barra e espaço. "fr4213" acha "FR-4213".
  chaveDeBusca(texto) {
    return this.normalizarTexto(texto).replace(/[^a-z0-9]/g, '');
  },

  filtrarProdutos(produtos, filtros) {
    const criterios = filtros || {};
    const busca = this.chaveDeBusca(criterios.texto || '');

    return produtos.filter((produto) => {
      if (busca !== '') {
        const noNome = this.chaveDeBusca(produto.nome).includes(busca);
        const noCodigo = this.chaveDeBusca(produto.codigo || '').includes(busca);
        if (!noNome && !noCodigo) return false;
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

  listarProdutos() {
    return Storage.carregarProdutos();
  },

  obterProduto(id) {
    const produto = this.listarProdutos().find((item) => item.id === id);
    return produto || null;
  },

  codigoEmUso(codigo, idIgnorado) {
    return this.listarProdutos().some(
      (produto) => produto.id !== idIgnorado && produto.codigo === codigo
    );
  },

  listarMovimentacoes() {
    // reverse() antes do sort: no mesmo milissegundo, a gravada por último vem primeiro.
    const movimentacoes = Storage.carregarMovimentacoes().reverse();
    return movimentacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
  },

  listarMovimentacoesDoProduto(produtoId) {
    return this.listarMovimentacoes().filter((item) => item.produtoId === produtoId);
  },

  // RF14: filtros do histórico. Busca pelo nome guardado na movimentação, que sobrevive à exclusão (D3).
  filtrarMovimentacoes(movimentacoes, filtros) {
    const criterios = filtros || {};
    const busca = this.chaveDeBusca(criterios.texto || '');

    return movimentacoes.filter((item) => {
      if (busca !== '' && !this.chaveDeBusca(item.produtoNome).includes(busca)) return false;
      if (criterios.tipo && item.tipo !== criterios.tipo) return false;
      return true;
    });
  },

  cadastrarProduto(dados) {
    const resultado = Validacao.validarProduto(dados);
    if (!resultado.valido) {
      return { ok: false, erros: resultado.erros, produto: null };
    }

    if (this.codigoEmUso(resultado.produto.codigo, null)) {
      return {
        ok: false,
        erros: { codigo: 'Já existe uma peça cadastrada com este código.' },
        produto: null
      };
    }

    const quantidadeInicial = resultado.produto.quantidade;

    // D2: nasce com 0 e a quantidade inicial entra como ENTRADA, para o histórico explicar o estoque.
    const novoProduto = {
      id: this.gerarId('p'),
      codigo: resultado.produto.codigo,
      nome: resultado.produto.nome,
      fabricante: resultado.produto.fabricante,
      aplicacao: resultado.produto.aplicacao,
      categoria: resultado.produto.categoria,
      preco: resultado.produto.preco,
      quantidade: 0,
      estoqueMinimo: resultado.produto.estoqueMinimo,
      cadastradoPor: this.emailAtual()
    };

    const produtos = this.listarProdutos();
    produtos.push(novoProduto);
    Storage.salvarProdutos(produtos);

    if (quantidadeInicial > 0) {
      this.registrarEntrada(novoProduto.id, quantidadeInicial);
    }

    return { ok: true, erros: {}, produto: this.obterProduto(novoProduto.id) };
  },

  editarProduto(id, dados) {
    const produtos = this.listarProdutos();
    const indice = produtos.findIndex((item) => item.id === id);

    if (indice === -1) {
      return { ok: false, erros: { geral: 'Produto não encontrado.' }, produto: null };
    }

    // Sem a quantidade (D2), mesmo que a tela a envie por engano.
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
      quantidade: produtos[indice].quantidade, // D2: só muda por movimentação
      estoqueMinimo: resultado.produto.estoqueMinimo,
      cadastradoPor: produtos[indice].cadastradoPor
    };

    Storage.salvarProdutos(produtos);
    return { ok: true, erros: {}, produto: produtos[indice] };
  },

  excluirProduto(id) {
    // D3: as movimentações da peça continuam no histórico.
    const produtos = this.listarProdutos();
    const restantes = produtos.filter((item) => item.id !== id);

    if (restantes.length === produtos.length) {
      return { ok: false, erro: 'Produto não encontrado.' };
    }

    Storage.salvarProdutos(restantes);
    return { ok: true, erro: null };
  },

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

    // Redundante com a checagem acima de propósito: última barreira da RN01.
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
      valorUnitario: produto.preco, // preço no momento da saída, para o valor vendido
      usuario: this.emailAtual(),
      data: new Date().toISOString()
    };

    const movimentacoes = Storage.carregarMovimentacoes();
    movimentacoes.push(movimentacao);
    Storage.salvarMovimentacoes(movimentacoes);

    return { ok: true, erro: null, produto: produto, movimentacao: movimentacao };
  },

  registrarEntrada(produtoId, quantidade) {
    return this.registrarMovimentacao(produtoId, this.TIPOS.ENTRADA, quantidade);
  },

  registrarSaida(produtoId, quantidade) {
    return this.registrarMovimentacao(produtoId, this.TIPOS.SAIDA, quantidade);
  },

  registrarCarro(nome, preco) {
    const carros = Storage.carregarCarros();
    carros.push({ id: this.gerarId('c'), nome, preco, usuario: this.emailAtual(), data: new Date().toISOString() });
    return Storage.salvarCarros(carros);
  }
};
