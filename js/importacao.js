const Importacao = {
  VEICULOS: {
    'gtr-nismo': { nome: 'Nissan GT-R Nismo R35', preco: 950000 },
    'gtr-premium': { nome: 'Nissan GT-R Premium R35', preco: 820000 },
    'supra': { nome: 'Toyota Supra GR A90', preco: 580000 },
    'honda-nsx': { nome: 'Honda NSX Type S', preco: 1290000 },
    'lexus-lc500': { nome: 'Lexus LC 500 Convertible', preco: 1200000 },
    'mazda-rx7': { nome: 'Mazda RX-7 FD3S Spirit R', preco: 610000 },
    'lancer-evo': { nome: 'Mitsubishi Lancer Evolution X', preco: 580000 },
    'infiniti-q60': { nome: 'Infiniti Q60 Red Sport 400', preco: 390000 },
    'gr86': { nome: 'Toyota GR86 Premium', preco: 440000 },
    'acura-nsx': { nome: 'Acura NSX GT3 Evo', preco: 2280000 },
    'hayabusa': { nome: 'Suzuki Hayabusa', preco: 125000 }
  },

  ORIGENS: {
    'Japão': { frete: 18500, prazo: '45 a 60 dias' },
    'Estados Unidos': { frete: 12000, prazo: '30 a 45 dias' }
  },

  // 63% foi escolhido para o GT-R Nismo dar o total do Figma; não é alíquota real.
  ALIQUOTA_IMPOSTOS: 0.63,
  TAXAS_DOCUMENTACAO: 7200,

  calcular(veiculo, origem) {
    const preco = this.VEICULOS[veiculo].preco;
    const { frete, prazo } = this.ORIGENS[origem];
    const impostos = Math.round(((preco + frete) * this.ALIQUOTA_IMPOSTOS) / 1000) * 1000;
    const taxas = this.TAXAS_DOCUMENTACAO;
    return { veiculo: preco, frete, impostos, taxas, total: preco + frete + impostos + taxas, prazo };
  },

  // Valores de exemplo, não taxas reais de banco.
  JUROS_MES: 0.0149,      // 1,49% ao mês
  ENTRADA_MINIMA: 0.2,    // 20% do total
  LIMITE_RENDA: 0.3,      // a parcela pode comprometer até 30% da renda
  PRAZOS: [12, 24, 36, 48, 60],

  // Arredonda para cima: a entrada mínima nunca fica abaixo da regra.
  entradaMinima(total) {
    return Math.ceil(total * this.ENTRADA_MINIMA * 100) / 100;
  },

  financiar(total, entrada, meses, renda) {
    const centavos = (valor) => Math.round(valor * 100) / 100;
    const financiado = total - entrada;
    const i = this.JUROS_MES;
    // Tabela Price: parcela fixa.
    const parcela = centavos((financiado * i) / (1 - Math.pow(1 + i, -meses)));
    const entradaMinima = this.entradaMinima(total);
    const rendaMinima = Math.ceil((parcela / this.LIMITE_RENDA) * 100) / 100;

    return {
      financiado,
      parcela,
      totalPago: centavos(entrada + parcela * meses),
      entradaMinima,
      rendaMinima,
      entradaOk: entrada >= entradaMinima,
      rendaOk: renda >= rendaMinima
    };
  }
};

// "R$ 950.000,00", "950000" ou "950.000" -> 950000
const lerDinheiro = (texto) => Number(String(texto).replace(/[^\d,]/g, '').replace(',', '.')) || 0;

// A parte de tela só roda na página do simulador: a Loja e os testes também carregam este arquivo.
const formSimulador = typeof document !== 'undefined' && document.getElementById('form-simulador');

