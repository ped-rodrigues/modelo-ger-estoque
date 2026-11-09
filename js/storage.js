// Único arquivo que acessa o localStorage: trocar o armazenamento só mexe aqui.
const Storage = {
  // O prefixo nas chaves evita conflito com outros projetos no mesmo domínio.
  CHAVE_PRODUTOS: 'gestoque.produtos',
  CHAVE_MOVIMENTACOES: 'gestoque.movimentacoes',

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

  ler(chave) {
    try {
      const bruto = localStorage.getItem(chave);
      if (bruto === null) return [];

      const dados = JSON.parse(bruto);
      // Dado corrompido (editado à mão, por exemplo): melhor começar vazio do que quebrar a tela.
      return Array.isArray(dados) ? dados : [];
    } catch (erro) {
      console.error('[Storage] Não foi possível ler a chave "' + chave + '".', erro);
      return [];
    }
  },

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

  carregarProdutos() {
    return this.ler(this.CHAVE_PRODUTOS);
  },

  salvarProdutos(produtos) {
    return this.escrever(this.CHAVE_PRODUTOS, produtos);
  },

  carregarMovimentacoes() {
    return this.ler(this.CHAVE_MOVIMENTACOES);
  },

  salvarMovimentacoes(movimentacoes) {
    return this.escrever(this.CHAVE_MOVIMENTACOES, movimentacoes);
  },

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
