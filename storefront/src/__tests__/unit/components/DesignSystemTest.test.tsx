/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import DesignSystemTest from '@/components/DesignSystemTest';

describe('DesignSystemTest', () => {
    it('renders the design system test component', () => {
        render(<DesignSystemTest />);

        // Check main heading
        expect(screen.getByText('Yello Solar Hub Design System Test')).toBeInTheDocument();
    });

    it('renders gradient background test element', () => {
        render(<DesignSystemTest />);

        const gradientElement = screen.getByText('Gradient Background Test');
        expect(gradientElement).toBeInTheDocument();
        expect(gradientElement).toHaveClass('bg-gradient-yello');
    });

    it('renders gradient text test element', () => {
        render(<DesignSystemTest />);

        const gradientText = screen.getByText('Gradient Text Test');
        expect(gradientText).toBeInTheDocument();
        expect(gradientText).toHaveClass('text-gradient-yello', 'text-xl', 'font-bold');
    });

    it('renders primary button with correct classes', () => {
        render(<DesignSystemTest />);

        const button = screen.getByRole('button', { name: /primary button test/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('ysh-btn-primary');
    });

    it('renders card component with correct structure', () => {
        render(<DesignSystemTest />);

        // Check card content
        expect(screen.getByText('Card Test')).toBeInTheDocument();
        expect(screen.getByText('Testing Yello design system integration')).toBeInTheDocument();

        // Check card container has correct class
        const cardElement = screen.getByText('Card Test').closest('.ysh-card');
        expect(cardElement).toBeInTheDocument();
    });

    it('renders all design system elements in correct order', () => {
        render(<DesignSystemTest />);

        const container = screen.getByText('Yello Solar Hub Design System Test').closest('div');
        expect(container).toBeInTheDocument();

        // Check that all elements are present
        expect(screen.getByText('Gradient Background Test')).toBeInTheDocument();
        expect(screen.getByText('Gradient Text Test')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /primary button test/i })).toBeInTheDocument();
        expect(screen.getByText('Card Test')).toBeInTheDocument();
    });

    it('applies correct spacing and layout classes', () => {
        render(<DesignSystemTest />);

        const container = screen.getByText('Yello Solar Hub Design System Test').closest('div');
        expect(container).toHaveClass('p-8', 'space-y-4');
    });

    it('applies correct heading styles', () => {
        render(<DesignSystemTest />);

        const heading = screen.getByText('Yello Solar Hub Design System Test');
        expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-yello-500');
    });
});