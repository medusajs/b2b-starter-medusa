import type { AppProps } from "next/app";
import "src/styles/globals.css";
import "src/styles/theme.css";
import "src/styles/gradients.css";

import { NextIntlProvider } from "next-intl";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { SWRConfig } from "swr";
import { fetcher } from "src/lib/fetcher";

import { useState } from "react";

export default function MyApp({ Component, pageProps }: AppProps<{
    messages?: Record<string, string>;
    locale?: string;
}>) {
    // QueryClient por-app (evita recriar a cada render)
    const [queryClient] = useState(() => new QueryClient());

    const locale = pageProps.locale || "pt-BR";
    const messages = pageProps.messages || {};

    return (
        <QueryClientProvider client={queryClient}>
            <SWRConfig value={{ fetcher }}>
                <NextIntlProvider locale={locale} messages={messages}>
                    <Component {...pageProps} />
                    <ReactQueryDevtools initialIsOpen={false} />
                </NextIntlProvider>
            </SWRConfig>
        </QueryClientProvider>
    );
}
