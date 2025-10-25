# 🎬 Vídeos do Hélio - Guia de Produção

## 📋 Visão Geral

O Hélio é o mascote animado da YSH Solar que guia o usuário através do onboarding. São necessários **3 vídeos** com diferentes "moods" (estados emocionais).

---

## 🎯 Especificações Técnicas

### Formato dos Vídeos

| Propriedade | Valor |
|-------------|-------|
| **Formato** | MP4 (H.264) |
| **Resolução** | 1080x1080px (1:1 quadrado) |
| **Frame Rate** | 30 fps |
| **Duração** | Varia por mood |
| **Compressão** | High quality, ~2-5MB cada |
| **Áudio** | Opcional (música de fundo sutil) |

### Localização dos Arquivos

```
ysh-store/storefront/public/videos/
├── helio-welcome.mp4
├── helio-compact.mp4
└── helio-celebration.mp4
```

---

## 🎭 Mood 1: Welcome

**Arquivo**: `helio-welcome.mp4`

### Contexto de Uso

- Tela de boas-vindas (WelcomeStep)
- Primeira impressão do usuário
- Tamanho grande (320x320px)

### Características da Animação

- **Duração**: 3-5 segundos (loop)
- **Emoção**: Acolhedor, amigável, convidativo
- **Movimento**:
  - Hélio "acorda" suavemente
  - Pisca olhos
  - Acena com a mão
  - Sorriso caloroso

### Storyboard Sugerido

```
[Frame 1-10] → Hélio dormindo/inativo
[Frame 11-30] → Abre os olhos
[Frame 31-50] → Sorriso se forma
[Frame 51-70] → Acena com mão
[Frame 71-90] → Pose final convidativa
[Loop de volta ao frame 71]
```

### Paleta de Cores

