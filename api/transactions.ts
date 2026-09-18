/**
 * Serverless Endpoint: URA Residential Property Transactions
 *
 * Location: /api/transactions.ts
 *
 * Data calls send BOTH headers, AccessKey and Token:
 * GET https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=1
 *
 * Query Parameters:
 * - batch: number (1, 2, 3, or 4 - default is 1)
 * - format: 'properties' | 'raw' (default is 'properties')
 * - force: 'true' (forces renewal of daily token)
 */

import { fetchUraData, transformUraToProperties, getUraStatus } from './ura';

export default async function handler(req: any, res: any) {
  const query = req.query || {};
  const batch = Number(query.batch) || 1;
  const format = query.format || 'properties';
  const force = query.force === 'true' || query.force === '1';

  const result = await fetchUraData({
    service: 'PMI_Resi_Transaction',
    batch,
    forceRefreshToken: force,
  });

  if (!result.success) {
    const statusCode = result.error === 'URA_ACCESS_KEY_MISSING' ? 400 : 502;
    return res.status(statusCode).json({
      ...result,
      status: getUraStatus(),
      timestamp: new Date().toISOString(),
    });
  }

  // Format as standardized PropertyTransactionItem objects for frontend consumption
  if (format === 'properties' && Array.isArray(result.data)) {
    const properties = transformUraToProperties(result.data);
    return res.status(200).json({
      success: true,
      service: 'PMI_Resi_Transaction',
      batch,
      count: properties.length,
      data: properties,
      rawProjectCount: result.resultCount,
      meta: result.meta,
      timestamp: new Date().toISOString(),
    });
  }

  // Otherwise return raw URA Result payload
  return res.status(200).json({
    ...result,
    timestamp: new Date().toISOString(),
  });
}
