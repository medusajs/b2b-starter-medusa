import type { Meta, StoryObj } from '@storybook/react'
import ProductCard from './ProductCard'

const meta: Meta<typeof ProductCard> = {
  title: 'Catalog/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'padded',
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-navigation', enabled: true },
          { id: 'focus-order-semantics', enabled: true },
        ],
      },
    },
  },
  argTypes: {
    category: {
      control: 'select',
      options: ['panels', 'inverters', 'batteries', 'accessories', 'kits'],
    },
  },
}

export default meta
type Story = StoryObj<typeof ProductCard>

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
  blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
}

export const Default: Story = {
  args: {
    product: mockProduct,
    category: 'panels',
  },
}

export const WithoutImage: Story = {
  args: {
    product: {
      ...mockProduct,
      processed_images: undefined,
      image_url: undefined,
    },
    category: 'panels',
  },
}

export const HighTier: Story = {
  args: {
    product: {
      ...mockProduct,
      tier_recommendation: ['XPP'],
      efficiency_pct: 23.1,
      price_brl: 1299.99,
    },
    category: 'panels',
  },
}

export const Inverter: Story = {
  args: {
    product: {
      ...mockProduct,
      id: 'inv_456',
      name: 'Inversor String 15kW Trifásico',
      sku: 'INV-STR-15KW-001',
      manufacturer: 'Fronius',
      model: 'Symo 15.0-3-M',
      kwp: 15,
      efficiency_pct: 98.1,
      type: 'inverter',
      tier_recommendation: ['PP'],
    },
    category: 'inverters',
  },
}

export const Kit: Story = {
  args: {
    product: {
      ...mockProduct,
      id: 'kit_789',
      name: 'Kit Solar Residencial 5kWp Completo',
      sku: 'KIT-RES-5KW-001',
      manufacturer: 'Yello Solar Hub',
      model: 'Kit Residencial Pro',
      kwp: 5.0,
      price_brl: 18999.99,
      type: 'kit',
      modalidade: 'on-grid',
      classe_consumidora: ['residencial-b1'],
      roi_estimado: 3.8,
    },
    category: 'kits',
  },
}

export const AccessibilityTest: Story = {
  args: {
    product: mockProduct,
    category: 'panels',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-navigation', enabled: true },
          { id: 'focus-order-semantics', enabled: true },
          { id: 'aria-labels', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'link-name', enabled: true },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Test keyboard navigation
    const buttons = canvasElement.querySelectorAll('button')
    buttons.forEach((button, index) => {
      if (!button.getAttribute('aria-label') && !button.textContent?.trim()) {
        console.warn(`Button ${index} missing accessible name`)
      }
    })
  },
}