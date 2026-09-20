# Kaisen — Gerenciador de Estoque

Aplicação web para controle de estoque de autopeças, desenvolvida como projeto acadêmico da
disciplina de Engenharia de Software. Funciona inteiramente no navegador, sem backend e sem banco
de dados: os dados são persistidos no `localStorage`.

A interface segue as telas de alta fidelidade do Figma do projeto: tema escuro com acento laranja,
navegação fixa no topo, painel de filtro claro no estoque e listagem em cartões.

---

## Objetivo

Permitir que um funcionário ou administrador cadastre produtos, controle quantidades, registre
entradas e saídas de estoque, consulte o histórico de movimentações e acompanhe indicadores do
estoque em um dashboard.

O projeto também serve como exercício completo de Engenharia de Software: levantamento de
requisitos, modelagem, arquitetura em camadas, versionamento e documentação.

---

## Funcionalidades

- Dashboard com indicadores calculados a partir dos dados reais
- Cadastro, consulta, edição e exclusão de produtos
- Pesquisa por nome e filtros por categoria e situação do estoque
- Registro de entradas e saídas de estoque
- Histórico de movimentações com data e hora
- Controle de estoque mínimo e classificação automática (Normal, Baixo, Esgotado)
- Persistência no `localStorage`
- Interface responsiva e com acessibilidade básica
- Validação de formulários com mensagens de erro claras

---

## Tecnologias

- HTML5
- CSS3
- JavaScript ES6+ (sem frameworks e sem bibliotecas externas)
- `localStorage` do navegador
- Git e GitHub para versionamento

---

## Como executar

Não é necessário instalar nada nem subir servidor.

1. Baixe ou clone o repositório.
2. Abra o arquivo `index.html` com um duplo clique (ou arraste para o navegador).

A partir da página inicial, a navegação do topo leva a todas as telas. Para começar pela tela de
acesso, abra `pages/login.html`.

> **A tela de acesso é uma demonstração.** Autenticação real está fora do escopo do projeto
> (seção 1 de `docs/requisitos.md`): não há cadastro de usuários, senha guardada nem sessão.
> Qualquer e-mail e senha preenchidos abrem o sistema.

> **Por que funciona sem servidor?** O projeto usa tags `<script>` clássicas em vez de módulos ES
> (`import`/`export`). Módulos ES são bloqueados pela política de segurança do navegador quando a
> página é aberta pelo protocolo `file://`. Essa foi a decisão D1 do projeto, registrada em
> `docs/diario-do-projeto.md`.

---

## Estrutura do projeto

```text
kaisen-estoque/
├── index.html              # Início: abertura, indicadores e últimos cadastros
├── pages/
│   ├── login.html          # Tela de acesso (demonstração, sem autenticação real)
│   ├── estoque.html        # Listagem, cadastro, edição, filtros e movimentações
│   ├── garagem.html        # Peças que pedem atenção (estoque baixo e esgotado)
│   ├── historico.html      # Histórico de entradas e saídas
│   ├── sobre.html          # O projeto, a arquitetura e as regras de negócio
│   └── contato.html        # Formulário "Fale conosco" (validado, sem envio)
├── css/
│   ├── style.css           # Base: variáveis, layout, cabeçalho, componentes
│   ├── home.css            # Página inicial
│   ├── login.css           # Tela de acesso
│   ├── estoque.css         # Painel de filtro e grade de peças
│   └── conteudo.css        # Garagem, histórico, sobre e contato
├── js/
│   ├── storage.js          # Camada de persistência (único acesso ao localStorage)
│   ├── validacao.js        # Validação dos dados informados (funções puras)
│   ├── estoque.js          # Regras de negócio e operações do estoque
│   ├── ui.js               # Funções auxiliares de tela compartilhadas
│   ├── layout.js           # Cabeçalho e rodapé, montados uma vez só
│   ├── home.js             # Página inicial
│   ├── login.js            # Tela de acesso
│   ├── tela-estoque.js     # Tela de estoque
│   ├── garagem.js          # Tela da garagem
│   ├── historico.js        # Tela de histórico
│   └── contato.js          # Tela de contato
├── docs/
│   ├── requisitos.md       # RF, RNF, regras de negócio, casos de uso, modelo de dados
│   ├── implementacao.md    # Telas, identidade visual e organização do código
│   ├── diario-do-projeto.md# Registro das decisões e do andamento
│   └── wireframes/
├── assets/
└── README.md
```

### Arquitetura em camadas

O projeto separa responsabilidades em três camadas, e a dependência sempre aponta para baixo:

```text
Telas (home.js, tela-estoque.js, garagem.js, ...)  -> conhecem o DOM
        |
        v
Regras (estoque.js, validacao.js)                 -> não conhecem o DOM
        |
        v
Persistência (storage.js)                         -> único arquivo que usa localStorage
```

Duas regras sustentam essa separação:

1. Nenhum arquivo além de `storage.js` chama `localStorage` diretamente.
2. `estoque.js` e `validacao.js` nunca acessam o DOM, o que permite mudar a interface sem
   tocar nas regras.

---

## Requisitos

A lista completa e numerada está em [`docs/requisitos.md`](docs/requisitos.md):
18 requisitos funcionais (RF01 a RF18), 12 requisitos não funcionais (RNF01 a RNF12) e
9 regras de negócio (RN01 a RN09).

Como cada requisito aparece nas telas, e como a interface foi construída, está em
[`docs/implementacao.md`](docs/implementacao.md).

---

## Regras de negócio (resumo)

| Código | Regra |
|--------|-------|
| RN01 | A quantidade de estoque nunca pode ser negativa |
| RN02 | Uma saída não pode exceder a quantidade disponível |
| RN03 | Quantidade igual a zero significa estoque "Esgotado" |
| RN04 | Quantidade maior que zero e menor ou igual ao estoque mínimo significa "Baixo" |
| RN05 | Quantidade superior ao estoque mínimo significa "Normal" |
| RN06 | O valor total de estoque de um produto é `preço × quantidade` |
| RN07 | Toda entrada ou saída gera uma movimentação no histórico |
| RN08 | O preço do produto não pode ser negativo |
| RN09 | Quantidade e estoque mínimo devem ser inteiros maiores ou iguais a zero |

---

## Equipe

| Nome | Papel |
|------|-------|
| _(a preencher)_ | Líder do projeto e desenvolvimento front-end (JavaScript) |
| _(a preencher)_ | |
| _(a preencher)_ | |
| _(a preencher)_ | |
| _(a preencher)_ | |

---

## Limitações conhecidas

- Os dados ficam salvos apenas no navegador em que foram cadastrados; não há sincronização entre
  máquinas ou usuários.
- Limpar os dados de navegação apaga o estoque.
- Não há autenticação, controle de permissões nem múltiplos usuários simultâneos.
- Não há backend, banco de dados nem integração com sistemas fiscais ou ERP.

---

## Trabalhos futuros

- Exportação do estoque e do histórico em CSV
- Gráficos de movimentação no dashboard
- Relatórios por período
- Substituição do `localStorage` por uma API real (a arquitetura em camadas já isola essa troca
  em um único arquivo)
