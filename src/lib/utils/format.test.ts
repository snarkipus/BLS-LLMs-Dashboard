import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatNumber, formatDate, debounce } from './format';

describe('formatNumber', () => {
  it('should format integers', () => {
    expect(formatNumber(1000)).toBe('1,000');
  });

  it('should format decimals', () => {
    expect(formatNumber(1000.12345)).toBe('1,000.12');
  });

  it('should format zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should format negative numbers', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
  });
});

describe('formatDate', () => {
  it('should format a date', () => {
    const date = new Date(Date.UTC(2024, 0, 15));
    const result = formatDate(date);
    expect(result).toMatch(/Jan 15, 2024/);
  });

  it('should handle different months', () => {
    const date = new Date(Date.UTC(2024, 11, 25));
    const result = formatDate(date);
    expect(result).toMatch(/Dec 25, 2024/);
  });

  it('should handle leap years', () => {
    const date = new Date(Date.UTC(2024, 1, 29));
    const result = formatDate(date);
    expect(result).toMatch(/Feb 29, 2024/);
  });
});

describe('debounce', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay function execution', () => {
    vi.useFakeTimers();
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should reset timer on subsequent calls', () => {
    vi.useFakeTimers();
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);
    expect(mockFn).not.toHaveBeenCalled();

    debouncedFn();
    vi.advanceTimersByTime(50);
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to debounced function', () => {
    vi.useFakeTimers();
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('test', 123);

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith('test', 123);
  });
});
