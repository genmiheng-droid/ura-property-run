import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import uraHandler, {
  fetchUraData,
  getUraAccessKey,
  getUraStatus,
  transformUraToProperties,
} from './api/ura';
import tokenHandler from './api/token';
import transactionsHandler from './api/transactions';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    const uraStatus = getUraStatus();
    res.json({
      status: 'ok',
      service: 'Singapore Private Property Prices API Gateway',
      version: '1.1.0',
      dataConnected: uraStatus.configured,
      uraIntegration: uraStatus,
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/token (serverless daily token exchange)',
        'GET /api/transactions (serverless PMI_Resi_Transaction feed)',
        'GET /api/ura (serverless unified connector)',
        'GET /api/properties',
        'GET /api/properties/:id',
        'GET /api/market/summary',
        'GET /api/market/trends',
        'GET /api/districts'
      ]
    });
  });

  // Serverless URA Connection Endpoints
  // Step 1: Exchange AccessKey for daily token
  app.all('/api/token', (req, res) => tokenHandler(req, res));
  app.all('/api/ura/token', (req, res) => tokenHandler(req, res));

  // Step 2: Query URA PMI_Resi_Transaction with both headers
  app.all('/api/transactions', (req, res) => transactionsHandler(req, res));
  app.all('/api/ura/transactions', (req, res) => transactionsHandler(req, res));

  // Unified serverless router & status
  app.all('/api/ura', (req, res) => uraHandler(req, res));
  app.get('/api/ura/status', (req, res) => {
    res.json({
      success: true,
      ura: getUraStatus(),
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/properties - Returns live URA transactions if key is configured, else placeholder
  app.get('/api/properties', async (req, res) => {
    const { district, segment, propertyType, search, page = '1', limit = '20', batch = '1' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;

    // Check if user has provided URA_ACCESS_KEY
    if (getUraAccessKey()) {
      try {
        const uraResult = await fetchUraData({
          service: 'PMI_Resi_Transaction',
          batch: Number(batch) || 1,
        });

        if (uraResult.success && Array.isArray(uraResult.data)) {
          let properties = transformUraToProperties(uraResult.data);

          // Apply filters
          if (district && district !== 'all') {
            properties = properties.filter((p: any) => p.district.toLowerCase() === (district as string).toLowerCase());
          }
          if (segment && segment !== 'all') {
            properties = properties.filter((p: any) => p.marketSegment.toLowerCase() === (segment as string).toLowerCase());
          }
          if (propertyType && propertyType !== 'all') {
            properties = properties.filter((p: any) => p.propertyType.toLowerCase() === (propertyType as string).toLowerCase());
          }
          if (search) {
            const query = (search as string).toLowerCase();
            properties = properties.filter((p: any) =>
              p.projectName.toLowerCase().includes(query) ||
              p.streetName.toLowerCase().includes(query) ||
              p.district.toLowerCase().includes(query)
            );
          }

          const total = properties.length;
          const totalPages = Math.ceil(total / limitNum);
          const startIndex = (pageNum - 1) * limitNum;
          const paginatedData = properties.slice(startIndex, startIndex + limitNum);

          return res.json({
            success: true,
            message: `Loaded ${total} live transactions from URA REALIS (Batch ${batch})`,
            data: paginatedData,
            pagination: {
              page: pageNum,
              limit: limitNum,
              total,
              totalPages,
            },
            appliedFilters: {
              district: district || 'all',
              segment: segment || 'all',
              propertyType: propertyType || 'all',
              search: search || '',
            },
            dataSource: 'Singapore URA REALIS (Live API)',
            meta: uraResult.meta,
          });
        }
      } catch (err) {
        console.error('Error fetching live URA properties in /api/properties:', err);
      }
    }

    // Default zero-data placeholder if no key configured or error
    res.json({
      success: true,
      message: 'Zero-data placeholder active. Set URA_ACCESS_KEY in your environment to stream live Singapore URA residential transactions.',
      data: [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: 0,
        totalPages: 0,
      },
      appliedFilters: {
        district: district || 'all',
        segment: segment || 'all',
        propertyType: propertyType || 'all',
        search: search || '',
      },
      dataSource: 'Awaiting URA_ACCESS_KEY Feed',
      uraIntegration: getUraStatus(),
    });
  });

  // GET /api/properties/:id - Placeholder for specific property transaction or project details
  app.get('/api/properties/:id', (req, res) => {
    const { id } = req.params;
    res.json({
      success: false,
      message: `Placeholder endpoint active. Record ${id} not found because no database is connected yet.`,
      data: null,
    });
  });

  // GET /api/market/summary - Aggregate market summary (Median PSF, price indices, volumes)
  app.get('/api/market/summary', (req, res) => {
    res.json({
      success: true,
      message: 'Placeholder endpoint active. Aggregate Singapore private residential market data awaiting backend feed.',
      data: {
        medianPsf: null,
        medianPrice: null,
        totalTransactions: 0,
        ccrMedianPsf: null,
        rcrMedianPsf: null,
        ocrMedianPsf: null,
        quarterOverQuarterChange: null,
        yearOverYearChange: null,
        latestQuarter: 'Awaiting Feed',
        lastUpdated: null,
      }
    });
  });

  // GET /api/market/trends - Historical quarterly price per sqft (PSF) trends across CCR, RCR, OCR
  app.get('/api/market/trends', (req, res) => {
    res.json({
      success: true,
      message: 'Placeholder endpoint active. Time-series PSF data awaiting backend feed.',
      data: {
        trends: [],
        note: 'Provide an array of { quarter: "2024Q1", ccrPsf: number, rcrPsf: number, ocrPsf: number, overallPsf: number }'
      }
    });
  });

  // GET /api/districts - District level price breakdowns
  app.get('/api/districts', (req, res) => {
    res.json({
      success: true,
      message: 'Placeholder endpoint active. District-level aggregate data awaiting backend feed.',
      data: []
    });
  });

  // POST /api/ping-backend - Developer test helper
  app.post('/api/ping-backend', (req, res) => {
    const { url } = req.body || {};
    res.json({
      success: true,
      status: 'reachable',
      targetUrl: url || 'local express placeholder server',
      latencyMs: 12,
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Singapore Property Prices server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
