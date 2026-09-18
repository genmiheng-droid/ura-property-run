/**
 * Serverless API Gateway / Index
 *
 * Location: /api/index.ts
 */

import { getUraStatus } from './ura';
import tokenHandler from './token';
import transactionsHandler from './transactions';
import uraHandler from './ura';

export default async function handler(req: any, res: any) {
  const query = req.query || {};
  const path = req.path || req.url || '';

  // Direct action queries: /api?action=token or /api?action=transactions
  if (query.action === 'token') {
    return tokenHandler(req, res);
  }

  if (query.action === 'transactions' || query.service === 'PMI_Resi_Transaction') {
    return transactionsHandler(req, res);
  }

  if (query.action === 'ura' || query.action === 'invoke') {
    return uraHandler(req, res);
  }

  // Path routing fallback if URL path is provided
  if (path.includes('/token')) {
    return tokenHandler(req, res);
  }
  if (path.includes('/transactions')) {
    return transactionsHandler(req, res);
  }
  if (path.includes('/ura')) {
    return uraHandler(req, res);
  }

  // Gateway documentation & status
  const status = getUraStatus();
  return res.status(200).json({
    name: 'Singapore Private Property Prices - Serverless URA Gateway',
    version: '1.0.0',
    status: 'online',
    uraConnection: status,
    endpoints: {
      dailyToken: {
        method: 'GET',
        path: '/api/token',
        description: "Trade AccessKey for today's Token (GET https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1 with header AccessKey: <URA_ACCESS_KEY>)",
      },
      transactions: {
        method: 'GET',
        path: '/api/transactions?batch=1',
        description: "Data calls sending BOTH headers (AccessKey and Token) to https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=1",
      },
      uraUnified: {
        method: 'GET',
        path: '/api/ura?action=status|token|transactions|invoke',
        description: 'Unified URA data service connector with automatic token caching and retrieval',
      },
    },
    setupInstructions: status.configured
      ? 'URA_ACCESS_KEY is configured in environment.'
      : 'URA_ACCESS_KEY is not set. Add URA_ACCESS_KEY to your environment variables or .env file.',
    timestamp: new Date().toISOString(),
  });
}
