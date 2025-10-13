import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { OfflineBanner, FallbackBadge } from './offline-banner';

// Mock do fetch para simular diferentes estados
const mockFetch = (healthy: boolean, fallbackActive = false) => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve({
                healthy,
                fallback: { active: fallbackActive }
            })
        })
    ) as jest.Mock;
};

const meta: Meta<typeof OfflineBanner> = {
    title: 'Components/OfflineBanner',
    component: OfflineBanner,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'Banner que exibe aviso quando o backend está offline e o site está em modo fallback.',
            },
        },
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => {
            // Reset mocks before each story
            jest.clearAllMocks();
            return <Story />;
        },
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Offline: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Estado offline - backend indisponível.',
            },
        },
    },
    beforeEach: () => {
        mockFetch(false);
    },
};

export const FallbackMode: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Modo fallback ativo - backend funcionando mas em modo limitado.',
            },
        },
    },
    beforeEach: () => {
        mockFetch(true, true);
    },
};

export const Online: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Estado online - banner não deve aparecer.',
            },
        },
    },
    beforeEach: () => {
        mockFetch(true, false);
    },
};

// Story para o FallbackBadge
const badgeMeta: Meta<typeof FallbackBadge> = {
    title: 'Components/OfflineBanner/Badge',
    component: FallbackBadge,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'Badge que indica quando o catálogo está sendo exibido em modo local/fallback.',
            },
        },
    },
    tags: ['autodocs'],
};

export const Badge: StoryObj<typeof badgeMeta> = {
    parameters: {
        docs: {
            description: {
                story: 'Badge indicando catálogo local.',
            },
        },
    },
};
