/**
 * Utility functions for formatting Singapore currency, area, and dates
 */

export function formatSgd(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPsf(psf: number | null | undefined): string {
  if (psf === null || psf === undefined || isNaN(psf)) {
    return '—';
  }
  return `S$${Math.round(psf).toLocaleString('en-SG')} /sqft`;
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '—';
  }
  return num.toLocaleString('en-SG');
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Calculate Singapore Buyer's Stamp Duty (BSD) for Residential Properties (effective from 15 Feb 2023)
 * Tier 1: First $180k @ 1%
 * Tier 2: Next $180k ($180k - $360k) @ 2%
 * Tier 3: Next $640k ($360k - $1M) @ 3%
 * Tier 4: Next $500k ($1M - $1.5M) @ 4%
 * Tier 5: Next $1.5M ($1.5M - $3.0M) @ 5%
 * Tier 6: Amounts exceeding $3.0M @ 6%
 */
export function calculateSingaporeBsd(price: number): number {
  if (!price || price <= 0) return 0;
  let bsd = 0;

  // First 180,000 @ 1%
  const t1 = Math.min(price, 180000);
  bsd += t1 * 0.01;
  if (price <= 180000) return Math.round(bsd);

  // Next 180,000 @ 2%
  const t2 = Math.min(price - 180000, 180000);
  bsd += t2 * 0.02;
  if (price <= 360000) return Math.round(bsd);

  // Next 640,000 @ 3%
  const t3 = Math.min(price - 360000, 640000);
  bsd += t3 * 0.03;
  if (price <= 1000000) return Math.round(bsd);

  // Next 500,000 @ 4%
  const t4 = Math.min(price - 1000000, 500000);
  bsd += t4 * 0.04;
  if (price <= 1500000) return Math.round(bsd);

  // Next 1,500,000 @ 5%
  const t5 = Math.min(price - 1500000, 1500000);
  bsd += t5 * 0.05;
  if (price <= 3000000) return Math.round(bsd);

  // Exceeding 3,000,000 @ 6%
  const t6 = price - 3000000;
  bsd += t6 * 0.06;

  return Math.round(bsd);
}
