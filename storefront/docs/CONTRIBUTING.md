# Guia de Contribuição

Bem-vindo ao projeto! Este documento contém diretrizes para contribuir com o desenvolvimento da aplicação storefront.

## Como Contribuir

### 1. Configuração do Ambiente

#### Pré-requisitos
- Node.js 20+
- npm ou yarn
- Git

#### Setup Local
```bash
# Clone o repositório
git clone https://github.com/your-org/your-repo.git
cd your-repo/storefront

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.template .env.local

# Execute em modo desenvolvimento
npm run dev
```

### 2. Fluxo de Desenvolvimento

#### Branches
- `main` - Código de produção
- `develop` - Desenvolvimento ativo
- `feature/*` - Novas funcionalidades
- `bugfix/*` - Correções de bugs
- `hotfix/*` - Correções críticas

#### Commits
Usamos [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Tipos permitidos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Mudanças de estilo (formatação, etc.)
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Mudanças em ferramentas, config, etc.

**Exemplos:**
```
feat(cart): add quantity selector
fix(checkout): resolve payment processing error
docs(readme): update installation instructions
```

### 3. Pull Requests

#### Antes de Abrir um PR
1. **Testes**: Garanta que todos os testes passam
2. **Linting**: Execute `npm run lint`
3. **Build**: Verifique se `npm run build` funciona
4. **Documentação**: Atualize docs se necessário

#### Template de PR
```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação
- [ ] Refatoração

## Checklist
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Linting passa
- [ ] Build passa
- [ ] Mudanças foram testadas localmente

## Issues Relacionadas
Closes #123
```

### 4. Estrutura de Código

#### Componentes React
```tsx
// ✅ Bom
interface ProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <button onClick={() => onAddToCart(product.id)}>
        Adicionar ao Carrinho
      </button>
    </div>
  )
}

// ❌ Evite
export function ProductCard(props) {
  return (
    <div>
      <h3>{props.product.name}</h3>
      <button onClick={() => props.onAddToCart(props.product.id)}>
        Adicionar
      </button>
    </div>
  )
}
```

#### Custom Hooks
```tsx
// ✅ Bom
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((product: Product) => {
    setItems(current => [...current, { product, quantity: 1 }])
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(current => current.filter(item => item.product.id !== productId))
  }, [])

  return { items, addItem, removeItem }
}

// ❌ Evite
export function useCart() {
  const [items, setItems] = useState([])

  function addItem(product) {
    setItems([...items, { product, quantity: 1 }])
  }

  return { items, addItem }
}
```

#### Testes
```tsx
// ✅ Bom
describe('ProductCard', () => {
  it('renders product name and price', () => {
    const product = { id: '1', name: 'Test Product', price: 29.99 }
    render(<ProductCard product={product} onAddToCart={jest.fn()} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
  })

  it('calls onAddToCart when button is clicked', () => {
    const mockAddToCart = jest.fn()
    const product = { id: '1', name: 'Test Product', price: 29.99 }
    render(<ProductCard product={product} onAddToCart={mockAddToCart} />)

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    expect(mockAddToCart).toHaveBeenCalledWith('1')
  })
})
```

### 5. Estilos e Design

#### Tailwind CSS
- Use classes utilitárias do Tailwind
- Evite estilos inline quando possível
- Mantenha consistência com o design system

```tsx
// ✅ Bom
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-xl font-semibold text-gray-900 mb-2">Título</h3>
  <p className="text-gray-600">Descrição do componente</p>
</div>

// ❌ Evite
<div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Título</h3>
  <p style={{ color: '#4B5563' }}>Descrição</p>
</div>
```

#### Componentes shadcn/ui
- Use componentes da biblioteca quando disponíveis
- Customize via props ao invés de sobrescrever estilos
- Mantenha acessibilidade

### 6. Performance

#### Code Splitting
```tsx
// ✅ Bom - Lazy loading de componentes
const ProductModal = lazy(() => import('./ProductModal'))

export function ProductList() {
  const [selectedProduct, setSelectedProduct] = useState(null)

  return (
    <div>
      {/* Lista de produtos */}
      {selectedProduct && (
        <Suspense fallback={<div>Loading...</div>}>
          <ProductModal product={selectedProduct} />
        </Suspense>
      )}
    </div>
  )
}
```

#### Imagens
```tsx
// ✅ Bom - Next.js Image component
import Image from 'next/image'

export function ProductImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={400}
      className="w-full h-auto"
      loading="lazy"
    />
  )
}
```

### 7. Segurança

#### Prevenção XSS
- Sempre sanitize user input
- Use `dangerouslySetInnerHTML` apenas quando necessário
- Valide dados no frontend e backend

#### Autenticação
- Nunca exponha tokens no client-side
- Use HTTP-only cookies para tokens
- Implemente refresh token logic

### 8. Acessibilidade

#### Semântica HTML
```tsx
// ✅ Bom
<button
  onClick={handleClick}
  aria-label="Fechar modal"
  className="close-button"
>
  ×
</button>

// ❌ Evite
<div
  onClick={handleClick}
  className="close-button"
  role="button"
  tabIndex={0}
>
  ×
</div>
```

#### Navegação por Teclado
- Garanta que todos os elementos interativos sejam acessíveis via teclado
- Mantenha ordem lógica de tabulação
- Forneça feedback visual para foco

### 9. Debugging

#### Console Logs
```tsx
// ✅ Desenvolvimento apenas
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}

// ❌ Nunca em produção
console.log('User data:', userData)
```

#### Error Boundaries
```tsx
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <h1>Algo deu errado.</h1>
    }

    return this.props.children
  }
}
```

### 10. Code Review

#### Checklist de Review
- [ ] Código segue os padrões estabelecidos
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação está atualizada
- [ ] Performance não foi impactada negativamente
- [ ] Segurança foi considerada
- [ ] Acessibilidade foi mantida
- [ ] Não há console.logs ou debug code
- [ ] Commits seguem conventional commits

### 11. Suporte

#### Onde Pedir Ajuda
- **Issues no GitHub**: Para bugs e feature requests
- **Discussions**: Para perguntas gerais
- **Discord/Slack**: Para chat em tempo real

#### Labels Importantes
- `bug`: Problema que precisa ser corrigido
- `enhancement`: Melhoria ou nova funcionalidade
- `documentation`: Mudanças na documentação
- `good first issue`: Ideal para contribuidores iniciantes
- `help wanted`: Contribuições são bem-vindas

Obrigado por contribuir! 🎉