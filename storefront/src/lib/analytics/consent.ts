/**
 * Analytics Consent Management
 * LGPD/GDPR compliant consent handling
 */

const CONSENT_KEY = 'ysh_analytics_consent'
const CONSENT_VERSION = '1.0'
const CONSENT_VERSION_KEY = 'ysh_consent_version'

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const consent = localStorage.getItem(CONSENT_KEY)
    const version = localStorage.getItem(CONSENT_VERSION_KEY)

    // If version mismatch, require new consent
    if (version !== CONSENT_VERSION) {
      return false
    }

    return consent === 'true'
  } catch {
    return false
  }
}

export function grantAnalyticsConsent(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CONSENT_KEY, 'true')
    localStorage.setItem(CONSENT_VERSION_KEY, CONSENT_VERSION)
  } catch (error) {
    console.error('[Consent] Failed to grant consent:', error)
  }
}

export function revokeAnalyticsConsent(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(CONSENT_KEY)
    localStorage.removeItem(CONSENT_VERSION_KEY)
  } catch (error) {
    console.error('[Consent] Failed to revoke consent:', error)
  }
}

export function getConsentStatus(): {
  granted: boolean
  version: string | null
} {
  if (typeof window === 'undefined') {
    return { granted: false, version: null }
  }

  try {
    return {
      granted: localStorage.getItem(CONSENT_KEY) === 'true',
      version: localStorage.getItem(CONSENT_VERSION_KEY),
    }
  } catch {
    return { granted: false, version: null }
  }
}
