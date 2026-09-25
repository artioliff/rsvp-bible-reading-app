# Regra de negócio — Navegação de capítulos no Reader

> **Status:** implementada
> **Arquivos:** `src/App.tsx`, `src/components/screens/ReaderScreen.tsx`
> **Última atualização:** 25/09/2026

## 1. Objetivo

Permitir avançar para o **próximo capítulo** ou voltar para o **capítulo anterior**
durante a leitura RSVP, sem retornar à tela de seleção.

## 2. Regras

### RN-01 — Botões de navegação

| Botão | Ícone | Rótulo | Ação |
|---|---|---|---|
| Anterior | `ChevronLeft` | `Ant.` | Vai para o capítulo anterior |
| Próximo | `ChevronRight` | `Próx.` | Vai para o próximo capítulo |

- Localização: **painel inferior de controles**, substituindo os antigos botões de
  pulo de ±10 palavras (`SkipBack`/`SkipForward`), que foram removidos da interface.
- O pulo de ±10 palavras **não existe mais** na UI. O slider de busca e o botão
  *Restart* continuam disponíveis para reposicionar a leitura dentro do capítulo.

### RN-02 — Intervalo de versículos

Ao navegar, a nova seleção corresponde sempre ao **capítulo inteiro**:

- `startVerse` = primeiro versículo do capítulo (ou `1` se ausente)
- `endVerse` = último versículo do capítulo (ou `startVerse` se ausente)

Mesma convenção adotada pelo `SelectionScreen`.

### RN-03 — Virada de livro

A navegação **atravessa fronteiras de livro**:

| Situação | Comportamento |
|---|---|
| Não é o primeiro capítulo do livro | Vai para o capítulo anterior/próximo do **mesmo livro** |
| Está no **primeiro** capítulo do livro | `Ant.` vai para o **último capítulo do livro anterior** |
| Está no **último** capítulo do livro | `Próx.` vai para o **primeiro capítulo do livro seguinte** |

Exemplo: último capítulo de Gênesis → `Próx.` = 1º capítulo de Êxodo.

### RN-04 — Fronteiras da Bíblia

O botão fica **desabilitado** (`opacity-40`, `cursor-not-allowed`, sem hover/ativação)
somente quando não há destino:

- `Ant.` desabilitado no **primeiro capítulo do primeiro livro** (Gênesis 1).
- `Próx.` desabilitado no **último capítulo do último livro** (Apocalipse 22).

Opcionalmente exibem `title`/`aria-label` com o capítulo destino
(ex.: `Próximo capítulo: João 4`) ou a indicação de início/fim da Bíblia.

### RN-05 — Falta de dados (guardas)

- Livro da seleção não encontrado em `books` → ambos os alvos são `null` → botões
  desabilitados (cenário possível com a amostra embutida de 9 livros).
- Livro vizinho sem capítulos → alvo `null` → botão desabilitado.
- Nenhum erro é lançado; a leitura atual nunca é interrompida por navegação indisponível.

### RN-06 — Reset de estado ao trocar de capítulo

A troca de seleção **remonta a tela do Reader** via `key` no `App.tsx`
(`key={${selection.book}_${selection.chapter}}`). A remontagem garante:

- índice do RSVP zerado (o `initialIndex` do `useRSVP` só vale na montagem — sem
  remontagem, o índice do capítulo anterior ficaria fora do intervalo do novo
  capítulo e a tela mostraria "Nenhuma palavra");
- tela **"Leitura Concluída 🎉"** fechada;
- controles e sessão de histórico recriados (novo registro no histórico por capítulo);
- posição salva (`lastPosition`) restaurada apenas se corresponder exatamente à
  nova seleção (livro, capítulo e faixa de versículos).

### RN-07 — Conclusão da leitura

Na tela **"Leitura Concluída 🎉"**:

- botão **"Ler Novamente"** (primário) — reinicia o capítulo atual;
- botão **"Próximo capítulo"** (secundário/outline) — aplica RN-02/RN-03;
  só é renderizado quando existe capítulo destino (RN-04).

## 3. Fluxo

```
clique em "Próx."
      │
      ▼
nextTarget == null? ──sim──▶ botão desabilitado (nada acontece)
      │ não
      ▼
onSelectionChange(target)  ← target = { book, chapter, startVerse, endVerse }
      │
      ▼
<App> atualiza `selection` ──▶ key muda ──▶ <ReaderScreen> remonta
      │
      ▼
RSVP reinicia em index 0 do capítulo inteiro
```

## 4. Derivação dos alvos

```ts
const chapters = getChapterNumbers(books, selection.book);
const chapterIndex = chapters.indexOf(selection.chapter);
const bookIndex = books.findIndex((b) => b.name === selection.book);

// previous: capítulo anterior; se for o 1º → último do livro anterior
// next:     próximo capítulo;  se for o último → 1º do livro seguinte
// alvos montados com getVerseNumbers(books, livro, capítulo) → capítulo inteiro
```

Helpers utilizados (todos já existentes em `src/data/bibleData.ts`):
`getChapterNumbers`, `getVerseNumbers`.

## 5. Critérios de aceite / teste manual

1. `Ant.` no meio do livro muda para o capítulo anterior (intervalo completo).
2. `Próx.` no meio do livro muda para o capítulo seguinte.
3. `Próx.` no último capítulo de um livro abre o **1º capítulo do livro seguinte**.
4. `Ant.` no primeiro capítulo de um livro abre o **último capítulo do livro anterior**.
5. Em Gênesis 1, `Ant.` aparece desabilitado; em Apocalipse 22, `Próx.` desabilitado.
6. Após navegar, a palavra exibida é a primeira do capítulo novo (sem "Nenhuma palavra").
7. Tela de conclusão mostra "Próximo capítulo" (exceto no fim da Bíblia).
8. Cada capítulo navegado gera uma entrada nova no histórico.
9. `npm run typecheck` e `npm run build` passam sem erros.
