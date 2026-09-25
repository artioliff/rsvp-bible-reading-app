# Regra de código — Paleta de cores

> **Status:** implementada
> **Arquivos:** `src/index.css` (fonte única) · `src/App.tsx`, `index.html` (ligação do tema)
> **Telas:** `HomeScreen`, `SelectionScreen`, `ReaderScreen`, `SpritzWord`,
> `SpeedControl`, `FavoritesPanel`, `HistoryPanel`
> **Última atualização:** 25/09/2026

## 1. Objetivo

Centralizar **todo valor de cor** em `src/index.css` e consumi-lo por **classes
semânticas**, eliminando hex/rgb/gradientes literais e pares de classe condicionais ao
tema espalhados pelos componentes.

## 2. Regras

### RN-01 — Nenhuma cor literal em `.tsx`

- Proibido hex (`#fff`), `rgb()/rgba()` e gradientes escritos em componentes.
- Também são proibidos os atalhos arbitrários do Tailwind (`shadow-[0_6px_20px_rgba(…)]`,
  `bg-[#…]`) e as classes de paleta cruas (`bg-black`, `text-white`, `text-neutral-800`,
  `bg-red-500/20`, `from-orange-400`, …).
- Única exceção de valor dinâmico: **percentuais** — `width`, `fontSize` e a variável
  `--progress` dos sliders (não são cores).

### RN-02 — Tokens em `src/index.css`

Dois blocos:

1. `@theme static { --color-…: … }` — tema **dark** (padrão) e geração das utilidades
   do Tailwind (`bg-*`, `text-*`, `border-*`, `hover:*`, `focus:*`).
2. `:root[data-theme="light"] { --color-…: … }` — sobrescreve as **mesmas** variáveis no
   tema claro (maior especificidade que o `:root` do `@theme`).

| Grupo | Tokens |
|---|---|
| Página e texto | `page`, `ink`, `ink-muted`, `ink-subtle`, `ink-faint`, `ink-hover` |
| Superfícies | `surface`, `surface-subtle`, `surface-hover`, `surface-pressed`, `surface-translucent`, `surface-topbar`, `surface-bar`, `surface-border`, `overlay` |
| Bordas | `line`, `line-strong`, `line-hover` |
| Superfície invertida (cards da Home, botões primários) | `inverse`, `inverse-ink`, `inverse-ink-dim`, `inverse-hover` |
| Foco e sliders | `focus-ring`, `slider-fill`, `slider-track`, `slider-thumb`, `slider-thumb-border` |
| Marca | `brand-from`, `brand-to`, `on-brand` |
| Spritz | `spritz-focal`, `spritz-guide`, `spritz-dot` |

Valores de referência (dark → light): `page` `#000`→`#fff` · `ink` `#fff`→`#000` ·
`surface` `#171717`→`#fff` · `line` `#262626`→`#e5e5e5` · `inverse` `#fff`→`#000` ·
`slider-fill` `#fff`→`#000` · `brand-from/to` `#fb923c`/`#ea580c` (fixos) ·
`spritz-focal` `#ef4444` (fixo).

### RN-03 — Ligação do tema

- `index.html` nasce com `<html lang="pt-BR" data-theme="dark">` (sem flash de tema errado).
- `App.tsx` só faz `document.documentElement.dataset.theme = settings.theme` —
  **nenhuma cor no JavaScript**.
- `body { background-color: var(--color-page) }` — acabou o `#141414` divergente.
- Consequência: os componentes **não recebem mais a prop `theme`** nem usam `isDark` para
  cor (removida de `HomeScreen`, `SelectionScreen`, `FavoritesPanel`, `HistoryPanel`,
  `SpeedControl`, `SpritzWord`). O `isDark` sobrevive em `ReaderScreen` apenas para
  lógica estrutural (ícone/rótulo do toggle de tema e posição dos interruptores).

### RN-04 — Classes utilitárias próprias (fora do gerador do Tailwind)

Definidas na seção final do `index.css`:

- `.brand-gradient` — gradiente do logo (Home e Seleção).
- `.shadow-card` — sombra dos cards da Home (substitui o valor arbitrário `rgba`).
- `.speed-slider` / `.seek-slider` — thumb + trilha **e o gradiente dinâmico**
  `linear-gradient(… var(--color-slider-fill) … var(--color-slider-track) …)`.

### RN-05 — Progresso dinâmico dos sliders

O preenchimento usa `var(--progress, 0%)`; o componente passa **só a porcentagem**:

```tsx
<input className="seek-slider" style={{ '--progress': `${rsvp.progress}%` } as React.CSSProperties} />
```

Nenhum valor de cor inline — apenas o percentual.

### RN-06 — Exceções justificadas

| Local | Valor | Motivo |
|---|---|---|
| `index.html` → `<meta name="theme-color">` | `#000000` | metadado de plataforma, não é contexto CSS |
| `public/manifest.json` → `theme_color`/`background_color` | `#000000` | idem |
| `public/sw.js` | — | não tem cores |

### RN-07 — Gate de verificação (rodar após qualquer mudança de cor)

```powershell
# 1) nenhuma cor literal em TSX — deve voltar vazio
Get-ChildItem -Recurse -Include *.tsx src |
  Select-String -Pattern '#[0-9a-fA-F]{3,8}\b|rgba?\('

# 2) nenhuma classe de paleta Tailwind restante — deve voltar vazio
Get-ChildItem -Recurse -Include *.tsx src |
  Select-String -Pattern '(bg|text|border|ring|fill|from|to|via)-(black|white|neutral|red|orange)'
```

+ `npm run typecheck` · `npm run build`.

## 3. Como criar um token novo

1. Acrescente `--color-nome: <valor>` no `@theme static` (valor do tema **dark**).
2. Se a cor variar por tema, acrescente `--color-nome` também em
   `:root[data-theme="light"]`.
3. Use a utilidade gerada (`bg-nome`, `text-nome`, `border-nome`, `hover:bg-nome`) ou
   `var(--color-nome)` dentro de uma regra própria do `index.css`.
4. Nunca use a cor diretamente num componente.

## 4. Decisões de unificação (pequenos ajustes visuais aceitos)

- Hover de superfícies unificado em `n100` no claro (`#f5f5f5`); antes alguns usavam `n200`.
- `shadow-lg/shadow-xl` dos painéis agora valem nos dois temas (antes só no claro).
- Painéis/`select`s ganharam borda `border-line` consistente (no claro a borda de
  superfície é `transparent` via `surface-border`).

## 5. Critérios de aceite / teste manual

1. Gate RN-07 vazio; `typecheck` e `build` sem erros.
2. Alternar o tema na Home e no Reader muda página, textos, cards, bordas, sliders,
   foco e sombras — tudo pelo `data-theme`, sem recarregar.
3. Slider de velocidade e de busca mostram thumb/trilha/fill corretos nos 2 temas.
4. Logo com gradiente laranja e ícone branco; Spritz com letra focal vermelha e
   guia/ponto translúcidos nos 2 temas.
5. `grep neutral-|black|white` no CSS gerado não encontra classes de paleta sobrando.
