import {
  ApiResponse,
  MarketSummaryData,
  MarketTrendPoint,
  PropertyFilterParams,
  PropertyTransaction,
} from '../types/property';

const STORAGE_KEY_API_URL = 'sg_property_api_base_url';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_API_URL);
    if (saved) return saved;
  }
  // Default to relative /api handled by Express or local proxy
  return '/api';
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (!url || url.trim() === '') {
      localStorage.removeItem(STORAGE_KEY_API_URL);
    } else {
      localStorage.setItem(STORAGE_KEY_API_URL, url.trim().replace(/\/$/, ''));
    }
  }
}

/**
 * Fetch property transaction records
 * Returns empty array by default until backend is connected
 */
export async function fetchProperties(
  params: Partial<PropertyFilterParams> = {}
): Promise<ApiResponse<PropertyTransaction[]>> {
  const baseUrl = getApiBaseUrl();
  const query = new URLSearchParams();

  if (params.searchQuery) query.set('search', params.searchQuery);
  if (params.marketSegment && params.marketSegment !== 'ALL') query.set('segment', params.marketSegment);
  if (params.district && params.district !== 'ALL') query.set('district', params.district);
  if (params.propertyType && params.propertyType !== 'ALL') query.set('propertyType', params.propertyType);
  if (params.tenure && params.tenure !== 'ALL') query.set('tenure', params.tenure);
  if (params.minPrice) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice) query.set('maxPrice', String(params.maxPrice));
  if (params.minPsf) query.set('minPsf', String(params.minPsf));
  if (params.maxPsf) query.set('maxPsf', String(params.maxPsf));
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const url = `${baseUrl}/properties${query.toString() ? `?${query.toString()}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`);
    }

    const json = await response.json();
    return json;
  } catch (error: any) {
    // If backend is not yet connected or network failed, return structured empty response
    return {
      success: false,
      message: error?.message || 'API endpoint not reachable. Backend placeholder active.',
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      dataSource: 'Placeholder (Offline / Unconnected)'
    };
  }
}

/**
 * Fetch aggregate market statistics
 */
export async function fetchMarketSummary(): Promise<ApiResponse<MarketSummaryData>> {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/market/summary`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Awaiting backend connection',
      data: {
        medianPsf: null,
        medianPrice: null,
        totalTransactions: 0,
        ccrMedianPsf: null,
        rcrMedianPsf: null,
        ocrMedianPsf: null,
        quarterOverQuarterChange: null,
        yearOverYearChange: null,
        latestQuarter: 'Unconnected',
        lastUpdated: null,
      }
    };
  }
}

/**
 * Fetch quarterly price trend lines
 */
