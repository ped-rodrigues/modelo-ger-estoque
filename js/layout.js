const UI = {
  formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

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

  criarEtiquetaStatus(status) {
    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta etiqueta--' + status.toLowerCase();
    etiqueta.textContent = Estoque.ROTULOS_STATUS[status];
    return etiqueta;
  },

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

  mostrarMensagem(elemento, texto, tipo) {
    elemento.className = 'aviso aviso--' + tipo;
    elemento.textContent = texto;
    elemento.hidden = false;
  },

  limparMensagem(elemento) {
    elemento.textContent = '';
    elemento.hidden = true;
  },

  limparErros(formulario) {
    formulario.querySelectorAll('[data-erro-de]').forEach((span) => {
      span.textContent = '';
    });
    formulario.querySelectorAll('[aria-invalid="true"]').forEach((campo) => {
      campo.setAttribute('aria-invalid', 'false');
    });
  },

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

  criarCelula(texto, classe) {
    const celula = document.createElement('td');
    celula.textContent = texto;
    if (classe) celula.className = classe;
    return celula;
  },

  mostrarEstadoVazio(corpoTabela, colunas, texto) {
    corpoTabela.innerHTML = '';

    const linha = document.createElement('tr');
    const celula = document.createElement('td');
    celula.colSpan = colunas;
    celula.className = 'estado-vazio';
    celula.textContent = texto;

    linha.appendChild(celula);
    corpoTabela.appendChild(linha);
  },

  // Linha de movimentação, usada no histórico e nas últimas movimentações do Dashboard.
  criarLinhaMovimentacao(movimentacao) {
    const linha = document.createElement('tr');
    const entrada = movimentacao.tipo === Estoque.TIPOS.ENTRADA;

    linha.appendChild(this.criarCelula(this.formatarDataHora(movimentacao.data)));
    linha.appendChild(this.criarCelula(movimentacao.produtoNome));

    const celulaTipo = document.createElement('td');
    const etiqueta = document.createElement('span');
    // Texto e cor juntos: o tipo não depende só da cor (RNF05).
    etiqueta.className = 'etiqueta ' + (entrada ? 'etiqueta--normal' : 'etiqueta--baixo');
    etiqueta.textContent = entrada ? 'Entrada' : 'Saída';
    celulaTipo.appendChild(etiqueta);
    linha.appendChild(celulaTipo);

    linha.appendChild(this.criarCelula((entrada ? '+' : '−') + movimentacao.quantidade, 'numero'));
    return linha;
  },

  // Sem login (página aberta direto), vale o menor acesso: Funcionário.
  perfilAtual() {
    return Estoque.ehAdministrador(Storage.lerPerfil()) ? Estoque.PERFIS.ADM : Estoque.PERFIS.OPR;
  },

  // Menu do painel: mostra quem está logado e esconde do Funcionário o que é do Administrador.
  aplicarPerfil() {
    const logado = document.getElementById('perfil-logado');
    if (!logado) return; // fora do painel (login)

    const perfil = this.perfilAtual();
    logado.textContent = Estoque.ROTULOS_PERFIS[perfil];

    if (!Estoque.ehAdministrador(perfil)) {
      document.querySelectorAll('[data-perfil="ADM"]').forEach((elemento) => {
        elemento.hidden = true;
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => UI.aplicarPerfil());
