# 🎬 Mega Prompts para Geração de Vídeos do Hélio com IA

## 📋 Visão Geral

Este documento contém **prompts ultra-detalhados** para gerar os 3 vídeos do Hélio usando ferramentas de IA como:

- **OpenAI Sora**: Estado da arte em geração de vídeo realista (acesso via API)
- **Google Gemini Video**: Excelente para animações e personagens (Gemini 2.0)
- **Runway Gen-3**: Melhor para movimentos complexos
- **Pika Labs**: Ótimo para animações de personagens
- **Midjourney + Runway**: Combinação poderosa (frame + animação)
- **Stable Video Diffusion**: Open source alternativo
- **Leonardo.ai Motion**: Para animações simples

---

## 🎨 Design Base do Hélio

### Prompt para Gerar o Personagem (Midjourney/DALL-E 3/Leonardo)

```
A friendly 3D cartoon sun mascot named Helio for a solar energy company. 
Characteristics:
- Round sun shape with 12 evenly-spaced sun rays extending outward
- Bright gradient colors: golden yellow (#facc15) core transitioning through vibrant orange (#f97316) to pink (#ec4899) at the edges
- Large, expressive round eyes with white highlights showing emotion
- Wide, warm smile that reaches the eyes
- Simple stick-like arms and legs with rounded ends
- Soft, smooth 3D rendering with subtle glow/bloom effect
- Professional yet approachable personality
- Clean, modern design suitable for tech/energy brand
- White or transparent background
- Front-facing view, centered composition
- Style: Similar to modern tech mascots (Duolingo owl, Mailchimp Freddie) but sun-themed
- Lighting: Soft ambient with slight rim light to emphasize 3D form
- Resolution: 1080x1080px, high quality render
--ar 1:1 --style raw --quality 2 --v 6
```

### Variações de Expressão (para diferentes moods)

**Happy/Welcome Expression:**

```
[Same base prompt above], expression: wide welcoming smile with eyes slightly squinted in joy, 
one arm raised in friendly wave gesture, body leaning slightly forward in welcoming pose, 
warm and inviting energy
```

**Thinking/Focused Expression:**

```
[Same base prompt], expression: slightly squinted eyes showing concentration, 
small subtle smile, neutral upright pose, one hand near chin in thoughtful gesture,
calm and professional demeanor, subtle glow pulsing effect
```

**Celebration/Excited Expression:**

```
[Same base prompt], expression: extremely wide smile showing excitement, 
eyes wide open with sparkle highlights, both arms raised high in victory pose,
body in jumping position mid-air, dynamic and energetic, 
confetti and star particles around, triumphant energy
```

---

## 🎬 Vídeo 1: WELCOME (Boas-vindas)

### Especificações Técnicas

- **Duração**: 4-5 segundos (loop seamless)
- **Resolução**: 1080x1080px (1:1)
- **FPS**: 30fps
- **Formato**: MP4 (H.264)
- **Tamanho**: ~2-3MB
- **Loop**: SIM (deve voltar suavemente ao início)

### Mega Prompt para Runway/Pika

