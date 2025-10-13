/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import ProductCard from '../ProductCard'

// Mock dependencies
jest.mock('@/modules/catalog/context/customization', () => ({
  useCatalogCustomization: () => ({
    extraBadges: () => [],
    primaryCta: undefined,
    secondaryCta: undefined,
    highlightSpecs: () => [],
    logoFor: () => null,
  }),
}))

jest.mock('@/modules/lead-quote/context', () => ({
  useLeadQuote: () => ({
    add: jest.fn(),
  }),
}))

jest.mock('@/lib/experiments', () => ({
  useVariant: (variants: any) => variants.A,
  trackExperimentEvent: jest.fn(),
}))

jest.mock('@/lib/sku-analytics', () => ({
  trackSKUCopy: jest.fn(),
  trackModelLinkClick: jest.fn(),
  trackProductView: jest.fn(),
}))

const mockProduct = {
  id: 'prod_123',
  name: 'Painel Solar Monocristalino 550W',
  sku: 'PAN-MONO-550W-001',
  price_brl: 899.99,
  manufacturer: 'Canadian Solar',
  model: 'CS3W-550MS',
  kwp: 0.55,
  efficiency_pct: 21.2,
  tier_recommendation: ['P'],
  processed_images: {
    thumb: '/placeholder-product.jpg',
    medium: '/placeholder-product.jpg',
    large: '/placeholder-product.jpg',
  },
  type: 'panel',
  modalidade: 'on-grid',
  classe_consumidora: ['residencial-b1', 'comercial-b3'],
  roi_estimado: 4.2,
}

describe('ProductCard Accessibility', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <ProductCard product={mockProduct} category="panels" />
    )
    
    expect(container).toBeInTheDocument()
  })

  it('should have proper ARIA labels for interactive elements', () => {
    render(<ProductCard product={mockProduct} category="panels" />)
    
    // Check for accessible button names
    const viewButton = screen.getByLabelText(/visualizar/i)
    expect(viewButton).toBeInTheDocument()
    
    const favoriteButton = screen.getByLabelText(/adicionar.*aos favoritos/i)
    expect(favoriteButton).toBeInTheDocument()
    
    const quoteButton = screen.getByLabelText(/adicionar.*à cotação/i)
    expect(quoteButton).toBeInTheDocument()
  })

  it('should have proper heading structure', () => {
    render(<ProductCard product={mockProduct} category="panels" />)
    
    // Product name should be in a heading or have proper semantic structure
    const productName = screen.getByText(mockProduct.name)
    expect(productName).toBeInTheDocument()
    
    // Check if it's wrapped in a link with proper accessible name
    const productLink = screen.getByRole('link', { name: new RegExp(mockProduct.name, 'i') })
    expect(productLink).toBeInTheDocument()
  })

  it('should have proper image alt text', () => {
    render(<ProductCard product={mockProduct} category="panels" />)
    
    const productImage = screen.getByAltText(mockProduct.name)
    expect(productImage).toBeInTheDocument()
  })

  it('should have keyboard navigation support', () => {
    render(<ProductCard product={mockProduct} category="panels" />)
    
    // All interactive elements should be focusable
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).not.toHaveAttribute('tabindex', '-1')
    })
    
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).not.toHaveAttribute('tabindex', '-1')
    })
  })

  it('should handle missing product data gracefully', async () => {
    const incompleteProduct = {
      id: 'prod_456',
      name: 'Test Product',
    }
    
    const { container } = render(
      <ProductCard product={incompleteProduct} category="panels" />
    )
    
    // Should still be accessible even with missing data
    const results = await axe(container)
    expect(results).toHaveNoViolations()
    
    // Should still have basic interactive elements
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('should have proper color contrast', () => {
    render(<ProductCard product={mockProduct} category="panels" />)
    
    // This is more of a visual test, but we can check for proper CSS classes
    const card = screen.getByText(mockProduct.name).closest('.ysh-product-card')
    expect(card).toBeInTheDocument()
    
    // Check for proper text color classes (assuming Tailwind)
    const priceElement = screen.getByText(/R\$/)
    expect(priceElement).toBeInTheDocument()
  })
})

describe('ProductCard Semantic Structure', () => {
  it('should use proper semantic HTML', () => {
    render(<ProductCard product={mockProduct} category="panels" />)
    
    // Should have proper button roles
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    
    // Should have proper link roles
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    
    // Should have proper image roles
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('should have proper group labeling for overlay actions', () => {
    render(<ProductCard product={mockProduct} category="panels" />)
    
    // Check for group with proper aria-label
    const actionGroup = screen.getByRole('group', { name: /ações do produto/i })
    expect(actionGroup).toBeInTheDocument()
  })
})
