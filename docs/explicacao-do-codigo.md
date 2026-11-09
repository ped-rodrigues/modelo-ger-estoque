# Explicação do código — Kaisen / Gerenciador de Estoque

Este documento explica como o projeto funciona, arquivo por arquivo. O código tem poucos
comentários de propósito: eles ficaram só onde o motivo de uma linha não é óbvio. O resto da
explicação (o que cada parte faz, por que foi feita assim e como as partes se ligam) está aqui.

Documentos relacionados:

- `README.md`: visão geral, como executar e estrutura de pastas.
- `docs/requisitos.md`: requisitos (RF, RNF), regras de negócio (RN) e modelo de dados originais.
- `docs/casos-de-teste.md`: roteiro dos testes automatizados e manuais.
- `docs/diario-do-projeto.md`: histórico das sessões e das decisões D1 a D5.

---

## 1. Visão geral

O projeto tem duas partes que dividem o mesmo repositório:

| Parte | Para quem | Páginas | Dados |
|-------|-----------|---------|-------|
| **Site público Kaisen** | Clientes da loja de carros importados | Início, Garagem, Estoque, Loja, Importação, Carro, Pedido, Venda, Contato | Fixos no HTML/JS |
| **Painel interno** | Funcionários | Login, Estoque de peças, Adicionar carro, Testes | Peças salvas no `localStorage` |

Não existe servidor nem banco de dados. Tudo roda no navegador, e o único dado que persiste é o
estoque de peças do painel interno, gravado no `localStorage`.

### Como executar

Abra `index.html` com um duplo clique. Não precisa instalar nada.

Isso funciona porque o projeto usa **scripts clássicos** (`<script src>`), e não módulos ES
(`import`/`export`): o navegador bloqueia módulos ES em páginas abertas por `file://`. Essa é a
decisão **D1**. A consequência é que cada arquivo JS cria **um objeto global** (`Storage`,
`Estoque`, `UI`...) e a **ordem das tags `<script>` importa**: quem é usado vem antes de quem usa.

### O que é demonstração

Várias telas fazem tudo do lado do navegador mas não enviam nada, porque não há servidor:

- **Login:** qualquer usuário e senha entram.
- **Contato e Venda seu carro:** validam os campos e avisam que nada foi enviado.
- **Pedido:** página fixa, e o "Baixar contrato" só mostra um aviso.
- **Adicionar carro:** confere tudo, mas não grava.
- **Carrinho da Loja:** fica só na memória da página e não envia o pedido.

---

## 2. Mapa de páginas

| Página | O que faz | CSS | JS |
|--------|-----------|-----|----|
| `index.html` | Página inicial: capa, vitrine do GT-R NISMO, últimos lançamentos | `site.css` | — |
| `pages/garagem.html` | Carros personalizados e vendidos, com abas de filtro | `site.css` | inline (abas) |
| `pages/estoque.html` | Vitrine dos 11 carros com filtro por palavra e marca | `site.css` | inline (filtro) |
| `pages/carro.html` | Detalhe do Nissan GT-R Nismo R35 com galeria | `site.css` | inline (galeria) |
| `pages/loja.html` | Loja de veículos e acessórios, com carrinho | `site.css` | `importacao.js`, `loja.js` |
| `pages/importacao.html` | Simulador do custo de importação e do financiamento | `site.css` | `importacao.js` |
| `pages/pedido.html` | Acompanhamento do pedido #2041 | `site.css` | inline (aviso) |
| `pages/venda.html` | Formulário "Venda seu carro para nós" | `site.css` | inline (aviso) |
| `pages/contato.html` | Formulário "Fale conosco" | `site.css` | inline (aviso) |
| `pages/login.html` | Acesso de funcionários | `login.css` | `ui.js`, `login.js` |
| `pages/produtos.html` | Estoque de peças: CRUD, filtros e movimentações | `site.css`, `produtos.css` | `storage.js`, `validacao.js`, `estoque.js`, `ui.js`, `produtos.js` |
| `pages/painel.html` | Adicionar carro (fotos, prévia, checklist) | `site.css` | `painel.js` |
| `pages/testes.html` | Executa os casos de teste CT01 a CT17 | `style.css` | `storage.js`, `validacao.js`, `estoque.js`, `importacao.js`, `loja.js`, `testes.js` |

### Como as páginas se ligam

