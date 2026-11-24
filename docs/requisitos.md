# Documento de Requisitos — Kaisen, Gerenciador de Estoque

Resumo técnico dos requisitos do projeto, alinhado ao **Documento de Visão** (versão Requisitos 2.0,
novembro de 2026), que é o guia oficial de referência. Se este arquivo e o Documento de Visão
divergirem, vale o Documento de Visão e este arquivo deve ser corrigido.

- **Projeto:** Kaisen — Gerenciador de Estoque
- **Segmento:** veículos e autopeças, com site público de venda de carros importados
- **Tipo:** aplicação web client-side, sem backend (HTML5, CSS3, JavaScript ES6+, `localStorage` e `sessionStorage`)
- **Atores:** Administrador (ADM) e Funcionário (OPR)

---

## 1. Escopo

### Dentro do escopo

**Painel interno**

- **Dashboard** (só Administrador): total de peças, itens em estoque, produtos com estoque baixo,
  produtos esgotados e valor financeiro total investido.
- **Estoque de peças:** cadastro, consulta, edição e exclusão (as duas últimas só do Administrador),
  busca por nome ou código e filtros por categoria e situação.
- **Histórico de movimentações:** entradas e saídas com data e hora em ISO 8601, filtro por nome da
  peça e por tipo, rastreabilidade mantida mesmo após a exclusão da peça.
- **Adicionar carro** (demonstração): formulário de veículo com fotos, prévia e checklist.
- **Pedidos de importação** (demonstração): etapas do pedido (Compra, Documentação, Embarque,
  Em trânsito, Desembaraço e Entrega), histórico de eventos com data, chegada prevista, porto de
  destino e situação de pagamento e documentos.

**Acesso**

- **Login** com contas de demonstração; o perfil (Administrador ou Funcionário) vem da conta.

**Site público**

- Início, Garagem de carros, Estoque de carros (busca por palavra-chave e marca), Loja Auto-Peças
  (acessórios e carrinho), Simulador de importação (com simulação de financiamento), Venda seu
  carro, Contato e Sobre.
- O financiamento é só uma simulação de cálculo com valores de exemplo: não faz pagamento nem se
  conecta a bancos.

**Interface**

- Tema escuro com acento laranja, baseado no protótipo do Figma; barra de navegação fixa no topo;
  responsiva; navegação por teclado com foco visível; sem dependência de serviços externos.

### Fora do escopo

Servidores back-end; bancos de dados relacionais/SGBD; APIs externas; autenticação real com
criptografia ou sessão; integração fiscal; NF-e/ERP; pagamentos reais; sincronização entre
navegadores ou dispositivos.

---

## 2. Perfis de acesso

O perfil vem da conta usada no login. O e-mail logado fica na chave `gestoque.usuario` do
`sessionStorage` (apagado ao fechar a aba ou ao voltar para o login pelo "Sair"). Sem login, as
páginas do painel voltam para o login.

| Perfil | Valor gravado | Pode |
|--------|---------------|------|
| Administrador / Gerente | `ADM` | Tudo: Dashboard, cadastro, edição, exclusão, movimentações, histórico |
| Funcionário / Operador | `OPR` | Consultar, buscar, cadastrar, registrar entradas e saídas, ver o histórico |

Contas de demonstração (`Estoque.USUARIOS`; sem servidor, a senha fica no código):

| E-mail | Senha | Perfil |
|--------|-------|--------|
| `admin@kaisen.com` | `admin123` | Administrador |
| `carla@kaisen.com` | `carla123` | Funcionário |
| `rafael@kaisen.com` | `rafael123` | Funcionário |

Cada peça cadastrada guarda `cadastradoPor`, cada movimentação guarda `usuario` e `valorUnitario`,
e cada carro publicado vai para `gestoque.carros` com `usuario`. O Painel geral mostra, por conta:
peças cadastradas, entradas, vendas (saídas), valor vendido e carros adicionados.

---

## 3. Requisitos funcionais

