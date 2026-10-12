# Indie Showcase — recriação

Recriação em alta fidelidade da landing **Indie Showcase**, conforme o briefing
[`../indie-showcase.md`](../indie-showcase.md). Referência:
<https://indie-showcase-56.aura.build/> (a página roda dentro de um iframe).

Stack do briefing: **Tailwind CSS (CDN)**, **Iconify 2.1.0**, **Manrope + Space Mono**
e JavaScript puro com loops em `requestAnimationFrame`. Não há Three.js, GSAP nem
Lenis: o "3D" do hero são cinco camadas de imagem em perspectiva CSS.

> **Como abrir:** pode abrir o `index.html` direto, mas um servidor local
> (`npx serve` ou Live Server) reproduz melhor o ambiente real. Precisa de
> internet para os CDNs e as imagens.

---

## Arquivos

| Arquivo | Papel |
|---|---|
| [index.html](index.html) | markup das 11 seções + header/footer, config do Tailwind (utilitários 3D do original) |
| [style.css](style.css) | o que o Tailwind não cobre: warp titles, o palco Aether (hero), o segundo título, o pulso da timeline |
| [scripts.js](scripts.js) | 1. menu, câmera, galeria horizontal, botões magnéticos, tilt dos cards, FAQ · 2. warp titles · 3. parallax do hero · 4. timeline |
| [shots.json](shots.json) | pontos de captura para comparar com o original |

---

## Processo (skill `scrollytelling-3d`)

1. **Fonte, não aproximação.** O site do Aura roda num iframe sem `src`. O
   conteúdo vem de uma requisição a
   `supabase.co/rest/v1/shared_code?slug=ilike.indie-showcase-56`, com o código
   autoral completo. O projeto tem `share_source_code: true` e 79 forks. A
   recriação parte desse fonte, não de uma reinterpretação.
2. **Limpeza de artefatos de serialização do editor do Aura:**
   - os títulos vinham com dois `span.warp-title-content` pré-aninhados (o
     script cria mais um em tempo de execução);
   - o `#top` vinha com `--scroll: 1` gravado inline, o que abriria a página
     já no "segundo mundo";
   - alguns títulos vinham com `warp-title-pending` fixo, ou seja, invisíveis
     sem JS;
   - também removi o controlador de preview e o selo "Made in Aura".
3. **Organização.** CSS e JS saíram do HTML para arquivos próprios e legíveis.
   O script do hero era minificado e foi reescrito com a mesma lógica.
4. **Verificação lado a lado**, com o original e a recriação capturados nos
   mesmos pontos de scroll:
   - desktop 1440×900: 15 pontos;
   - celular 390×844: 8 pontos.

   As posições de scroll coincidem ao pixel (mesma altura de layout) e o
   resultado visual é o mesmo seção por seção. Ver "Verificação".

---

## Seções

| # | id | Altura | O que acontece |
|---|---|---|---|
| — | `top` | 420svh (340svh ≤ 760px) | **Aether stage**: palco sticky de 100svh com 6 camadas (fundo, meio, ilhas, rochas, frente, *world two*), bloom, atmosfera, vinheta e grão. Variáveis `--mx`/`--my` (ponteiro), `--scroll` (0..1) e `--rock-*` (balanço) escritas no `#top` a cada frame. "Beyond the veil" só aparece depois de 58% (`opacity: clamp(0, (scroll − .58) × 4, 1)`). |
| 01 | `models` | 100svh | "Choose your journey": grade ciano, anéis concêntricos, arte de personagens |
| 02 | `services` | 100svh | "Built to play": imagem com deriva de câmera no scroll, gradiente `circle at 68% 45%`, faixa com os 8 gêneros |
| 03 | — | 100svh | "Immersive worlds": duas imagens com rótulos (Visual style, Sound design…) |
| 04 | `systems` | 100svh | "Anatomy of a masterpiece": vista explodida com 4 notas (Game Loop, Art Direction…) |
| 05 | — | 100svh | "Specifications": render + grade de 6 especificações |
| 06 | — | 100svh | "Couch co-op": cena doméstica, agenda 07:00–22:00 |
| 07 | `gallery` | **500svh** (≥ 1024px) | galeria horizontal **sticky**: `translate3d(${-currentGallery}px,0,0)` com easing 0,12; cards encolhem e esmaecem longe do centro; tilt 3D no hover; barra de progresso. Abaixo de 1024px vira rolagem horizontal nativa (como no original). |
| 08 | — | 100svh | "A game that evolves": timeline com linha principal (`scaleX`), pontos pulsantes e conectores SVG `viewBox="0 0 1 40"` desenhados por `stroke-dashoffset` (40 → 0) |
| 09 | `support` | 100svh | FAQ em `<details>`, só um aberto por vez |
| 10 | `reserve` | 100svh | CTA "Ready for the next level" |

