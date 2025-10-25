/**
 * Multilingual Support for Brazilian Solar Distributors
 * Suporte Multilíngue para Distribuidores Solares Brasileiros
 */

export type Language = 'pt' | 'en';

export interface I18nMessages {
  auth: {
    authenticating: string;
    authenticated: string;
    failed: string;
    still_on_login: string;
    no_session: string;
  };
  products: {
    listing: string;
    listed: string;
    failed: string;
    fetching: string;
    fetched: string;
    not_found: string;
    full_details: string;
  };
  catalog: {
    extracting: string;
    completed: string;
    failed: string;
  };
  categories: {
    panel: string;
    inverter: string;
    structure: string;
    cable: string;
    connector: string;
    string_box: string;
    battery: string;
    microinverter: string;
    kit: string;
    other: string;
  };
  stock: {
    available: string;
    unavailable: string;
    out_of_stock: string;
  };
}

export const messages: Record<Language, I18nMessages> = {
  pt: {
    auth: {
      authenticating: 'Autenticando com o portal B2B...',
      authenticated: 'Autenticado com sucesso no portal B2B',
      failed: 'Falha na autenticação do portal B2B',
      still_on_login: 'Ainda na página de login após autenticação',
      no_session: 'Nenhum cookie de sessão encontrado após login',
    },
    products: {
      listing: 'Listando produtos...',
      listed: 'Produtos listados com sucesso',
      failed: 'Falha ao listar produtos',
      fetching: 'Buscando detalhes do produto...',
      fetched: 'Detalhes do produto obtidos com sucesso',
      not_found: 'Produto não encontrado',
      full_details: 'Extraindo detalhes completos dos produtos...',
    },
    catalog: {
      extracting: 'Iniciando extração do catálogo...',
      completed: 'Extração do catálogo concluída',
      failed: 'Falha na extração do catálogo',
    },
    categories: {
      panel: 'Painel Solar',
      inverter: 'Inversor',
      structure: 'Estrutura',
      cable: 'Cabo',
      connector: 'Conector',
      string_box: 'String Box',
      battery: 'Bateria',
      microinverter: 'Microinversor',
      kit: 'Kit Completo',
      other: 'Outros',
    },
    stock: {
      available: 'Disponível',
      unavailable: 'Indisponível',
      out_of_stock: 'Fora de Estoque',
    },
  },
  en: {
    auth: {
      authenticating: 'Authenticating with B2B portal...',
      authenticated: 'Successfully authenticated with B2B portal',
      failed: 'B2B portal authentication failed',
      still_on_login: 'Still on login page after authentication',
      no_session: 'No session cookie found after login',
    },
    products: {
      listing: 'Listing products...',
      listed: 'Products listed successfully',
      failed: 'Failed to list products',
      fetching: 'Fetching product details...',
      fetched: 'Product details fetched successfully',
      not_found: 'Product not found',
      full_details: 'Extracting full product details...',
    },
    catalog: {
      extracting: 'Starting catalog extraction...',
      completed: 'Catalog extraction completed',
      failed: 'Catalog extraction failed',
    },
    categories: {
      panel: 'Solar Panel',
      inverter: 'Inverter',
      structure: 'Structure',
      cable: 'Cable',
      connector: 'Connector',
      string_box: 'String Box',
      battery: 'Battery',
      microinverter: 'Microinverter',
      kit: 'Complete Kit',
      other: 'Other',
    },
    stock: {
      available: 'Available',
      unavailable: 'Unavailable',
      out_of_stock: 'Out of Stock',
    },
  },
};

export function getMessages(language: Language): I18nMessages {
  return messages[language] || messages.pt;
}

export function formatCurrency(value: number, language: Language = 'pt'): string {
  if (language === 'pt') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: Date, language: Language = 'pt'): string {
  if (language === 'pt') {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
