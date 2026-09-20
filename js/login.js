/**
 * login.js — TELA DE ACESSO
 * ---------------------------------------------------------------------------
 * Responsabilidade: ligar a tela `pages/login.html` ao usuário. Ela confere se
 * os campos foram preenchidos, mostra os erros junto de cada campo e, quando
 * está tudo certo, encaminha para a tela principal.
 *
 * Esta tela é GENÉRICA de propósito. Autenticação real está fora do escopo do
 * projeto (seção 1 de docs/requisitos.md): não existe cadastro de usuários,
 * nem senha guardada, nem sessão. Por isso o arquivo:
 *
 *   - não usa `Storage` (ele guarda estoque, não usuários);
 *   - não usa `Estoque` (nenhuma regra de negócio é aplicada aqui);
 *   - não grava nada no navegador, nem mesmo a marcação "Remember me".
 *
 * Como as demais telas, este arquivo conhece o DOM e reaproveita `UI` para as
 * mensagens (RNF11).
 *
 * Atende: RNF06 (campos com validação), RNF07 (feedback visual).
 */

const TelaLogin = {
  // Referências aos elementos da página, preenchidas em iniciar().
  el: {},

  // Para onde o usuário vai depois de entrar: a tela de estoque, que é a
  // principal do sistema.
  DESTINO: 'estoque.html',

  // Tempo até a troca de página, em milissegundos. Existe para a mensagem de
  // sucesso ser vista e anunciada pelo leitor de tela antes da navegação.
  ESPERA_ATE_ENTRAR: 800,

  /**
   * Formato mínimo de e-mail: algo, arroba, algo, ponto, algo.
   * Não é validação de e-mail de verdade (isso exigiria enviar uma mensagem),
   * é só uma conferência de formulário para pegar o engano óbvio.
   */
  FORMATO_EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // ==========================================================================
  // INICIALIZAÇÃO
  // ==========================================================================

  iniciar() {
    this.el = {
      formulario: document.getElementById('form-login'),
      mensagem: document.getElementById('mensagem-login'),
      linkSenha: document.getElementById('link-senha'),
      botaoCadastro: document.getElementById('botao-cadastro')
    };

    this.el.formulario.addEventListener('submit', (evento) => this.aoEnviar(evento));

    // O "Forgot password?" não tem para onde levar em uma tela sem
    // autenticação. Em vez de um link quebrado, ele explica isso.
    this.el.linkSenha.addEventListener('click', (evento) => {
      evento.preventDefault();
      this.avisarForaDoEscopo(
        'Recuperação de senha não faz parte deste projeto. Use qualquer e-mail e senha para entrar.'
      );
    });

    // O "Sign up" existe no Figma, mas cadastro de usuários está fora do
    // escopo. O botão continua na tela e explica o porquê.
    this.el.botaoCadastro.addEventListener('click', () => {
      this.avisarForaDoEscopo(
        'Cadastro de usuários não faz parte deste projeto. Use qualquer e-mail e senha para entrar.'
      );
    });
  },

  /**
   * Mostra um aviso de funcionalidade fora do escopo e limpa os erros de
   * campo que estivessem na tela, para não misturar as duas coisas.
   * @param {string} texto
   */
  avisarForaDoEscopo(texto) {
    UI.limparErros(this.el.formulario);
    UI.mostrarMensagem(this.el.mensagem, texto, 'erro');
  },

  // ==========================================================================
  // VALIDAÇÃO
  // ==========================================================================

  /**
   * Confere os campos da tela de acesso.
   *
   * Segue o formato usado por `Validacao`: devolve um objeto de erros com uma
   * mensagem por campo, no mesmo formato que `UI.mostrarErros` já sabe exibir.
   *
   * @param {string} email
   * @param {string} senha
   * @returns {Object} { campo: mensagem }; vazio quando não há erro
   */
  validar(email, senha) {
    const erros = {};

    if (email === '') {
      erros.email = 'Informe o e-mail.';
    } else if (!this.FORMATO_EMAIL.test(email)) {
      erros.email = 'Informe um e-mail válido. Ex.: nome@empresa.com';
    }

    if (senha === '') {
      erros.senha = 'Informe a senha.';
    }

    return erros;
  },

  // ==========================================================================
  // EVENTOS
  // ==========================================================================

  /**
   * Trata o envio do formulário.
   * @param {Event} evento
   */
  aoEnviar(evento) {
    evento.preventDefault();

    const formulario = this.el.formulario;
    const email = formulario.elements.email.value.trim();
    const senha = formulario.elements.senha.value;

    const erros = this.validar(email, senha);

    if (Object.keys(erros).length > 0) {
      UI.limparMensagem(this.el.mensagem);
      UI.mostrarErros(formulario, erros);
      return;
    }

    UI.limparErros(formulario);
    UI.mostrarMensagem(this.el.mensagem, 'Acesso liberado. Abrindo o estoque...', 'sucesso');

    // Evita um segundo envio enquanto a próxima página não carrega.
    formulario.querySelector('button[type="submit"]').disabled = true;

    window.setTimeout(() => {
      window.location.href = this.DESTINO;
    }, this.ESPERA_ATE_ENTRAR);
  }
};

document.addEventListener('DOMContentLoaded', () => TelaLogin.iniciar());