```
Generate a 3D animated video of Helio, a friendly sun mascot character for a solar energy company.

CHARACTER DESIGN:
- Round golden sun with 12 sun rays (gradient: yellow #facc15 → orange #f97316 → pink #ec4899)
- Large expressive eyes, warm smile, simple stick arms and legs
- Soft 3D render with subtle glow effect
- Clean, modern, professional style

ANIMATION SEQUENCE (4 seconds, loop):

[0.0s - 0.5s] WAKE UP
- Helio starts in dormant state (eyes closed, dim glow, rays slightly drooped)
- Gentle fade-in from 0% to 100% opacity
- Soft ambient background (light gradient: white to pale yellow)

[0.5s - 1.5s] EYES OPEN
- Eyes slowly open with subtle squash-and-stretch animation
- Pupils dilate slightly as if adjusting to light
- Glow intensity increases from 30% to 70%
- Sun rays gently straighten and extend outward (10% increase in length)
- Subtle "ding" energy pulse ripple from center

[1.5s - 2.5s] SMILE FORMATION
- Smile gradually forms, expanding from neutral to wide welcoming grin
- Eyes squint slightly in genuine happiness (upper eyelids lower 20%)
- Soft bounce in body (scale: 100% → 105% → 100%)
- Glow reaches 100% intensity with soft pulsing
- Warm particles (tiny yellow/orange sparkles) appear around rays

[2.5s - 3.5s] WAVE GESTURE
- Right arm smoothly raises from side to 45-degree angle
- Hand rotates in friendly wave motion (3 gentle back-and-forth waves)
- Body leans forward slightly (5-degree tilt) in welcoming manner
- Left arm remains at side with slight sway
- Sun rays pulse gently in sync with wave motion
- Background adds subtle radial gradient animation (breathing effect)

[3.5s - 4.0s] HOLD & TRANSITION
- Helio settles into welcoming pose (arm still partially raised)
- Maintains warm smile and friendly expression
- Gentle idle breathing motion (subtle scale: 100% → 102% → 100%)
- Prepare for seamless loop back to frame 0

LOOP TRANSITION:
- Arm smoothly returns to neutral position
- Expression remains warm but transitions to dormant state
- Fade slightly (90% opacity) to create smooth loop point
- Rays retract 10% to match starting position

TECHNICAL DETAILS:
- Camera: Static, front-facing, centered
- Lighting: Soft key light from top-left, gentle rim light from back-right
- Background: Clean gradient (white → pale yellow #fffef0)
- Motion blur: Subtle, realistic
- Easing: Smooth ease-in-out on all movements
- Color grading: Warm, inviting, slightly saturated
- Glow effect: Soft bloom shader, 20-pixel radius, 60% opacity
- Particles: 30-40 small sparkles, slow float upward, fade at edges

MOOD & ENERGY:
- Welcoming, friendly, approachable
- Professional yet playful
- Warm and inviting like sunrise
- Trustworthy and dependable energy
- Perfect for first impression / onboarding experience

STYLE REFERENCE:
- Similar to Duolingo mascot animations but sun-themed
- Clean, modern 3D like Pixar/Disney junior content
- Not too childish, suitable for B2B solar energy platform
- Smooth, fluid motion like Apple/Google product animations

OUTPUT REQUIREMENTS:
- 1080x1080px @ 30fps
- Perfect loop (last frame blends to first frame)
- No audio needed (visual only)
- MP4 format, H.264 codec, high quality
- File size target: 2-3MB
```

### Prompt Simplificado (para IAs mais limitadas)

```
Animated sun mascot character waking up and waving hello.
- Golden sun with rays (yellow → orange → pink gradient), friendly face, stick arms
- 4 seconds loop: dormant → eyes open → smile → wave → reset
- Warm gradient background, soft glow effect
- Smooth 3D animation, welcoming energy
- 1080x1080px, seamless loop
Style: Modern tech mascot, professional but friendly
```

---

## 🤔 Vídeo 2: COMPACT (Thinking/Working)

### Especificações Técnicas

- **Duração**: 2-3 segundos (loop infinito)
- **Resolução**: 1080x1080px (1:1)
- **FPS**: 30fps
- **Formato**: MP4 (H.264)
- **Tamanho**: ~1-2MB (otimizado)
- **Loop**: SIM (loop infinito suave)

### Mega Prompt para Runway/Pika

