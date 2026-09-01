/**
 * ui.js — FUNÇÕES AUXILIARES DE TELA
 * ---------------------------------------------------------------------------
 * Responsabilidade: tarefas de interface que se repetem em mais de uma tela —
 * formatar valores, montar a etiqueta de situação, exibir mensagens de feedback
 * e mostrar os erros de validação nos formulários.
 *
 * Este arquivo conhece o DOM, mas NÃO conhece as regras de negócio: ele nunca
 * decide nada sobre o estoque, apenas exibe o que recebe.
 *
 * Existe para evitar que dashboard.js, produtos.js e historico.js repitam o
 * mesmo código (RNF11).
 */

const UI = {
  /**
   * Formata um número como moeda brasileira. Ex.: 1234.5 vira "R$ 1.234,50".
   * @param {number} valor
   * @returns {string}
   */
  formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  /**
   * Formata uma data ISO como "dd/mm/aaaa hh:mm".
   * @param {string} dataISO valor gravado no campo `data` da movimentação
   * @returns {string}
   */
  formatarDataHora(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Cria a etiqueta colorida da situação do estoque.
   * A cor é acompanhada sempre do texto ("Normal", "Baixo", "Esgotado"), para
   * que o estado não seja comunicado apenas por cor (acessibilidade).
   * @param {string} status um valor de Estoque.STATUS
   * @returns {HTMLElement}
   */
  criarEtiquetaStatus(status) {
    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta etiqueta--' + status.toLowerCase();
    etiqueta.textContent = Estoque.ROTULOS_STATUS[status];
    return etiqueta;
  },

  /**
   * Preenche um <select> com uma lista de opções.
   * @param {HTMLSelectElement} select
   * @param {Array<{valor: string, texto: string}>} opcoes
   * @param {string} [textoPadrao] primeira opção, de valor vazio
   */
  preencherSelect(select, opcoes, textoPadrao) {
    select.innerHTML = '';

    if (textoPadrao !== undefined) {
      const padrao = document.createElement('option');
      padrao.value = '';
      padrao.textContent = textoPadrao;
      select.appendChild(padrao);
    }

    opcoes.forEach((opcao) => {
      const item = document.createElement('option');
      item.value = opcao.valor;
      item.textContent = opcao.texto;
      select.appendChild(item);
    });
  },

  /**
   * Exibe uma mensagem de feedback ao usuário (RNF07).
   * O elemento de destino deve ter `role="status"` e `aria-live="polite"` no
   * HTML, para que leitores de tela também anunciem a mensagem.
   *
   * @param {HTMLElement} elemento onde a mensagem aparece
   * @param {string} texto
   * @param {'sucesso'|'erro'} tipo
   */
  mostrarMensagem(elemento, texto, tipo) {
    elemento.className = 'aviso aviso--' + tipo;
    elemento.textContent = texto;
    elemento.hidden = false;
  },

  /**
   * Esconde a mensagem de feedback.
   * @param {HTMLElement} elemento
   */
  limparMensagem(elemento) {
    elemento.textContent = '';
    elemento.hidden = true;
  },

  /**
   * Apaga as mensagens de erro de todos os campos de um formulário.
   * @param {HTMLFormElement} formulario
   */
  limparErros(formulario) {
    formulario.querySelectorAll('[data-erro-de]').forEach((span) => {
      span.textContent = '';
    });
    formulario.querySelectorAll('[aria-invalid="true"]').forEach((campo) => {
      campo.setAttribute('aria-invalid', 'false');
    });
  },

  /**
   * Mostra as mensagens de erro devolvidas pela validação, cada uma junto do
   * seu campo, e leva o foco para o primeiro campo com problema (RNF06).
   *
   * O HTML liga o campo à mensagem assim:
   *   <input id="produto-nome" aria-describedby="erro-produto-nome">
   *   <span id="erro-produto-nome" data-erro-de="nome"></span>
   *
   * @param {HTMLFormElement} formulario
   * @param {Object} erros objeto { campo: mensagem } vindo da validação
   */
  mostrarErros(formulario, erros) {
    this.limparErros(formulario);

    let primeiroCampo = null;

    Object.keys(erros).forEach((campo) => {
      const span = formulario.querySelector('[data-erro-de="' + campo + '"]');
      if (span) span.textContent = erros[campo];

      const entrada = formulario.querySelector('[name="' + campo + '"]');
      if (entrada) {
        entrada.setAttribute('aria-invalid', 'true');
        if (primeiroCampo === null) primeiroCampo = entrada;
      }
    });

    if (primeiroCampo !== null) primeiroCampo.focus();
  },

  /**
   * Monta uma célula de tabela já com o texto informado.
   * @param {string} texto
   * @param {string} [classe] classe CSS opcional (ex.: "numero")
   * @returns {HTMLTableCellElement}
   */
  criarCelula(texto, classe) {
    const celula = document.createElement('td');
    celula.textContent = texto;
    if (classe) celula.className = classe;
    return celula;
  },

  /**
   * Substitui o conteúdo de um <tbody> por uma única linha de estado vazio.
   * @param {HTMLElement} corpoTabela
   * @param {number} colunas quantidade de colunas da tabela
   * @param {string} texto mensagem exibida
   */
  mostrarEstadoVazio(corpoTabela, colunas, texto) {
    corpoTabela.innerHTML = '';

    const linha = document.createElement('tr');
    const celula = document.createElement('td');
    celula.colSpan = colunas;
    celula.className = 'estado-vazio';
    celula.textContent = texto;

    linha.appendChild(celula);
    corpoTabela.appendChild(linha);
  }
};