- O menu das páginas públicas tem: Início, Garagem, Estoque, Loja, Importação, Sobre e Contato.
- **Estoque → Importação:** cada carro tem "Simular importação", que abre
  `importacao.html?veiculo=<chave>` com o carro já escolhido.
- **Loja → Importação:** cada veículo tem o mesmo botão, e o carrinho leva ao simulador.
- **Garagem → Venda:** o botão "Enviar meu carro".
- **Carro → Importação e Contato:** "Simular importação" e "Falar com consultor".
- **Login → Estoque de peças:** depois de entrar, o login leva a `produtos.html`.
- **Menu lateral do painel:** Estoque, Adicionar carro, Garagem, Pedidos, Testes e Sair.
  "Painel geral" e "Clientes" aparecem apagados e sem link porque ainda não têm tela.

---

## 3. Arquitetura do painel interno (estoque de peças)

O estoque de peças é a parte com regras de negócio de verdade, e por isso é dividido em camadas.
A dependência sempre aponta para baixo:

```text
Telas       produtos.js, login.js       conhecem o DOM; não decidem regras
              │  usam
Apoio       ui.js                        formata e exibe; não decide regras
              │
Regras      estoque.js ──► validacao.js  não conhecem o DOM (testáveis sozinhos)
              │
Dados       storage.js                   único arquivo que usa localStorage
```

Duas regras sustentam essa divisão:

1. **Só `storage.js` toca no `localStorage`.** Para trocar o armazenamento (por uma API, por
   exemplo), basta mudar esse arquivo.
2. **`estoque.js` e `validacao.js` nunca acessam o DOM.** Por isso os testes podem chamá-los
   diretamente, sem tela.

### Padrão de retorno

As operações não lançam erro: elas devolvem um objeto dizendo se deu certo.

- **Formulário de produto** (`cadastrarProduto`, `editarProduto`):
  `{ ok, erros: { campo: mensagem }, produto }`. As mensagens vêm por campo, e
  `UI.mostrarErros` exibe cada uma ao lado do campo certo.
- **Demais operações** (`excluirProduto`, `registrarMovimentacao`): `{ ok, erro, ... }`, com
  uma mensagem só.

---

## 4. Modelo de dados (`localStorage`)

Duas chaves, cada uma com um array em JSON. O prefixo `gestoque.` evita conflito com outros
projetos abertos no mesmo endereço.

### `gestoque.produtos`

```js
{
  id: 'p_m0x3k1a_7f2qd',     // gerado por Estoque.gerarId('p')
  codigo: 'FR-4213',         // código do catálogo, maiúsculo e único (RN10)
  nome: 'Pastilha de freio dianteira',
  fabricante: 'Fras-le',
  aplicacao: 'Gol G5 1.0 2008-2014',   // opcional; '' quando vazio
  categoria: 'Freios',       // um item de Estoque.CATEGORIAS
  preco: 189.9,
  quantidade: 12,            // só muda por movimentação (D2)
  estoqueMinimo: 4
}
```

### `gestoque.movimentacoes`

```js
{
  id: 'm_m0x3k1b_2ka9p',
  produtoId: 'p_m0x3k1a_7f2qd',
  produtoNome: 'Pastilha de freio dianteira',  // cópia do nome (D3)
  tipo: 'ENTRADA',           // ou 'SAIDA'
  quantidade: 12,
  data: '2026-11-09T12:30:00.000Z'
}
```

> O `docs/requisitos.md` ainda descreve o modelo antigo (sem `codigo`, `fabricante` e
> `aplicacao`, com as categorias "Eletrônicos, Periféricos..."). O código atual é o descrito acima.

---

## 5. JavaScript, arquivo por arquivo

### 5.1 `js/storage.js` — persistência

Objeto `Storage`. É a única porta para o `localStorage`.

| Função | O que faz |
|--------|-----------|
| `disponivel()` | Testa gravar e apagar uma chave. Em modo anônimo ou com armazenamento bloqueado, o navegador lança erro, e a função devolve `false`. |
| `ler(chave)` | Lê e converte o JSON. Se a chave não existe, o JSON está quebrado ou o conteúdo não é um array, devolve `[]`. Assim um dado corrompido não derruba a aplicação. |
| `escrever(chave, lista)` | Grava a lista. Devolve `false` se falhar (normalmente por falta de espaço). |
| `carregarProdutos` / `salvarProdutos` | Atalhos para a chave de produtos. |
| `carregarMovimentacoes` / `salvarMovimentacoes` | Atalhos para a chave de movimentações. |
| `limparTudo()` | Apaga as duas chaves. Usado pelos testes. |

