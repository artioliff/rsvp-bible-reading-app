# Regra de negócio — Traduções e camada de dados

> **Status:** implementada
> **Arquivos:** `src/data/bibleData.ts`, `src/data/sampleData.ts`, `src/hooks/useAppState.ts`,
> `public/sw.js`, `scripts/convert-bible-data.mjs`
> **Última atualização:** 25/09/2026

## 1. Objetivo

Definir como as 18 traduções são carregadas, cacheadas, convertidas e como o app se
comporta offline.

## 2. Regras

### RN-01 — Tradução ativa

- Código persistido em `settings.translation`; padrão **ARA** (Almeida Revista e Atualizada).
- 18 traduções disponíveis (`TRANSLATIONS`), cada uma = arquivo `public/data/{code}.json`.
- O rodapé da Home exibe o nome oficial da tradução ativa (ou o código, se desconhecido).
- Trocar a tradução **recarrega os livros** — ver RN-04.

### RN-02 — Carregamento e cache

- `loadTranslation(code)` busca `${import.meta.env.BASE_URL}data/{code}.json` (respeita o
  base do Vite, ex.: GitHub Pages em subpasta).
- **Cache em memória por promessa** (`Map<string, Promise>`): a 1ª chamada inicia o fetch e
  as chamadas concorrentes compartilham a mesma promessa (deduplicação).
- **Falhas nunca são memorizadas** (`translationCache.delete(code)`) → a próxima chamada
  tenta de novo.
- Validação leve: precisa ser `Book[]` não vazio, com `chapters` em todos os itens.

### RN-03 — Fallback offline

- Se o fetch falhar (HTTP ≠ 200, rede fora, JSON inválido) → resolve com a **amostra
  embutida** (9 livros: Gênesis, Êxodo, Salmos, Provérbios, Mateus, João, Romanos, Efésios,
  Apocalipse) e `isFallback: true`.
- `isFallback` é exibido como alerta na tela de seleção (não quebra o fluxo de leitura).

### RN-04 — Recarregamento ao trocar de tradução

- Efeito em `useAppState` observa `translation`: define `isLoading = true`, chama
  `loadTranslation` e só então `setBooks` + `isLoading = false`.
- **Guarda de corrida:** se o efeito rodar de novo antes de terminar (`cancelled`), a
  resposta antiga é descartada — respostas velhas nunca sobrescrevem as novas.
- Enquanto carrega, a seleção "Começar" fica desabilitada
  (ver [seleção de passagem](./selecao-de-passage.md)).

### RN-05 — Amostra inicial

- O app **inicia** com a amostra embutida (`bibleBooks`) para nunca ficar com `books`
  vazio, mesmo antes do 1º fetch resolver.

### RN-06 — Pipeline de dados

```
data-src/*.json  →  npm run convert:data  →  public/data/*.json
(fonte bruta)       valida capítulos          (servido pelo Vite +
                    canônicos, numeração       cacheado pelo Service Worker)
                    1-based
```

- ⚠️ **Não reformatar** `data-src/` e `public/data/` (há `.prettierignore` e `.editorconfig`):
  reindentar um arquivo de 4,5 MB infla ~60% no fetch e polui o git.

### RN-07 — Offline / Service Worker (`public/sw.js`)

- Cache `lbr-v2` com `/`, `/index.html`, `/manifest.json` e ícones pré-cacheados no `install`.
- Estratégia: **cache-first com atualização em segundo plano** — se existir no cache, serve
  do cache; senão busca na rede e coloca no cache (apenas respostas `200` + type `basic`).
- Isso faz os JSONs de `/data/*.json` serem cacheados no **1º acesso**.
- `activate` apaga caches com nome diferente de `lbr-v2`; `skipWaiting` + `clients.claim`
  ativam a nova versão sem esperar abas antigas.

## 3. Fluxo de troca de tradução

```
select "Tradução" → updateSettings({ translation })
      → efeito em useAppState: isLoading = true
      → loadTranslation(code) (cacheia a promessa)
      ├─ sucesso → setBooks(66 livros), isFallback = false
      └─ falha   → setBooks(amostra 9 livros), isFallback = true
      → isLoading = false (guarda `cancelled` descarta respostas velhas)
```

## 4. Critérios de aceite / teste manual

1. Trocar de tradução mostra "Carregando…" e, ao terminar, os 66 livros aparecem no select.
2. Recarregar a página com a mesma tradução não refaz o fetch (promessa cacheada).
3. Sem rede: o app abre com a amostra e o alerta de fallback na tela de seleção.
4. Conexão volta → nova tentativa de fetch (falha não fica cacheada).
5. Duas trocas rápidas de tradução mantêm a última escolhida (guarda de corrida).
6. Com o app instalado (PWA) e dados já vistos, a leitura funciona offline.
7. `npm run convert:data` valida e regenera `public/data/*.json`.
