# Kaisen — Gerenciador de Estoque

Aplicação web para controle de estoque de autopeças, com um site público de venda de carros
importados. Projeto acadêmico da disciplina Desenvolvimento Front-End para Web, curso de
Engenharia de Software, turma 02.2026. Funciona inteiramente no navegador, sem backend e sem
banco de dados: os dados são persistidos no `localStorage`.

O guia oficial do projeto é o **Documento de Visão**; o resumo técnico dos requisitos está em
[`docs/requisitos.md`](docs/requisitos.md).

---

## Objetivo

Permitir que um funcionário ou um administrador cadastre peças, controle quantidades, registre
entradas e saídas de estoque, consulte o histórico de movimentações e acompanhe indicadores do
estoque em um dashboard.

O projeto também serve como exercício completo de Engenharia de Software: levantamento de
requisitos, modelagem, arquitetura em camadas, testes, versionamento e documentação.

---

## Funcionalidades

- Dashboard com indicadores calculados a partir dos dados reais (só Administrador)
- Cadastro, consulta, edição e exclusão de peças (editar e excluir só Administrador)
- Pesquisa por nome ou código e filtros por categoria e situação do estoque
- Registro de entradas e saídas de estoque
- Histórico de movimentações com data e hora
- Controle de estoque mínimo e classificação automática (Normal, Baixo, Esgotado)
- Persistência no `localStorage`
- Interface responsiva e com acessibilidade básica
- Validação de formulários com mensagens de erro claras
- Perfis de acesso Administrador e Funcionário, escolhidos no login
- Painel interno complementar: Adicionar carro e Pedidos de importação (demonstração)
- Site público: Início, Garagem, Estoque de carros, Auto-Peças com carrinho, Simulador de
  importação e financiamento, Venda seu carro, Sobre e Contato

---

## Tecnologias

- HTML5
- CSS3
- JavaScript ES6+ (sem frameworks e sem bibliotecas externas)
- `localStorage` do navegador (dados) e `sessionStorage` (só o perfil de acesso da sessão)
- Git e GitHub para versionamento

---

## Como executar

Não é necessário instalar nada nem subir servidor.

1. Baixe ou clone o repositório.
2. Abra o arquivo `index.html` com um duplo clique (ou arraste para o navegador).

> **Site e área interna:** `index.html` é a página inicial do site público (marca Kaisen),
> seguindo o design do Figma "Projeto front". A área dos funcionários começa em
> `pages/login.html`: o Administrador entra no Painel geral (`pages/dashboard.html`) e o
> Funcionário entra direto no Estoque de peças (`pages/produtos.html`).

> **A tela de acesso é uma demonstração.** Autenticação real está fora do escopo do projeto:
> não há cadastro de usuários nem senha guardada. Qualquer e-mail (com pelo menos 3 caracteres) e
> qualquer senha abrem o sistema. O perfil escolhido fica em `gestoque.perfil` no
> `sessionStorage` e é apagado ao fechar a aba ou ao clicar em "Sair".

> **Por que funciona sem servidor?** O projeto usa tags `<script>` clássicas em vez de módulos ES
> (`import`/`export`). Módulos ES são bloqueados pela política de segurança do navegador quando a
> página é aberta pelo protocolo `file://`. Essa foi a decisão D1 do projeto, registrada em
> `docs/diario-do-projeto.md`.

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
│   ├── loja.html           # Auto-Peças: peças e acessórios, com busca e carrinho (demonstração)
│   ├── pedido.html         # Acompanhamento do pedido #2041 (design Kaisen)
│   ├── venda.html          # "Venda seu carro para nós" (design Kaisen)
│   ├── painel.html         # Painel interno: adicionar carro (demonstração, nada é gravado)
│   ├── login.html          # Acesso de funcionários (demonstração, sem autenticação real)
│   ├── dashboard.html      # Painel geral: indicadores do estoque (só Administrador)
│   ├── produtos.html       # Listagem, cadastro, edição e movimentações
│   ├── historico.html      # Histórico de entradas e saídas
│   └── sobre.html          # Página institucional
├── css/
│   ├── site.css            # Site público e painel interno (design Kaisen)
│   ├── login.css
│   ├── produtos.css        # Telas do estoque de peças (tabela, indicadores)
│   └── fontes.css          # Fontes embutidas, para o site abrir sem internet
├── js/
│   ├── storage.js          # Camada de persistência (único ponto de acesso ao localStorage)
│   ├── validacao.js        # Validação dos dados informados (funções puras)
│   ├── estoque.js          # Regras de negócio e operações do estoque
│   ├── layout.js           # Funções de tela compartilhadas e perfil logado no menu
│   ├── login.js            # Tela de acesso
│   ├── importacao.js       # Simulador de importação e financiamento
│   ├── painel.js           # Painel interno: fotos, prévia e checklist
│   ├── loja.js             # Auto-Peças e carrinho
│   ├── home.js             # Tela do dashboard
│   ├── tela-estoque.js     # Tela de estoque de peças
│   └── historico.js        # Tela de histórico
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
Telas (home.js, tela-estoque.js,                  -> conhecem o DOM
       historico.js, layout.js, login.js, painel.js)
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

Os arquivos do site público `loja.js` e `importacao.js` seguem a mesma ideia: o cálculo não
depende do DOM e a parte de tela só roda na página correspondente.

---

## Requisitos

A lista completa e numerada está em [`docs/requisitos.md`](docs/requisitos.md):
18 requisitos funcionais (RF01 a RF18), 12 requisitos não funcionais (RNF01 a RNF12) e
10 regras de negócio (RN01 a RN10).

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
| RN07 | Qualquer alteração no saldo deve vir de uma movimentação registrada no histórico |
| RN08 | O preço do produto não pode ser negativo |
| RN09 | Quantidade e estoque mínimo devem ser inteiros maiores ou iguais a zero |
| RN10 | O código do produto deve ser único no cadastro |

---

## Testes

Os casos de teste estão descritos em [`docs/casos-de-teste.md`](docs/casos-de-teste.md).
São conferidos à mão na interface: a página de testes automatizados foi removida.

---

## Equipe

| Nome | Papel |
|------|-------|
| Pedro Henrique | Líder do projeto e desenvolvimento front-end (JavaScript) |
| Ângelo Antônio | Desenvolvedor front-end (HTML5 / CSS3) |
| Bruna Villanova | Projetista UI/UX e prototipagem (Figma) |
| Diana Nicole | Analista de requisitos e documentação |
| Victor Lucas | Tester e validação de interface/acessibilidade |

---

## Limitações conhecidas

- Os dados ficam salvos apenas no navegador em que foram cadastrados; não há sincronização entre
  máquinas ou usuários.
- Limpar os dados de navegação apaga o estoque.
- Não há autenticação real: os perfis Administrador e Funcionário são escolhidos no login e só
  controlam o que aparece na tela. Não há múltiplos usuários simultâneos.
- Não há backend, banco de dados nem integração com sistemas fiscais ou ERP.

---

## Trabalhos futuros

- Exportação do estoque e do histórico em CSV
- Gráficos de movimentação no dashboard
- Relatórios por período
- Substituição do `localStorage` por uma API real (a arquitetura em camadas já isola essa troca
  em um único arquivo)
