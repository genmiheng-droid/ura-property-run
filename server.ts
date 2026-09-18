import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Singapore Private Property Prices API Placeholder',
      version: '1.0.0',
      dataConnected: false,
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/properties',
        'GET /api/properties/:id',
        'GET /api/market/summary',
        'GET /api/market/trends',
        'GET /api/districts'
      ]
    });
  });

  // GET /api/properties - Placeholder endpoint for private property transactions & listings
  // Query parameters:
  // - district: string (e.g. "D09", "D10", "all")
  // - segment: string ("CCR" | "RCR" | "OCR" | "all")
  // - propertyType: string ("Condominium" | "Apartment" | "Landed" | "all")
  // - minPrice, maxPrice: number
  // - minPsf, maxPsf: number
  // - tenure: string ("Freehold" | "Leasehold" | "all")
  // - search: string
  // - page: number, limit: number
  app.get('/api/properties', (req, res) => {
    const { district, segment, propertyType, search, page = '1', limit = '20' } = req.query;

    // Notice: As requested, no data is pre-populated here.
    // Replace this array with real queries to your database (e.g. PostgreSQL, Cloud SQL, MongoDB)
    // or proxy calls to Singapore URA REALIS API / PropertyGuru / 99.co data feeds.
    res.json({
      success: true,
      message: 'Placeholder endpoint active. Connect your backend database or real estate API data source here.',
      data: [],
      pagination: {
        page: parseInt(page as string, 10) || 1,
        limit: parseInt(limit as string, 10) || 20,
        total: 0,
        totalPages: 0,
      },
      appliedFilters: {
        district: district || 'all',
        segment: segment || 'all',
        propertyType: propertyType || 'all',
        search: search || '',
      },
      dataSource: 'Backend API Placeholder (Ready for integration)'
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
