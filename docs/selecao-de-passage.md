# Regra de negócio — Seleção de passagem

> **Status:** implementada
> **Arquivos:** `src/components/screens/SelectionScreen.tsx`, `src/hooks/useAppState.ts`
> **Última atualização:** 25/09/2026

## 1. Objetivo

Definir como o usuário escolhe a passagem (tradução → livro → capítulo → versículos)
e como essa escolha chega ao leitor.

## 2. Regras

### RN-01 — Cascata de seleção

A tela mantém um espelho local `localSel` da seleção global:

1. **Tradução** — select com as 18 traduções (`TRANSLATIONS`), formato `Nome (código)`.
2. **Livro** — dois `optgroup`: *Antigo Testamento* e *Novo Testamento* (filtrados por
   `book.testament`), exibindo `Nome (abreviação)`.
3. **Capítulo** — lista vinda de `getChapterNumbers(books, livro)`.
4. **Versículos inicial/final** — de `getVerseNumbers(books, livro, capítulo)`;
   o select do versículo final só oferece valores `≥ startVerse`.

### RN-02 — Correções automáticas

- Troca de **livro** → capítulo volta para o 1º disponível (ou `1`) e a faixa passa a ser o
  capítulo inteiro.
- Troca de **capítulo** → faixa recalculada para `primeiro – último` versículo.
- `startVerse` maior que `endVerse` → `endVerse` é corrigido para `startVerse`.

### RN-03 — Prévia

Card "Passagem Selecionada" mostra `{livro} {capítulo}:{início}–{fim}` e a contagem
`fim − início + 1` de versículos (ou "Nenhum versículo disponível" quando a lista é vazia).

### RN-04 — Validação do botão "Começar"

Desabilitado quando:

- `isLoading` (tradução sendo carregada) — rótulo vira **"Carregando tradução…"**;
- `startVerses.length === 0` (livro/capítulo sem versículos).

### RN-05 — Aplicação da seleção

- O estado global `selection` **só muda** ao clicar em "Começar"
  (`onSelectionChange(localSel)`), momento em que a tela navega para `reader`.
- Sair pela seta ‹ sem clicar em "Começar" **descarta** as alterações locais.

### RN-06 — Estado inicial global

- Seleção inicial do app: **João 3:1–21** (`useAppState`).

### RN-07 — Indisponibilidade (fallback)

- Se o fetch da tradução falhou (`isFallback`), um alerta no topo informa:
  "Tradução indisponível — exibindo amostra de 9 livros. Verifique a conexão."
- Ver [traduções e dados](./traducoes-e-dados.md).

## 3. Critérios de aceite / teste manual

1. Trocar livro recalcula capítulo e faixa de versículos.
2. Escolher um `startVerse` maior restringe as opções do `endVerse`.
3. Se o `endVerse` ficar menor que o `startVerse`, ele é corrigido automaticamente.
4. "Começar" fica desabilitado durante o carregamento e volta a habilitar.
5. Voltar pela seta sem "Começar" não altera a passagem em uso.
6. Clicar em "Começar" leva ao leitor com a passagem exata exibida na prévia.
