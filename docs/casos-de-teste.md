# Casos de Teste — Gerenciador de Estoque

Os casos de teste do projeto são de dois tipos:

- **Automatizados:** implementados em `js/testes.js` e executados em `pages/testes.html`.
  Verificam as regras de negócio, a validação e a persistência.
- **Manuais:** executados na interface pelo integrante responsável, com o resultado anotado na
  tabela de execução ao final deste documento. Verificam o que só existe na tela (feedback visual,
  confirmação de exclusão, navegação por teclado, responsividade).

---

## Casos de teste automatizados

| Código | Caso de teste | O que verifica | Resultado esperado |
|--------|---------------|----------------|--------------------|
| CT01 | Cadastro válido | RF01, RF02, D2 | Produto salvo com id único, quantidade correta e uma movimentação de ENTRADA gerada |
| CT02 | Cadastro com campo obrigatório vazio | RNF06 | Cadastro recusado, mensagem de erro no campo nome, nada salvo |
| CT03 | Edição de produto | RF06, D2 | Nome e preço alterados; quantidade permanece inalterada |
| CT04 | Exclusão de produto | RF07, D3 | Produto removido da lista; movimentações permanecem no histórico com o nome preservado |
| CT05 | Entrada de estoque | RF08, RF10, RF13 | Quantidade vai de 15 para 25; movimentação registrada com data e hora |
| CT06 | Saída de estoque válida | RF09, RF10 | Quantidade vai de 25 para 22; movimentação do tipo SAIDA registrada |
| CT07 | Saída superior ao estoque | RF11, RN01, RN02 | Operação recusada com mensagem clara; quantidade inalterada; nenhuma movimentação criada |
| CT08 | Produto esgotado | RF12, RN03 | Quantidade zerada é classificada como ESGOTADO |
| CT09 | Produto com estoque baixo | RF12, RN04, RN05 | Quantidade menor ou igual ao mínimo é BAIXO; acima do mínimo é NORMAL |
| CT10 | Pesquisa de produto | RF04 | Busca parcial encontra os produtos correspondentes, ignorando maiúsculas e acentos |
| CT11 | Filtro de produtos | RF05 | Filtros por categoria, por situação e a combinação dos dois retornam os produtos corretos |
| CT12 | Persistência no localStorage | RF17 | O conteúdo lido diretamente da chave do `localStorage` contém o produto e a movimentação |
| CT13 | Recuperação após recarregar | RF18, RNF08 | Produto, quantidade, preço e histórico são recuperados corretamente |
| CT14 | Indicadores do dashboard | RF15, RF16, RN06 | Total de produtos, total de itens, baixos, esgotados e valor total conferem com os dados |

### Como executar

1. Abra `pages/testes.html` no navegador.
2. Clique em **Executar testes**.
3. O resumo indica quantos casos passaram; a tabela detalha cada caso e, em caso de falha, mostra
   a diferença entre o valor esperado e o obtido.

Os testes rodam sempre em um estoque vazio e restauram os dados salvos no navegador ao final,
mesmo se algum caso falhar.

### Última execução

| Data | Executado por | Resultado |
|------|---------------|-----------|
| 01/09/2026 | Verificação técnica | 14 de 14 casos aprovados |

---

## Casos de teste manuais (interface)

A serem executados quando as telas estiverem prontas.

| Código | Caso de teste | Passos | Resultado esperado |
|--------|---------------|--------|--------------------|
| CTM01 | Feedback visual de cadastro | Cadastrar um produto válido na tela de produtos | Mensagem de sucesso visível e produto aparece na tabela sem recarregar a página (RNF07) |
| CTM02 | Confirmação de exclusão | Clicar em excluir um produto | Sistema pede confirmação antes de excluir; ao cancelar, nada é alterado (RF07) |
| CTM03 | Erros exibidos no formulário | Enviar o formulário com preço negativo e quantidade decimal | Mensagens de erro aparecem junto aos campos correspondentes (RNF06) |
| CTM04 | Navegação por teclado | Percorrer a tela usando apenas Tab, Shift+Tab e Enter | Todos os controles são alcançáveis e o foco é sempre visível (RNF04) |
| CTM05 | Responsividade | Reduzir a janela para largura de celular | Layout se adapta e a tabela rola horizontalmente sem quebrar a página (RNF03) |
| CTM06 | Persistência real | Cadastrar produtos, fechar o navegador e abrir novamente | Os dados continuam disponíveis (RNF08) |
| CTM07 | Funcionamento sem internet | Desconectar a rede e usar o sistema | Todas as funcionalidades continuam funcionando (RNF09) |

### Registro de execução dos testes manuais

| Código | Data | Executado por | Resultado | Observações |
|--------|------|---------------|-----------|-------------|
| CTM01 | | | | |
| CTM02 | | | | |
| CTM03 | | | | |
| CTM04 | | | | |
| CTM05 | | | | |
| CTM06 | | | | |
| CTM07 | | | | |