### 5.2 `js/validacao.js` — validação

Objeto `Validacao`. Funções puras: recebem o texto do formulário e devolvem se é válido e o dado
já convertido (o formulário entrega texto; o sistema trabalha com números).

| Função | O que faz |
|--------|-----------|
| `paraNumero(valor)` | Converte texto em número aceitando vírgula (`"12,50"` → `12.5`). Devolve `null` se não for número. |
| `validarProduto(dados)` | Valida todos os campos da peça e devolve `{ valido, erros, produto }`. |
| `validarQuantidadeMovimentacao(valor)` | Exige inteiro maior que zero. |

Detalhes de `validarProduto`:

- **Código:** obrigatório, 2 a 30 caracteres. Só aceita letras, números, hífen, ponto, barra e
  espaço (`FORMATO_CODIGO`). É guardado em maiúsculas e com espaços únicos, para que `fr 4213`,
  `FR  4213` e `Fr 4213` sejam o mesmo código na comparação de unicidade e na pesquisa.
- **Nome:** 2 a 60 caracteres. **Fabricante:** 2 a 40.
- **Aplicação:** opcional, até 80. É opcional porque itens como óleo não servem a um carro
  específico.
- **Categoria:** precisa estar em `Estoque.CATEGORIAS`.
- **Preço:** número maior ou igual a zero (RN08).
- **Quantidade e estoque mínimo:** inteiros maiores ou iguais a zero (RN09).
- **A quantidade só é validada quando vem nos dados.** Na edição ela não é enviada, porque só muda
  por movimentação (D2).
- **O que não fica aqui:** a unicidade do código (RN10) e "saída maior que o estoque" (RN02)
  dependem dos dados salvos, por isso moram em `estoque.js`, que mantém a validação pura.
- **Ordem dos scripts:** `validarProduto` lê `Estoque.CATEGORIAS`, mas só quando é chamada, nunca
  no carregamento. Por isso a ordem entre `validacao.js` e `estoque.js` não quebra nada.

### 5.3 `js/estoque.js` — regras de negócio

Objeto `Estoque`. Usa `Validacao` para validar e `Storage` para salvar.

**Constantes**

| Constante | Conteúdo |
|-----------|----------|
| `CATEGORIAS` | 11 categorias de autopeças (Motor, Freios, Suspensão e Direção...). Para criar uma categoria nova, basta acrescentar o texto aqui (D4). |
| `STATUS` / `ROTULOS_STATUS` | `NORMAL`, `BAIXO`, `ESGOTADO` e o texto exibido de cada um. |
| `TIPOS` | `ENTRADA` e `SAIDA`. |

**Funções puras (só calculam)**

| Função | O que faz |
|--------|-----------|
| `gerarId(prefixo)` | Instante atual + trecho aleatório, em base 36. Ex.: `p_m0x3k1a_7f2qd`. |
| `classificar(produto)` | `0` → ESGOTADO (RN03); até o mínimo → BAIXO (RN04); acima → NORMAL (RN05). |
| `valorTotalProduto(produto)` | `preco × quantidade` (RN06). |
| `calcularIndicadores(produtos)` | Total de produtos, total de itens, quantos estão baixos, quantos esgotados e valor total. Pensado para o dashboard, que ainda não existe. |
| `normalizarTexto(texto)` | Minúsculas e sem acento, para "suspensao" achar "Suspensão". O `normalize('NFD')` separa a letra do acento, e a expressão regular apaga os acentos (faixa Unicode U+0300 a U+036F). |
| `filtrarProdutos(produtos, filtros)` | Aplica texto, categoria e situação. O texto procura no **nome e no código**, porque no balcão a peça costuma ser procurada pelo código impresso na embalagem. |

**Consultas (leem do `Storage`)**

- `listarProdutos()`, `obterProduto(id)`.
- `codigoEmUso(codigo, idIgnorado)`: diz se o código já existe (RN10). Na edição, o próprio
  produto é ignorado.
- `listarMovimentacoes()`: da mais recente para a mais antiga.
- `listarMovimentacoesDoProduto(id)`.

