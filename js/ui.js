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
  }
};
