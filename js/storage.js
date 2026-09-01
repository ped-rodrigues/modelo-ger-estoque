/**
 * storage.js — CAMADA DE PERSISTÊNCIA
 * ---------------------------------------------------------------------------
 * Responsabilidade única: ler e gravar dados no localStorage.
 *
 * Regra de arquitetura do projeto (RNF11):
 *   NENHUM outro arquivo do projeto pode chamar `localStorage` diretamente.
 *   Todo acesso passa por aqui. Assim, se um dia trocarmos o localStorage por
 *   outro mecanismo de armazenamento, somente este arquivo muda.
 *
 * Convenção do projeto: comentários e textos exibidos ao usuário usam
 * acentuação normal; nomes de variáveis e funções ficam sem acento.
 *
 * Atende: RF17 (armazenar), RF18 (recuperar ao iniciar), RNF08 (os dados
 * permanecem após fechar o navegador).
 */

const Storage = {
  // O prefixo nas chaves evita conflito com outros projetos no mesmo domínio.
  CHAVE_PRODUTOS: 'gestoque.produtos',
  CHAVE_MOVIMENTACOES: 'gestoque.movimentacoes',

  /**
   * Verifica se o navegador permite usar o localStorage.
   * (Modo anônimo ou armazenamento bloqueado podem lançar erro.)
   * @returns {boolean}
   */
  disponivel() {
    try {
      const teste = '__gestoque_teste__';
      localStorage.setItem(teste, '1');
      localStorage.removeItem(teste);
      return true;
    } catch (erro) {
      return false;
    }
  },

  /**
   * Lê uma lista do localStorage de forma segura.
   * Se a chave não existir ou o conteúdo estiver corrompido, devolve [].
   * @param {string} chave
   * @returns {Array}
   */
  ler(chave) {
    try {
      const bruto = localStorage.getItem(chave);
      if (bruto === null) return [];

      const dados = JSON.parse(bruto);
      // Proteção: se alguém editar o localStorage na mão e quebrar o formato,
      // é melhor começar vazio do que derrubar a aplicação inteira.
      return Array.isArray(dados) ? dados : [];
    } catch (erro) {
      console.error('[Storage] Não foi possível ler a chave "' + chave + '".', erro);
      return [];
    }
  },

  /**
   * Grava uma lista no localStorage.
   * @param {string} chave
   * @param {Array} lista
   * @returns {boolean} true se gravou com sucesso
   */
  escrever(chave, lista) {
    try {
      localStorage.setItem(chave, JSON.stringify(lista));
      return true;
    } catch (erro) {
      // Acontece principalmente quando o limite de armazenamento é atingido.
      console.error('[Storage] Não foi possível gravar a chave "' + chave + '".', erro);
      return false;
    }
  },

  // --- Atalhos de leitura e escrita por entidade -----------------------------

  /** @returns {Array<Object>} lista de produtos salvos */
  carregarProdutos() {
    return this.ler(this.CHAVE_PRODUTOS);
  },

  /** @param {Array<Object>} produtos @returns {boolean} */
  salvarProdutos(produtos) {
    return this.escrever(this.CHAVE_PRODUTOS, produtos);
  },

  /** @returns {Array<Object>} lista de movimentações salvas */
  carregarMovimentacoes() {
    return this.ler(this.CHAVE_MOVIMENTACOES);
  },

  /** @param {Array<Object>} movimentacoes @returns {boolean} */
  salvarMovimentacoes(movimentacoes) {
    return this.escrever(this.CHAVE_MOVIMENTACOES, movimentacoes);
  },

  /** Apaga TODOS os dados da aplicação (usado nos testes e no reset manual). */
  limparTudo() {
    try {
      localStorage.removeItem(this.CHAVE_PRODUTOS);
      localStorage.removeItem(this.CHAVE_MOVIMENTACOES);
      return true;
    } catch (erro) {
      console.error('[Storage] Não foi possível limpar os dados.', erro);
      return false;
    }
  }
};