**Operações (validam, alteram e salvam)**

| Função | Regras aplicadas |
|--------|------------------|
| `cadastrarProduto(dados)` | Valida, recusa código repetido, cria o produto **com quantidade 0** e, se a quantidade inicial for maior que zero, registra uma **ENTRADA** com ela. Assim o histórico sempre explica o estoque atual (D2, RN07). |
| `editarProduto(id, dados)` | Valida **sem** a quantidade, mesmo que a tela a envie por engano, e preserva a quantidade atual (D2). Recusa código repetido de outra peça. |
| `excluirProduto(id)` | Remove o produto e **mantém** as movimentações (D3). A confirmação é feita pela tela. |
| `registrarMovimentacao(id, tipo, qtd)` | Valida o tipo e a quantidade, recusa saída maior que o disponível (RN02) e, por segurança, qualquer resultado negativo (RN01). Atualiza a quantidade e grava a movimentação com data e com o **nome do produto copiado**, para o histórico continuar legível depois de uma exclusão (D3). |
| `registrarEntrada` / `registrarSaida` | Atalhos para `registrarMovimentacao`. |

### 5.4 `js/ui.js` — apoio de tela

Objeto `UI`. Conhece o DOM, mas não decide nada sobre o estoque. Existe para as telas não
repetirem código.

| Função | O que faz |
|--------|-----------|
| `formatarMoeda(valor)` | `1234.5` → `R$ 1.234,50`. |
| `formatarDataHora(iso)` | Data ISO → `dd/mm/aaaa hh:mm`. |
| `criarEtiquetaStatus(status)` | `<span class="etiqueta etiqueta--baixo">Baixo</span>`. Sempre com texto, para a situação não depender só da cor. |
| `preencherSelect(select, opcoes, padrao)` | Monta as `<option>` de um `<select>`. |
| `mostrarMensagem(el, texto, tipo)` / `limparMensagem(el)` | Aviso de sucesso ou erro. O elemento tem `role="status"` no HTML, então o leitor de tela anuncia a mensagem. |
| `mostrarErros(form, erros)` / `limparErros(form)` | Põe cada mensagem no `<span data-erro-de="campo">`, marca o campo com `aria-invalid="true"` e leva o foco ao primeiro erro. |
| `criarCelula(texto, classe)` / `mostrarEstadoVazio(tbody, colunas, texto)` | Montagem da tabela. |

Como o HTML liga campo e erro:

```html
<input id="produto-nome" name="nome" aria-describedby="erro-produto-nome">
<span id="erro-produto-nome" data-erro-de="nome"></span>
```

### 5.5 `js/produtos.js` — tela de estoque de peças

Objeto `TelaProdutos`, iniciado no `DOMContentLoaded`.

- **`iniciar()`:** guarda as referências dos elementos em `this.el` e avisa se o navegador bloqueia
  o armazenamento. Depois preenche os `<select>` de categoria e situação, liga os eventos e
  desenha a tabela.
- **`renderizar()`:** lê os produtos, aplica os filtros e refaz a tabela. Mostra uma linha de
  estado vazio quando não há peças ou quando o filtro não acha nada. Os filtros chamam
  `renderizar()` a cada tecla ou mudança.
- **Tabela:** cada linha tem código, peça (nome e fabricante juntos, para não ter mais uma coluna),
  aplicação, categoria, preço, quantidade, mínimo, situação, valor total e ações.
- **Botões de ação:** guardam `data-acao` e `data-id`. Um **único ouvinte** na tabela
  (`tratarCliqueNaTabela`) descobre qual botão foi clicado. É a delegação de eventos: as linhas são
  recriadas o tempo todo, e assim não é preciso ligar um ouvinte a cada botão novo.
- **`aria-label` dos botões:** inclui nome e código da peça, senão o leitor de tela ouviria
  "Editar, Editar, Editar..." sem saber de qual peça se trata.
- **Janelas:** são três `<dialog>` (peça, movimentação e exclusão). O `<dialog>` com
  `showModal()` já prende o foco e fecha com Esc, sem código extra. Os botões
  `data-fechar="<id>"` fecham a janela indicada.
- **Cadastro x edição:** é o mesmo formulário. Na edição, o campo quantidade fica desabilitado e
  com outro texto de ajuda (D2), e o preço é escrito com `toFixed(2)` para aparecer `199,90` e não
  `199,9`.
