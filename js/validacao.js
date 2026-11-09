const Validacao = {
  // Ex.: "FR-4213", "MB-90.123/A", "BOSCH 0986BB4324".
  FORMATO_CODIGO: /^[A-Z0-9][A-Z0-9./\- ]*$/,

  paraNumero(valor) {
    if (valor === null || valor === undefined) return null;

    const texto = String(valor).trim().replace(',', '.');
    if (texto === '') return null;

    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : null;
  },

  validarProduto(dados) {
    const erros = {};
    const produto = {};
    const entrada = dados || {};

    // Maiúsculo e com espaço único: "fr 4213" e "FR  4213" viram o mesmo código (RN10 e pesquisa).
    const codigo = String(entrada.codigo === undefined ? '' : entrada.codigo)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ');

    if (codigo === '') {
      erros.codigo = 'Informe o código da peça.';
    } else if (codigo.length < 2) {
      erros.codigo = 'O código deve ter pelo menos 2 caracteres.';
    } else if (codigo.length > 30) {
      erros.codigo = 'O código deve ter no máximo 30 caracteres.';
    } else if (!this.FORMATO_CODIGO.test(codigo)) {
      erros.codigo = 'Use apenas letras, números, hífen, ponto e barra.';
    } else {
      produto.codigo = codigo;
    }

    const nome = String(entrada.nome === undefined ? '' : entrada.nome).trim();
    if (nome === '') {
      erros.nome = 'Informe o nome da peça.';
    } else if (nome.length < 2) {
      erros.nome = 'O nome deve ter pelo menos 2 caracteres.';
    } else if (nome.length > 60) {
      erros.nome = 'O nome deve ter no máximo 60 caracteres.';
    } else {
      produto.nome = nome;
    }

    const fabricante = String(entrada.fabricante === undefined ? '' : entrada.fabricante).trim();
    if (fabricante === '') {
      erros.fabricante = 'Informe o fabricante da peça.';
    } else if (fabricante.length < 2) {
      erros.fabricante = 'O fabricante deve ter pelo menos 2 caracteres.';
    } else if (fabricante.length > 40) {
      erros.fabricante = 'O fabricante deve ter no máximo 40 caracteres.';
    } else {
      produto.fabricante = fabricante;
    }

    // Opcional: itens como óleo não servem a um carro específico.
    const aplicacao = String(entrada.aplicacao === undefined ? '' : entrada.aplicacao).trim();
    if (aplicacao.length > 80) {
      erros.aplicacao = 'A aplicação deve ter no máximo 80 caracteres.';
    } else {
      produto.aplicacao = aplicacao;
    }

    const categoria = String(entrada.categoria === undefined ? '' : entrada.categoria).trim();
    if (categoria === '') {
      erros.categoria = 'Selecione uma categoria.';
    } else if (!Estoque.CATEGORIAS.includes(categoria)) { // lido só na chamada: a ordem dos <script> não importa
      erros.categoria = 'Categoria inválida.';
    } else {
      produto.categoria = categoria;
    }

    const preco = this.paraNumero(entrada.preco);
    if (preco === null) {
      erros.preco = 'Informe um preço válido.';
    } else if (preco < 0) {
      erros.preco = 'O preço não pode ser negativo.';
    } else {
      produto.preco = preco;
    }

    // D2: na edição a quantidade não é enviada, então só é validada quando vem.
    if (entrada.quantidade !== undefined) {
      const quantidade = this.paraNumero(entrada.quantidade);
      if (quantidade === null) {
        erros.quantidade = 'Informe uma quantidade válida.';
      } else if (!Number.isInteger(quantidade)) {
        erros.quantidade = 'A quantidade deve ser um número inteiro.';
      } else if (quantidade < 0) {
        erros.quantidade = 'A quantidade não pode ser negativa.';
      } else {
        produto.quantidade = quantidade;
      }
    }

    const estoqueMinimo = this.paraNumero(entrada.estoqueMinimo);
    if (estoqueMinimo === null) {
      erros.estoqueMinimo = 'Informe o estoque mínimo.';
    } else if (!Number.isInteger(estoqueMinimo)) {
      erros.estoqueMinimo = 'O estoque mínimo deve ser um número inteiro.';
    } else if (estoqueMinimo < 0) {
      erros.estoqueMinimo = 'O estoque mínimo não pode ser negativo.';
    } else {
      produto.estoqueMinimo = estoqueMinimo;
    }

    return {
      valido: Object.keys(erros).length === 0,
      erros: erros,
      produto: produto
    };
  },

  validarQuantidadeMovimentacao(valor) {
    const quantidade = this.paraNumero(valor);

    if (quantidade === null) {
      return { valido: false, erro: 'Informe uma quantidade válida.', quantidade: null };
    }
    if (!Number.isInteger(quantidade)) {
      return { valido: false, erro: 'A quantidade deve ser um número inteiro.', quantidade: null };
    }
    if (quantidade <= 0) {
      return { valido: false, erro: 'A quantidade deve ser maior que zero.', quantidade: null };
    }

    return { valido: true, erro: null, quantidade: quantidade };
  }
};