```
Generate a subtle looping 3D animation of Helio, a sun mascot, in "thinking" mode for header badge display.

CHARACTER DESIGN:
- Same Helio character (golden sun, yellow → orange → pink gradient, friendly face)
- More compact, simplified version suitable for small header display
- Slightly less detailed rays (8-10 instead of 12)
- Neutral, focused expression

ANIMATION SEQUENCE (2.5 seconds, infinite loop):

[0.0s - 0.5s] IDLE BREATHING
- Helio in neutral centered pose
- Subtle breathing motion (scale pulse: 100% → 102% → 100%)
- Eyes open, focused but calm
- Gentle consistent glow (70% intensity)
- Background: minimal, clean white or transparent

[0.5s - 1.0s] BLINK
- Quick natural eye blink (0.15s duration)
- Eyelids close and open smoothly
- Head remains static
- Glow maintains steady intensity

[1.0s - 1.8s] GLOW PULSE
- Outer glow expands and contracts (radius: 20px → 30px → 20px)
- Glow opacity pulses (50% → 70% → 50%)
- Sun rays subtly pulse in length (100% → 105% → 100%)
- No body movement, only energy/glow effects
- Suggesting "processing" or "thinking" activity

[1.8s - 2.5s] SLIGHT HEAD TILT
- Very subtle head tilt (2-3 degrees to the right, then back to center)
- Slight eye movement (pupils shift slightly left then center)
- Maintains thinking/focused expression
- Breathing continues throughout

LOOP TRANSITION:
- Animation seamlessly loops back to 0.0s
- No jarring transitions
- All motions return to neutral starting position

TECHNICAL DETAILS:
- Camera: Static, centered, close-up framing
- Character size: Fills 70% of frame (optimized for small display)
- Lighting: Soft, even, minimal shadows
- Background: White (#FFFFFF) or transparent PNG
- Motion: Extremely subtle, should not distract user
- Easing: Smooth cubic ease-in-out
- Glow: Soft radial gradient, subtle pulsing
- Color grading: Clean, bright, professional

MINIMALIST APPROACH:
- Less movement than welcome video
- More subdued and professional
- Should work well at 120x120px display size
- Suggests "working" without being distracting
- Calm, reliable, steady presence

MOOD & ENERGY:
- Focused, professional, working
- Calm and reliable
- Subtle indication of activity/processing
- Not demanding attention, just present
- Trustworthy companion energy

STYLE:
- Ultra-clean, minimal motion design
- Think: macOS loading spinners or Google Material loading states
- Professional SaaS product aesthetic
- Sophisticated, not childish

OPTIMIZATION:
- Small file size critical (target: 1-2MB)
- Works well when scaled down to 100-150px
- Readable/recognizable even at small sizes
- Smooth playback on all devices

OUTPUT REQUIREMENTS:
- 1080x1080px @ 30fps
- Perfect seamless infinite loop
- Optional: Transparent background (Alpha channel)
- MP4 or WebM format
- Optimized for web delivery
```

### Prompt Simplificado

```
Minimal looping animation of sun mascot in idle thinking state.
- Yellow to orange to pink gradient sun
- Subtle breathing pulse (2% scale variation)
- Occasional eye blink
- Soft glow pulsing effect (thinking indicator)
- Very minimal movement, professional
- 2.5 seconds, perfect loop
- 1080x1080px, optimized for small display
Style: Clean, minimal, like modern UI loading states
```

---

## 🎉 Vídeo 3: CELEBRATION (Comemoração)

### Especificações Técnicas

- **Duração**: 5-6 segundos (NÃO loop, one-shot)
- **Resolução**: 1080x1080px (1:1)
- **FPS**: 30fps
- **Formato**: MP4 (H.264)
- **Tamanho**: ~3-5MB
- **Loop**: NÃO (animação única que termina)

### Mega Prompt para Runway/Pika

