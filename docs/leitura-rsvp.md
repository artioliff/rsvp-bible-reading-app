# Regra de negócio — Leitura RSVP (motor e controles)

> **Status:** implementada
> **Arquivos:** `src/components/screens/ReaderScreen.tsx`, `src/hooks/useRSVP.ts`,
> `src/components/reader/SpritzWord.tsx`, `src/components/reader/SpeedControl.tsx`
> **Última atualização:** 25/09/2026

## 1. Objetivo

Definir como o texto bíblico é convertido em palavras, exibido palavra por palavra
(RSVP — *Rapid Serial Visual Presentation*) e controlado pelo leitor.

## 2. Regras

### RN-01 — Origem das palavras

- `getVerses(books, livro, capítulo, startVerse, endVerse)` → versículos da seleção.
- `getAllWords(verses)` separa cada texto por espaços (`split(/\s+/)`, remove vazios) e
  gera `{ word, verseRef }`, preservando a referência do versículo de origem.
- Sem versículos na seleção → lista vazia → exibição **"Nenhuma palavra"**.

### RN-02 — Velocidades

- Opções fixas (`SPEED_OPTIONS`): **100, 200, 300, 400, 500, 600, 800, 1000 ppm**.
- Padrão: **300 ppm**.
- Intervalo entre palavras: `Math.floor(60000 / speed)` ms (300 ppm → 200 ms).
- Slider de velocidade mapeia o **índice** na lista de opções; se a velocidade salva não
  existir na lista, o slider assume o índice `2` (300 ppm).
- Mudança de velocidade durante a reprodução **reinicia o timer** mantendo a posição.

### RN-03 — Reprodução

| Ação | Comportamento |
|---|---|
| Play | Inicia o timer; se o índice estiver na última palavra, reinicia em `0` antes de tocar |
| Pause | Para o timer, mantém a palavra atual |
| Restart | Volta ao índice `0`, pausa, fecha a tela de conclusão |
| Seek (slider) | Vai direto ao índice escolhido (sem tocar) |
| Play com tela "Leitura Concluída" | Reinicia em `0` e inicia a reprodução |

- A reprodução **não avança automaticamente** de capítulo (ver
  [navegação de capítulos](./navegacao-de-capitulos.md)).

### RN-04 — Progresso e tempo estimado

- `progress = currentIndex / (words.length - 1) * 100` (0–100; `0` se não houver palavras).
- Tempo restante: `ceil((palavrasRestantes / speed) * 60)` segundos.
- Enquanto toca, exibe `~Xm Ys`; quando pausado, exibe `índice/total` (ex.: `120/842`).
- `formatTime`: `< 60 s` → `12s`; minutos com segundos → `3m 24s`; minuto cheio → `3m`.

### RN-05 — Conclusão da leitura

- Ao ultrapassar a última palavra: para o timer, `isPlaying = false` e mostra a tela
  **"Leitura Concluída 🎉"** com o intervalo `livro capítulo:start–end`.
- Ações disponíveis: **"Ler Novamente"** e **"Próximo capítulo"**
  (esta última apenas se houver capítulo destino — ver [navegação](./navegacao-de-capitulos.md)).

### RN-06 — Exibição: Spritz × palavra simples

- `spritzMode: true` → componente `SpritzWord` com marca focal em vermelho e guia horizontal.
- `spritzMode: false` → palavra em texto simples, centralizada.
- Tamanho da fonte: `settings.fontSize || 52`, limitado pela UI a **28–80 px**
  (padrão das configurações: **48 px**, passo de `±4`).
- Animação de troca: opacidade cai por 30 ms a cada mudança de palavra.

### RN-07 — Controles e auto-ocultação

- Com a leitura **tocando**, os controles somem após **3 segundos**.
- Com a leitura **pausada**, os controles ficam sempre visíveis.
- Toque em qualquer ponto da tela alterna a visibilidade dos controles — **exceto** quando
  há painel (favoritos/histórico/configurações) ou cartão de versículo aberto.
- Painéis e cartões param a propagação do clique (não fecham/trocam os controles).

### RN-08 — Controles disponíveis no painel inferior

1. Velocidade (RN-02)
2. **Ant.** / reiniciar / play-pause / **Próx.** (navegação de capítulo — ver doc próprio)
3. Tamanho da fonte (`+`/`−`)
4. Slider de busca por palavra

## 3. Fluxo de um tick

```
timer (60000/speed ms)
  → currentIndex + 1
      ├─ ≥ words.length → clearTimer, isPlaying=false, onComplete()  → RN-05
      └─ senão → onWordChange(next) e nova palavra exibida
```

## 4. Critérios de aceite / teste manual

1. Em 300 ppm a palavra avança a cada ~200 ms; mudar para 600 ppm dobra a cadência.
2. Pausar mantém a palavra atual; retomar continua dali.
3. O slider de busca move a leitura sem iniciar a reprodução.
4. Chegando ao fim, aparece "Leitura Concluída 🎉" e o playback para.
5. Modo Spritz mostra a letra focal em vermelho; desligado, mostra palavra simples.
6. Fonte respeita 28–80 px (padrão 48).
7. Com a leitura tocando, os controles somem após 3 s; um toque os traz de volta.
8. Toque na tela com painel aberto **não** alterna os controles.