- **Background**: Transparente ou gradiente laranja/amarelo suave
- **Hélio**: Cores solares vibrantes (amarelo #facc15, laranja #f97316)
- **Detalhes**: Raios de sol, brilhos sutis

---

## 🤔 Mood 2: Compact (Thinking)

**Arquivo**: `helio-compact.mp4`

### Contexto de Uso

- Badge no header durante steps intermediários
- Location, Consumption, Roof steps
- Tamanho pequeno (120x120px)

### Características da Animação

- **Duração**: 2-3 segundos (loop infinito)
- **Emoção**: Pensativo, concentrado, trabalhando
- **Movimento**:
  - Respiração suave (pulsação leve)
  - Olhos piscando ocasionalmente
  - Pequenos movimentos de cabeça
  - Aura/glow pulsante ao redor

### Storyboard Sugerido

```
[Frame 1-20] → Pose neutra + respiração
[Frame 21-30] → Pisca rápido
[Frame 31-40] → Volta pose neutra
[Frame 41-60] → Glow pulsa (sutil)
[Loop]
```

### Estilo Visual

- **Minimalista**: Menos detalhes que welcome
- **Subtileza**: Movimentos discretos para não distrair
- **Glow**: Aura amarela pulsante indicando "processamento"

---

## 🎉 Mood 3: Celebration

**Arquivo**: `helio-celebration.mp4`

### Contexto de Uso

- Tela de resultados (ResultsStep)
- Quando o sistema foi dimensionado com sucesso
- Tamanho médio (200x200px)

### Características da Animação

- **Duração**: 4-6 segundos (one-shot, NÃO loop)
- **Emoção**: Empolgado, comemorativo, vitorioso
- **Movimento**:
  - Jump/pulo de alegria
  - Braços para cima
  - Confetes/estrelas ao redor
  - Expressão super feliz

### Storyboard Sugerido

```
[Frame 1-15] → Antecipação (agacha)
[Frame 16-30] → PULA alto
[Frame 31-50] → Braços para cima
[Frame 51-80] → Confetes explodem
[Frame 81-100] → Pose vitoriosa final
[Frame 101-120] → Fade out suave
[FIM - não loopa]
```

### Efeitos Especiais

- **Confetes**: Partículas coloridas (amarelo, laranja, verde)
- **Estrelas**: Brilhos dourados
- **Flash**: Luz breve no momento do pulo
- **Trail**: Rastro de movimento para enfatizar pulo

---

## 🎨 Design do Hélio

### Características Físicas

- **Forma**: Sol antropomórfico (círculo com raios)
- **Rosto**: Olhos grandes expressivos, sorriso simpático
- **Membros**: Braços e pernas simples mas expressivos
- **Raios**: 8-12 raios ao redor (parte do design)

### Personalidade Visual

- **Friendly**: Formas arredondadas, sem ângulos agressivos
- **Energético**: Cores vibrantes, movimentos fluidos
- **Profissional**: Clean, não infantil demais
- **Solar**: Obviamente conectado ao tema energia solar

### Referências de Estilo

- **Inspiração**: Mascotes tech modernos (Duolingo, Mailchimp)
- **Não é**: Clipart genérico, emoji simples
- **Tom**: Educacional mas divertido, profissional mas acessível

---

## 🛠️ Ferramentas Sugeridas

### Opção 1: Produção Profissional

- **After Effects**: Animação 2D profissional
- **Illustrator**: Design do personagem
- **Premiere**: Compilação final

### Opção 2: Alternativas Acessíveis

- **Rive**: Animação interativa web-native
- **Lottie**: JSON animations (pode usar LottieFiles)
- **Blender**: Se quiser 3D simples

### Opção 3: Sem Animador (Temporário)

- **Placeholder SVG animado**: CSS animations
- **GIF animado**: Converter de sprites
- **Vídeo stock**: Adaptar vídeos existentes

---

## 📦 Assets Necessários

### Para o Animador

```
assets/
├── helio-character-design.ai   # Design do personagem (AI/SVG)
├── color-palette.aco           # Paleta de cores oficial
├── brand-guidelines.pdf        # Diretrizes da marca YSH
└── reference-animations/       # Exemplos de referência
    ├── mood-welcome.mp4
    ├── mood-thinking.mp4
    └── mood-celebration.mp4
```

### Entregáveis

```
deliverables/
├── helio-welcome.mp4          # Vídeo final
├── helio-compact.mp4          # Vídeo final
├── helio-celebration.mp4      # Vídeo final
├── helio-welcome-fallback.png # Imagem estática fallback
├── helio-compact-fallback.png # Imagem estática fallback
└── helio-celebration-fallback.png # Imagem estática fallback
```

---

## 🚀 Implementação Temporária (Placeholder)

Enquanto os vídeos não estão prontos, use:

### Solução 1: SVG Animado

```html
<!-- helio-placeholder.svg -->
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sunGradient">
      <stop offset="0%" stop-color="#facc15" />
      <stop offset="100%" stop-color="#f97316" />
    </radialGradient>
  </defs>
  
  <!-- Core circle -->
  <circle cx="50" cy="50" r="30" fill="url(#sunGradient)">
    <animate attributeName="r" values="30;32;30" dur="2s" repeatCount="indefinite" />
  </circle>
  
  <!-- Rays -->
  <g class="rays">
    <!-- 8 rays rotating -->
    <animateTransform 
      attributeName="transform" 
      type="rotate" 
      from="0 50 50" 
      to="360 50 50" 
      dur="8s" 
      repeatCount="indefinite" />
  </g>
</svg>
```

### Solução 2: CSS Animation

```tsx
// HelioPlaceholder.tsx
export function HelioPlaceholder({ mood }: { mood: string }) {
  return (
    <div className={`helio-placeholder helio-${mood}`}>
      <div className="helio-core">☀️</div>
      <style jsx>{`
        .helio-core {
          font-size: 4rem;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
```

---

## ✅ Checklist de Qualidade

### Pré-Produção

- [ ] Design do Hélio aprovado
- [ ] Storyboards revisados
- [ ] Paleta de cores definida
- [ ] Duração de cada vídeo confirmada

### Produção

- [ ] Animações fluidas (30fps)
- [ ] Cores fiéis à marca
- [ ] Movimentos expressivos
- [ ] Compressão otimizada

### Pós-Produção

- [ ] Vídeos em 1080x1080px
- [ ] Tamanho < 5MB cada
- [ ] Loop perfeito (welcome e compact)
- [ ] No-loop correto (celebration)
- [ ] Fallback images criadas

### Integração

- [ ] Arquivos em `/public/videos/`
- [ ] Fallbacks em `/public/images/`
- [ ] Componente HelioVideo testado
- [ ] Performance verificada (mobile)
- [ ] Acessibilidade (alt text)

---

## 💰 Orçamento Estimado

| Item | Custo Estimado |
|------|----------------|
| Design do personagem | R$ 500 - R$ 1.500 |
| 3 animações (welcome, compact, celebration) | R$ 1.500 - R$ 4.000 |
| Revisões e ajustes | R$ 500 - R$ 1.000 |
| **TOTAL** | **R$ 2.500 - R$ 6.500** |

### Alternativas Budget

- **Freelancer júnior**: R$ 800 - R$ 1.500 (qualidade menor)
- **Fiverr/99designs**: R$ 300 - R$ 800 (arriscado)
- **Template customizado**: R$ 100 - R$ 300 (limitado)
- **DIY com ferramentas no-code**: Grátis - R$ 50 (tempo investido)

---

## 📞 Próximos Passos

1. **Definir Budget**: Quanto pode investir em animação?
2. **Contratar Profissional**: Animador 2D ou Motion Designer
3. **Briefing Completo**: Enviar este documento + brand guidelines
4. **Primeira Revisão**: Aprovar storyboards e primeiro draft
5. **Iteração**: 2-3 rodadas de ajustes
6. **Entrega Final**: Receber arquivos + fallbacks
7. **Integração**: Adicionar ao projeto e testar

---

## 🎓 Recursos Úteis

- [Rive.app](https://rive.app) - Ferramenta de animação interativa
- [LottieFiles](https://lottiefiles.com) - Biblioteca de animações JSON
- [Motion Design School](https://motiondesign.school) - Tutoriais
- [Behance](https://behance.net) - Portfolio de animadores
- [Upwork](https://upwork.com) - Contratar freelancers

---

**Desenvolvido para YSH Solar - Onboarding Module**  
**Última atualização**: Sessão 4 - Implementação Completa
