import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button';

describe('Button', () => {
  it('renders children and responds to click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies size and variant classes', () => {
    render(<Button variant="secondary" size="lg">Hi</Button>);
    const btn = screen.getByRole('button', { name: /hi/i });
    expect(btn).toHaveClass('text-lg');
  });
});
