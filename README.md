# Indie Showcase

Landing page de uma vitrine de jogos independentes, recriada em alta fidelidade
a partir do template **Indie Showcase** do Aura
(<https://indie-showcase-56.aura.build/>).

Abre com um hero cinematográfico de 420svh: cinco camadas de imagem em
perspectiva CSS que se separam, desfocam e dão lugar a um "segundo mundo"
conforme a página rola. Depois vêm seções de personagens, gêneros, mecânicas,
especificações, uma galeria horizontal presa à tela, uma linha do tempo
desenhada no scroll, FAQ e chamada final.

**Stack:** HTML + [Tailwind CSS](https://tailwindcss.com) (CDN) +
[Iconify](https://iconify.design) 2.1.0 + Google Fonts (Manrope, Space Mono) +
JavaScript puro com loops em `requestAnimationFrame`. Sem build, sem frameworks
e sem WebGL.

---

## Rodar localmente

É um site estático: basta servir a pasta.

```bash
npx serve .
# ou
python -m http.server 8000
```

Também dá para abrir o `index.html` direto no navegador. É preciso estar
online, porque Tailwind, Iconify, fontes e imagens vêm de CDNs.

**Publicar:** funciona no GitHub Pages sem configuração. Em *Settings → Pages*,
use *Deploy from a branch → `main` / root*. Netlify e Vercel também servem,
como site estático.

---

## Estrutura

| Arquivo | Papel |
|---|---|
| `index.html` | markup das 11 seções, header e footer; config do Tailwind com os utilitários 3D do template |
| `style.css` | o que o Tailwind não cobre: warp titles, o palco do hero (Aether stage), o segundo título e o pulso da timeline |
| `scripts.js` | 1. menu, deriva de câmera, galeria horizontal, botões magnéticos, tilt dos cards, FAQ · 2. warp titles · 3. parallax do hero · 4. timeline |
| `shots.json` | pontos de scroll usados para comparar a recriação com o original |

---

## Seções

| # | id | Altura | O que acontece |
|---|---|---|---|
| — | `top` | 420svh (340svh no celular) | **Aether stage**: palco sticky de 100svh com 6 camadas (fundo, meio, ilhas, rochas, frente, *world two*), bloom, atmosfera, vinheta e grão. "Beyond the veil" só aparece depois de 58% do scroll. |
| 01 | `models` | 100svh | "Choose your journey": grade ciano, anéis concêntricos, arte de personagens |
| 02 | `services` | 100svh | "Built to play": imagem com deriva de câmera, luz radial em `circle at 68% 45%`, faixa com 8 gêneros |
| 03 | — | 100svh | "Immersive worlds": duas imagens com rótulos (Visual style, Sound design…) |
| 04 | `systems` | 100svh | "Anatomy of a masterpiece": vista explodida com 4 notas |
| 05 | — | 100svh | "Specifications": render e grade de 6 especificações |
| 06 | — | 100svh | "Couch co-op": cena doméstica e agenda do dia |
| 07 | `gallery` | **500svh** (≥ 1024px) | galeria horizontal **sticky**: os cards deslizam com easing, encolhem e esmaecem longe do centro e inclinam em 3D no hover. Abaixo de 1024px vira rolagem horizontal nativa. |
| 08 | — | 100svh | "A game that evolves": timeline com linha principal (`scaleX`), pontos pulsantes e conectores SVG desenhados por `stroke-dashoffset` |
| 09 | `support` | 100svh | FAQ em `<details>`, só um aberto por vez |
| 10 | `reserve` | 100svh | CTA "Ready for the next level" |

### Como as animações funcionam

- **Hero:** o script escreve variáveis CSS no `#top` a cada frame:
  - `--mx`/`--my` vêm do ponteiro;
  - `--scroll` vai de 0 a 1 ao longo dos 420svh;
  - `--rock-*` é um balanço ocioso.

  Cada camada calcula opacidade, transform e blur a partir delas, com
  `calc()`/`clamp()`. Exemplo: o fundo some com
  `clamp(0, calc((.94 - var(--scroll)) * 2.8), 1)`.
- **Warp titles:** um `IntersectionObserver` dispara a revelação
  (`clip-path: inset(100% -8% 0 -8%)` + `blur(16px)` + `scale3d(1.075, .68, 1)` → normal, em 1,35 s).
  Depois, o título oscila levemente seguindo o ponteiro.
- **Galeria:** `translate3d(${-currentGallery}px, 0, 0)` persegue o progresso
  do scroll com fator 0,12.
- **Botões magnéticos** (`[data-magnetic]`): deslocamento de −6 a 6 px na
  direção do ponteiro.
- **Menu mobile:** alterna os ícones `solar:hamburger-menu-linear` e
  `solar:close-square-linear`, com `aria-expanded`.
- **`prefers-reduced-motion`:** o hero fica estático com 120svh, sem warp
  titles e sem galeria animada.

---

## Personalizar

| Quero… | Onde |
|---|---|
| mudar a coreografia do hero | `style.css`, bloco *Aether stage*: cada `.aether-*` define opacidade e transform em função de `--scroll`, `--mx` e `--my` |
| mudar a duração do hero | `#top { height: 420svh }` (e 340svh no bloco `max-width: 760px`) |
| suavização do hero | `scripts.js` › 3: `pointerEase` (3.8) e `scrollEase` (5.2) |
| velocidade da galeria | `scripts.js` › 1: fator `0.12`; duração em `lg:h-[500svh]` no `index.html` |
| quando um warp title dispara | `scripts.js` › 2: `threshold: 0.2`, `rootMargin: '0px 0px -8% 0px'` |
| ritmo da timeline | `scripts.js` › 4: `start = 0.9 vh`, `end = 0.2 vh` |
| trocar imagens | `src` dos `<img>` no `index.html`. As 6 primeiras, em `.aether-scene`, são as camadas do hero. |

---

## Sobre a recriação

- **Ponto de partida:** o código-fonte publicado do template (o autor
  compartilha o código, e o projeto tem 79 forks no Aura), não uma
  reinterpretação visual.
- **Limpeza:** o código salvo pelo editor do Aura trazia sobras de execução,
  que foram removidas:
  - o estado final do hero gravado inline (`--scroll: 1`);
  - camadas duplicadas nos títulos;
  - classes que deixavam títulos invisíveis sem JavaScript;
  - o controlador de preview e o selo "Made in Aura".
- **Organização:** CSS e JS foram separados do HTML; o script do hero, que
  vinha minificado, foi reescrito de forma legível, com a mesma lógica.
- **Verificação:** a recriação foi comparada com o original nos mesmos pontos
  de scroll (`shots.json`), em 1440×900 e 390×844. As posições coincidem ao
  pixel e o resultado visual é o mesmo seção por seção.
- **Única mudança de comportamento:** o loader do original esperava
  decodificar também a imagem do *world two* (um PNG de 7,6 MB que só aparece
  depois de 44% do scroll), o que deixava a tela azul por vários segundos.
  Aqui ele espera só as camadas visíveis no primeiro quadro, com limite de 8 s.

---

## Limitações conhecidas

- **Peso das imagens:** as 12 imagens hospedadas no Midjourney chegam como PNG
  original (2688 px, ~7,7 MB cada, ~90 MB no total), porque o CDN ignora o
  `?w=800&q=80`. Numa primeira visita com scroll rápido, o *world two* e os
  cards da galeria aparecem vazios até terminar de baixar. O template original
  tem o mesmo problema. Para produção, o ideal é baixar e converter para WebP
  de ~1600 px (~200 kB cada).
- **Testes automatizados:** o CDN do Midjourney recusa navegadores headless
  (`ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`). Capturas e testes precisam de um
  Chrome visível.
- **Tailwind via CDN:** o Tailwind avisa no console que o CDN não é para
  produção. Para publicar de forma definitiva, gere o CSS com o
  [Tailwind CLI](https://tailwindcss.com/docs/installation).
- **Textos alternativos:** os `alt` mencionam "Persona humanoid", uma herança do
  template, que mistura termos de robótica com arte de jogos. Foram mantidos
  para fidelidade.

---

## Créditos

- Design e código original: template **Indie Showcase**, publicado no
  [Aura](https://aura.build) com código compartilhado.
- Imagens: hospedadas no Supabase do Aura e no CDN do Midjourney, conforme o
  template. Os direitos pertencem aos respectivos autores.
- Recriação, organização e verificação: este repositório.