- **Movimentação:** o erro devolvido pela regra aparece no campo quantidade, que é onde o usuário
  corrige.
- **Exclusão:** pede confirmação e avisa que o histórico é mantido.
- **Acesso aos campos:** sempre por `form.elements.<campo>`. Usar `form.id` devolveria o atributo
  `id` do formulário, e não o campo chamado `id`.

### 5.6 `js/login.js` — tela de acesso

Objeto `TelaLogin`. A autenticação está fora do escopo: não há usuários nem senhas guardadas.

- `validar(usuario, senha)` exige usuário com 3 ou mais caracteres e senha preenchida. Devolve os
  erros no mesmo formato da `Validacao`, então `UI.mostrarErros` os exibe.
- Com tudo certo, mostra "Acesso liberado", desabilita o botão (evita duplo envio) e, depois de
  800 ms, vai para `produtos.html`. A espera existe para a mensagem ser vista e anunciada.
- "Forgot password?" e "Sign up" não levam a lugar nenhum. Em vez de link quebrado, eles mostram
  uma mensagem explicando que isso não faz parte do projeto.
- O login não usa `Storage` nem `Estoque` e não grava nada, nem o "Remember me".

### 5.7 `js/importacao.js` — simulador de importação e financiamento

Objeto `Importacao`. A parte de cálculo é pura e testada (CT15, CT16). A parte de tela só roda se
a página tiver o formulário `#form-simulador`, e por isso o arquivo também pode ser carregado na
Loja e na página de testes.

**Dados**

- `VEICULOS`: os 11 carros (`chave → { nome, preco }`). A chave é a mesma do nome da foto em
  `assets/carros/<chave>.jpg` e do parâmetro `?veiculo=<chave>`. A Loja lê esta mesma lista,
  então o preço nunca diverge entre Loja e simulador.
- `ORIGENS`: frete e prazo por país (Japão: R$ 18.500 e 45 a 60 dias; Estados Unidos:
  R$ 12.000 e 30 a 45 dias).

**`calcular(veiculo, origem)`**

```text
impostos = 63% de (preço + frete), arredondado ao milhar
total    = preço + frete + impostos + R$ 7.200 de taxas
```

A alíquota de 63% foi escolhida para o GT-R Nismo dar exatamente o total do Figma
(R$ 1.585.700). **Não é um cálculo tributário real.**

**`financiar(total, entrada, meses, renda)`**: valores de exemplo, não taxas de banco.

- **Juros:** 1,49% ao mês, pela tabela Price (parcelas fixas):
  `parcela = financiado × i / (1 − (1 + i)^−n)`.
- **Entrada mínima:** 20% do total (`entradaMinima(total)`, arredondada para cima).
- **Renda:** a parcela pode comprometer até 30% dela. A renda mínima é `parcela / 0,30`,
  arredondada para cima.
- **Retorno:** `{ financiado, parcela, totalPago, entradaMinima, rendaMinima, entradaOk, rendaOk }`.

**Tela**

- Preenche os `<select>` de veículo, origem e parcelas, e lê `?veiculo=` da URL.
- O resumo é recalculado a cada mudança no formulário (evento `change`). O botão "Calcular" também
  funciona, para quem espera clicar.
- Os campos de financiamento ficam num `<fieldset>` **escondido e desabilitado** quando o
  pagamento é "À vista". Um campo desabilitado não é validado nem enviado.
- Ao escolher "Financiado" pela primeira vez, a entrada já vem com o mínimo.
- Campos de dinheiro (`.dinheiro`) aceitam `950000`, `950.000` ou `R$ 950.000,00`. `lerDinheiro`
  tira tudo que não é dígito ou vírgula, e o campo é reformatado ao sair dele.
- A mensagem final é verde (cabe na renda), vermelha (entrada abaixo do mínimo, parcela acima de
  30% ou entrada maior que o total) ou neutra (falta informar a renda).

### 5.8 `js/loja.js` — loja e carrinho

Objeto `Loja`. Depende de `importacao.js`, que precisa vir antes no HTML.

- `ACESSORIOS`: 9 itens (`id`, `nome`, `descricao`, `preco`, `foto`).
- `produtos()`: junta os veículos de `Importacao.VEICULOS` (`tipo: 'veiculo'`) com os acessórios
  (`tipo: 'acessorio'`).
