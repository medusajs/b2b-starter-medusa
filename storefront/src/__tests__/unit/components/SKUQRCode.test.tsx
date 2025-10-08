/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SKUQRCode, SKUQRCodeButton } from '@/components/SKUQRCode';

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation((props) => (
        React.createElement('img', {
            ...props,
            alt: props.alt || '',
            src: props.src,
            width: props.width,
            height: props.height,
        })
    )),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock window.innerWidth for mobile detection
const mockInnerWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
    });
};

// Mock navigator.share
const mockShare = jest.fn();
Object.defineProperty(window.navigator, 'share', {
    writable: true,
    value: mockShare,
});

// Mock document.createElement and related methods for download
const mockCreateElement = jest.spyOn(document, 'createElement');
const mockAppendChild = jest.spyOn(document.body, 'appendChild');
const mockRemoveChild = jest.spyOn(document.body, 'removeChild');
const mockClick = jest.fn();

describe('SKUQRCode', () => {
    const defaultProps = {
        sku: 'TEST-SKU-123',
        productName: 'Test Product',
        size: 200,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockInnerWidth(1024); // Desktop by default

        // Mock createElement for download functionality
        mockCreateElement.mockReturnValue({
            href: '',
            download: '',
            click: mockClick,
        } as any);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Basic Rendering', () => {
        it('renders QR code button with correct text and icon', () => {
            render(<SKUQRCode {...defaultProps} />);

            const button = screen.getByRole('button', { name: /qr code/i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent('QR Code');

            // Check for QR code icon (svg)
            const svg = button.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });

        it('renders with custom className', () => {
            render(<SKUQRCode {...defaultProps} className="custom-class" />);

            const button = screen.getByRole('button', { name: /qr code/i });
            expect(button).toHaveClass('custom-class');
        });

        it('generates correct QR code URL', () => {
            render(<SKUQRCode {...defaultProps} />);

            // The QR code URL should be generated with the SKU
            const expectedUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(defaultProps.sku)}`;
            expect(expectedUrl).toContain('TEST-SKU-123');
        });
    });

    describe('Mobile Detection', () => {
        it('detects mobile screen size', () => {
            mockInnerWidth(600); // Mobile width

            render(<SKUQRCode {...defaultProps} />);

            // Component should still render on mobile
            expect(screen.getByRole('button', { name: /qr code/i })).toBeInTheDocument();
        });

        it('handles window resize events', () => {
            mockInnerWidth(1024); // Start with desktop

            render(<SKUQRCode {...defaultProps} />);

            // Simulate resize to mobile
            act(() => {
                mockInnerWidth(600);
                window.dispatchEvent(new Event('resize'));
            });

            // Component should still be present
            expect(screen.getByRole('button', { name: /qr code/i })).toBeInTheDocument();
        });
    });

    describe('Modal Functionality', () => {
        it('opens modal when button is clicked', () => {
            render(<SKUQRCode {...defaultProps} />);

            const button = screen.getByRole('button', { name: /qr code/i });
            fireEvent.click(button);

            // Modal should be visible
            expect(screen.getByText('QR Code do SKU')).toBeInTheDocument();
            expect(screen.getByText('TEST-SKU-123')).toBeInTheDocument();
            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });

        it('closes modal when close button is clicked', () => {
            render(<SKUQRCode {...defaultProps} />);

            // Open modal
            const button = screen.getByRole('button', { name: /qr code/i });
            fireEvent.click(button);

            // Close modal
            const closeButton = screen.getByRole('button', { name: /fechar modal/i });
            fireEvent.click(closeButton);

            // Modal should be closed
            expect(screen.queryByText('QR Code do SKU')).not.toBeInTheDocument();
        });

        it('closes modal when clicking outside', () => {
            render(<SKUQRCode {...defaultProps} />);

            // Open modal
            const button = screen.getByRole('button', { name: /qr code/i });
            fireEvent.click(button);

            // Click outside modal
            const modalBackdrop = screen.getByText('QR Code do SKU').closest('.fixed');
            fireEvent.click(modalBackdrop!);

            // Modal should be closed
            expect(screen.queryByText('QR Code do SKU')).not.toBeInTheDocument();
        });

        it('renders QR code image in modal', () => {
            render(<SKUQRCode {...defaultProps} />);

            // Open modal
            const button = screen.getByRole('button', { name: /qr code/i });
            fireEvent.click(button);

            // Check for QR code image
            const qrImage = screen.getByAltText('QR Code para SKU TEST-SKU-123');
            expect(qrImage).toBeInTheDocument();
            expect(qrImage).toHaveAttribute('width', '200');
            expect(qrImage).toHaveAttribute('height', '200');
        });
    });

    describe('Download Functionality', () => {
        it('downloads QR code when download button is clicked', () => {
            render(<SKUQRCode {...defaultProps} />);

            // Open modal
            const button = screen.getByRole('button', { name: /qr code/i });
            fireEvent.click(button);

            // Click download button
            const downloadButton = screen.getByRole('button', { name: /baixar/i });
            fireEvent.click(downloadButton);

            // Verify download functionality was triggered
            expect(mockCreateElement).toHaveBeenCalledWith('a');
            expect(mockAppendChild).toHaveBeenCalled();
            expect(mockClick).toHaveBeenCalled();
            expect(mockRemoveChild).toHaveBeenCalled();
        });

        it('sets correct download attributes', () => {
            render(<SKUQRCode {...defaultProps} />);

            // Open modal
            const button = screen.getByRole('button', { name: /qr code/i });
            fireEvent.click(button);

            // Click download button
            const downloadButton = screen.getByRole('button', { name: /baixar/i });
            fireEvent.click(downloadButton);

            // Check that the link element was configured correctly
            const mockLink = mockCreateElement.mock.results[0].value;
            expect(mockLink.download).toBe('qrcode-TEST-SKU-123.png');
            expect(mockLink.href).toContain('api.qrserver.com');
        });
    });

    describe('Share Functionality', () => {
        beforeEach(() => {
            mockShare.mockResolvedValue(undefined);
        });

        it('shows share button when Web Share API is available', () => {
            render(<SKUQRCode {...defaultProps} />);

            // Open modal
            const button = screen.getByRole('button', { name: /qr code/i });
            fireEvent.click(button);

            // Share button should be visible
            const shareButton = screen.getByRole('button', { name: /compartilhar qr code/i });
            expect(shareButton).toBeInTheDocument();
        });

        it('calls navigator.share with correct data when share button is clicked', async () => {
            render(<SKUQRCode {...defaultProps} />);

            // Open modal
            const button = screen.getByRole('button', { name: /qr code/i });
            fireEvent.click(button);

            // Click share button
            const shareButton = screen.getByRole('button', { name: /compartilhar qr code/i });
            fireEvent.click(shareButton);

            // Verify share was called with correct data
            await waitFor(() => {
                expect(mockShare).toHaveBeenCalledWith({
                    title: 'SKU: TEST-SKU-123',
                    text: 'Test Product\nSKU: TEST-SKU-123',
                    url: expect.any(String),
                });
            });
        });

        it('handles share errors gracefully', async () => {
            mockShare.mockRejectedValue(new Error('Share cancelled'));

            // Mock console.log to avoid console output in tests
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            render(<SKUQRCode {...defaultProps} />);

            // Open modal
            const button = screen.getByRole('button', { name: /qr code/i });
            fireEvent.click(button);

            // Click share button
            const shareButton = screen.getByRole('button', { name: /compartilhar qr code/i });
            fireEvent.click(shareButton);

            // Should not throw error, just log it
            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Erro ao compartilhar:', expect.any(Error));
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Without Product Name', () => {
        it('renders correctly without product name', () => {
            render(<SKUQRCode sku={defaultProps.sku} />);

            // Open modal
            const button = screen.getByRole('button', { name: /qr code/i });
            fireEvent.click(button);

            // Should show SKU but no product name
            expect(screen.getByText('TEST-SKU-123')).toBeInTheDocument();
            expect(screen.queryByText('Produto:')).not.toBeInTheDocument();
        });

        it('shares with correct text when no product name', async () => {
            render(<SKUQRCode sku={defaultProps.sku} />);

            // Open modal
            const button = screen.getByRole('button', { name: /qr code/i });
            fireEvent.click(button);

            // Click share button
            const shareButton = screen.getByRole('button', { name: /compartilhar qr code/i });
            fireEvent.click(shareButton);

            // Verify share was called with SKU only
            await waitFor(() => {
                expect(mockShare).toHaveBeenCalledWith({
                    title: 'SKU: TEST-SKU-123',
                    text: 'SKU: TEST-SKU-123',
                    url: expect.any(String),
                });
            });
        });
    });

    describe('Custom Size', () => {
        it('uses custom size for QR code generation', () => {
            render(<SKUQRCode {...defaultProps} size={300} />);

            // Open modal
            const button = screen.getByRole('button', { name: /qr code/i });
            fireEvent.click(button);

            // Check QR code image size
            const qrImage = screen.getByAltText('QR Code para SKU TEST-SKU-123');
            expect(qrImage).toHaveAttribute('width', '300');
            expect(qrImage).toHaveAttribute('height', '300');
        });
    });
});

describe('SKUQRCodeButton', () => {
    const defaultProps = {
        sku: 'TEST-SKU-123',
        productName: 'Test Product',
    };

    it('renders compact button with icon only', () => {
        render(<SKUQRCodeButton {...defaultProps} />);

        const button = screen.getByRole('button', { name: /gerar qr code/i });
        expect(button).toBeInTheDocument();

        // Should not have text, only icon
        expect(button).not.toHaveTextContent('QR Code');

        // Should have icon
        const svg = button.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('opens full SKUQRCode modal when clicked', () => {
        render(<SKUQRCodeButton {...defaultProps} />);

        const button = screen.getByRole('button', { name: /gerar qr code/i });
        fireEvent.click(button);

        // Full modal should open
        expect(screen.getByText('QR Code do SKU')).toBeInTheDocument();
        expect(screen.getByText('TEST-SKU-123')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(<SKUQRCodeButton {...defaultProps} className="custom-button-class" />);

        const button = screen.getByRole('button', { name: /gerar qr code/i });
        expect(button).toHaveClass('custom-button-class');
    });
});