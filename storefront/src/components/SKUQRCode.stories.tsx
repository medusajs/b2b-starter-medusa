import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SKUQRCode, SKUQRCodeButton } from './SKUQRCode';

const meta: Meta<typeof SKUQRCode> = {
  title: 'Components/SKUQRCode',
  component: SKUQRCode,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente que gera QR Code para SKUs, otimizado para dispositivos móveis.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    sku: {
      control: 'text',
      description: 'O SKU do produto para gerar o QR Code',
    },
    size: {
      control: { type: 'number', min: 100, max: 500, step: 50 },
      description: 'Tamanho do QR Code em pixels',
    },
    productName: {
      control: 'text',
      description: 'Nome do produto (opcional)',
    },
    className: {
      control: 'text',
      description: 'Classes CSS adicionais',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sku: 'ABC-123-XYZ-789',
    size: 200,
    productName: 'Painel Solar 400W Canadian',
  },
};

export const Large: Story = {
  args: {
    sku: 'LARGE-SKU-EXAMPLE',
    size: 300,
    productName: 'Sistema Solar Completo 5kWp',
  },
};

export const Small: Story = {
  args: {
    sku: 'SMALL-123',
    size: 150,
    productName: 'Micro Inversor 300W',
  },
};

export const WithoutProductName: Story = {
  args: {
    sku: 'NO-NAME-SKU-456',
    size: 200,
  },
};

export const LongSKU: Story = {
  args: {
    sku: 'VERY-LONG-SKU-CODE-THAT-MIGHT-BREAK-LAYOUT-TESTING-RESPONSIVENESS-123456789',
    size: 200,
    productName: 'Produto com SKU muito longo para testar quebra de linha',
  },
};

// Story para o botão compacto
const buttonMeta: Meta<typeof SKUQRCodeButton> = {
  title: 'Components/SKUQRCode/Button',
  component: SKUQRCodeButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Versão compacta do botão QR Code (apenas ícone).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    sku: {
      control: 'text',
      description: 'O SKU do produto para gerar o QR Code',
    },
    productName: {
      control: 'text',
      description: 'Nome do produto (opcional)',
    },
    className: {
      control: 'text',
      description: 'Classes CSS adicionais',
    },
  },
};

export const Button: StoryObj<typeof buttonMeta> = {
  args: {
    sku: 'BUTTON-SKU-789',
    productName: 'Botão QR Code Compacto',
  },
};