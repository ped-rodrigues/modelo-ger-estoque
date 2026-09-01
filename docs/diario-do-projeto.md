# Diário do Projeto — Gerenciador de Estoque

Documento vivo. Registra o andamento do projeto, as decisões tomadas e o resumo de cada sessão de
trabalho. **É atualizado a cada nova conversa**, sempre acrescentando ao final da seção
"Registro das sessões" — o histórico anterior nunca é reescrito.

- **Equipe:** 5 integrantes
- **Prazo:** aproximadamente 1 mês
- **Início:** 01/09/2026

---

## 1. Estado atual do projeto

**Etapa atual:** Semana 1 concluída (análise, planejamento e núcleo do sistema).

### O que já existe

| Item | Arquivo | Situação |
|------|---------|----------|
| Repositório Git e estrutura de pastas | — | Pronto |
| Camada de persistência | `js/storage.js` | Pronto e testado |
| Camada de validação | `js/validacao.js` | Pronto e testado |
| Regras de negócio e operações | `js/estoque.js` | Pronto e testado |
| Testes automatizados CT01 a CT14 | `js/testes.js`, `pages/testes.html` | 14 de 14 aprovados |
| Estilos base | `css/style.css` | Pronto |
| Documentação de requisitos | `docs/requisitos.md` | Pronto |
| Roteiro de casos de teste | `docs/casos-de-teste.md` | Pronto (parte manual a executar) |
| README | `README.md` | Pronto (equipe a preencher) |

### O que ainda falta

| Item | Etapa prevista |
|------|----------------|
| `index.html` (dashboard) e `js/dashboard.js` | Semana 2 e 3 |
| `pages/produtos.html` e `js/produtos.js` (CRUD, pesquisa, filtros) | Semana 2 |
| `pages/historico.html` e `js/historico.js` | Semana 3 |
| `js/ui.js` (funções auxiliares de tela) | Semana 2 |
| Modal de entrada e saída de estoque | Semana 3 |
| Wireframes em `docs/wireframes/` | Semana 1 e 2 |
| Execução dos testes manuais CTM01 a CTM07 | Semana 4 |
| Preenchimento da equipe no README | Qualquer momento |

---

## 2. Decisões de projeto

Decisões que alteram o comportamento do sistema ou a forma de trabalhar. Uma vez registradas aqui,
valem para todo o projeto; mudá-las exige nova conversa e atualização deste documento.

### D1 — Scripts clássicos em vez de módulos ES
**Decidido em:** 01/09/2026
**Decisão:** usar tags `<script>` clássicas, com um objeto por arquivo (`const Storage = { ... }`),
em vez de `import`/`export`.
**Motivo:** módulos ES são bloqueados pela política de segurança do navegador quando a página é
aberta por `file://`, o que obrigaria a equipe a subir um servidor local (Live Server) toda vez,
inclusive no dia da apresentação. Com scripts clássicos, o projeto abre por duplo clique.
Continua sendo ES6+ (`const`, `let`, arrow functions, template literals), atendendo ao RNF01.
**Consequência:** a ordem das tags `<script>` importa; as camadas de baixo vêm primeiro.

### D2 — A quantidade só muda por movimentação
**Decidido em:** 01/09/2026
**Decisão:** no cadastro, a quantidade inicial informada gera automaticamente uma movimentação de
ENTRADA. Na edição, a quantidade não pode ser alterada: só muda por entrada ou saída.
**Motivo:** o RN07 exige que toda entrada ou saída gere histórico. Se a quantidade pudesse ser
editada livremente, o histórico deixaria de explicar o estoque atual e os relatórios ficariam
inconsistentes.
**Consequência:** o campo quantidade fica desabilitado no formulário de edição, com um texto
explicando que a alteração é feita pela movimentação.

### D3 — O histórico sobrevive à exclusão do produto
**Decidido em:** 01/09/2026
**Decisão:** ao excluir um produto, suas movimentações permanecem no histórico.
**Motivo:** o histórico é o registro do que aconteceu e não deve ser reescrito. Apagar
movimentações junto com o produto destruiria a rastreabilidade.
**Consequência:** cada movimentação guarda o campo `produtoNome`, com o nome do produto no momento
em que a movimentação ocorreu. O histórico exibe esse nome mesmo depois da exclusão.

