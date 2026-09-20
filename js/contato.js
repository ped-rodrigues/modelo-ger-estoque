/**
 * contato.js — TELA DE CONTATO
 * ---------------------------------------------------------------------------
 * Responsabilidade: validar o formulário "Fale conosco" e confirmar o envio.
 *
 * O projeto não tem servidor (decisão D1), então não existe para onde enviar a
 * mensagem. A tela vai até onde o escopo permite: confere os campos, mostra os
 * erros junto de cada um e confirma na própria página. Nada é gravado — o
 * `localStorage` guarda estoque, não recados.
 *
 * A validação segue o mesmo formato de `Validacao` e reaproveita `UI` para
 * exibir erros e mensagens (RNF11).
 *
 * Atende: RNF06 (validação), RNF07 (feedback visual).
 */

const TelaContato = {
  el: {},

  // Limites dos campos. Não são regra de negócio: é conferência de formulário.
  MINIMO_NOME: 3,
  MINIMO_COMENTARIOS: 10,
  MAXIMO_COMENTARIOS: 600,

  /** Formato mínimo de e-mail: algo, arroba, algo, ponto, algo. */
  FORMATO_EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /**
   * Telefone brasileiro: 10 ou 11 dígitos contando o DDD.
   * A conferência é feita sobre os dígitos, então o usuário pode digitar com
   * ou sem parênteses, espaços e traços.
   */
  DIGITOS_TELEFONE: { minimo: 10, maximo: 11 },

  // ==========================================================================
  // INICIALIZAÇÃO
  // ==========================================================================

  iniciar() {
    this.el = {
      formulario: document.getElementById('form-contato'),
      mensagem: document.getElementById('mensagem-contato'),
      comentarios: document.getElementById('contato-comentarios'),
      contador: document.getElementById('contador-caracteres')
    };

    this.el.formulario.addEventListener('submit', (evento) => this.aoEnviar(evento));

    // Contador de caracteres: o usuário vê quanto ainda cabe antes de esbarrar
    // no limite, em vez de descobrir quando o texto para de entrar.
    this.el.comentarios.addEventListener('input', () => {
      this.el.contador.textContent = this.el.comentarios.value.length;
    });
  },

  // ==========================================================================
  // VALIDAÇÃO
  // ==========================================================================

  /**
   * Confere os campos do formulário.
   * @param {{nome: string, email: string, telefone: string, comentarios: string}} dados
   * @returns {Object} { campo: mensagem }; vazio quando não há erro
   */
  validar(dados) {
    const erros = {};

    if (dados.nome === '') {
      erros.nome = 'Informe seu nome.';
    } else if (dados.nome.length < this.MINIMO_NOME) {
      erros.nome = 'O nome deve ter pelo menos ' + this.MINIMO_NOME + ' caracteres.';
    }

    if (dados.email === '') {
      erros.email = 'Informe seu e-mail.';
    } else if (!this.FORMATO_EMAIL.test(dados.email)) {
      erros.email = 'Informe um e-mail válido. Ex.: nome@empresa.com';
    }

    // Só os dígitos importam: a pontuação que o usuário digitou é ignorada.
    const digitos = dados.telefone.replace(/\D/g, '');

    if (dados.telefone === '') {
      erros.telefone = 'Informe seu telefone.';
    } else if (digitos.length < this.DIGITOS_TELEFONE.minimo ||
               digitos.length > this.DIGITOS_TELEFONE.maximo) {
      erros.telefone = 'Informe o telefone com DDD. Ex.: (11) 90000-0000';
    }

    if (dados.comentarios === '') {
      erros.comentarios = 'Escreva sua mensagem.';
    } else if (dados.comentarios.length < this.MINIMO_COMENTARIOS) {
      erros.comentarios = 'A mensagem deve ter pelo menos ' +
        this.MINIMO_COMENTARIOS + ' caracteres.';
    } else if (dados.comentarios.length > this.MAXIMO_COMENTARIOS) {
      erros.comentarios = 'A mensagem deve ter no máximo ' +
        this.MAXIMO_COMENTARIOS + ' caracteres.';
    }

    return erros;
  },

  // ==========================================================================
  // EVENTOS
  // ==========================================================================

  /**
   * Trata o envio do formulário.
   * @param {SubmitEvent} evento
   */
  aoEnviar(evento) {
    evento.preventDefault();

    const formulario = this.el.formulario;

    const dados = {
      nome: formulario.elements.nome.value.trim(),
      email: formulario.elements.email.value.trim(),
      telefone: formulario.elements.telefone.value.trim(),
      comentarios: formulario.elements.comentarios.value.trim()
    };

    const erros = this.validar(dados);

    if (Object.keys(erros).length > 0) {
      UI.limparMensagem(this.el.mensagem);
      UI.mostrarErros(formulario, erros);
      return;
    }

    UI.limparErros(formulario);
    UI.mostrarMensagem(
      this.el.mensagem,
      'Obrigado, ' + dados.nome + '! Sua mensagem foi validada. ' +
      'Como este projeto não tem servidor, ela não é enviada nem armazenada.',
      'sucesso'
    );

    formulario.reset();
    this.el.contador.textContent = '0';

    // O foco vai para a confirmação: quem navega por teclado precisa ser
    // levado até a resposta, e não continuar no fim do formulário vazio.
    this.el.mensagem.setAttribute('tabindex', '-1');
    this.el.mensagem.focus();
  }
};

document.addEventListener('DOMContentLoaded', () => TelaContato.iniciar());
