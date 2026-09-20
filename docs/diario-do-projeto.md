# Diário do Projeto — Gerenciador de Estoque

Documento vivo. Registra o andamento do projeto, as decisões tomadas e o resumo de cada sessão de
trabalho. **É atualizado a cada nova conversa**, sempre acrescentando ao final da seção
"Registro das sessões" — o histórico anterior nunca é reescrito.

- **Equipe:** 5 integrantes
- **Prazo:** aproximadamente 1 mês
- **Início:** 01/09/2026

---

## 1. Estado atual do projeto

**Etapa atual:** Semana 2 em andamento (tela de produtos concluída).

### O que já existe

| Item | Arquivo | Situação |
|------|---------|----------|
| Repositório Git e estrutura de pastas | — | Pronto |
| Camada de persistência | `js/storage.js` | Pronto |
| Camada de validação | `js/validacao.js` | Pronto |
| Regras de negócio e operações | `js/estoque.js` | Pronto |
| Estilos base | `css/style.css` | Pronto |
| Funções auxiliares de tela | `js/ui.js` | Pronto |
| Tela de produtos (CRUD, pesquisa, filtros, movimentações) | `pages/produtos.html`, `js/produtos.js`, `css/produtos.css` | Pronto e verificado no navegador |
| Documentação de requisitos | `docs/requisitos.md` | Pronto |
| README | `README.md` | Pronto (equipe a preencher) |

### O que ainda falta

| Item | Etapa prevista |
|------|----------------|
| `index.html` (dashboard) e `js/dashboard.js` | Semana 3 |
| `pages/historico.html` e `js/historico.js` | Semana 3 |
| Link do dashboard e do histórico na navegação | Semana 3 |
| Wireframes em `docs/wireframes/` | Semana 2 e 3 |
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
| 1 | Análise, planejamento, arquitetura e núcleo do sistema | Concluída |
| 2 | Tela de produtos: HTML, CSS, CRUD completo, pesquisa, filtros e movimentações | Concluída |
| 3 | Dashboard e histórico na interface | A fazer |
| 4 | Integração, correções, responsividade, acessibilidade e documentação final | A fazer |

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
4. Estilos base criados, incluindo foco visível, contraste e estados que não dependem apenas de
   cor.
5. Documentação criada: `README.md`, `docs/requisitos.md` e este diário.

**Verificação executada**

- Sintaxe de todos os arquivos JavaScript conferida.

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

---

### Sessão 2 — 01/09/2026

**Pedido:** construir a tela de produtos e publicar os commits no GitHub.

**Escopo da sessão**

A tela de produtos foi construída com listagem dinâmica, cadastro, edição, exclusão com
confirmação, pesquisa por nome e filtros por categoria e situação. As movimentações de entrada e
saída, previstas originalmente para a Semana 3, foram antecipadas para esta tela: pela decisão D2
a quantidade só muda por movimentação, então sem elas o estoque ficaria congelado e a tela não
seria utilizável. A seção 10 do escopo já previa "acesso às movimentações" nesta tela.

**Arquivos criados**

- `js/ui.js` — funções de tela compartilhadas: formatação de moeda e de data, etiqueta de
  situação, mensagens de feedback, exibição dos erros de validação e estado vazio de tabela.
- `pages/produtos.html` — listagem, barra de filtros e três janelas (`<dialog>`): produto,
  movimentação e confirmação de exclusão.
- `js/produtos.js` — liga a tela às regras de negócio. Usa delegação de eventos na tabela, para
  não recriar ouvintes a cada renderização.
- `css/produtos.css` — barra de filtros, botões de ação e estilo das janelas.

**Decisões técnicas menores**

- As janelas usam o elemento `<dialog>` do HTML, que já prende o foco e fecha com Esc. Isso evita
  o `confirm()` do navegador e melhora a acessibilidade sem código extra.
- Os botões de ação têm `aria-label` com o nome do produto ("Excluir Mouse Logitech"), senão um
  leitor de tela ouviria apenas "Excluir" repetido em todas as linhas.

**Correções feitas durante o desenvolvimento**

1. `form.id` devolve o atributo `id` do formulário, não o campo chamado `id`, o que faria
   `form.id.value` ser `undefined`. Todos os acessos passaram a usar `form.elements.<campo>`.
2. O preço aparecia como "199,9" no formulário de edição; passou a usar `toFixed(2)`.

**Verificação executada no navegador (Chrome)**

| O que foi verificado | Resultado |
|-------------------|-----------|
| Formulário vazio | Três mensagens de erro exibidas junto aos campos; nada salvo |
| Cadastro de 3 produtos | Salvos, com mensagem de sucesso e valor total calculado |
| Classificação automática | Teclado com 3 unidades e mínimo 5 exibido como "Baixo" |
| Pesquisa por "mo" | 2 de 3 produtos exibidos |
| Filtro por situação "Baixo" | 1 de 3 produtos exibido |
| Saída de 10 com estoque 3 | Recusada, com a mensagem "Disponível: 3"; janela permaneceu aberta |
| Saída de 3 | Estoque foi a 0 e a situação mudou para "Esgotado" |
| Entrada de 8 | Estoque foi a 8 e a situação voltou para "Normal" |
| Edição | Preço alterado, quantidade preservada e campo desabilitado (D2) |
| Exclusão | Cancelar não alterou nada; confirmar removeu o produto |
| Histórico após exclusão | A movimentação do produto excluído permaneceu, com o nome preservado (D3) |
| Recarregar a página | Os dados foram recuperados do `localStorage` |
| Tecla Esc | Fecha a janela aberta |
| Console do navegador | Nenhum erro |

**Pendências deixadas para a próxima sessão**

- Dashboard (`index.html` e `js/dashboard.js`) com os indicadores, e tela de histórico
  (`pages/historico.html` e `js/historico.js`).
- Acrescentar os links de Dashboard e Histórico na navegação das telas.
- Verificar a responsividade em tela estreita — não foi possível confirmar nesta sessão.
