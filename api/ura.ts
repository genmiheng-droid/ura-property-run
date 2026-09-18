/**
 * Serverless URA (Urban Redevelopment Authority) Data Service Connector
 *
 * Location: /api/ura.ts
 *
 * URA Data Service Flow:
 * 1. Each day, trade URA_ACCESS_KEY for today's daily Token:
 *    GET https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1
 *    Header: AccessKey: <URA_ACCESS_KEY>
 *
 * 2. Data queries require BOTH headers (AccessKey and Token):
 *    GET https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=1
 *    Header: AccessKey: <URA_ACCESS_KEY>
 *    Header: Token: <URA_DAILY_TOKEN>
 *
 * Note: URA_ACCESS_KEY is loaded dynamically from process.env.URA_ACCESS_KEY.
 * No API keys are hardcoded.
 */

export const URA_ENDPOINTS = {
  INSERT_NEW_TOKEN: 'https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1',
  INVOKE_DATA_SERVICE: 'https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1',
} as const;

export interface UraTokenCache {
  token: string | null;
  dateStr: string | null;
  timestamp: number | null;
}

// In-memory daily token cache (valid for calendar day in Singapore SGT)
let cachedDailyToken: UraTokenCache = {
  token: null,
  dateStr: null,
  timestamp: null,
};

/**
 * Returns the current date formatted as YYYY-MM-DD in Singapore Time (UTC+8).
 * URA daily tokens are renewed once per calendar day.
 */
export function getSingaporeDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Singapore',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Retrieves the URA Access Key from environment variables.
 * Never hardcodes credentials.
 */
export function getUraAccessKey(): string | null {
  const key = process.env.URA_ACCESS_KEY;
  if (!key || key.trim() === '' || key === 'YOUR_URA_DEVELOPER_KEY') {
    return null;
  }
  return key.trim();
}

export interface DailyTokenResponse {
  success: boolean;
  token?: string;
  date?: string;
  cached?: boolean;
  error?: string;
  message?: string;
  raw?: any;
}

/**
 * Step 1: Trades the AccessKey for today's Token.
 * Cached in memory per calendar day unless forceRefresh is true.
 */
export async function getDailyToken(options?: { forceRefresh?: boolean }): Promise<DailyTokenResponse> {
  const accessKey = getUraAccessKey();
  if (!accessKey) {
    return {
      success: false,
      error: 'URA_ACCESS_KEY_MISSING',
      message: 'URA_ACCESS_KEY environment variable is not configured. Set URA_ACCESS_KEY in your environment or .env file.',
    };
  }

  const todayStr = getSingaporeDateString();

  // Return cached token if still valid for today
  if (!options?.forceRefresh && cachedDailyToken.token && cachedDailyToken.dateStr === todayStr) {
    return {
      success: true,
      token: cachedDailyToken.token,
      date: cachedDailyToken.dateStr,
      cached: true,
      message: "Reused today's cached token (Singapore date: " + todayStr + ')',
    };
  }

  try {
    const response = await fetch(URA_ENDPOINTS.INSERT_NEW_TOKEN, {
      method: 'GET',
      headers: {
        AccessKey: accessKey,
        'User-Agent': 'Singapore-Property-Prices-Connector/1.0',
        Accept: 'application/json',
      },
    });

    const data: any = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: 'URA_HTTP_ERROR',
        message: `URA API responded with HTTP status ${response.status}`,
        raw: data,
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'EMPTY_RESPONSE',
        message: 'URA API returned an empty response',
      };
    }

    // URA returns { Status: 'Success', Result: 'TOKEN_STRING', Message: '...' }
    if (data.Status === 'Success' && data.Result) {
      cachedDailyToken = {
        token: data.Result,
        dateStr: todayStr,
        timestamp: Date.now(),
      };

      return {
        success: true,
        token: data.Result,
        date: todayStr,
        cached: false,
        message: data.Message || "Successfully generated today's URA token",
        raw: data,
      };
    }

    return {
      success: false,
      error: data.Status || 'URA_TOKEN_ERROR',
      message: data.Message || 'Failed to trade AccessKey for token from URA',
      raw: data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'NETWORK_EXCEPTION',
      message: err.message || 'Failed to connect to URA token endpoint',
    };
  }
}

export interface FetchUraDataParams {
  service?: string; // Default: 'PMI_Resi_Transaction'
  batch?: number | string; // Default: 1 (batches 1-4 for residential transactions)
  forceRefreshToken?: boolean;
}

export interface UraDataResponse {
  success: boolean;
  service: string;
  batch: number;
  data?: any;
  resultCount?: number;
  error?: string;
  message?: string;
  meta?: {
    tokenDate?: string;
    tokenCached?: boolean;
    timestamp: string;
  };
}

/**
 * Step 2: Executes data queries sending BOTH headers: AccessKey and Token
 * Default endpoint:
 * https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=1
 */