```
Generate an energetic one-shot celebration animation of Helio, a sun mascot, celebrating success.

CHARACTER DESIGN:
- Helio: golden sun mascot (yellow #facc15 → orange #f97316 → pink #ec4899 gradient)
- Large expressive eyes, wide excited smile, stick arms and legs
- Maximum energy and enthusiasm in expression
- Dynamic pose with motion blur on fast movements

ANIMATION SEQUENCE (5.5 seconds, ONE-SHOT):

[0.0s - 0.3s] ANTICIPATION
- Helio starts centered, normal size
- Quick inhale/preparation pose (body compresses down 15%, squash effect)
- Eyes widen in anticipation
- Arms pull down to sides, tensing
- Glow intensifies rapidly (50% → 90%)
- Background brightens slightly

[0.3s - 1.0s] EXPLOSIVE JUMP
- Helio LAUNCHES upward in powerful jump motion
- Body stretches vertically (120% height, squeeze effect)
- Both arms thrust upward in victory V-shape
- Eyes maximally wide with joy, huge smile
- Sun rays extend 20% longer with motion blur
- Flash effect at launch point (white burst, 0.1s duration)
- Motion trails follow movement (orange/yellow streaks)

[1.0s - 1.5s] MID-AIR PEAK
- Helio reaches apex of jump (body at 150% starting height)
- Brief hang-time moment (0.2s hold at top)
- Arms fully extended overhead in triumph
- Body rotates slightly (360° spin on Y-axis)
- Maximum glow intensity (100%)
- Speed lines emanating outward

[1.5s - 2.5s] CONFETTI EXPLOSION
- Confetti bursts from around Helio (100+ particles)
- Colors: yellow, orange, green, blue, white
- Confetti shapes: squares, circles, triangles, stars
- Particles explode outward then fall with gravity
- Some particles spin/rotate as they fall
- Golden sparkle stars (20-30) radiate from center
- Rainbow subtle glow ring expands outward (3 concentric rings)

[2.5s - 3.5s] DESCENT & LANDING
- Helio begins falling back down (smooth arc trajectory)
- Body rotates back to front-facing
- Arms transition from overhead to sides in flourish motion
- Anticipation pose before landing (body compresses slightly)
- Motion blur on descent
- Confetti continues falling in background

[3.5s - 4.2s] IMPACT & BOUNCE
- Helio lands with bouncy impact (squash & stretch)
- Body compresses on impact (90% scale), then bounces
- 2-3 decreasing bounces (elastic spring physics)
- Arms settle into victorious pose (hands on hips or peace signs)
- Glow pulses with each bounce
- Dust/energy puff on first impact

[4.2s - 5.5s] VICTORY POSE & FADE
- Helio settles into final triumphant pose
- Wide proud smile, confident expression
- Subtle idle breathing (chest puff)
- Confetti finishes falling (some pieces still floating)
- Last few sparkles twinkle and fade
- Background returns to normal brightness
- Final glow pulse (hero moment)
- Fade to 85% opacity over last 0.3s (ending transition)

PARTICLE EFFECTS:

CONFETTI:
- Count: 100-150 pieces
- Colors: Yellow (25%), Orange (20%), Pink (20%), Green (12%), Blue (12%), White (11%)
- Shapes: Mix of squares, circles, triangles, ribbons
- Physics: Initial velocity outward + gravity pull down
- Rotation: Random tumbling as they fall
- Size: 8-20px varied
- Spawn timing: Burst between 1.5s-2.0s

SPARKLES/STARS:
- Count: 25-35 stars
- Color: Golden yellow with white core
- Spawn: Radiate from Helio's center
- Behavior: Quick expansion then fade
- Twinkle effect: Opacity flicker
- Timing: 1.5s-3.0s

GLOW RINGS:
- 3 concentric circular rings
- Expand from center outward (0.5s duration each)
- Colors: Yellow → Orange → White gradient
- Opacity: Start 80%, fade to 0% as expanding
- Timing: Staggered (0.1s delay between each)

MOTION BLUR:
- Applied to Helio during jump and fall
- Direction follows motion path
- Intensity: Higher at peak velocity, lower at stops
- Length: 30-50px at fastest points

TECHNICAL DETAILS:
- Camera: Static front-facing throughout
- Background: Clean white or soft radial gradient (white center → pale yellow edges)
- Lighting: Dynamic - brightens during jump, normalizes after
- Color grading: Vibrant, saturated, energetic
- Motion physics: Realistic gravity + cartoon exaggeration
- Timing: Snappy and punchy, fast acceleration
- Sound design suggestion: Whoosh, pop, tinkle sounds (not included in video)

MOOD & ENERGY:
- MAXIMUM ENTHUSIASM AND JOY
- Celebratory, triumphant, victorious
- Reward moment, achievement unlocked feeling
- Infectious positive energy
- Makes viewer want to celebrate too
- Satisfying, complete animation arc

STYLE REFERENCES:
- Duolingo achievement animations
- Mobile game victory screens (Candy Crush, Angry Birds)
- Confetti cannons at sports events
- Mario jumping animation but sun-themed
- Pixar character celebration moments

EMOTIONAL IMPACT:
- Viewer should feel proud and accomplished
- Validates user's effort/progress
- Creates positive association with results
- Memorable moment that reinforces success
- Peak emotional beat in user journey

OUTPUT REQUIREMENTS:
- 1080x1080px @ 30fps
- 5-6 seconds total duration
- NO LOOP - one-shot animation that ends
- Ends with fade or hold on victory pose
- MP4 format, H.264 codec
- File size: 3-5MB acceptable (rich effects justify size)
- Can have final frame hold for UI to take over
```