Comportamentos globais:
- **Warp Title:** `IntersectionObserver` (limiar 0,2) dispara `clip-path: inset(100% -8% 0 -8%)` + `blur(16px)` + `scale3d(1.075, .68, 1)` → normal em 1,35 s. Depois, uma oscilação leve que segue o ponteiro.
- **Botões magnéticos** (`[data-magnetic]`): deslocamento de −6 a 6 px conforme a distância do ponteiro ao centro.
- **Menu mobile:** alterna entre `solar:hamburger-menu-linear` e `solar:close-square-linear`.
- **`prefers-reduced-motion`:** hero com 120svh e camadas estáticas, sem warp titles e sem galeria animada.

---

## Assets

Todas as URLs do ASSET MAP foram usadas como estão: as camadas do hero e as
imagens das seções 03–06 vêm do Supabase, e o *world two*, as seções 01/02/10 e
os 8 cards da galeria vêm do Midjourney.

**Peso das imagens do Midjourney:** o CDN ignora o `?w=800&q=80` e entrega o
PNG original, de 2688 px e cerca de 7,7 MB. São 12 imagens, cerca de 90 MB. A
página de referência tem o mesmo problema: nas capturas dela, vários cards
aparecem pretos ou carregados pela metade. A camada de fundo do hero (WebP de
3840 px) pesa 6,3 MB.

**Única mudança de comportamento:** no original, o loader esperava decodificar
*todas* as imagens do hero, inclusive o PNG de 7,6 MB do *world two*. Isso
deixava uma tela azul lisa por vários segundos. Aqui o loader espera só as
cinco camadas do "first light" (com limite de 8 s). O *world two* só fica
visível depois de 44% do scroll, então decodifica em segundo plano.

---

## Verificação

```bash
# capturas (Chrome visível: o CDN do Midjourney bloqueia o headless)
python ~/.claude/skills/scrollytelling-3d/scripts/shots.py . out/ shots.json --headed --ready "document.readyState === 'complete'" --sheet folha.png --cols 3
# lado a lado com a referência
python ~/.claude/skills/scrollytelling-3d/scripts/compare_ref.py https://indie-showcase-56.aura.build/ . out/cmp shots.json --iframe
# varredura de página
python ~/.claude/skills/scrollytelling-3d/scripts/gsap_check.py index.html --width 1440
```

**Resultados:**
- **Comparação:** idêntica em layout e posições de scroll, em 1440×900 e 390×844.
- **`gsap_check.py`:** 0 alvos ausentes e sem overflow. Os "erros" listados
  são as 12 imagens do Midjourney que o CDN recusa ao Chromium headless
  (`ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`). No Chrome real elas carregam
  (200, 2688 px).
- **Medido no Chrome real:**
  - no fim do hero, `--scroll` = 1 e "Beyond the veil" com opacidade 1;
  - a timeline desenha linha, pontos e textos até 100%;
  - o menu alterna os dois ícones e `aria-expanded`.

---

## Onde mexer

| Quero… | Onde |
|---|---|
| mudar a coreografia do hero | `style.css` › Aether stage: cada `.aether-*` tem opacidade e transform como `calc()` de `--scroll`, `--mx`, `--my` |
| mudar a altura do hero | `#top { height: 420svh }` (e 340svh no bloco `max-width: 760px`) |
| ajustar a suavização do hero | `scripts.js` › 3: `pointerEase` (3.8) e `scrollEase` (5.2) |
| velocidade/suavidade da galeria | `scripts.js` › 1: `currentGallery += (target − current) * 0.12`; altura em `lg:h-[500svh]` |
| quando um warp title dispara | `scripts.js` › 2: `threshold: 0.2`, `rootMargin: '0px 0px -8% 0px'` |
| ritmo da timeline | `scripts.js` › 4: `start = 0.9 vh`, `end = 0.2 vh`, fatias por item |
| trocar imagens | `src` dos `<img>` no `index.html` (o hero usa as 6 primeiras, dentro de `.aether-scene`) |

---

## Limitações

- **Peso das imagens do Midjourney (~90 MB):** é o maior problema herdado do
  original. Para produção, valeria baixar e converter para WebP de 1600 px
  (~200 kB cada), mudando só os `src`. Não fiz isso porque o briefing pede as
  URLs fornecidas.
- **Tailwind via CDN:** o próprio Tailwind avisa no console que não é para
  produção. Para publicar, gerar o CSS com o Tailwind CLI.
- **Textos alternativos:** os `alt` falam de "Persona humanoid", uma herança do
  template original que mistura termos de robótica com arte de jogos. O
  briefing pede para preservar essa peculiaridade.
# indie
