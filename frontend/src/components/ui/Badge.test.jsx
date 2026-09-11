import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from './Badge.jsx';

describe('Badge', () => {
  it('renders a human-readable label for a status value', () => {
    render(<Badge value="low_stock" />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('falls back to the raw value for unknown statuses', () => {
    render(<Badge value="mystery" />);
    expect(screen.getByText('mystery')).toBeInTheDocument();
  });
});