export async function fetchMarketTrends(): Promise<ApiResponse<MarketTrendPoint[]>> {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/market/trends`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return {
      success: true,
      data: json.data?.trends || [],
    };
  } catch {
    return {
      success: false,
      data: [],
    };
  }
}

/**
 * Ping backend test connection
 */
export async function testBackendConnection(customUrl?: string): Promise<{
  reachable: boolean;
  statusText: string;
  latencyMs: number;
  data: any;
}> {
  const target = customUrl || getApiBaseUrl();
  const startTime = performance.now();
  try {
    const res = await fetch(`${target}/health`, {
      headers: { 'Accept': 'application/json' },
    });
    const latencyMs = Math.round(performance.now() - startTime);
    if (!res.ok) {
      return {
        reachable: false,
        statusText: `HTTP ${res.status}: ${res.statusText}`,
        latencyMs,
        data: null,
      };
    }
    const data = await res.json();
    return {
      reachable: true,
      statusText: 'Connected (200 OK)',
      latencyMs,
      data,
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      reachable: false,
      statusText: err?.message || 'Network connection failed',
      latencyMs,
      data: null,
    };
  }
}

/**
 * URA Connector status and test helpers
 */
export async function fetchUraServerlessStatus(): Promise<{
  configured: boolean;
  keyConfigured: boolean;
  cachedTokenAvailable: boolean;
  cachedTokenDate: string | null;
  singaporeDate: string;
  error?: string;
}> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/ura/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.ura || { configured: false, keyConfigured: false, cachedTokenAvailable: false, cachedTokenDate: null, singaporeDate: '' };
  } catch (err: any) {
    return {
      configured: false,
      keyConfigured: false,
      cachedTokenAvailable: false,
      cachedTokenDate: null,
      singaporeDate: '',
      error: err.message,
    };
  }
}

export async function testUraDailyToken(force = false): Promise<any> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/token${force ? '?force=true' : ''}`);
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function testUraTransactions(batch = 1, force = false): Promise<any> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/transactions?batch=${batch}${force ? '&force=true' : ''}`);
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Expected schema documentation for developers connecting a backend
 */
export const API_SCHEMA_BLUEPRINT = {
  endpoints: [
    {
      method: 'GET',
      path: '/api/token',
      description: "Serverless Daily Token Exchange (Step 1): Trades AccessKey for today's token at https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1 with header AccessKey: <URA_ACCESS_KEY>.",
      queryParams: [
        { name: 'force', type: 'boolean', example: 'true', description: 'Bypasses memory cache and requests a brand new token from URA' }
      ],
      sampleResponse: {
        success: true,
        token: "f92a18b..._sample_token_...39c0",
        date: "2025-01-20",
        cached: false,
        message: "Successfully generated today's URA token",
        timestamp: "2025-01-20T08:30:00.000Z"
      }
    },
    {
      method: 'GET',
      path: '/api/transactions',
      description: "Serverless Transactions Feed (Step 2): Invokes https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=1 sending BOTH AccessKey and Token headers.",
      queryParams: [
        { name: 'batch', type: 'number', example: 1, description: 'Batch index: 1, 2, 3, or 4 (URA splits residential transactions into 4 batches)' },
        { name: 'format', type: 'string', example: 'properties', description: '"properties" for normalized list or "raw" for direct URA Result payload' },
        { name: 'force', type: 'boolean', example: 'true', description: 'Forces token refresh if expired' }
      ],
      sampleResponse: {
        success: true,
        service: "PMI_Resi_Transaction",
        batch: 1,
        count: 1420,
        data: [
          {
            id: "ura-THE-CREST-0424-06-10-0",
            projectName: "THE CREST",
            streetName: "PRINCE CHARLES CRESCENT",
            district: "D03",
            marketSegment: "RCR",
            propertyType: "Condominium",
            price: 1850000,
            areaSqft: 775,
            areaSqm: 72,
            psf: 2387,
            tenure: "99 Yrs From 21/12/2012",
            floorLevel: "Level 06-10",
            saleType: "Resale",
            transactionDate: "2024-04-15",
            source: "URA REALIS"
          }
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/properties',
      description: 'Returns list of transacted private residential properties or active listings with pagination and filters.',
      queryParams: [
        { name: 'district', type: 'string', example: 'D09', description: 'Singapore postal district code (D01 to D28)' },
        { name: 'segment', type: 'string', example: 'CCR', description: 'Market segment: CCR (Core Central), RCR (Rest of Central), OCR (Outside Central)' },
        { name: 'propertyType', type: 'string', example: 'Condominium', description: 'Condominium | Apartment | Landed | Executive Condominium' },
        { name: 'tenure', type: 'string', example: 'Freehold', description: 'Freehold | 99-year Leasehold | 999-year Leasehold' },
        { name: 'minPrice', type: 'number', example: 1500000, description: 'Minimum price in SGD' },
        { name: 'maxPrice', type: 'number', example: 3500000, description: 'Maximum price in SGD' },
        { name: 'minPsf', type: 'number', example: 1800, description: 'Minimum Price Per Square Foot (S$/sqft)' },
        { name: 'maxPsf', type: 'number', example: 3000, description: 'Maximum Price Per Square Foot (S$/sqft)' },
        { name: 'search', type: 'string', example: 'Marina One', description: 'Search term for project name, street name, or postal code' },
        { name: 'page', type: 'number', example: 1, description: 'Page number' },
        { name: 'limit', type: 'number', example: 20, description: 'Items per page' }
      ],
      sampleResponse: {
        success: true,
        data: [
          {
            id: "tx-sg-10492",
            projectName: "Example Condominium",
            streetName: "Orchard Boulevard",
            postalDistrict: "D09",
            marketSegment: "CCR",
            propertyType: "Condominium",
            tenure: "Freehold",
            priceSgd: 2850000,
            areaSqft: 1206,
            areaSqm: 112.0,
            psf: 2363,
            floorLevel: "15 to 20",
            bedroomCount: 3,
            completionYear: 2020,
            transactionDate: "2025-01-20",
            typeOfSale: "Resale"
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      }
    },
    {
      method: 'GET',
      path: '/api/market/summary',
      description: 'Returns overall Singapore private residential market indices and medians.',
      sampleResponse: {
        success: true,
        data: {
          medianPsf: 2180,
          medianPrice: 1950000,
          totalTransactions: 3420,
          ccrMedianPsf: 2850,
          rcrMedianPsf: 2320,
          ocrMedianPsf: 1680,
          quarterOverQuarterChange: 1.2,
          yearOverYearChange: 4.8,
          latestQuarter: "2025-Q1",
          lastUpdated: "2025-03-01T00:00:00.000Z"
        }
      }
    },
    {
      method: 'GET',
      path: '/api/market/trends',
      description: 'Returns quarterly time-series PSF and volume data for historical analysis.',
      sampleResponse: {
        success: true,
        data: {
          trends: [
            { quarter: "2024-Q1", ccrPsf: 2750, rcrPsf: 2240, ocrPsf: 1610, overallPsf: 2080, volume: 3100 },
            { quarter: "2024-Q2", ccrPsf: 2790, rcrPsf: 2270, ocrPsf: 1635, overallPsf: 2110, volume: 3420 },
            { quarter: "2024-Q3", ccrPsf: 2810, rcrPsf: 2290, ocrPsf: 1650, overallPsf: 2140, volume: 2980 },
            { quarter: "2024-Q4", ccrPsf: 2840, rcrPsf: 2310, ocrPsf: 1670, overallPsf: 2165, volume: 3250 }
          ]
        }
      }
    }
  ]
};
