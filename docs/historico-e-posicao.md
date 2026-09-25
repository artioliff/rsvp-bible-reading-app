# Regra de negócio — Histórico de sessões e posição de leitura

> **Status:** implementada
> **Arquivos:** `src/hooks/useAppState.ts`, `src/components/screens/ReaderScreen.tsx`,
> `src/components/panels/HistoryPanel.tsx`, `src/components/screens/HomeScreen.tsx`
> **Última atualização:** 25/09/2026

## 1. Objetivo

Definir como o app registra as sessões de leitura (histórico) e como retoma a leitura de
onde o usuário parou.

## 2. Histórico — Regras

### RN-01 — Identidade da sessão

- Cada montagem do Reader gera uma sessão: `id = session_${Date.now()}` e
  `startedAt = Date.now()`.
- Como a tela remonta a cada troca de capítulo
  (ver [navegação](./navegacao-de-capitulos.md)), **cada capítulo vira uma sessão distinta**.

### RN-02 — Conteúdo da entrada

```ts
{ id, book, chapter, startVerse, endVerse, startedAt, completedAt?,
  totalWords, wordsRead, speed }
```

- `totalWords` = tamanho da lista de palavras da seleção.
- `wordsRead` = `currentIndex + 1` (atualizado a cada mudança de índice).
- `speed` = velocidade em ppm no momento da escrita.
- `completedAt` é **previsto no tipo, mas ainda não é preenchido** pela UI.

### RN-03 — Upsert e limite

- `addHistory` procura o `id`:
  - **existe** → atualiza a entrada **no mesmo lugar** da lista;
  - **não existe** → insere no **início** e aplica `slice(0, 50)` → **máx. 50 sessões**.
- Persistência: `localStorage['lbr_history']`.

### RN-04 — Quando é gravado

- Efeito no Reader disparado a cada mudança de `currentIndex` (inclusive na montagem),
  gravando a sessão corrente.

### RN-05 — Painel de histórico

- Aberto pelo ícone 📚 na barra superior do Reader (para a propagação do clique).
- Cada entrada exibe:
  - `livro capítulo:início–fim`;
  - selo de progresso: **`%`** (`round(wordsRead/totalWords × 100)`) ou **"✓ Concluído"**
    quando ≥ 100% (barra preenchida até 100%);
  - `speed ppm` · `wordsRead/totalWords palavras` · data (`pt-BR`) de `startedAt`.
- Botão 🗑 **Limpar** (só aparece com ≥ 1 entrada) → `clearHistory()` esvazia a lista.
- Estado vazio: "Nenhuma sessão de leitura registrada."
- Fundo clicável fecha o painel.

### RN-06 — Home

- Card "Sessões" exibe `historyCount` (= `history.length`).

## 3. Posição de leitura — Regras

### RN-07 — Salvamento

- A cada mudança de `currentIndex`, **se `currentIndex > 0`**, grava:

```ts
{ book, chapter, startVerse, endVerse, wordIndex, timestamp: Date.now() }
```

- Persistência: `localStorage['lbr_last_position']` (`ReadingPosition | null`).
- Índice `0` **não** é salvo (evita sobrescrever a posição com o início).

### RN-08 — Retomada

O Reader só restaura a posição quando **livro + capítulo + startVerse + endVerse**
coincidirem exatamente com a seleção atual:

```
índice inicial = min(lastPosition.wordIndex, words.length - 1)
```

- Qualquer divergência → índice `0`.
- `lastPosition` foi salvo em outro capítulo → a leitura daquele capítulo recomeça do 0.

### RN-09 — "Continuar de onde parou" (Home)

- Card exibido **somente se** existir `lastPosition`.
- Mostra `livro capítulo:início` e navega para a tela `reader`.
- O app **não** mexe no `selection` global: a retomada depende de a seleção atual coincidir
  com a posição salva (RN-08) — caso contrário a leitura começa do 0.

## 4. Critérios de aceite / teste manual

1. Ler até a palavra 100 → recarregar → o slider e a palavra começam em ~100.
2. Ler o capítulo A, depois selecionar o capítulo B → B começa em 0 (não herda a posição).
3. Trocar de capítulo gera uma **entrada nova** no histórico (sessões distintas).
4. Após 51 sessões, as mais antigas são descartadas (máx. 50).
5. O painel mostra %, "✓ Concluído" ao terminar, ppm, contagem e data em pt-BR.
6. 🗑 limpa o histórico e o card "Sessões" da Home zera.
7. Com `lastPosition` apagado, o card "Continuar de onde parou" some da Home.