### D4 — Categoria como campo controlado
**Decidido em:** 01/09/2026
**Decisão:** não existe entidade separada para categoria. A categoria é um campo do produto,
validado contra a lista fixa `Estoque.CATEGORIAS`.
**Motivo:** evita complexidade desnecessária (uma tela de CRUD a mais) sem perder a validação nem
o filtro por categoria.
**Consequência:** para incluir uma categoria nova, basta acrescentar o texto ao array
`CATEGORIAS` em `js/estoque.js`. Categorias atuais: Eletrônicos, Periféricos, Escritório,
Limpeza, Outros.

### D5 — Testes automatizados mais roteiro manual
**Decidido em:** 01/09/2026
**Decisão:** as regras de negócio são cobertas por testes automatizados em JavaScript puro
(`js/testes.js`, executados em `pages/testes.html`); o que só existe na interface é coberto por um
roteiro manual em `docs/casos-de-teste.md`.
**Motivo:** sem backend e sem bibliotecas, é a forma mais barata de ter testes que verificam
comportamento real e que podem ser demonstrados ao vivo na apresentação.
**Consequência:** nenhuma dependência externa é adicionada ao projeto.

### Convenções adotadas

- Comentários e textos exibidos ao usuário usam acentuação correta; nomes de variáveis, funções e
  classes CSS ficam sem acento.
- Nenhum arquivo além de `storage.js` acessa o `localStorage`.
- `estoque.js` e `validacao.js` nunca acessam o DOM.
- Commits pequenos e descritivos, no padrão `feat:`, `fix:`, `style:`, `test:`, `docs:`.

---

## 3. Cronograma

| Semana | Foco | Situação |
|--------|------|----------|
| 1 | Análise, planejamento, arquitetura, núcleo do sistema e testes | Concluída |
| 2 | Telas de produtos e dashboard: HTML, CSS e CRUD completo | A fazer |
| 3 | Entradas, saídas, histórico, indicadores, pesquisa e filtros na interface | A fazer |
| 4 | Integração, testes manuais, correções, responsividade, acessibilidade e documentação final | A fazer |

---

## 4. Registro das sessões

### Sessão 1 — 01/09/2026

**Contexto trazido pelo líder da equipe**

- Equipe de 5 pessoas; o líder também atua no desenvolvimento front-end com JavaScript.
- Pedido de que o código seja compreensível, para permitir acompanhar e destravar o projeto.
- Pedido de manutenção deste diário, atualizado a cada conversa.
- Desenvolvimento conduzido de forma incremental, sem divisão nominal de tarefas por pessoa.

**Análise inicial**

O diretório do projeto estava completamente vazio: nenhum arquivo, nenhum repositório Git. Não
havia código anterior a preservar nem problema arquitetural a corrigir. Foram levantadas cinco
decisões técnicas que precisavam ser tomadas antes de escrever a primeira linha de código, porque
alterariam o comportamento do sistema ou a forma de executá-lo.

**Decisões tomadas:** D1, D2, D3, D4 e D5 (todas registradas na seção 2), seguindo as
recomendações apresentadas.

**Trabalho realizado**

1. Repositório Git inicializado, com `.gitignore` e a estrutura de pastas definida.
2. Arquitetura em três camadas implementada: persistência (`storage.js`), regras
   (`estoque.js` e `validacao.js`) e telas (a construir).
3. Núcleo do sistema escrito e comentado: geração de id, classificação do estoque, cálculo de
   indicadores, pesquisa e filtros, cadastro, edição, exclusão e movimentações.
4. Suíte de testes CT01 a CT14 criada, cobrindo os 13 casos exigidos mais os indicadores do
   dashboard.
5. Estilos base criados, incluindo foco visível, contraste e estados que não dependem apenas de
   cor.
6. Documentação criada: `README.md`, `docs/requisitos.md`, `docs/casos-de-teste.md` e este diário.

**Verificação executada**

- Sintaxe de todos os arquivos JavaScript conferida.
- Suíte de testes executada duas vezes: 14 de 14 casos aprovados.
- `pages/testes.html` aberta em navegador real (Chrome): página renderizada corretamente,
  acentuação correta, nenhum erro no console e os 14 casos aprovados na interface.

**Pendências deixadas para a próxima sessão**

- Construir a tela de produtos (`pages/produtos.html` e `js/produtos.js`) com listagem, cadastro,
  edição, exclusão com confirmação, pesquisa e filtros.
- Criar `js/ui.js` com as funções compartilhadas de tela (mensagens de feedback, formatação de
  moeda e de data, montagem da etiqueta de situação).
- Preencher os nomes da equipe no `README.md`.

**Pontos em aberto para o líder decidir**

1. Nomes dos integrantes para o `README.md`.
2. Se o repositório será publicado no GitHub agora (o repositório local já está pronto para
   receber o `git remote add origin`).
