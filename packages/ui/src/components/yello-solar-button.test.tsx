
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { YelloSolarButton } from './yello-solar-button';

describe('YelloSolarButton', () => {
  it('should not have a transparent border when the outline variant is selected', () => {
    render(<YelloSolarButton variant="outline">Click me</YelloSolarButton>);
    const button = screen.getByRole('button', { name: /click me/i });

    // Check if the button's classes include border-transparent
    expect(button).not.toHaveClass('border-transparent');
  });
});