| Código | Requisito | Usuários aptos | Prioridade |
|--------|-----------|----------------|------------|
| RF01 | Cadastrar produtos informando nome, código, fabricante, categoria, preço, quantidade inicial e estoque mínimo | ADM / OPR | Essencial |
| RF02 | Gerar identificador único automático (ex.: `p_m0x3k1a_7f2q`) para cada produto | Sistema | Essencial |
| RF03 | Consultar a listagem de peças em tabela na tela Estoque de peças | ADM / OPR | Essencial |
| RF04 | Pesquisar por nome ou código, ignorando maiúsculas, acentos, hífen, ponto, barra e espaço (`fr4213` encontra `FR-4213`) | ADM / OPR | Essencial |
| RF05 | Filtrar por categoria automotiva e por situação do estoque (Normal, Baixo, Esgotado) | ADM / OPR | Essencial |
| RF06 | Editar os dados de um produto, exceto o saldo de quantidade | ADM | Essencial |
| RF07 | Excluir produtos mediante confirmação em modal (`<dialog>`) | ADM | Essencial |
| RF08 | Registrar entradas de estoque, atualizando a quantidade | ADM / OPR | Essencial |
| RF09 | Registrar saídas de estoque, diminuindo a quantidade disponível | ADM / OPR | Essencial |
| RF10 | Atualizar a classificação e a quantidade após qualquer movimentação | Sistema | Essencial |
| RF11 | Impedir saídas maiores que a quantidade disponível | Sistema | Essencial |
| RF12 | Classificar o estoque em Normal (qtd > mínimo), Baixo (1 ≤ qtd ≤ mínimo) e Esgotado (qtd = 0) | Sistema | Essencial |
| RF13 | Gravar data e hora de cada movimentação em ISO 8601 | Sistema | Essencial |
| RF14 | Disponibilizar o histórico de movimentações em ordem decrescente e com filtros | ADM / OPR | Essencial |
| RF15 | Apresentar no Dashboard, exclusivo do Administrador, peças cadastradas, itens em estoque, estoque baixo, esgotados e valor investido | ADM | Importante |
| RF16 | Calcular o valor financeiro do estoque (preço unitário × quantidade) | Sistema | Importante |
| RF17 | Salvar produtos e movimentações nas chaves `gestoque.produtos` e `gestoque.movimentacoes` do `localStorage` | Sistema | Essencial |
| RF18 | Recuperar os dados salvos ao iniciar a aplicação | Sistema | Essencial |

---

## 4. Requisitos não funcionais

| Código | Requisito | Tipo | Prioridade |
|--------|-----------|------|------------|
| RNF01 | Somente HTML5, CSS3 e JavaScript ES6+ puro, sem frameworks ou bibliotecas | Tecnológico | Essencial |
| RNF02 | Compatível com Chrome, Edge, Firefox e Safari | Portabilidade | Essencial |
| RNF03 | Interface responsiva para desktop e celular | Usabilidade | Essencial |
| RNF04 | Navegação completa por teclado e foco visível | Acessibilidade | Essencial |
| RNF05 | Contraste adequado no tema escuro, sem depender só de cor para indicar estados | Usabilidade | Essencial |
| RNF06 | Campos identificados e mensagens explicativas nos erros de validação | Usabilidade | Essencial |
| RNF07 | Feedback imediato com `role="status"` e `aria-live="polite"` | Usabilidade | Importante |
| RNF08 | Dados mantidos após fechar e reabrir o navegador | Confiabilidade | Essencial |
| RNF09 | Sem dependência de rede ou APIs externas (100% offline) | Desempenho | Essencial |
| RNF10 | Consistência visual entre todas as telas da Relação de Telas | Usabilidade | Importante |
| RNF11 | Organização modular em camadas, sem duplicação desnecessária (DRY) | Manutenibilidade | Essencial |
| RNF12 | Resposta imediata, sem latência perceptível nas operações locais | Desempenho | Essencial |

---

## 5. Regras de negócio

