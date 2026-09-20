# Implementação — Interface, Telas e Novas Funcionalidades

Documento de referência da **camada de apresentação** do sistema: quais telas existem, o que cada
uma faz, como a identidade visual é construída e quais decisões sustentam esse desenho.

Complementa os outros documentos sem repeti-los:

| Documento | Responde |
|-----------|----------|
| `docs/requisitos.md` | **O que** o sistema precisa fazer (RF, RNF, RN, casos de uso, modelo de dados) |
| `docs/diario-do-projeto.md` | **Quando** cada coisa foi feita e **por que** foi decidida assim |
| `docs/implementacao.md` (este) | **Como** a interface foi construída e o que cada tela entrega |

---

## 1. Visão geral

A interface foi reconstruída a partir das telas de alta fidelidade do Figma do projeto, sob a
identidade **Kaisen**: tema escuro, acento laranja e listagem em cartões.

O que mudou em relação à versão anterior:

- O sistema deixou de ser **duas telas soltas** (acesso e produtos) e passou a ser um **site
  navegável de sete telas**, com barra de navegação fixa e seção atual sempre destacada.
- A listagem de peças deixou de ser uma **tabela larga com rolagem horizontal** e passou a ser uma
  **grade de cartões** com painel de filtro dedicado.
- O cabeçalho e o rodapé deixaram de ser **copiados em cada arquivo HTML** e passaram a ser
  montados por um único arquivo (`js/layout.js`).

O que **não** mudou: as regras de negócio. `js/estoque.js`, `js/validacao.js` e `js/storage.js`
seguem exatamente como estavam. A arquitetura em três camadas continua valendo, e nenhuma regra
foi reescrita para acomodar a interface nova.

---

## 2. Telas do sistema

| Tela | Arquivo | O que entrega | Requisitos |
|------|---------|---------------|------------|
| Início | `index.html` | Abertura, indicadores do estoque e últimas peças cadastradas | RF15, RF16, RF18 |
| Acesso | `pages/login.html` | Entrada no sistema (demonstração, sem autenticação real) | RNF06, RNF07 |
| Estoque | `pages/estoque.html` | Cadastro, consulta, edição, exclusão, pesquisa, filtros e movimentações | RF01 a RF12, RF19 a RF21 |
| Garagem | `pages/garagem.html` | Peças que exigem decisão: estoque baixo e esgotado | RF12, RF15, RF16 |
| Histórico | `pages/historico.html` | Entradas e saídas com data e hora, com filtros | RF13, RF14 |
| Sobre | `pages/sobre.html` | O projeto, a arquitetura e as regras de negócio | — |
| Contato | `pages/contato.html` | Formulário "Fale conosco", validado na própria página | RNF06, RNF07 |

### 2.1 Início (`index.html`)

É o dashboard exigido pela RF15. Traz cinco indicadores calculados em tempo real por
`Estoque.calcularIndicadores`: peças cadastradas, itens em estoque, estoque baixo, esgotados e
valor total (RF16). **Nenhum número é fixo no HTML** — todos vêm do `localStorage`.

Abaixo dos indicadores ficam quatro cartões de seção e a faixa "Últimos cadastros", que mostra as
três peças mais recentes.

> **Como "mais recente" é descoberto sem data de cadastro.** O modelo de dados não guarda a data em
> que a peça foi criada. Mas o id gerado por `Estoque.gerarId` começa pelo instante do cadastro em
> base 36, então ordenar os ids em ordem alfabética decrescente dá exatamente a ordem do mais novo
> para o mais antigo. Evita acrescentar um campo ao modelo só para isso.

### 2.2 Estoque (`pages/estoque.html`)

A tela principal. Duas colunas: painel de filtro à esquerda, grade de peças à direita.

**Painel de filtro** — claro, em contraste com o grafite do restante. É proposital: separa à
primeira vista o que é ferramenta do que é conteúdo.

- **Palavra-chave** — pesquisa por nome **ou código** da peça (RF04). Ignora acentos e
  maiúsculas: digitar `ignicao` encontra "Vela de Ignição".
- **Situação** — fichas Normal, Baixo e Esgotado (RF05, RF12).
- **Categorias** — um azulejo por categoria, com ícone desenhado em SVG (RF05).
- **Rodapé** — botão `+` para cadastrar e a contagem de peças visíveis.

Situação e categoria são de **escolha única**, e clicar na opção já marcada a desmarca — é o
caminho mais curto para desfazer um filtro.

**Grade de peças** — cada cartão traz código, etiqueta de situação, nome, fabricante, aplicação,
preço, quantidade, estoque mínimo, valor total e os quatro botões de ação: Entrada, Saída, Editar
e Excluir.

As três janelas (`<dialog>`) de cadastro/edição, movimentação e confirmação de exclusão continuam
com o mesmo comportamento de antes.