- `adicionar(carrinho, produto, delta)`: **devolve um carrinho novo** em vez de alterar o atual,
  o que facilita testar (CT17). Use `delta = -1` para tirar uma unidade; com zero unidades o item
  sai do carrinho. **Cada veículo é único**, então a quantidade dele não passa de 1.
- `total(carrinho)`: soma `preço × quantidade`.

**Tela**

- Os cartões são montados a partir de `Loja.produtos()`. Nome e descrição entram por
  `textContent`, então nada dos dados é interpretado como HTML.
- Abas Todos / Veículos / Acessórios escondem os cartões pelo `data-tipo`.
- Um único ouvinte no `document` trata "Adicionar/Reservar" (`data-adicionar`) e os botões `−`/`+`
  do carrinho (`data-mudar`, `data-delta`).
- O carrinho mostra quantidade total, total em reais e, se houver veículo, o aviso de que o valor
  não inclui frete e impostos. O `+` do veículo fica desabilitado.
- O carrinho vive só na memória: trocar de página o esvazia.

### 5.9 `js/painel.js` — Adicionar carro

Script da tela `painel.html`. Também é demonstração: nada é gravado. O estoque do sistema guarda
peças, não carros, e as fotos não caberiam no `localStorage`.

- **Fotos:** aceita clique ou arrastar e soltar, até 10. Cada arquivo vira uma URL temporária
  (`URL.createObjectURL`) para aparecer na miniatura sem enviar nada. A primeira foto é a capa.
- **Pré-visualização:** nome (marca + modelo), preço e capa, atualizados a cada digitação.
- **Checklist:** cada seção fica "feita" quando todos os seus campos obrigatórios estão válidos.
  Fotos ficam feitas a partir de **4** (capa + 3 ângulos). Esse número foi escolhido porque no
  Figma 3 fotos ainda aparecem como pendentes.
- **Campos de dinheiro:** reformatados ao sair do campo, como no simulador.
- **Publicar:** usa a validação nativa do navegador (`checkValidity`/`reportValidity`) e o
  mínimo de fotos, e no fim mostra o aviso de demonstração.

### 5.10 `js/testes.js` — casos de teste

Objeto `Testes`, sem biblioteca nenhuma.

- `afirmar(condicao, msg)` e `afirmarIgual(obtido, esperado, msg)` lançam erro quando falham.
- `criarProduto(dados)` é um atalho para preparar uma peça.
- `casos`: lista de `{ codigo, descricao, executar() }`.
- `executar()`: **guarda os dados reais do navegador**, roda cada caso num estoque vazio e
  **devolve os dados no final**, mesmo se algo falhar (`finally`). Rodar os testes não apaga o
  estoque de ninguém.

A página `testes.html` só exibe o relatório: resumo e uma linha por caso, com "Passou" ou
"Falhou" em texto, além da cor.

### 5.11 Scripts dentro das páginas

São pequenos e só servem àquela página:

| Página | O que o script faz |
|--------|--------------------|
| `estoque.html` | Filtro por palavra-chave e marca. O número no botão mostra quantos carros a seleção vai trazer, mas a lista só muda ao clicar "Ver Veículos". "Limpar" volta a mostrar todos. O "x" fecha e abre o painel. |
| `garagem.html` | Abas. Cada cartão lista seus tipos em `data-tipo` (ex.: `"loja moto"`). |
| `carro.html` | A miniatura clicada troca de lugar com a foto principal (imagem e texto alternativo). |
| `contato.html`, `venda.html`, `pedido.html` | Validação nativa do navegador e aviso de que nada foi enviado. A Venda também mostra quantas fotos foram escolhidas. |

---

## 6. CSS

### 6.1 Arquivos

| Arquivo | Usado por | Conteúdo |
|---------|-----------|----------|
| `css/site.css` | Todas as páginas, menos login e testes | Site público e painel interno |
| `css/produtos.css` | `produtos.html` | Filtros, tabela, etiquetas, avisos e janelas do estoque de peças |
| `css/login.css` | `login.html` | Tela de acesso (desktop e mobile) |
| `css/style.css` | `testes.html` | Estilo "box de corrida" da primeira versão do sistema |

`style.css` sobrou da primeira versão e hoje só atende a página de testes. Boa parte das regras
dele (cabeçalho, botões, formulários, janelas) não é mais usada.

