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
- Bible data amostral (9 livros) — estruturado para futura API

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
| `npm run sync:android` | Build + sincronização do Android |
| `npm run apk` | Gera o APK debug para Android |

## `.gitignore`

O repositório já inclui `.gitignore` para excluir:

- `node_modules/`
- `dist/`
- `package-lock.json`
- arquivos de log

## Licença

Este projeto está licenciado sob a licença que você desejar (MIT, Apache 2.0, etc.). Adicione um arquivo `LICENSE` se for publicar.