if (formSimulador) {
  const moeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const campos = formSimulador.elements;

  Object.entries(Importacao.VEICULOS).forEach(([chave, carro]) => {
    campos.veiculo.add(new Option(carro.nome, chave));
  });
  Object.keys(Importacao.ORIGENS).forEach((pais) => campos.origem.add(new Option(pais)));

  const pedido = new URLSearchParams(location.search).get('veiculo');
  if (Importacao.VEICULOS[pedido]) campos.veiculo.value = pedido;

  Importacao.PRAZOS.forEach((meses) => campos.parcelas.add(new Option(meses + ' meses', meses)));
  campos.parcelas.value = '48';

  const texto = (id, valor) => { document.getElementById(id).textContent = valor; };
  const camposFinanciamento = document.getElementById('campos-financiamento');

  // ok: true (verde), false (vermelho) ou undefined (neutro, só uma orientação).
  const veredito = (mensagem, ok) => {
    const p = document.getElementById('fin-veredito');
    p.textContent = mensagem;
    p.className = 'k-aviso' + (ok === undefined ? '' : ok ? ' k-aviso--ok' : ' k-aviso--erro');
  };

  function mostrarFinanciamento(total) {
    const financiado = campos.pagamento.value === 'Financiado';
    camposFinanciamento.hidden = !financiado;
    camposFinanciamento.disabled = !financiado;
    document.getElementById('resumo-financiamento').hidden = !financiado;
    if (!financiado) {
      texto('fin-veredito', '');
      return;
    }

    const entrada = lerDinheiro(campos.entrada.value);
    const meses = Number(campos.parcelas.value);
    const renda = lerDinheiro(campos.renda.value);
    texto('ajuda-entrada', 'Mínimo de ' + Importacao.ENTRADA_MINIMA * 100 + '%: ' + moeda(Importacao.entradaMinima(total)));

    if (entrada > total) {
      ['fin-entrada', 'fin-financiado', 'fin-parcelas', 'fin-total'].forEach((id) => texto(id, '—'));
      veredito('A entrada não pode ser maior que o valor total.', false);
      return;
    }

    const f = Importacao.financiar(total, entrada, meses, renda);
    texto('fin-entrada', moeda(entrada));
    texto('fin-financiado', moeda(f.financiado));
    texto('fin-parcelas', meses + 'x de ' + moeda(f.parcela));
    texto('fin-total', moeda(f.totalPago));

    if (!f.entradaOk) {
      veredito('Entrada abaixo do mínimo: são necessários ' + moeda(f.entradaMinima) + '.', false);
    } else if (!renda) {
      veredito('Informe sua renda mensal para saber se a parcela cabe no orçamento.');
    } else if (!f.rendaOk) {
      veredito('A parcela passa de 30% da sua renda. Renda mínima: ' + moeda(f.rendaMinima) + ' (ou aumente a entrada ou o prazo).', false);
    } else {
      veredito('A parcela cabe em até 30% da sua renda.', true);
    }
  }

  const mostrar = () => {
    const r = Importacao.calcular(campos.veiculo.value, campos.origem.value);
    ['veiculo', 'frete', 'impostos', 'taxas', 'total'].forEach((item) => {
      texto('resumo-' + item, moeda(r[item]));
    });
    texto('resumo-prazo', r.prazo);
    mostrarFinanciamento(r.total);
  };

  campos.pagamento.addEventListener('change', () => {
    if (campos.pagamento.value === 'Financiado' && !campos.entrada.value) {
      const { total } = Importacao.calcular(campos.veiculo.value, campos.origem.value);
      campos.entrada.value = moeda(Importacao.entradaMinima(total));
    }
  });

  formSimulador.querySelectorAll('.dinheiro').forEach((campo) => {
    campo.addEventListener('blur', () => {
      if (campo.value.trim()) campo.value = moeda(lerDinheiro(campo.value));
    });
  });

  // O resumo segue cada mudança; o submit fica para quem espera clicar no botão.
  formSimulador.addEventListener('change', mostrar);
  formSimulador.addEventListener('submit', (evento) => {
    evento.preventDefault();
    mostrar();
  });

  mostrar();
}
