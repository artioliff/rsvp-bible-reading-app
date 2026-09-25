# Regra de negócio — Favoritos

> **Status:** implementada
> **Arquivos:** `src/hooks/useAppState.ts`, `src/components/screens/ReaderScreen.tsx`,
> `src/components/panels/FavoritesPanel.tsx`, `src/components/screens/HomeScreen.tsx`
> **Última atualização:** 25/09/2026

## 1. Objetivo

Definir como versículos são salvos/removidos dos favoritos e persistidos entre sessões.

## 2. Regras

### RN-01 — Identidade do favorito

- `id` = `` `${book}_${chapter}_${verse}` `` (ex.: `João_3_16`).
- Consequência: **um versículo só pode existir uma vez** — a mesma referência em outra
  tradução/sessão é tratada como o mesmo favorito.

### RN-02 — Conteúdo salvo

```ts
{ id, book, chapter, verse, text, savedAt }
```

- `text` é uma **cópia** do texto no momento em que foi favoritado (não acompanha trocas
  posteriores de tradução).
- `savedAt` = `Date.now()`.

### RN-03 — Adicionar / remover (toggle)

- Botão de favorito no Reader age sobre o **versículo atual** da leitura
  (`rsvp.currentWord.verseRef`, ou `startVerse` quando não há palavra).
- Já favoritado → **remove** (`onRemoveFavorite`).
- Não favoritado → **adiciona** e mostra feedback "Favoritado ♥" por **1,5 s**
  (escala `scale-110` durante o feedback).
- Sem dados do versículo (`currentVerseData` ausente) → nada é salvo.
- Adicionar é **idempotente**: se o `id` já existir, a lista não muda
  (`addHistory`/`addFavorite` verificam duplicatas).

### RN-04 — Persistência

- `localStorage['lbr_favorites']` (`FavoriteVerse[]`), via `useLocalStorage`.
- Ordenação: **mais recente primeiro** (novo entra no início).
- O botão do Reader exibe coração preenchido quando existe ≥ 1 favorito na Home
  (`favorites.length > 0`).

### RN-05 — Painel de favoritos

- Aberto pelo ícone ❤️ na barra superior do Reader (não alterna os controles —
  para a propagação do clique).
- Lista cada favorito com `livro capítulo:versículo` + texto + data; **remoção individual**.
- Estado vazio: "Nenhum versículo favoritado ainda. Durante a leitura, toque no ❤️ para salvar."
- Botão de fechar no cabeçalho.

### RN-06 — Home

- Card "Favoritos" mostra a contagem e o coração preenchido quando `favoritesCount > 0`.

## 3. Fluxo

```
toque em "Favoritar v.X" (Reader)
   ├─ já favoritado → removeFavorite(id)     → coração vazio
   └─ não favoritado → addFavorite({...})    → "Favoritado ♥" por 1,5 s
                                              → salva em localStorage (mais recente 1º)
```

## 4. Critérios de aceite / teste manual

1. Favoritar o v.16 de João cria a chave `João_3_16` no `localStorage`.
2. Clicar de novo remove o favorito (toggle).
3. Favoritar o mesmo versículo duas vezes não duplica a lista.
4. Recarregar o app mantém os favoritos; a Home mostra a contagem correta.
5. Remover pelo painel atualiza imediatamente o contador da Home.
6. Com a lista vazia, o painel exibe a mensagem de estado vazio.
