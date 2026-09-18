/**
 * TypeScript Interfaces for Singapore Private Property Prices & API Integration
 */

export type MarketSegment = 'CCR' | 'RCR' | 'OCR';

export type PropertyType =
  | 'Condominium'
  | 'Apartment'
  | 'Executive Condominium'
  | 'Terrace House'
  | 'Semi-Detached House'
  | 'Detached House'
  | 'Good Class Bungalow';

export type TenureType = 'Freehold' | '99-year Leasehold' | '999-year Leasehold' | 'Other';

export type SaleType = 'New Sale' | 'Resale' | 'Sub Sale';

export interface SingaporeDistrict {
  districtCode: string; // e.g. "D01", "D09", "D15"
  name: string; // e.g. "Orchard, Cairnhill, River Valley"
  region: MarketSegment;
  postalSectors: string[]; // e.g. ["22", "23"]
}

export interface PropertyTransaction {
  id: string;
  projectName: string;
  streetName?: string;
  postalDistrict: string; // e.g. "D09"
  marketSegment: MarketSegment;
  propertyType: PropertyType;
  tenure: TenureType;
  priceSgd: number; // e.g. 2450000
  areaSqft: number; // e.g. 1150
  areaSqm?: number; // e.g. 106.8
  psf: number; // Price per square foot in SGD e.g. 2130
  floorLevel?: string; // e.g. "11 to 15", "Ground", "Penthouse"
  bedroomCount?: number;
  completionYear?: number | null; // TOP year
  transactionDate: string; // e.g. "2025-02-14"
  typeOfSale: SaleType;
  developer?: string;
}

export interface MarketSummaryData {
  medianPsf: number | null;
  medianPrice: number | null;
  totalTransactions: number;
  ccrMedianPsf: number | null;
  rcrMedianPsf: number | null;
  ocrMedianPsf: number | null;
  quarterOverQuarterChange: number | null; // e.g. +1.4%
  yearOverYearChange: number | null;
  latestQuarter: string;
  lastUpdated: string | null;
}

export interface MarketTrendPoint {
  quarter: string; // e.g. "2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4"
  ccrPsf: number | null;
  rcrPsf: number | null;
  ocrPsf: number | null;
  overallPsf: number | null;
  volume?: number;
}

export interface PropertyFilterParams {
  searchQuery: string;
  marketSegment: 'ALL' | MarketSegment;
  district: string; // 'ALL' or 'D01'..'D28'
  propertyType: 'ALL' | PropertyType | 'Landed';
  tenure: 'ALL' | 'Freehold' | 'Leasehold';
  minPrice: number | '';
  maxPrice: number | '';
  minPsf: number | '';
  maxPsf: number | '';
  sortBy: 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc' | 'psf_desc' | 'psf_asc';
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  appliedFilters?: Record<string, string | number>;
  dataSource?: string;
  timestamp?: string;
}

export interface BackendConnectionStatus {
  isConnected: boolean;
  isChecking: boolean;
  mode: 'placeholder' | 'connected' | 'error';
  endpointUrl: string;
  latencyMs: number | null;
  lastChecked: Date | null;
  recordsCount: number;
  errorMessage?: string;
}
