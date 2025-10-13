/**
 * Unit tests for SKU Analytics & PLG Tracking
 * Validates consent guard and tracking functions
 */

import { trackSKUCopy, trackModelLinkClick, trackCategoryView, setAnalyticsConsent } from '@/lib/sku-analytics'

// Mock window and document
const mockWindow = {
  posthog: {
    capture: jest.fn(),
  },
  gtag: jest.fn(),
  location: {
    href: 'https://yellosolarhub.com/br/products/test',
  },
  navigator: {
    userAgent: 'Mozilla/5.0 Test',
  },
}

const mockDocument = {
  cookie: '',
  referrer: 'https://google.com',
}

describe('SKU Analytics - Consent Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.window = mockWindow as any
    global.document = mockDocument as any
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    }
    global.sessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('trackSKUCopy should NOT track without consent', () => {
    mockDocument.cookie = ''
    ;(global.localStorage.getItem as jest.Mock).mockReturnValue(null)
    ;(global.sessionStorage.getItem as jest.Mock).mockReturnValue(null)

    trackSKUCopy({
      sku: 'TEST-SKU-001',
      product_id: 'prod_123',
      category: 'panels',
    })

    expect(mockWindow.posthog.capture).not.toHaveBeenCalled()
    expect(mockWindow.gtag).not.toHaveBeenCalled()
  })

  test('trackSKUCopy should track WITH consent (cookie)', () => {
    mockDocument.cookie = 'analytics_consent=true'

    trackSKUCopy({
      sku: 'TEST-SKU-001',
      product_id: 'prod_123',
      category: 'panels',
      manufacturer: 'Test Brand',
      price: 1500,
      source: 'product_page',
    })

    expect(mockWindow.posthog.capture).toHaveBeenCalledWith(
      'sku_copied',
      expect.objectContaining({
        sku: 'TEST-SKU-001',
        product_id: 'prod_123',
        category: 'panels',
        manufacturer: 'Test Brand',
        price: 1500,
        source: 'product_page',
      })
    )
  })

  test('trackModelLinkClick should track WITH consent (localStorage)', () => {
    ;(global.localStorage.getItem as jest.Mock).mockReturnValue('true')

    trackModelLinkClick({
      manufacturer: 'Canadian Solar',
      model: 'CS3W-450P',
      product_id: 'prod_456',
      source: 'product_card',
    })

    expect(mockWindow.posthog.capture).toHaveBeenCalledWith(
      'product_model_clicked',
      expect.objectContaining({
        manufacturer: 'Canadian Solar',
        model: 'CS3W-450P',
        product_id: 'prod_456',
        source: 'product_card',
      })
    )
  })

  test('trackCategoryView should track WITH consent (sessionStorage)', () => {
    ;(global.sessionStorage.getItem as jest.Mock).mockReturnValue('true')

    trackCategoryView({
      category: 'inversores',
      filters: { power: '5kW', brand: 'Fronius' },
      page: 1,
      total_results: 42,
      source: 'filter',
    })

    expect(mockWindow.posthog.capture).toHaveBeenCalledWith(
      'category_viewed',
      expect.objectContaining({
        category: 'inversores',
        filters: { power: '5kW', brand: 'Fronius' },
        page: 1,
        total_results: 42,
        source: 'filter',
      })
    )
  })

  test('setAnalyticsConsent should set consent in all storages', () => {
    setAnalyticsConsent(true)

    expect(global.localStorage.setItem).toHaveBeenCalledWith('analytics_consent', 'true')
    expect(global.sessionStorage.setItem).toHaveBeenCalledWith('analytics_consent', 'true')
    expect(mockDocument.cookie).toContain('analytics_consent=true')
  })

  test('setAnalyticsConsent should revoke consent', () => {
    setAnalyticsConsent(false)

    expect(global.localStorage.setItem).toHaveBeenCalledWith('analytics_consent', 'false')
    expect(global.sessionStorage.setItem).toHaveBeenCalledWith('analytics_consent', 'false')
  })
})
