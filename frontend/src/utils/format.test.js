import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, statusLabel } from './format.js';

describe('format utils', () => {
  it('formats currency as INR with no decimals', () => {
    expect(formatCurrency(1500)).toContain('1,500');
  });

  it('formats numbers with Indian grouping', () => {
    expect(formatNumber(1234567)).toBe('12,34,567');
  });

  it('converts snake_case status into a title-cased label', () => {
    expect(statusLabel('out_of_stock')).toBe('Out Of Stock');
  });

  it('handles non-numeric input gracefully', () => {
    expect(formatCurrency(undefined)).toContain('0');
    expect(formatNumber(null)).toBe('0');
  });
});