### 2.3 Garagem (`pages/garagem.html`)

Reúne o que exige decisão agora: peças abaixo do estoque mínimo e peças esgotadas. Traz um resumo
em três números (peças em atenção, valor parado, categorias em uso) e a lista filtrável, que pode
ser ordenada por maior valor, menor quantidade ou nome.

É uma tela **somente de leitura**: cadastrar, movimentar e excluir acontece apenas na tela de
estoque, para essas ações existirem em um lugar só (RNF11). Daqui o usuário é levado para lá.

### 2.4 Histórico (`pages/historico.html`)

Atende a RF14 e o UC07, que até então estavam apenas previstos. Lista as movimentações da mais
recente para a mais antiga, com data e hora (RF13), e filtra por peça, por tipo e por período
(7, 30 ou 90 dias).

Também é somente de leitura: o histórico é o registro do que aconteceu, e apagar um registro
deixaria o estoque atual sem explicação (RN07).

### 2.5 Contato (`pages/contato.html`)

Formulário validado com nome, e-mail, telefone e comentários. O projeto não tem servidor (D1),
então não há para onde enviar: a tela valida, confirma na própria página e **não grava nada** — o
`localStorage` guarda estoque, não recados.

A validação de telefone conta apenas os dígitos, então o usuário pode digitar com ou sem
parênteses, espaços e traços.

---

## 3. Identidade visual

### 3.1 Cores

Todas as cores são variáveis CSS declaradas uma única vez em `:root`, no `css/style.css`. Mudar
ali muda o sistema inteiro.

| Papel | Variável | Valor |
|-------|----------|-------|
| Fundo da página | `--cor-fundo` | `#141414` |
| Barra de navegação | `--cor-preto` | `#000000` |
| Cartões e superfícies | `--cor-superficie` | `#2e2e2e` |
| Cor de ação | `--cor-primaria` | `#e8590c` |
| Títulos e preços nos cartões | `--cor-primaria-clara` | `#e8963c` |
| Link ativo da navegação | `--cor-primaria-nav` | `#e8833a` |
| Painel de filtro (claro) | `--cor-painel` | `#eef1f5` |

As cores de estado — verde, âmbar e vermelho — **não fazem parte do tema**. Elas comunicam a
situação do estoque e foram escolhidas para manter contraste alto sobre o fundo escuro (RNF05).

### 3.2 Acessibilidade

Compromissos mantidos em todas as telas:

- **Estado nunca é comunicado só por cor** (RNF05). A etiqueta de situação traz a palavra
  "Normal", "Baixo" ou "Esgotado"; a categoria escolhida ganha um visto além da moldura laranja;
  as fichas ativas ficam em negrito além de mudar de cor.
- **Foco sempre visível** (RNF04), inclusive nos campos do login, em que a moldura arredondada
  inteira recebe o contorno — e não apenas o texto.
- **Link "pular para o conteúdo"** continua sendo o primeiro elemento focável de cada página,
  inclusive depois de o cabeçalho ser inserido por JavaScript.
- **Botões de ação dos cartões** têm `aria-label` com o nome e o código da peça. Sem isso, um
  leitor de tela ouviria apenas "Editar" repetido em todos os cartões.
- **Mensagens de operação** usam `role="status"` e `aria-live="polite"`, então são anunciadas
  assim que aparecem (RNF07).

### 3.3 Sem dependências externas

Nenhuma fonte, ícone ou imagem vem da internet (RNF09). O logotipo, os ícones de categoria, a
lupa da busca e os ícones sociais são **SVG escrito à mão**; as aberturas e os banners são
degradês CSS. O projeto continua abrindo por duplo clique, sem servidor.

---

## 4. Organização do código

### 4.1 Arquivos de estilo

| Arquivo | Escopo |
|---------|--------|
| `css/style.css` | Base: variáveis, reset, cabeçalho, botões, formulários, tabelas, etiquetas |
| `css/home.css` | Página inicial |
| `css/login.css` | Tela de acesso |
| `css/estoque.css` | Painel de filtro, grade de peças e janelas |
| `css/conteudo.css` | Garagem, histórico, sobre e contato |

As quatro últimas telas dividem um arquivo só porque são páginas de leitura e formulário, com a
mesma estrutura. Um CSS por tela, nesse caso, seria repetição (RNF11).

### 4.2 Arquivos de tela

Cada tela tem o seu arquivo, e todos seguem o mesmo formato: um objeto com `el` (referências ao
DOM), `iniciar()`, `ligarEventos()` e `renderizar()`.

| Arquivo | Tela |
|---------|------|
| `js/layout.js` | Cabeçalho e rodapé das seis telas que têm navegação |
| `js/home.js` | Início |
| `js/login.js` | Acesso |
| `js/tela-estoque.js` | Estoque |
| `js/garagem.js` | Garagem |
| `js/historico.js` | Histórico |
| `js/contato.js` | Contato |

