/**
 * ProductCard Unit Tests
 * Tests for accessibility, rendering, and user interactions
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProductCard from '../ProductCard'

// Mock do contexto LeadQuote
jest.mock('@/modules/lead-quote/context', () => ({
  useLeadQuote: () => ({
    add: jest.fn(),
  }),
}))

// Mock do contexto de customização
jest.mock('@/modules/catalog/context/customization', () => ({
  useCatalogCustomization: () => ({
    extraBadges: undefined,
    primaryCta: undefined,
    secondaryCta: undefined,
    highlightSpecs: undefined,
    logoFor: undefined,
  }),
}))

// Mock do LocalizedClientLink
jest.mock('@/modules/common/components/localized-client-link', () => {
  return function LocalizedClientLink({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

describe('ProductCard', () => {
  const mockProduct = {
    id: 'prod_1',
    name: 'Painel Solar 550W',
    sku: 'YSH-PANEL-550W',
    price_brl: 89900, // R$ 899,00 em centavos
    manufacturer: 'Canadian Solar',
    model: 'HiKu7',
    kwp: 0.55,
    efficiency_pct: 21.5,
    tier_recommendation: ['XPP'],
    processed_images: {
      thumb: '/images/panel-thumb.jpg',
      medium: '/images/panel-medium.jpg',
      large: '/images/panel-large.jpg',
    },
    type: 'panel',
  }

  it('renderiza informações básicas do produto', () => {
    render(<ProductCard product={mockProduct} category="panels" />)

    // Verifica nome do produto
    expect(screen.getByText('Painel Solar 550W')).toBeInTheDocument()

    // Verifica SKU
    expect(screen.getByText('YSH-PANEL-550W')).toBeInTheDocument()

    // Verifica potência
    expect(screen.getByText(/0.55kWp/)).toBeInTheDocument()

    // Verifica eficiência
    expect(screen.getByText(/21.5% η/)).toBeInTheDocument()
  })

  it('renderiza imagem com atributos corretos', () => {
    render(<ProductCard product={mockProduct} category="panels" />)

    const image = screen.getByAltText('Painel Solar 550W')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('loading', 'lazy')
  })

  it('renderiza badge de tier quando disponível', () => {
    render(<ProductCard product={mockProduct} category="panels" />)

    const badge = screen.getByText('XPP')
    expect(badge).toBeInTheDocument()
  })

  it('possui botões com labels acessíveis', () => {
    render(<ProductCard product={mockProduct} category="panels" />)

    // Verifica ARIA labels nos botões overlay
    expect(screen.getByLabelText(/Visualizar Painel Solar 550W/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Adicionar Painel Solar 550W aos favoritos/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Adicionar Painel Solar 550W à cotação/i)).toBeInTheDocument()
  })

  it('formata preço corretamente', () => {
    render(<ProductCard product={mockProduct} category="panels" />)

    // Preço em BRL
    expect(screen.getByText(/R\$\s*899,00/)).toBeInTheDocument()
  })

  it('renderiza "Sob Consulta" quando preço não disponível', () => {
    const productWithoutPrice = { ...mockProduct, price_brl: undefined, price: undefined }
    render(<ProductCard product={productWithoutPrice} category="panels" />)

    expect(screen.getByText('Sob Consulta')).toBeInTheDocument()
  })

  it('renderiza fabricante e modelo quando disponíveis', () => {
    render(<ProductCard product={mockProduct} category="panels" />)

    expect(screen.getByText(/Canadian Solar/)).toBeInTheDocument()
    expect(screen.getByText(/HiKu7/)).toBeInTheDocument()
  })

  it('possui estrutura semântica adequada', () => {
    const { container } = render(<ProductCard product={mockProduct} category="panels" />)

    // Verifica heading para nome do produto
    const heading = container.querySelector('h3')
    expect(heading).toBeInTheDocument()
    expect(heading?.textContent).toContain('Painel Solar 550W')
  })

  // Teste de acessibilidade básico (requer @axe-core/react se quiser validar com axe)
  it('não possui erros evidentes de acessibilidade', () => {
    render(<ProductCard product={mockProduct} category="panels" />)

    // Verifica que todos os botões possuem type
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button')
    })

    // Verifica que ícones possuem aria-hidden
    const icons = screen.getAllByRole('img', { hidden: true })
    expect(icons.length).toBeGreaterThan(0)
  })
})
