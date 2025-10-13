// src/lib/i18n.ts

import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
    messages: (await import(`../messages/${locale}.json`)).default
}));