import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers with Arabic numerals or standard tabular digits with comma separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format currency in Sudanese Pounds (ج.س)
 */
export function formatCurrency(amount: number, showCurrency = true): string {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
  return showCurrency ? `${formatted} ج.س` : formatted;
}