> **Por que `tela-estoque.js` e não `estoque.js`.** `js/estoque.js` já existe e guarda as **regras
> de negócio**. O arquivo da tela precisava de outro nome para a diferença entre regra e tela
> continuar óbvia ao bater o olho na pasta.

### 4.3 Cabeçalho e rodapé em um lugar só

O projeto não usa servidor nem gerador de páginas (D1), então não existe `include` de HTML.
Copiar o mesmo cabeçalho em seis arquivos significaria seis lugares para corrigir a cada mudança
— exatamente a duplicação que a RNF11 pede para evitar.

A solução: cada página declara onde está, e `js/layout.js` monta o resto.

```html
<body data-secao="estoque" data-base="../">
```

`data-secao` marca o link atual e escreve o nome da seção ao lado do logotipo. `data-base` vale
`""` na raiz e `"../"` nas páginas dentro de `pages/`.

A tela de acesso é a única exceção: ela vem **antes** do sistema, não tem barra de navegação e por
isso não declara esses atributos nem carrega o `layout.js`.

---

## 5. Novas decisões de projeto

Complementam as decisões D1 a D4, registradas em `docs/diario-do-projeto.md`.

> **Por que a numeração recomeça em D7.** O código **D5** era a decisão sobre testes automatizados
> e foi retirada do projeto junto com a página de testes; códigos aposentados não são reciclados,
> para que uma referência antiga nunca aponte para a decisão errada. O código **D6** está em uso:
> é a adoção do domínio de autopeças, citada em `js/estoque.js` mas ainda não registrada no diário
> (item 2 da seção 6).

### D7 — Cabeçalho e rodapé montados por JavaScript
**Decisão:** a navegação e o rodapé não são escritos em cada HTML; `js/layout.js` os monta a
partir de dois atributos no `<body>`.
**Motivo:** sem servidor não há `include`, e sete cópias do mesmo cabeçalho contrariam a RNF11.
**Consequência:** a navegação depende de JavaScript. Aceitável, porque todas as telas já dependem
dele para funcionar — sem JavaScript não há estoque para navegar.

### D8 — Listagem em cartões no lugar da tabela
**Decisão:** a tela de estoque lista as peças em cartões, e não em tabela.
**Motivo:** é o desenho das telas de alta fidelidade, e a tabela anterior tinha dez colunas e
1100px de largura mínima, o que forçava rolagem horizontal em qualquer notebook.
**Consequência:** o histórico continua em tabela, onde a comparação linha a linha é o que importa.

### D9 — Telas de leitura separadas das telas de ação
**Decisão:** Garagem e Histórico não cadastram, não movimentam e não excluem.
**Motivo:** ter a mesma ação em três telas significa três lugares para manter e três caminhos para
testar.
**Consequência:** toda alteração do estoque passa pela tela de Estoque.

---

## 6. Pendências e inconsistências conhecidas

Levantadas ao construir esta camada. **Nenhuma impede o sistema de funcionar**, mas todas são
divergências entre o código e a documentação:

| # | Situação | Onde |
|---|----------|------|
| 1 | O código cita **RF19, RF20, RF21 e RN10** (código da peça, fabricante, aplicação e unicidade do código), mas `docs/requisitos.md` para em RF18 e RN09 | `js/validacao.js`, `js/estoque.js` |
| 2 | O código cita a **decisão D6** (domínio de autopeças), que não está registrada no diário | `js/estoque.js` linha 19 |
| 3 | O modelo de dados em `docs/requisitos.md` não lista os campos `codigo`, `fabricante` e `aplicacao`, que o sistema exige e grava | `docs/requisitos.md` seção 6 |
| 4 | As categorias documentadas ainda são as antigas (Eletrônicos, Periféricos, Escritório, Limpeza, Outros); o sistema usa as onze categorias automotivas | `docs/requisitos.md` seção 6 |
| 5 | O `docs/diario-do-projeto.md` ainda cita `produtos.html`, `dashboard.js` e lista o histórico como "a fazer" | `docs/diario-do-projeto.md` |
| 6 | A responsividade em tela estreita não pôde ser conferida em navegador real; as regras `@media` existem e foram validadas, mas sem confirmação visual | todas as telas |

---

## 7. Fora do escopo

Continuam fora, como já registrado na seção 1 de `docs/requisitos.md`:

- **Autenticação real.** A tela de acesso é demonstração: qualquer e-mail e senha entram. Os
  botões "Sign up" e "Forgot password?" existem no desenho e explicam que estão fora do escopo.
- **Envio de mensagens.** O formulário de contato valida e confirma, mas não envia nem armazena.
- **Fotografias das peças.** O modelo de dados não guarda imagem. Nos cartões, a inicial do nome
  ocupa o lugar da foto. As classes já estão preparadas para receber `background-image` caso um
  dia existam imagens.
