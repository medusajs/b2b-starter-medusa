# Arquitetura da Aplicação Storefront

## Visão Geral

Esta é uma aplicação de e-commerce B2B construída com Next.js 15, TypeScript e Medusa.js, oferecendo uma experiência completa de Progressive Web App (PWA) com foco em performance e escalabilidade.

## Stack Tecnológico

### Frontend

- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca UI com hooks modernos
- **TypeScript** - Tipagem estática para maior confiabilidade
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI acessíveis e consistentes

### Backend & E-commerce

- **Medusa.js** - Plataforma headless de e-commerce
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões (opcional)

### Qualidade & Desenvolvimento

- **ESLint** - Linting e qualidade de código
- **Prettier** - Formatação automática
- **Jest** - Framework de testes
- **Testing Library** - Utilitários de teste para React
- **Husky** - Git hooks para qualidade

### DevOps & Deploy

- **Docker** - Containerização
- **Vercel** - Plataforma de deploy
- **GitHub Actions** - CI/CD
- **PWA** - Service Worker e manifest

## Estrutura de Diretórios

```
src/
├── app/                    # Rotas Next.js 13+ (App Router)
│   ├── (auth)/            # Rotas de autenticação
│   ├── (store)/           # Rotas da loja
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── client/           # Componentes client-side
│   └── solar/            # Tema e design system
├── lib/                  # Utilitários e configurações
│   ├── context/          # Context providers
│   ├── data/             # Funções de data fetching
│   ├── hooks/            # Custom hooks
│   ├── i18n/             # Internacionalização
│   └── utils/            # Funções utilitárias
├── modules/              # Módulos funcionais
│   ├── account/          # Gestão de conta
│   ├── analytics/        # Analytics e tracking
│   ├── cart/             # Carrinho de compras
│   ├── catalog/          # Catálogo de produtos
│   └── ...               # Outros módulos
├── types/                # Definições TypeScript
└── __tests__/            # Testes
    ├── unit/             # Testes unitários
    ├── integration/      # Testes de integração
    └── e2e/              # Testes end-to-end
```

## Padrões de Arquitetura

### Componentes

- **Server Components** por padrão (Next.js 13+)
- **Client Components** apenas quando necessário (interatividade)
- **Custom Hooks** para lógica reutilizável
- **Compound Components** para APIs flexíveis

### Estado Global

- **Context API** para estado local da aplicação
- **Server State** com SWR/React Query
- **Local State** com useState/useReducer

### Data Fetching

- **Server Components** para dados iniciais
- **API Routes** para endpoints customizados
- **Medusa.js SDK** para operações de e-commerce

### Estilização

- **Tailwind CSS** para utilitários
- **CSS Variables** para temas
- **Component-scoped** styles quando necessário

## Funcionalidades Principais

### E-commerce B2B

- Catálogo de produtos com filtros avançados
- Sistema de carrinho e checkout
- Gestão de pedidos e histórico
- Sistema de usuários B2B

### PWA Features

- Service Worker para cache offline
- Manifest para instalação
- Push notifications (futuro)
- Background sync

### Performance

- Static generation onde possível
- Dynamic imports para code splitting
- Image optimization
- Bundle analysis

### Acessibilidade

- Componentes semanticamente corretos
- Navegação por teclado
- Screen reader support
- Contraste adequado

## Estratégias de Teste

### Unitários

- Componentes isolados
- Custom hooks
- Utilitários e helpers
- Lógica de negócio

### Integração

- Fluxos completos de usuário
- API integrations
- Context providers
- Form submissions

### E2E

- Fluxos críticos de compra
- Navegação e roteamento
- Responsividade
- PWA features

## CI/CD Pipeline

### Desenvolvimento

- **Linting** automático em commits
- **Testes** executados em PRs
- **Build** verificado antes do merge

### Produção

- **Deploy automático** para Vercel
- **Health checks** pós-deploy
- **Monitoring** e alertas

## Segurança

### Frontend

- Content Security Policy
- XSS prevention
- CSRF protection
- Secure headers

### Autenticação

- JWT tokens
- Secure cookie handling
- Password policies
- Session management

## Monitoramento

### Performance

- Core Web Vitals
- Bundle size monitoring
- Runtime performance
- Error tracking

### Analytics

- User behavior tracking
- Conversion funnels
- A/B testing
- Business metrics

## Escalabilidade

### Frontend

- Code splitting
- Lazy loading
- CDN optimization
- Service worker caching

### Backend

- API rate limiting
- Database optimization
- Caching strategies
- Horizontal scaling

## Desenvolvimento

### Setup Local

```bash
npm install
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
npm test            # Testes
npm run test:coverage # Testes com cobertura
```

### Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Roadmap

### Próximas Features

- [ ] Multi-tenant architecture
- [ ] Advanced search with AI
- [ ] Real-time inventory
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced personalization