### 6.2 `site.css` por seções

1. **Cabeçalho:** `.topo`, logo, título da página e `.navegacao`.
2. **Faixa de imagem** no topo de Estoque e Contato.
3. **Cartão de veículo** (`.carro`), usado na Início e no Estoque.
4. **Página inicial.**
5. **Estoque:** painel de filtro (`.filtro`) e grade de carros.
6. **Contato.**
7. **Responsividade** das seções 1 a 6.
8. **Telas novas**, com o prefixo `k-`:
   - 8.0: tokens, campos, botões, linhas de resumo, abas e etiquetas;
   - 8.1 Garagem; 8.2 Detalhe do carro; 8.3 Pedido; 8.4 Venda; 8.5 Painel interno;
   - 8.6 Telas estreitas; 8.7 Loja.

As seções 1 a 7 reproduzem as medidas em px do quadro de 1836 px do Figma. As telas novas vieram
do Figma como capturas de tela, sem camadas, então usam tamanhos próprios e cores medidas nas
imagens.

### 6.3 Tokens das telas novas

```css
--k-fundo: #0c0c0c;        /* fundo da página */
--k-cartao: #1b1b1b;       /* cartões */
--k-campo: #262626;        /* campos e botão escuro */
--k-borda: #333333;
--k-laranja: #e8761c;      /* ação, preço e destaque */
--k-texto-fraco: #9a9a9a;
--k-verde: #6cc070;        /* confirmações */
```

Componentes reaproveitados:

- **Base:** `.k-pagina`, `.k-titulo`, `.k-sub`, `.k-cartao`.
- **Formulário:** `.k-campo`, `.k-campos`, `.k-botao` (`--escuro`), `.k-aviso` (`--ok`, `--erro`).
- **Resumos e filtros:** `.k-linhas` (pares rótulo/valor), `.k-aba`, `.k-opcao`, `.k-etiqueta`.
- **Fotos:** `.k-envio` (área de envio).

### 6.4 Larguras de tela

| Largura | O que muda |
|---------|------------|
| ≤ 1500 px | Menu menor (24 px); grades da Início em colunas fluidas |
| ≤ 1250 px | O menu desce para uma linha própria abaixo da marca |
| ≤ 1100 px | Ajustes de texto e espaçamento da Início, Estoque e Contato |
| ≤ 900 px | Telas novas viram uma coluna; o menu do painel fica em cima |
| ≤ 560 px | Campos em uma coluna; etapas do pedido em 2 por linha |

### 6.5 Armadilhas de layout que já foram corrigidas

Se algo voltar a "estourar" a página para o lado, provavelmente é uma destas:

- **`repeat(auto-fill, minmax(280px, 406px))`:** com máximo fixo, o navegador conta quantas
  colunas cabem pelo **máximo**, e sobrava uma coluna só. Com `1fr` no máximo, ele conta pelo
  mínimo.
- **Coluna `1fr` com conteúdo largo:** `1fr` não encolhe abaixo do conteúdo, então a tabela de
  peças alargava a página inteira. As grades do painel usam `minmax(0, 1fr)`, e a tabela rola
  dentro do próprio cartão.
- **`<fieldset>`:** por padrão ele cresce até a largura do conteúdo. O formulário do Contato
  precisou de `min-width: 0`.
- **`display: flex` num `<td>`:** tira a célula do layout de tabela e desalinha as bordas das
  linhas. A coluna de ações usa `white-space: nowrap` e margem entre os botões.
- **`[hidden]` contra `display`:** uma classe com `display: grid` vence o atributo `hidden`. Por
  isso há regras como `.produto[hidden] { display: none }` e `.financiamento:not([hidden])`.
- **Legenda de `<fieldset>`:** no painel ela "flutua" (`float`) para ficar dentro do cartão em vez
  de cortar a borda, e o elemento seguinte precisa de `clear: both`.

---

## 7. Regras de negócio e decisões

### Estoque de peças

