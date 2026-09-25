# Leitura Bíblica Rápida

Aplicação PWA para ler a Bíblia palavra por palavra usando a técnica **RSVP** (Rapid Serial Visual Presentation). Cada palavra é exibida centramente em sequência, permitindo uma leitura mais rápida e focada.

## Funcionalidades

- Leitura RSVP com controle de velocidade (100 a 1000 ppm)
- Modo **Spritz** (destaca a palavra focal em vermelho)
- Tema claro/escuro
- Favoritos e histórico de leitura
- Posicionamento salvo entre sessões
- Seleção de livro e capítulo (Antigo/Testamento e Novo Testamento)
- Painéis laterais de favoritos e histórico

## Tecnologias

- **React 19** + **Vite 7** + **Tailwind CSS 4**
- **Capacitor** para gerar APK (Android)
- **vite-plugin-singlefile** — bundler em único arquivo HTML para PWA
- Dados bíblicos: 18 traduções completas (66 livros) servidas de `public/data/`

## Como usar (Web/PWA)

1. Acesse a URL hospedada (GitHub Pages, Netlify, Vercel etc.) em HTTPS.
2. No Chrome/Edge, use o menu ⋮ → **"Instalar app"** / **"Adicionar à tela inicial"**.
3. O app abrirá em tela cheia, como um aplicativo nativo.

## Como gerar o APK (Android)

```bash
# 1. Instalar a toolchain (apenas primeira vez)
winget install Microsoft.OpenJDK.21           # JDK 21
# Baixe e extraia o Android SDK cmdline-tools (ver steps abaixo)

# 2. Instalar dependências
npm install

# 3. Configurar Android SDK (cmdline-tools, platform-tools, platforms;android-36, build-tools;36.0.0)
# ... (seguir instruções do Capacitor)

# 4. Gerar o APK debug
npm run apk          # ou: npx cap add android && cd android && gradlew.bat assembleDebug
```

O APK será gerado em `android/app/build/outputs/apk/debug/app-debug.apk`.

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento Vite |
| `npm run build` | Build de produção (index.html + assets inline) |
| `npm run typecheck` | Verificação estática com TSC |
| `npm run convert:data` | Converte `data-src/*.json` → `public/data/*.json` |
| `npm run sync:android` | Build + sincronização do Android |
| `npm run apk` | Gera o APK debug para Android |

## Estrutura do projeto

```
├── data-src\                  # Fonte bruta das 18 traduções (formato [{abbrev, name, chapters}])
├── docs\                      # Regras de negócio (.md) — ver docs/README.md
├── scripts\
│   └── convert-bible-data.mjs # data-src → public/data (formato {id, name, testament, chapters, verses})
├── public\
│   ├── data\                  # JSONs convertidos (gerado — não editar na mão)
│   ├── manifest.json / sw.js  # PWA
├── src\
│   ├── types\                 # bible.ts (domínio) + app.ts (estado) + index.ts (barrel)
│   ├── constants\             # settings.ts (SPEED_OPTIONS, DEFAULT_SETTINGS)
│   ├── data\                  # Domínio bíblico
│   │   ├── bibleData.ts       # helpers de consulta (Fase 2: loadTranslation)
│   │   └── sampleData.ts      # amostra embutida (fallback offline)
│   ├── components\
│   │   ├── screens\           # HomeScreen, SelectionScreen, ReaderScreen
│   │   ├── reader\            # SpeedControl, SpritzWord
│   │   └── panels\            # FavoritesPanel, HistoryPanel
│   ├── hooks\                 # useAppState, useRSVP, useLocalStorage
│   └── utils\                 # cn.ts
```

### Documentação

Regras de negócio ficam em [`docs/`](./docs/README.md) — um arquivo `.md` por regra,
com status, arquivos envolvidos e critérios de aceite.

- [Leitura RSVP](./docs/leitura-rsvp.md)
- [Seleção de passagem](./docs/selecao-de-passage.md)
- [Traduções e dados](./docs/traducoes-e-dados.md)
- [Navegação de capítulos no Reader](./docs/navegacao-de-capitulos.md)
- [Configurações e tema](./docs/configuracoes-e-tema.md)
- [Favoritos](./docs/favoritos.md)
- [Histórico e posição de leitura](./docs/historico-e-posicao.md)
- [Paleta de cores](./docs/paleta-de-cores.md)

### Fluxo de dados bíblicos

1. `data-src/*.json` — fonte bruta versionada (não é importada por código nenhum)
2. `npm run convert:data` — valida (capítulos canônicos, numeração 1-based) e gera `public/data/*.json`
3. `public/data/*.json` é servido estaticamente pelo Vite e cacheado pelo Service Worker

> ⚠️ **Não reformatar** os JSONs de `data-src/` e `public/data/` (há `.prettierignore` e
> `.editorconfig` protegendo). Reindentar um arquivo de 4,5 MB infla ~60% o tamanho do fetch
> e polui o git.

## `.gitignore`

O repositório já inclui `.gitignore` para excluir:

- `node_modules/`
- `dist/`
- arquivos de log

## Licença

Este projeto está licenciado sob a licença que você desejar (MIT, Apache 2.0, etc.). Adicione um arquivo `LICENSE` se for publicar.