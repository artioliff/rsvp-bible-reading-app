# Documentação do projeto

Regras de negócio e decisões de design do **Leitura Bíblica Rápida**.

## Índice

| Documento | Descrição |
|---|---|
| [Leitura RSVP](./leitura-rsvp.md) | Motor de leitura palavra por palavra: velocidades, play/pause, progresso, conclusão, Spritz, fonte e auto-ocultação dos controles |
| [Seleção de passagem](./selecao-de-passage.md) | Cascata tradução → livro → capítulo → versículos, correções automáticas, prévia e validação do "Começar" |
| [Traduções e dados](./traducoes-e-dados.md) | As 18 traduções, cache por promessa, fallback offline, guarda de corrida, pipeline de conversão e Service Worker |
| [Navegação de capítulos](./navegacao-de-capitulos.md) | Regras dos botões "Ant."/"Próx." no Reader: capítulo inteiro, virada de livro, fronteiras da Bíblia, reset de estado e tela de conclusão |
| [Configurações e tema](./configuracoes-e-tema.md) | `AppSettings` (tema, velocidade, fonte, Spritz, tradução), persistência em `localStorage` e aplicação do tema claro/escuro |
| [Favoritos](./favoritos.md) | Id do favorito, toggle no versículo atual, persistência, painel lateral e contador na Home |
| [Histórico e posição](./historico-e-posicao.md) | Sessões de leitura (upsert, máx. 50), painel com progresso e retomada da posição salva |
| [Paleta de cores](./paleta-de-cores.md) | Regra de código: todo valor de cor em `src/index.css`, tokens por tema via `data-theme`, classes semânticas e gate de verificação |

## Como escrever aqui

- Um arquivo `.md` por regra de negócio/decisão, em português.
- Nome em kebab-case: `verbo-dos-dados.md`.
- Cabeçalho com **status**, **arquivos envolvidos** e **data da última atualização**.
- Seções sugeridas: Objetivo → Regras (RN-xx) → Fluxo → Critérios de aceite.
- Ao implementar mudanças, atualize o documento correspondente no mesmo PR.