| Código | Regra | Onde |
|--------|-------|------|
| RN01 | Quantidade nunca negativa | `Estoque.registrarMovimentacao`, `Validacao.validarProduto` |
| RN02 | Saída não pode passar do disponível | `Estoque.registrarMovimentacao` |
| RN03 a RN05 | Esgotado (0), Baixo (até o mínimo), Normal (acima) | `Estoque.classificar` |
| RN06 | Valor total = preço × quantidade | `Estoque.valorTotalProduto` |
| RN07 | Toda entrada ou saída gera movimentação | `Estoque.registrarMovimentacao` |
| RN08 | Preço não negativo | `Validacao.validarProduto` |
| RN09 | Quantidade e mínimo inteiros ≥ 0 | `Validacao.validarProduto` |
| RN10 | Código da peça é único | `Estoque.codigoEmUso` |

| Decisão | Resumo |
|---------|--------|
| D1 | Scripts clássicos, para abrir por duplo clique |
| D2 | A quantidade só muda por movimentação; a carga inicial vira uma ENTRADA |
| D3 | Excluir uma peça mantém o histórico (com o nome copiado) |
| D4 | Categoria é uma lista fixa, sem tela própria |
| D5 | Testes automatizados + roteiro manual |
| D6 | Domínio de autopeças (código, fabricante e aplicação na peça) |

### Site público (valores de exemplo)

| Item | Valor |
|------|-------|
| Impostos de importação | 63% de (carro + frete), arredondado ao milhar |
| Taxas e documentação | R$ 7.200 |
| Juros do financiamento | 1,49% ao mês, tabela Price |
| Entrada mínima | 20% do total |
| Limite da parcela | 30% da renda mensal |
| Prazos | 12, 24, 36, 48 ou 60 meses |
| Veículo no carrinho | No máximo 1 de cada |
| Fotos para publicar um carro | No mínimo 4, no máximo 10 |

---

## 8. Testes

Abra `pages/testes.html` e clique em **Executar testes**.

| Casos | O que verificam |
|-------|-----------------|
| CT01 a CT14 | Cadastro, edição, exclusão, entradas, saídas, classificação, pesquisa, filtros, gravação, recuperação e indicadores do estoque |
| CT15 | Total do simulador para o GT-R Nismo (R$ 1.585.700) |
| CT16 | Parcela, total pago, entrada mínima e limite de renda do financiamento |
| CT17 | Carrinho: soma de acessórios, veículo limitado a 1, remoção e total |

> **Situação atual:** CT02, CT09, CT15, CT16 e CT17 passam. Os outros 12 falham desde que o
> domínio mudou para autopeças: os testes ainda cadastram peças sem `codigo` e `fabricante` e com
> categorias que não existem mais ("Periféricos", "Eletrônicos"). O código das regras está certo;
> são os dados de teste que precisam ser atualizados.

---

## 9. Acessibilidade

Convenções seguidas em todas as telas:

- Link "Pular para o conteúdo" no início de cada página.
- Foco sempre visível (contorno laranja nas telas novas).
- Estado nunca comunicado só por cor: etiquetas e mensagens têm texto.
- Mensagens dinâmicas em elementos com `role="status"` / `aria-live`, anunciadas pelo leitor de
  tela.
- Erros de formulário ligados ao campo por `aria-describedby` e marcados com `aria-invalid`.
- Botões repetidos com `aria-label` que diz a qual item se referem.
- Abas e opções com `aria-pressed`. A etapa atual do pedido tem `aria-current="step"`.
- Imagens decorativas com `alt=""`; textos visíveis só para leitor de tela com
  `.apenas-leitor-tela`.

---

## 10. Imagens

| Pasta ou arquivo | Origem |
|------------------|--------|
| `assets/*.jpg`, `assets/*.png`, `assets/carros/` | Exportadas do Figma "Projeto front" |
| `assets/garagem-topo.jpg` | Figma (topo da Garagem) |
| `assets/acessorios/` | Wikimedia Commons e Flickr, com licença livre. Autores e licenças em `assets/acessorios/CREDITOS.md` e no rodapé da Loja, como as licenças exigem. |

---

## 11. Limitações conhecidas

- Os dados de peças ficam só no navegador onde foram cadastrados.
- Não há autenticação real, carrinho persistente, envio de formulários nem gravação de carros.
- Impostos, juros e preços do site público são valores de exemplo.
- Dashboard e tela de histórico de movimentações ainda não existem. As funções
  `calcularIndicadores` e `listarMovimentacoes` já estão prontas para elas.
- 12 dos testes antigos precisam ser atualizados para o domínio de autopeças (seção 8).
- `docs/requisitos.md` ainda descreve o modelo de dados anterior (seção 4).