| Código | Regra | Onde está implementada |
|--------|-------|------------------------|
| RN01 | A quantidade de estoque nunca pode ser negativa | `Estoque.registrarMovimentacao`, `Validacao.validarProduto` |
| RN02 | Uma saída não pode ser maior que a quantidade disponível | `Estoque.registrarMovimentacao` |
| RN03 | Quantidade igual a zero é "Esgotado" | `Estoque.classificar` |
| RN04 | Quantidade maior que zero e menor ou igual ao mínimo é "Baixo" | `Estoque.classificar` |
| RN05 | Quantidade acima do mínimo é "Normal" | `Estoque.classificar` |
| RN06 | Valor total do produto é `preço × quantidade` | `Estoque.valorTotalProduto` |
| RN07 | Qualquer alteração no saldo deve vir de uma movimentação registrada no histórico | `Estoque.cadastrarProduto`, `Estoque.registrarMovimentacao` |
| RN08 | O preço unitário não pode ser negativo | `Validacao.validarProduto` |
| RN09 | Quantidade e estoque mínimo são inteiros maiores ou iguais a zero | `Validacao.validarProduto` |
| RN10 | O código do produto é único no cadastro | `Estoque.cadastrarProduto`, `Estoque.editarProduto` |

---

## 6. Casos de uso

| Código | Caso de uso | Administrador | Funcionário |
|--------|-------------|:-------------:|:-----------:|
| UC01 | Cadastrar produto | ✓ | ✓ |
| UC02 | Consultar produtos | ✓ | ✓ |
| UC03 | Editar produto | ✓ | |
| UC04 | Excluir produto | ✓ | |
| UC05 | Registrar entrada | ✓ | ✓ |
| UC06 | Registrar saída | ✓ | ✓ |
| UC07 | Consultar histórico | ✓ | ✓ |
| UC08 | Consultar dashboard | ✓ | |
| UC09 | Pesquisar e filtrar produtos | ✓ | ✓ |

O sistema executa automaticamente, sem ação do usuário: cálculo dos indicadores, classificação do
estoque, atualização das quantidades, armazenamento dos dados e validações.

---

## 7. Modelo de dados

### Produto — `localStorage`, chave `gestoque.produtos`

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | string | Gerado pelo sistema (RF02) |
| `codigo` | string | Código de referência da peça, único (RN10) |
| `nome` | string | 2 a 60 caracteres |
| `fabricante` | string | Marca/fabricante |
| `aplicacao` | string | Compatibilidade / veículos atendidos |
| `categoria` | string | Uma das 11 categorias abaixo |
| `preco` | number | Maior ou igual a zero (RN08) |
| `quantidade` | integer | Maior ou igual a zero (RN01, RN09); só muda por movimentação (RN07) |
| `estoqueMinimo` | integer | Maior ou igual a zero (RN09) |

**Categorias aceitas** (`Estoque.CATEGORIAS`): Motor, Freios, Suspensão e Direção, Transmissão,
Filtros, Elétrica, Arrefecimento, Pneus e Rodas, Lubrificantes e Fluidos, Acessórios e Outros.

### Movimentação — `localStorage`, chave `gestoque.movimentacoes`

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | string | Gerado pelo sistema |
| `produtoId` | string | Referência ao produto |
| `produtoNome` | string | Nome no momento da operação, preservado se a peça for excluída (D3) |
| `tipo` | string | `ENTRADA` ou `SAIDA` |
| `quantidade` | integer | Maior que zero |
| `data` | string | Data e hora em ISO 8601 (RF13) |

### Conta logada — `sessionStorage`, chave `gestoque.usuario`

| Campo | Tipo | Observação |
|-------|------|------------|
| `gestoque.usuario` | string | E-mail da conta logada. Apagado ao fechar a aba ou ao voltar ao login |

---

## 8. Decisões de projeto que afetam o comportamento

O registro completo, com a justificativa de cada decisão, está em `docs/diario-do-projeto.md`.

| Código | Decisão |
|--------|---------|
| D1 | Scripts clássicos em vez de módulos ES, para o projeto abrir por duplo clique (`file://`) |
| D2 | A quantidade só muda por movimentação; a quantidade inicial do cadastro gera uma ENTRADA |
| D3 | Ao excluir um produto, suas movimentações permanecem no histórico |
| D4 | Categoria é um campo controlado do produto, com lista fixa |
| D5 | Roteiro de casos de teste em `docs/casos-de-teste.md`, conferidos na interface |