### Prompt Simplificado

```
Energetic celebration animation: sun mascot jumps high with joy.
- Yellow-orange-pink gradient sun character
- Anticipation crouch → explosive jump → confetti burst → bounce landing → victory pose
- 5.5 seconds, one-shot (no loop)
- 100+ confetti particles (yellow/orange/pink/green/blue)
- Golden sparkles, glow rings expanding
- Squash & stretch animation, motion blur
- Maximum excitement and triumph
- 1080x1080px, dynamic movement
Style: Pixar celebration + mobile game victory screen
Mood: Achievement unlocked, pure joy
```

---

## 🎯 Configurações Recomendadas por Ferramenta

### OpenAI Sora (Recomendado)

```
API Settings:
- Model: sora-turbo (rápido) ou sora-1.0 (máxima qualidade)
- Resolution: 1080x1080 (square format)
- Duration: Custom (4s, 2.5s, 5.5s)
- Frame rate: 30fps
- Loop: Enabled (para welcome e compact)

Prompt Tips:
- Descreva movimento frame-by-frame com timestamps
- Enfatize "seamless loop" para vídeos cíclicos
- Use "3D cartoon style" para estilo consistente
- Mencione "yellow-orange-pink gradient" explicitamente
- Especifique "1:1 aspect ratio, centered composition"

Custo Estimado:
- ~$0.10-0.20 por vídeo de 5 segundos
- Qualidade superior, menos iterações necessárias
```

### Google Gemini 2.0 Video (Recomendado)

```
Gemini API Settings:
- Model: gemini-2.0-flash-exp (vídeo)
- Output format: MP4
- Resolution: 1080x1080
- Max duration: Use for videos up to 10s

Prompt Structure:
- Início: Descrição completa do personagem
- Meio: Sequência de ações com timing
- Fim: Especificações técnicas (loop, resolução, estilo)

Vantagens:
- Excelente compreensão de contexto longo
- Ótimo para personagens cartoon/mascote
- Consistência de estilo entre gerações
- Integração com Gemini para refinamento iterativo

Custo:
- Grátis durante preview (até limite de quota)
- Produção: ~$0.05-0.15 por vídeo
```

### Runway Gen-3 Alpha

```
Text-to-Video Settings:
- Duration: Custom (4s, 2.5s, 5.5s respectively)
- Motion: 7-8/10 (dynamic but controlled)
- Camera Motion: None (static)
- Aspect Ratio: 1:1
- Resolution: 1080p
- Upscale: Yes
- Extend: Use for seamless loops

Tips:
- Generate initial frame with "First Frame" option using Midjourney image
- Use "Motion Brush" to control specific movements
- Generate multiple takes, select best
- Use "Extend" feature to create longer perfect loops
```

### Pika Labs

