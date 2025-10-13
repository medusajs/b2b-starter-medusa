// src/lib/i18n-client.ts

import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const { Link, redirect, usePathname, useRouter } =
    createSharedPathnamesNavigation({ locales: ['pt'] });