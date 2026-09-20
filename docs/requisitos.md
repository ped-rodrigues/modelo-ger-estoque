# Documento de Requisitos — Gerenciador de Estoque

Documento de referência oficial do projeto. Sempre que houver dúvida sobre o comportamento
esperado do sistema, este arquivo tem a palavra final.

- **Projeto:** Gerenciador de Estoque
- **Tipo:** aplicação web sem backend (HTML5, CSS3, JavaScript ES6+, `localStorage`)
- **Ator principal:** Funcionário/Administrador

---

## 1. Escopo

### Dentro do escopo

Dashboard; cadastro, consulta, edição e exclusão de produtos; pesquisa e filtros; registro de
entradas e saídas; histórico de movimentações; controle de estoque mínimo; classificação
automática do estoque; persistência em `localStorage`; interface responsiva; acessibilidade
básica; validação de formulários.

### Fora do escopo

Backend; banco de dados; API externa; autenticação real; permissões complexas; múltiplos usuários
simultâneos; integração fiscal ou com ERP; emissão de nota fiscal; pagamentos.

---

## 2. Requisitos funcionais

| Código | Requisito | Situação |
|--------|-----------|----------|
| RF01 | Cadastrar produtos informando nome, categoria, preço, quantidade e estoque mínimo | Núcleo pronto |
| RF02 | Gerar um identificador único para cada produto | Núcleo pronto |
| RF03 | Consultar a lista de produtos cadastrados | Núcleo pronto |
| RF04 | Pesquisar produtos pelo nome | Núcleo pronto |
| RF05 | Filtrar produtos por categoria e situação do estoque | Núcleo pronto |
| RF06 | Editar os dados de um produto | Núcleo pronto |
| RF07 | Excluir produtos mediante confirmação | Núcleo pronto (confirmação fica na tela) |
| RF08 | Registrar entradas de estoque | Núcleo pronto |
| RF09 | Registrar saídas de estoque | Núcleo pronto |
| RF10 | Atualizar automaticamente a quantidade após uma movimentação | Núcleo pronto |
| RF11 | Impedir saída superior à quantidade disponível | Núcleo pronto |
| RF12 | Classificar automaticamente como normal, baixo estoque ou esgotado | Núcleo pronto |
| RF13 | Registrar data e hora das movimentações | Núcleo pronto |
| RF14 | Disponibilizar o histórico de entradas e saídas | Núcleo pronto |
| RF15 | Apresentar no dashboard a quantidade de produtos, o total em estoque, os produtos com estoque baixo e os esgotados | Núcleo pronto |
| RF16 | Calcular o valor total do estoque com base no preço e na quantidade | Núcleo pronto |
| RF17 | Armazenar os dados no `localStorage` | Núcleo pronto |
| RF18 | Recuperar os dados armazenados ao ser iniciado | Núcleo pronto |

> "Núcleo pronto" significa que a regra existe e está implementada em `js/estoque.js`; a interface que
> a expõe ao usuário é construída nas etapas seguintes.

---

## 3. Requisitos não funcionais

| Código | Requisito |
|--------|-----------|
| RNF01 | Utilizar HTML5, CSS3 e JavaScript ES6+ |
| RNF02 | Funcionar em navegadores modernos |
| RNF03 | Interface responsiva |
| RNF04 | Permitir navegação por teclado |
| RNF05 | Contraste adequado |
| RNF06 | Campos com identificação clara e validação |
| RNF07 | Feedback visual nas operações |
| RNF08 | Dados disponíveis após fechar e reabrir o navegador |
| RNF09 | Funcionalidades principais não dependem de internet |
| RNF10 | Consistência visual entre as telas |
| RNF11 | JavaScript modular, evitando duplicação desnecessária |
| RNF12 | Resposta imediata nas operações normais |

---

## 4. Regras de negócio

| Código | Regra | Onde está implementada |
|--------|-------|------------------------|
| RN01 | A quantidade de estoque nunca pode ser negativa | `Estoque.registrarMovimentacao`, `Validacao.validarProduto` |
| RN02 | Uma saída não pode exceder a quantidade disponível | `Estoque.registrarMovimentacao` |
| RN03 | Quantidade igual a zero significa "Esgotado" | `Estoque.classificar` |
| RN04 | Quantidade entre 1 e o estoque mínimo significa "Baixo" | `Estoque.classificar` |
| RN05 | Quantidade acima do estoque mínimo significa "Normal" | `Estoque.classificar` |
| RN06 | Valor total do produto é `preço × quantidade` | `Estoque.valorTotalProduto` |
| RN07 | Toda entrada ou saída gera uma movimentação no histórico | `Estoque.registrarMovimentacao` |
| RN08 | O preço do produto não pode ser negativo | `Validacao.validarProduto` |
| RN09 | Quantidade e estoque mínimo são inteiros maiores ou iguais a zero | `Validacao.validarProduto` |

---

## 5. Casos de uso

Ator: **Funcionário/Administrador**

| Código | Caso de uso |
|--------|-------------|
| UC01 | Cadastrar produto |
| UC02 | Consultar produtos |
| UC03 | Editar produto |
| UC04 | Excluir produto |
| UC05 | Registrar entrada |
| UC06 | Registrar saída |
| UC07 | Consultar histórico |
| UC08 | Consultar dashboard |
| UC09 | Pesquisar e filtrar produtos |

O sistema executa automaticamente, sem ação do usuário: cálculo dos indicadores, classificação do
estoque, atualização das quantidades, armazenamento dos dados e validações.

---

## 6. Modelo de dados

Os dados são guardados no `localStorage` em duas chaves, cada uma contendo um array em JSON.

### Produto — chave `gestoque.produtos`

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | string | Gerado pelo sistema (RF02). Exemplo: `p_m0x3k1a_7f2qd` |
| `nome` | string | 2 a 60 caracteres |
| `categoria` | string | Um dos valores de `Estoque.CATEGORIAS` |
| `preco` | number | Maior ou igual a zero (RN08) |
| `quantidade` | number | Inteiro maior ou igual a zero (RN01, RN09). Só muda por movimentação |
| `estoqueMinimo` | number | Inteiro maior ou igual a zero (RN09) |

### Movimentação — chave `gestoque.movimentacoes`

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | string | Gerado pelo sistema. Exemplo: `m_m0x3k1b_2ka9p` |
| `produtoId` | string | Referência ao produto |
| `produtoNome` | string | Nome do produto no momento da movimentação (decisão D3) |
| `tipo` | string | `ENTRADA` ou `SAIDA` |
| `quantidade` | number | Inteiro maior que zero |
| `data` | string | Data e hora em formato ISO 8601 (RF13) |

### Categoria

Não existe entidade separada para categoria (decisão D4). A categoria é um campo controlado do
produto, validado contra a lista fixa `Estoque.CATEGORIAS`:

```text
Eletrônicos, Periféricos, Escritório, Limpeza, Outros
```

---

## 7. Decisões de projeto que afetam o comportamento

Estas decisões complementam os requisitos e foram acordadas com a equipe. O registro completo,
com a justificativa de cada uma, está em `docs/diario-do-projeto.md`.

| Código | Decisão |
|--------|---------|
| D1 | Scripts clássicos em vez de módulos ES, para o projeto abrir por duplo clique |
| D2 | A quantidade só muda por movimentação; a quantidade inicial do cadastro gera uma ENTRADA |
| D3 | Ao excluir um produto, suas movimentações permanecem no histórico |
| D4 | Categoria é um campo controlado do produto, com lista fixa |
