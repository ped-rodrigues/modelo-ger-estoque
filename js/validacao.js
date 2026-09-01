/**
 * validacao.js — REGRAS DE VALIDAÇÃO
 * ---------------------------------------------------------------------------
 * Responsabilidade única: dizer se um dado informado pelo usuário é válido e,
 * quando válido, devolver esse dado já convertido para o tipo correto
 * (o formulário sempre entrega texto; o sistema trabalha com números).
 *
 * Este arquivo NÃO acessa o DOM e NÃO acessa o localStorage.
 * São funções puras: mesma entrada, mesma saída. Por isso são fáceis de testar.
 *
 * Atende: RNF06 (campos com validação), RN01, RN02, RN08, RN09.
 *
 * Observação sobre a ordem de carregamento: `validarProduto` consulta
 * `Estoque.CATEGORIAS`, mas só no momento da chamada (nunca no carregamento do
 * arquivo). Por isso a ordem das tags <script> entre validacao.js e estoque.js
 * não altera o funcionamento.
 */

const Validacao = {
  /**
   * Converte um valor vindo do formulário em número.
   * Aceita vírgula como separador decimal ("12,50" vira 12.5).
   * @param {*} valor
   * @returns {number|null} null quando não for um número válido
   */
  paraNumero(valor) {
    if (valor === null || valor === undefined) return null;

    const texto = String(valor).trim().replace(',', '.');
    if (texto === '') return null;

    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : null;
  },

  /**
   * Valida os dados de um produto.
   *
   * O campo `quantidade` só é validado quando está presente em `dados`.
   * Isso atende à decisão D2 do projeto: na EDIÇÃO a quantidade não é enviada,
   * porque ela só pode mudar por meio de uma movimentação de entrada ou saída.
   *
   * @param {Object} dados { nome, categoria, preco, quantidade?, estoqueMinimo }
   * @returns {{ valido: boolean, erros: Object, produto: Object }}
   *          `erros` usa o nome do campo como chave e a mensagem como valor.
   */
  validarProduto(dados) {
    const erros = {};
    const produto = {};
    const entrada = dados || {};

    // --- nome (campo obrigatório) -------------------------------------------
    const nome = String(entrada.nome === undefined ? '' : entrada.nome).trim();
    if (nome === '') {
      erros.nome = 'Informe o nome do produto.';
    } else if (nome.length < 2) {
      erros.nome = 'O nome deve ter pelo menos 2 caracteres.';
    } else if (nome.length > 60) {
      erros.nome = 'O nome deve ter no máximo 60 caracteres.';
    } else {
      produto.nome = nome;
    }

    // --- categoria (campo controlado, decisão D4) ---------------------------
    const categoria = String(entrada.categoria === undefined ? '' : entrada.categoria).trim();
    if (categoria === '') {
      erros.categoria = 'Selecione uma categoria.';
    } else if (!Estoque.CATEGORIAS.includes(categoria)) {
      erros.categoria = 'Categoria inválida.';
    } else {
      produto.categoria = categoria;
    }

    // --- preço (RN08: não pode ser negativo) --------------------------------
    const preco = this.paraNumero(entrada.preco);
    if (preco === null) {
      erros.preco = 'Informe um preço válido.';
    } else if (preco < 0) {
      erros.preco = 'O preço não pode ser negativo.';
    } else {
      produto.preco = preco;
    }

    // --- quantidade (RN09: número inteiro maior ou igual a zero) ------------
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

    // --- estoque mínimo (RN09: número inteiro maior ou igual a zero) --------
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

  /**
   * Valida a quantidade informada em uma movimentação de entrada ou saída.
   * A checagem de "saída maior que o disponível" (RN02) fica no estoque.js,
   * porque depende do produto e não apenas do valor digitado.
   *
   * @param {*} valor
   * @returns {{ valido: boolean, erro: string|null, quantidade: number|null }}
   */
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