```
Settings:
- Motion: 2-3 (subtle for compact, 3-4 for others)
- Camera: Off
- FPS: 24 (upscale to 30 in post)
- Negative prompt: "distorted, blurry, text, watermark, duplicate limbs"

Commands:
-motion 2 (for compact)
-motion 4 (for welcome/celebration)
-fps 24
-aspect 1:1
-camera static
```

### Leonardo.ai Motion

```
Motion Settings:
- Motion Strength: 5-7/10
- Style: 3D Animation
- Quality: High
- Duration: Maximum available

Tips:
- Start with Leonardo Phoenix for image generation
- Use "Motion" feature on generated image
- Multiple generations recommended
- Download highest quality available
```

### Midjourney + After Effects (Manual)

```
Workflow:
1. Generate keyframes in Midjourney (start, middle, end poses)
2. Import into After Effects
3. Use Puppet Pin tool for animation
4. Add particle effects with Particle World
5. Composite and render

Midjourney Prompts for Keyframes:
[Base prompt] + specific pose description
- "starting pose, dormant"
- "mid animation, waving"
- "ending pose, celebrating"
```

---

## 🛠️ Pós-Produção e Otimização

### After Effects / Premiere Pro

```
Edits recomendados após geração:
1. Color grading: Levels, Curves para ajustar saturação
2. Glow adicional: Add > Video Effects > Stylize > Glow
3. Motion blur: Se IA não gerou, adicionar Directional Blur
4. Loop perfeito: Crossfade últimos frames com primeiros
5. Particles: Adicionar CC Particle World se necessário

Exportação:
- Codec: H.264
- Profile: High
- Bitrate: VBR 2 pass, target 8-10 Mbps
- Resolution: 1920x1920 (downscale to 1080x1080)
- Frame rate: 30fps
- Audio: None
```

### FFmpeg (Otimização de Tamanho)

```bash
# Comprimir mantendo qualidade
ffmpeg -i helio-welcome.mp4 -c:v libx264 -crf 23 -preset slow -vf scale=1080:1080 -an helio-welcome-optimized.mp4

# Criar loop perfeito
ffmpeg -i input.mp4 -filter_complex "[0:v]reverse,fifo[r];[0:v][r] concat=n=2:v=1 [v]" -map "[v]" output-loop.mp4

# Reduzir tamanho agressivamente
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -vf scale=1080:1080 -an -movflags +faststart output-small.mp4
```

### WebM (Alternativa para Web)

```bash
# Converter para WebM (melhor compressão)
ffmpeg -i helio-welcome.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -vf scale=1080:1080 -an helio-welcome.webm

# Com transparência (Alpha channel) - só se IA gerar
ffmpeg -i helio-transparent.mov -c:v libvpx-vp9 -pix_fmt yuva420p helio-transparent.webm
```

---

## 📦 Fallback: Imagens Estáticas

### Caso os vídeos não funcionem, gerar imagens PNG estáticas

```
Prompt para Imagem Estática (Midjourney):
A friendly 3D sun mascot named Helio for solar energy company, 
final polished render, centered composition, welcoming pose with one arm waving,
warm smile, large friendly eyes, gradient colors from golden yellow (#facc15) through 
orange (#f97316) to pink (#ec4899), 12 sun rays extending outward, soft glow effect, 
modern clean 3D style, white background, professional tech company aesthetic, 
high quality render, 1080x1080px, suitable as static mascot icon
--ar 1:1 --style raw --quality 2 --v 6 --no animation, motion, blur
```

### Gerar 3 Variações

1. **helio-welcome-static.png**: Pose com aceno, sorriso grande
2. **helio-compact-static.png**: Pose neutra, profissional, frontal
3. **helio-celebration-static.png**: Braços pra cima, super feliz

---

## ✅ Checklist de Validação

### Antes de Aprovar o Vídeo Final

