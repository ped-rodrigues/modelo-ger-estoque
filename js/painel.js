const form = document.getElementById('form-carro');
const MAX_FOTOS = 10;
// Fotos mínimas para publicar: capa + 3 ângulos. Abaixo disso o item fica pendente.
const MIN_FOTOS = 4;
let fotos = []; // { arquivo, url }

const aviso = (texto) => { document.getElementById('aviso-carro').textContent = texto; };
const moeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// "R$ 950.000,00", "950000" ou "950.000" -> 950000
const lerDinheiro = (texto) => Number(texto.replace(/[^\d,]/g, '').replace(',', '.')) || 0;

const secaoCompleta = (numero) =>
  [...form.querySelectorAll('fieldset.k-cartao')[numero - 1].querySelectorAll('[required]')]
    .every((campo) => campo.checkValidity());

function desenharFotos() {
  const caixa = document.getElementById('fotos');
  const nomes = ['Capa', 'Foto 2', 'Foto 3'];
  caixa.replaceChildren();

  for (let i = 0; i < Math.max(nomes.length, fotos.length); i++) {
    const item = document.createElement('div');
    if (fotos[i]) {
      const img = document.createElement('img');
      img.src = fotos[i].url;
      img.alt = i === 0 ? 'Capa' : 'Foto ' + (i + 1);
      item.append(img);
    } else {
      item.textContent = nomes[i];
    }
    caixa.append(item);
  }

  if (fotos.length < MAX_FOTOS) {
    const adicionar = document.createElement('label');
    adicionar.textContent = '+ adicionar';
    adicionar.htmlFor = 'entrada-fotos';
    caixa.append(adicionar);
  }
}

function atualizar() {
  const campos = form.elements;
  const nome = (campos.marca.value + ' ' + campos.modelo.value).trim();
  document.getElementById('previa-nome').textContent = nome || 'Nome do carro';
  document.getElementById('previa-preco').textContent = moeda(lerDinheiro(campos.preco.value));

  const capa = document.getElementById('previa-foto');
  if (fotos[0]) {
    const img = document.createElement('img');
    img.src = fotos[0].url;
    img.alt = 'Capa de ' + (nome || 'carro');
    capa.replaceChildren(img);
  } else {
    capa.textContent = 'Foto de capa';
  }

  document.getElementById('total-fotos').textContent = fotos.length;
  document.querySelectorAll('#checklist li').forEach((item) => {
    const secao = item.dataset.secao;
    item.classList.toggle('feito', secao === 'fotos' ? fotos.length >= MIN_FOTOS : secaoCompleta(Number(secao)));
  });
}

const entrada = form.elements.fotos;
entrada.id = 'entrada-fotos';
entrada.addEventListener('change', () => {
  const novas = [...entrada.files].slice(0, MAX_FOTOS - fotos.length);
  fotos = fotos.concat(novas.map((arquivo) => ({ arquivo, url: URL.createObjectURL(arquivo) })));
  if (entrada.files.length > novas.length) aviso('Limite de ' + MAX_FOTOS + ' fotos: as demais foram ignoradas.');
  entrada.value = ''; // permite escolher o mesmo arquivo de novo
  desenharFotos();
  atualizar();
});

const envio = document.getElementById('envio-fotos');
envio.addEventListener('dragover', (evento) => evento.preventDefault());
envio.addEventListener('drop', (evento) => {
  evento.preventDefault();
  entrada.files = evento.dataTransfer.files;
  entrada.dispatchEvent(new Event('change'));
});

form.querySelectorAll('.dinheiro').forEach((campo) => {
  campo.addEventListener('blur', () => {
    if (campo.value.trim()) campo.value = moeda(lerDinheiro(campo.value));
  });
});

form.addEventListener('input', atualizar);

document.getElementById('salvar-rascunho').addEventListener('click', () => {
  aviso('Demonstração: o rascunho não foi salvo.');
});

form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    aviso('Preencha os campos obrigatórios antes de publicar.');
    return;
  }
  if (fotos.length < MIN_FOTOS) {
    aviso('Envie pelo menos ' + MIN_FOTOS + ' fotos antes de publicar.');
    return;
  }
  aviso('Demonstração: tudo certo, mas o carro não foi publicado.');
});

desenharFotos();
atualizar();