export async function fetchUraData(params?: FetchUraDataParams): Promise<UraDataResponse> {
  const service = params?.service || 'PMI_Resi_Transaction';
  const batch = Number(params?.batch) || 1;
  const accessKey = getUraAccessKey();

  if (!accessKey) {
    return {
      success: false,
      service,
      batch,
      error: 'URA_ACCESS_KEY_MISSING',
      message: 'URA_ACCESS_KEY environment variable is not configured. Set URA_ACCESS_KEY in your environment or .env file.',
    };
  }

  // Obtain today's token
  const tokenResult = await getDailyToken({ forceRefresh: params?.forceRefreshToken });
  if (!tokenResult.success || !tokenResult.token) {
    return {
      success: false,
      service,
      batch,
      error: tokenResult.error || 'TOKEN_ACQUISITION_FAILED',
      message: tokenResult.message || 'Could not acquire daily token from URA',
    };
  }

  const queryUrl = `${URA_ENDPOINTS.INVOKE_DATA_SERVICE}?service=${encodeURIComponent(service)}&batch=${batch}`;

  try {
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        AccessKey: accessKey,
        Token: tokenResult.token,
        'User-Agent': 'Singapore-Property-Prices-Connector/1.0',
        Accept: 'application/json',
      },
    });

    const data: any = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        service,
        batch,
        error: 'URA_HTTP_ERROR',
        message: `URA API responded with HTTP status ${response.status}`,
        data,
      };
    }

    if (!data) {
      return {
        success: false,
        service,
        batch,
        error: 'EMPTY_RESPONSE',
        message: 'URA API returned an empty response payload',
      };
    }

    // URA returns { Status: 'Success', Result: [ ... ] }
    if (data.Status === 'Success') {
      const items = Array.isArray(data.Result) ? data.Result : [];
      return {
        success: true,
        service,
        batch,
        data: data.Result,
        resultCount: items.length,
        message: data.Message || `Successfully fetched ${items.length} records from URA (${service}, batch ${batch})`,
        meta: {
          tokenDate: tokenResult.date,
          tokenCached: tokenResult.cached,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // If URA returned invalid token, clear cache once and retry if not forced
    if (data.Message && data.Message.toLowerCase().includes('token') && !params?.forceRefreshToken) {
      cachedDailyToken = { token: null, dateStr: null, timestamp: null };
      return fetchUraData({ ...params, forceRefreshToken: true });
    }

    return {
      success: false,
      service,
      batch,
      error: data.Status || 'URA_API_ERROR',
      message: data.Message || 'URA API returned an error',
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      service,
      batch,
      error: 'NETWORK_EXCEPTION',
      message: err.message || 'Failed to fetch data from URA API',
    };
  }
}

/**
 * Returns connection diagnostic status without revealing secret keys.
 */
export function getUraStatus() {
  const accessKey = getUraAccessKey();
  const todayStr = getSingaporeDateString();

  return {
    configured: !!accessKey,
    keyConfigured: !!accessKey,
    keyLength: accessKey ? accessKey.length : 0,
    singaporeDate: todayStr,
    cachedTokenAvailable: !!cachedDailyToken.token && cachedDailyToken.dateStr === todayStr,
    cachedTokenDate: cachedDailyToken.dateStr,
    cachedTokenAgeMinutes: cachedDailyToken.timestamp
      ? Math.round((Date.now() - cachedDailyToken.timestamp) / 60000)
      : null,
    endpoints: {
      token: URA_ENDPOINTS.INSERT_NEW_TOKEN,
      dataService: `${URA_ENDPOINTS.INVOKE_DATA_SERVICE}?service=PMI_Resi_Transaction&batch=1`,
    },
  };
}

/**
 * Helper to convert URA contractDate "MMYY" (e.g. "0424" -> "2024-04-15")
 */
function parseUraContractDate(mmyy: string): string {
  if (!mmyy || mmyy.length < 4) return new Date().toISOString().slice(0, 10);
  const mm = mmyy.slice(0, 2);
  const yy = mmyy.slice(2, 4);
  const fullYear = parseInt(yy, 10) > 70 ? `19${yy}` : `20${yy}`;
  return `${fullYear}-${mm}-15`;
}

/**
 * Maps raw URA PMI_Resi_Transaction projects array into standardized PropertyTransactionItem objects.
 */
export function transformUraToProperties(uraProjects: any[]): any[] {
  if (!Array.isArray(uraProjects)) return [];

  const items: any[] = [];

  for (const proj of uraProjects) {
    const projectName = proj.project || 'Private Residential';
    const streetName = proj.street || '';
    const marketSegment = proj.marketSegment || 'OCR';
    const txList = Array.isArray(proj.transaction) ? proj.transaction : [];

    txList.forEach((tx: any, idx: number) => {
      const areaSqm = parseFloat(tx.area) || 0;
      const areaSqft = Math.round(areaSqm * 10.7639);
      const price = parseFloat(tx.price) || 0;
      const psf = areaSqft > 0 ? Math.round(price / areaSqft) : 0;
      const rawDistrict = (tx.district || '').toString().padStart(2, '0');
      const district = rawDistrict ? `D${rawDistrict}` : 'D01';

      // typeOfSale: 1 = New Sale, 2 = Sub Sale, 3 = Resale
      const saleTypeMap: Record<string, string> = {
        '1': 'New Sale',
        '2': 'Sub Sale',
        '3': 'Resale',
      };

      const saleType = saleTypeMap[tx.typeOfSale] || 'Resale';

      items.push({
        id: `ura-${proj.project || 'p'}-${tx.contractDate || ''}-${tx.floorRange || ''}-${idx}`.replace(/\s+/g, '-'),
        projectName,
        streetName,
        district,
        marketSegment,
        propertyType: tx.propertyType || 'Condominium',
        price,
        areaSqft,
        areaSqm,
        psf,
        tenure: tx.tenure || 'Freehold',
        floorLevel: tx.floorRange ? `Level ${tx.floorRange}` : 'Middle Floor',
        saleType,
        transactionDate: parseUraContractDate(tx.contractDate),
        source: 'URA REALIS',
      });
    });
  }

  return items;
}

/**
 * Standard Serverless Handler (Vercel / Cloud Functions / Express compatible)
 *
 * Query params:
 * - action: 'status' | 'token' | 'transactions' | 'invoke'
 * - batch: number (1-4, default 1)
 * - service: string (default 'PMI_Resi_Transaction')
 * - force: 'true' | 'false' (forces fresh token)
 * - format: 'raw' | 'properties' (default 'properties' for transactions)
 */
export default async function handler(req: any, res: any) {
  const query = req.query || {};
  const action = (query.action || 'status').toString().toLowerCase();
  const batch = Number(query.batch) || 1;
  const service = (query.service || 'PMI_Resi_Transaction').toString();
  const force = query.force === 'true' || query.force === '1';
  const format = query.format || 'properties';

  // 1. Status diagnostic
  if (action === 'status') {
    return res.status(200).json({
      success: true,
      uraConnection: getUraStatus(),
      documentation: {
        step1: 'GET /api/ura?action=token (trades AccessKey for today daily token)',
        step2: 'GET /api/ura?action=transactions&batch=1 (fetches residential transactions sending AccessKey and Token headers)',
        invokeCustom: 'GET /api/ura?action=invoke&service=PMI_Resi_Rental&batch=1',
      },
    });
  }

  // 2. Token exchange
  if (action === 'token') {
    const tokenResult = await getDailyToken({ forceRefresh: force });
    const statusCode = tokenResult.success ? 200 : (tokenResult.error === 'URA_ACCESS_KEY_MISSING' ? 400 : 502);
    return res.status(statusCode).json(tokenResult);
  }

  // 3. Transactions data fetch (default PMI_Resi_Transaction)
  if (action === 'transactions' || action === 'invoke') {
    const dataResult = await fetchUraData({
      service,
      batch,
      forceRefreshToken: force,
    });

    if (!dataResult.success) {
      const statusCode = dataResult.error === 'URA_ACCESS_KEY_MISSING' ? 400 : 502;
      return res.status(statusCode).json(dataResult);
    }

    // Optionally map into normalized PropertyTransactionItem array
    if (format === 'properties' && service === 'PMI_Resi_Transaction' && Array.isArray(dataResult.data)) {
      const properties = transformUraToProperties(dataResult.data);
      return res.status(200).json({
        success: true,
        service,
        batch,
        count: properties.length,
        data: properties,
        rawResultCount: dataResult.resultCount,
        meta: dataResult.meta,
      });
    }

    return res.status(200).json(dataResult);
  }

  return res.status(400).json({
    success: false,
    error: 'UNKNOWN_ACTION',
    message: `Invalid action "${action}". Use 'status', 'token', 'transactions', or 'invoke'.`,
  });
}

/**
 * Modern Web Fetch API compatible handler for Edge / Cloudflare Workers
 */
export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const action = (url.searchParams.get('action') || 'status').toLowerCase();
  const batch = Number(url.searchParams.get('batch')) || 1;
  const service = url.searchParams.get('service') || 'PMI_Resi_Transaction';
  const force = url.searchParams.get('force') === 'true';
  const format = url.searchParams.get('format') || 'properties';

  const mockRes = {
    statusCode: 200,
    body: '',
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(obj: any) {
      this.body = JSON.stringify(obj, null, 2);
      return new Response(this.body, {
        status: this.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  };

  const mockReq = {
    query: {
      action,
      batch,
      service,
      force: force ? 'true' : 'false',
      format,
    },
  };

  return (await handler(mockReq, mockRes)) as unknown as Response;
}