- [ ] **Resolução correta**: 1080x1080px exato
- [ ] **Duração correta**: Welcome 4-5s, Compact 2-3s, Celebration 5-6s
- [ ] **Loop funciona**: Welcome e Compact devem ter loop perfeito
- [ ] **Sem loop**: Celebration termina e não loopa
- [ ] **Cores corretas**: Gradiente amarelo #facc15 → laranja #f97316 → rosa #ec4899 visível
- [ ] **Expressão apropriada**: Mood correto para cada vídeo
- [ ] **Tamanho de arquivo**: < 3MB para Welcome/Compact, < 5MB para Celebration
- [ ] **Performance**: Roda suave em mobile e desktop
- [ ] **Acessibilidade**: Reconhecível mesmo sem áudio
- [ ] **Branding**: Alinhado com identidade visual YSH Solar
- [ ] **Profissionalismo**: Não muito infantil, adequado para B2B

### Teste em Contexto

- [ ] Visualizar em 320x320px (tamanho grande em WelcomeStep)
- [ ] Visualizar em 120x120px (tamanho pequeno no header)
- [ ] Visualizar em 200x200px (tamanho médio em ResultsStep)
- [ ] Testar loop em repetição (10+ vezes) - deve ser fluido
- [ ] Verificar em diferentes dispositivos (desktop, tablet, mobile)
- [ ] Performance: CPU usage aceitável durante playback

---

## 💡 Dicas Pro

### Para Melhores Resultados

1. **Gere múltiplas versões**: Peça 5-10 variações de cada vídeo
2. **Combine ferramentas**: Use Midjourney para frames + Runway para animação
3. **Iteração**: Refine o prompt baseado nos resultados anteriores
4. **Referências visuais**: Envie imagens de referência junto com prompt
5. **Estilo consistente**: Use mesma "seed" ou checkpoint entre gerações
6. **Teste cedo**: Valide conceito com versões rápidas antes de refinar

### Se Budget é Limitado

**Opção 1: SVG Animado com CSS**

- Criar Hélio como SVG
- Animar com CSS keyframes
- Mais leve que vídeo
- 100% controlável

**Opção 2: Lottie Animation**

- Criar no After Effects
- Exportar como JSON via Bodymovin
- Extremamente leve (<100KB)
- Escalável sem perda de qualidade

**Opção 3: Usar Emoji Animado**

- ☀️ emoji nativo + CSS animations
- Zero custo
- Funciona imediatamente
- Placeholder perfeito enquanto cria os vídeos profissionais

---

## 🎓 Recursos Adicionais

### Tutoriais

- **OpenAI Sora**: <https://openai.com/sora> (API docs)
- **Google Gemini Video**: <https://ai.google.dev/gemini-api/docs/video> (API reference)
- **Runway Gen-3**: <https://runwayml.com/tutorials>
- **Pika Labs**: <https://pika.art/learn>
- **Midjourney**: <https://docs.midjourney.com>
- **After Effects**: Adobe YouTube channel
- **Lottie**: <https://lottiefiles.com/learn>

### Comunidades

- **Runway Discord**: Feedback e dicas da comunidade
- **Pika Discord**: Showcase e ajuda
- **Midjourney Discord**: Prompt engineering
- **r/StableDiffusion**: Para opções open source

### Alternativas Gratuitas/Open Source

- **Stable Diffusion WebUI + AnimateDiff**: Grátis, local
- **ComfyUI**: Workflows customizados de vídeo
- **Deforum**: Para animações mais simples
- **Blender + Geometry Nodes**: Full control, steep learning curve

---

## 📞 Suporte

Se precisar de ajuda para:

- Refinar os prompts
- Escolher a melhor ferramenta
- Troubleshooting de gerações
- Otimização de vídeos
- Implementação alternativa

Entre em contato ou consulte documentação técnica em:

- `MODULO_ONBOARDING_COMPLETO.md`
- `README-HELIO-VIDEOS.md`

---

**Criado para YSH Solar - Módulo Onboarding**  
**Versão**: 1.0  
**Data**: Outubro 2025  
**Status**: ✅ Pronto para produção
