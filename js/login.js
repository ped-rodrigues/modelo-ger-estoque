const TelaLogin = {
  el: {},

  DESTINO_ADM: 'dashboard.html',
  DESTINO_OPR: 'produtos.html',

  // Tempo para a mensagem de sucesso ser vista e anunciada antes de trocar de página.
  ESPERA_ATE_ENTRAR: 800,

  MINIMO_USUARIO: 3,

  iniciar() {
    this.el = {
      formulario: document.getElementById('form-login'),
      mensagem: document.getElementById('mensagem-login'),
      linkSenha: document.getElementById('link-senha'),
      linkCadastro: document.getElementById('link-cadastro')
    };

    this.el.formulario.addEventListener('submit', (evento) => this.aoEnviar(evento));

    // Não há autenticação no projeto: estes links explicam isso em vez de quebrar.
    this.el.linkSenha.addEventListener('click', (evento) => {
      evento.preventDefault();
      UI.mostrarMensagem(
        this.el.mensagem,
        'Recuperação de senha não faz parte deste projeto. Use qualquer usuário e senha para entrar.',
        'erro'
      );
    });

    this.el.linkCadastro.addEventListener('click', (evento) => {
      evento.preventDefault();
      UI.mostrarMensagem(
        this.el.mensagem,
        'Cadastro de usuários não faz parte deste projeto. Use qualquer e-mail e senha para entrar.',
        'erro'
      );
    });
  },

  validar(usuario, senha) {
    const erros = {};

    if (usuario === '') {
      erros.usuario = 'Informe o e-mail.';
    } else if (usuario.length < this.MINIMO_USUARIO) {
      erros.usuario = 'Mínimo de ' + this.MINIMO_USUARIO + ' caracteres.';
    }

    if (senha === '') {
      erros.senha = 'Informe a senha.';
    }

    return erros;
  },

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

    // Administrador abre no Dashboard; Funcionário vai direto ao estoque (seção 1.8).
    const perfil = formulario.elements.perfil.value;
    Storage.salvarPerfil(perfil);
    const adm = Estoque.ehAdministrador(perfil);

    UI.mostrarMensagem(
      this.el.mensagem,
      adm ? 'Acesso liberado. Abrindo o painel geral...' : 'Acesso liberado. Abrindo o estoque...',
      'sucesso'
    );

    // Evita um segundo envio enquanto a próxima página não carrega.
    formulario.querySelector('button[type="submit"]').disabled = true;

    window.setTimeout(() => {
      window.location.href = adm ? this.DESTINO_ADM : this.DESTINO_OPR;
    }, this.ESPERA_ATE_ENTRAR);
  }
};

document.addEventListener('DOMContentLoaded', () => TelaLogin.iniciar());
