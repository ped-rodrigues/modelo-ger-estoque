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
 *   - não grava nada no navegador, nem mesmo a marcação "lembrar de mim".
 *
 * Como as demais telas, este arquivo conhece o DOM e reaproveita `UI` para as
 * mensagens (RNF11).
 *
 * Atende: RNF06 (campos com validação), RNF07 (feedback visual).
 */

const TelaLogin = {
  // Referências aos elementos da página, preenchidas em iniciar().
  el: {},

  // Para onde o usuário vai depois de entrar. Enquanto o dashboard não existe,
  // a tela de peças é a página principal do sistema.
  DESTINO: 'produtos.html',

  // Tempo até a troca de página, em milissegundos. Existe para a mensagem de
  // sucesso ser vista e anunciada pelo leitor de tela antes da navegação.
  ESPERA_ATE_ENTRAR: 800,

  // Tamanho mínimo do usuário. Não é regra de negócio: é só uma conferência de
  // formulário, para o campo não ser enviado com uma letra solta.
  MINIMO_USUARIO: 3,

  // ==========================================================================
  // INICIALIZAÇÃO
  // ==========================================================================

  iniciar() {
    this.el = {
      formulario: document.getElementById('form-login'),
      mensagem: document.getElementById('mensagem-login'),
      linkSenha: document.getElementById('link-senha')
    };

    this.el.formulario.addEventListener('submit', (evento) => this.aoEnviar(evento));

    // O "esqueci minha senha" não tem para onde levar em uma tela sem
    // autenticação. Em vez de um link quebrado, ele explica isso.
    this.el.linkSenha.addEventListener('click', (evento) => {
      evento.preventDefault();
      UI.mostrarMensagem(
        this.el.mensagem,
        'Recuperação de senha não faz parte deste projeto. Use qualquer usuário e senha para entrar.',
        'erro'
      );
    });
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
   * @param {string} usuario
   * @param {string} senha
   * @returns {Object} { campo: mensagem }; vazio quando não há erro
   */
  validar(usuario, senha) {
    const erros = {};

    if (usuario === '') {
      erros.usuario = 'Informe o usuário.';
    } else if (usuario.length < this.MINIMO_USUARIO) {
      erros.usuario = 'O usuário deve ter pelo menos ' + this.MINIMO_USUARIO + ' caracteres.';
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
    const usuario = formulario.elements.usuario.value.trim();
    const senha = formulario.elements.senha.value;

    const erros = this.validar(usuario, senha);

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
