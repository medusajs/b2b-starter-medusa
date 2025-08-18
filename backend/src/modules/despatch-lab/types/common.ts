export interface DespatchLabAuthCredentials {
  key: string;
  secret: string;
}

export interface DespatchLabTokens {
  access: string;
  refresh: string;
}

export interface DespatchLabAuthResponse {
  tokens: DespatchLabTokens;
}

export interface DespatchLabImpersonationTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DespatchLabImpersonationResponse {
  tokens: DespatchLabImpersonationTokens;
}

export interface DespatchLabAuthError {
  error: string;
}

export interface DespatchLabModuleOptions {
  apiUrl?: string;
  key: string;
  secret: string;
}

export interface DespatchLabAuthContext {
  tokens?: DespatchLabTokens;
  expiresAt?: Date;
  isAuthenticated: boolean;
}

export interface DespatchLabOrder {
  id: string;
  [key: string]: any;
}

export interface DespatchLabFulfillmentData {
  id?: string;
  orderId?: string;
  tracking_number?: string;
  label_url?: string;
  tracking_url?: string;
  [key: string]: any;
}

export interface DespatchLabShippingOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimated_delivery_days?: number;
}

export interface DespatchLabCalculatePriceData {
  shipping_address?: any;
  items?: any[];
  currency_code?: string;
  [key: string]: any;
}

export interface DespatchLabFulfillmentDocument {
  tracking_number: string;
  label_url?: string;
  tracking_url?: string;
  type: "label" | "invoice" | "customs" | "other";
  [key: string]: any;
}
