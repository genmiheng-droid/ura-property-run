/**
 * Serverless Endpoint: Get Daily URA Token
 *
 * Location: /api/token.ts
 *
 * Each day, trade the AccessKey for today's Token:
 * GET https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1
 * Header: AccessKey: <URA_ACCESS_KEY>
 *
 * Note: URA_ACCESS_KEY is read dynamically from process.env.URA_ACCESS_KEY.
 */

import { getDailyToken, getUraStatus } from './ura';

export default async function handler(req: any, res: any) {
  const force = req.query?.force === 'true' || req.query?.force === '1';

  const result = await getDailyToken({ forceRefresh: force });

  if (!result.success) {
    const statusCode = result.error === 'URA_ACCESS_KEY_MISSING' ? 400 : 502;
    return res.status(statusCode).json({
      ...result,
      status: getUraStatus(),
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(200).json({
    ...result,
    timestamp: new Date().toISOString(),
  });
}
