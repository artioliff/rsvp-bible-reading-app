# Regra de negócio — Configurações e tema

> **Status:** implementada
> **Arquivos:** `src/constants/settings.ts`, `src/types/app.ts`, `src/hooks/useAppState.ts`,
> `src/hooks/useLocalStorage.ts`, `src/App.tsx`, `src/components/screens/ReaderScreen.tsx`
> **Última atualização:** 25/09/2026

## 1. Objetivo

Definir as preferências persistentes do usuário (tema, velocidade, fonte, modo Spritz e
tradução) e como o tema é aplicado na interface.

## 2. Regras

### RN-01 — Preferências (`AppSettings`)

| Campo | Tipo | Padrão | Faixa/obs |
|---|---|---|---|
| `theme` | `'dark' \| 'light'` | `'dark'` | tema global |
| `spritzMode` | `boolean` | `false` | letra focal em vermelho |
| `speed` | `number` | `300` | 100–1000 ppm (`SPEED_OPTIONS`) |
| `fontSize` | `number` | `48` | UI limita a 28–80 px, passo 4 |
| `translation` | `string` | `'ARA'` | código da tradução ativa |

- Persistidas em **`localStorage['lbr_settings']`** via `useLocalStorage`.
- **Migração:** settings antigos sem `translation` caem no default `ARA`
  (`settings.translation ?? DEFAULT_TRANSLATION_CODE`).
- Alterações são aplicadas por `updateSettings(partial)` (merge parcial) — qualquer tela
  pode mudar uma preferência sem repassar as demais.
- Erros de `localStorage` (quota, JSON inválido) são capturados e logados; o app segue com
  o valor em memória.

### RN-02 — Tema claro × escuro

| | **light** | **dark** |
|---|---|---|
| Fundo (app e `body`) | branco `#ffffff` | preto `#000000` |
| Texto principal | preto | branco |
| Cards/CTA da Home | card preto, texto branco | card branco, texto preto |
| Controles do Reader | preto | branco |

- `App.tsx` define, a cada mudança de tema:
  - `document.body.style.backgroundColor`
  - `--focus-ring` e `--slider-thumb` (cor do slider = cor do texto principal)
  - `--slider-thumb-border` (contraste)
- O rodapé do HTML (`index.html`) acompanha o mesmo fundo.

### RN-03 — Onde o tema pode ser alterado

1. **Home** — botão ☀️ no canto superior direito (`onToggleTheme`), alterna `light ↔ dark`.
2. **Reader** — painel de configurações (ícone ⚙️) com o toggle "Modo Escuro/Modo Claro".

### RN-04 — Painel de configurações do Reader

- Abre/fecha pelo ícone ⚙️ na barra superior (fora do toque que alterna os controles).
- Contém três controles:
  1. **Tema** (RN-03);
  2. **Modo Spritz** — com legenda "Destaca a letra focal em vermelho";
  3. botão **Fechar**.
- O painel fecha sozinho ao navegar de volta (estado local do componente).

### RN-05 — Tamanho da fonte

- Botões `+` / `−` no painel de controles do Reader: `+4` até **80**, `−4` até **28**.
- Valor aplicado via `onSettingsChange({ fontSize })` (persistente — vale para sessões futuras).

## 3. Chaves de `localStorage` do app

| Chave | Conteúdo | Documento |
|---|---|---|
| `lbr_settings` | `AppSettings` | este documento (RN-01) |
| `lbr_last_position` | última posição de leitura | [histórico e posição](./historico-e-posicao.md) |
| `lbr_favorites` | versículos favoritados | [favoritos](./favoritos.md) |
| `lbr_history` | sessões de leitura | [histórico e posição](./historico-e-posicao.md) |

## 4. Critérios de aceite / teste manual

1. Abrir o app pela primeira vez: tema escuro, 300 ppm, fonte 48 px, Spritz desligado, ARA.
2. Mudar qualquer preferência e recarregar → o valor é mantido.
3. Trocar o tema na Home muda também o Reader e o fundo da página.
4. Fonte não passa de 80 px nem desce abaixo de 28 px.
5. Um `localStorage` corrompido não quebra o app (cai para o default e loga o erro).
