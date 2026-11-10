# Gerenciador de Estoque

Aplicação web para controle de estoque, desenvolvida como projeto acadêmico da disciplina de
Engenharia de Software. Funciona inteiramente no navegador, sem backend e sem banco de dados:
os dados são persistidos no `localStorage`.

---

## Objetivo

Permitir que um funcionário ou administrador cadastre produtos, controle quantidades, registre
entradas e saídas de estoque, consulte o histórico de movimentações e acompanhe indicadores do
estoque em um dashboard.

O projeto também serve como exercício completo de Engenharia de Software: levantamento de
requisitos, modelagem, arquitetura em camadas, testes, versionamento e documentação.

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
- Página de testes automatizados das regras de negócio

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

> **Site e área interna:** `index.html` é a página inicial do site público (marca Kaisen),
> com `pages/estoque.html` e `pages/contato.html`, seguindo o design do Figma "Projeto front".
> A área dos funcionários começa em `pages/login.html`, que leva a `pages/produtos.html` — com o
> cadastro, a consulta, a edição, a exclusão, a pesquisa, os filtros e as movimentações de estoque.

> **A tela de acesso é uma demonstração.** Autenticação real está fora do escopo do projeto
> (seção 1 de `docs/requisitos.md`): não há cadastro de usuários, senha guardada nem sessão.
> Qualquer usuário e senha preenchidos abrem o sistema.

> **Por que funciona sem servidor?** O projeto usa tags `<script>` clássicas em vez de módulos ES
> (`import`/`export`). Módulos ES são bloqueados pela política de segurança do navegador quando a
> página é aberta pelo protocolo `file://`. Essa foi a decisão D1 do projeto, registrada em
> `docs/diario-do-projeto.md`.

Para rodar os testes automatizados, abra `pages/testes.html` e clique em **Executar testes**.

---

## Estrutura do projeto

```text
gerenciador-estoque/
├── index.html              # Página inicial do site (design Kaisen)
├── pages/
│   ├── estoque.html        # Vitrine de veículos com filtro (design Kaisen)
│   ├── contato.html        # Formulário "Fale conosco" (design Kaisen)
│   ├── garagem.html        # Carros personalizados e vendidos, com abas (design Kaisen)
│   ├── carro.html          # Detalhe do Nissan GT-R Nismo R35 (design Kaisen)
│   ├── importacao.html     # Simulador do custo de importação e financiamento
│   ├── loja.html           # Loja: veículos do simulador e acessórios, com carrinho (demonstração)
│   ├── pedido.html         # Acompanhamento do pedido #2041 (design Kaisen)
│   ├── venda.html          # "Venda seu carro para nós" (design Kaisen)
│   ├── painel.html         # Painel interno: adicionar carro (demonstração, nada é gravado)
│   ├── login.html          # Acesso de funcionários (demonstração, sem autenticação real)
│   ├── dashboard.html      # Painel geral: indicadores do estoque (só Administrador)
│   ├── produtos.html       # Listagem, cadastro, edição e movimentações
│   ├── historico.html      # Histórico de entradas e saídas
│   ├── garagem-estoque.html# Garagem: peças esgotadas e com estoque baixo
│   ├── sobre.html          # Página institucional
│   └── testes.html         # Execução dos casos de teste automatizados
├── css/
│   ├── style.css           # Base: variáveis, layout, componentes
│   ├── site.css            # Site público e painel interno (design Kaisen)
│   ├── login.css
│   ├── produtos.css        # Telas do estoque de peças (tabela, indicadores, garagem)
│   └── fontes.css          # Fontes embutidas, para o site abrir sem internet
├── js/
│   ├── storage.js          # Camada de persistência (único ponto de acesso ao localStorage)
│   ├── validacao.js        # Validação dos dados informados (funções puras)
│   ├── estoque.js          # Regras de negócio e operações do estoque
│   ├── layout.js           # Funções de tela compartilhadas e perfil logado no menu
│   ├── login.js            # Tela de acesso
│   ├── importacao.js       # Simulador de importação e financiamento (CT15 e CT16)
│   ├── painel.js           # Painel interno: fotos, prévia e checklist
│   ├── loja.js             # Loja e carrinho (CT17)
│   ├── home.js             # Tela do dashboard
│   ├── tela-estoque.js     # Tela de estoque de peças
│   ├── historico.js        # Tela de histórico
│   ├── garagem.js          # Tela da garagem (reposição)
│   └── testes.js           # Casos de teste CT01 a CT21
├── docs/
│   ├── explicacao-do-codigo.md # Como o código funciona, arquivo por arquivo
│   ├── requisitos.md       # RF, RNF, regras de negócio, casos de uso, modelo de dados
│   ├── casos-de-teste.md   # Roteiro dos casos de teste
│   ├── diario-do-projeto.md# Registro das decisões e do andamento
│   └── wireframes/
├── assets/
└── README.md
```

A explicação completa do código, arquivo por arquivo, está em
[`docs/explicacao-do-codigo.md`](docs/explicacao-do-codigo.md).

### Arquitetura em camadas

O projeto separa responsabilidades em três camadas, e a dependência sempre aponta para baixo:

```text
Telas (home.js, tela-estoque.js, garagem.js,      -> conhecem o DOM
       historico.js, layout.js)
        |
        v
Regras (estoque.js, validacao.js)                 -> não conhecem o DOM
        |
        v
Persistência (storage.js)                         -> único arquivo que usa localStorage
```

Duas regras sustentam essa separação:

1. Nenhum arquivo além de `storage.js` chama `localStorage` diretamente.
2. `estoque.js` e `validacao.js` nunca acessam o DOM, o que os torna testáveis isoladamente.

---

## Requisitos

A lista completa e numerada está em [`docs/requisitos.md`](docs/requisitos.md):
18 requisitos funcionais (RF01 a RF18), 12 requisitos não funcionais (RNF01 a RNF12) e
9 regras de negócio (RN01 a RN09).

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

## Testes

Os casos de teste estão descritos em [`docs/casos-de-teste.md`](docs/casos-de-teste.md).

Os testes das regras de negócio são automatizados e ficam em `js/testes.js`. Para executá-los,
abra `pages/testes.html` e clique em **Executar testes**. Os testes rodam em um estoque vazio e
restauram os dados salvos no navegador ao final.

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
- Modo escuro
- Relatórios por período
- Substituição do `localStorage` por uma API real (a arquitetura em camadas já isola essa troca
  em um único arquivo)
