import { useCallback, useEffect, useState } from 'react';
import { ApiIntegrationHub } from './components/ApiIntegrationHub';
import { DistrictsExplorer } from './components/DistrictsExplorer';
import { FilterBar } from './components/FilterBar';
import { MarketOverviewBanner } from './components/MarketOverviewBanner';
import { MarketTrendsView } from './components/MarketTrendsView';
import { Navbar } from './components/Navbar';
import { PriceTransactionsTable } from './components/PriceTransactionsTable';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import {
  SAMPLE_LAYOUT_SUMMARY,
  SAMPLE_LAYOUT_TRANSACTIONS,
  SAMPLE_LAYOUT_TRENDS,
} from './data/sampleLayoutData';
import {
  fetchMarketSummary,
  fetchMarketTrends,
  fetchProperties,
  getApiBaseUrl,
  testBackendConnection,
} from './services/propertyApi';
import {
  BackendConnectionStatus,
  MarketSegment,
  MarketSummaryData,
  MarketTrendPoint,
  PropertyFilterParams,
  PropertyTransaction,
} from './types/property';

const DEFAULT_FILTERS: PropertyFilterParams = {
  searchQuery: '',
  marketSegment: 'ALL',
  district: 'ALL',
  propertyType: 'ALL',
  tenure: 'ALL',
  minPrice: '',
  maxPrice: '',
  minPsf: '',
  maxPsf: '',
  sortBy: 'date_desc',
  page: 1,
  limit: 20,
};

const DEFAULT_EMPTY_SUMMARY: MarketSummaryData = {
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
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'districts' | 'trends' | 'api-hub'>('explorer');
  const [filters, setFilters] = useState<PropertyFilterParams>(DEFAULT_FILTERS);
  const [transactions, setTransactions] = useState<PropertyTransaction[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [summary, setSummary] = useState<MarketSummaryData>(DEFAULT_EMPTY_SUMMARY);
  const [trends, setTrends] = useState<MarketTrendPoint[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyTransaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Preview Mode: false by default. Zero mock data loaded by default as requested.
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const [backendStatus, setBackendStatus] = useState<BackendConnectionStatus>({
    isConnected: false,
    isChecking: false,
    mode: 'placeholder',
    endpointUrl: getApiBaseUrl(),
    latencyMs: null,
    lastChecked: null,
    recordsCount: 0,
  });

  // Load properties and market data
  const loadData = useCallback(async () => {
    setIsLoading(true);

    if (previewMode) {
      // Temporary Sample UI layout mode
      let filtered = [...SAMPLE_LAYOUT_TRANSACTIONS];
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          t => t.projectName.toLowerCase().includes(q) || t.streetName?.toLowerCase().includes(q)
        );
      }
      if (filters.marketSegment !== 'ALL') {
        filtered = filtered.filter(t => t.marketSegment === filters.marketSegment);
      }
      if (filters.district !== 'ALL') {
        filtered = filtered.filter(t => t.postalDistrict === filters.district);
      }
      if (filters.propertyType !== 'ALL') {
        filtered = filtered.filter(t => t.propertyType === filters.propertyType);
      }
      if (filters.tenure !== 'ALL') {
        filtered = filtered.filter(t => t.tenure.toLowerCase().includes(filters.tenure.toLowerCase()));
      }

      setTransactions(filtered);
      setTotalCount(filtered.length);
      setSummary(SAMPLE_LAYOUT_SUMMARY);
      setTrends(SAMPLE_LAYOUT_TRENDS);
      setIsLoading(false);
      return;
    }

    // Default mode: query actual endpoints (which currently return [] as placeholder)
    try {
      const [propRes, sumRes, trendRes] = await Promise.all([
        fetchProperties(filters),
        fetchMarketSummary(),
        fetchMarketTrends(),
      ]);

      setTransactions(propRes.data || []);
      setTotalCount(propRes.pagination?.total || propRes.data?.length || 0);

      if (sumRes.data) {
        setSummary(sumRes.data);
      } else {
        setSummary(DEFAULT_EMPTY_SUMMARY);
      }

      setTrends(trendRes.data || []);
    } catch (err) {
      console.error('Error fetching property data:', err);
      setTransactions([]);
      setTotalCount(0);
      setSummary(DEFAULT_EMPTY_SUMMARY);
      setTrends([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, previewMode]);

  // Check health and endpoint readiness
  const checkHealth = useCallback(async () => {
    setBackendStatus(prev => ({ ...prev, isChecking: true }));
    const health = await testBackendConnection();
    setBackendStatus({
      isConnected: health.reachable,
      isChecking: false,
      mode: health.reachable ? 'placeholder' : 'error',
      endpointUrl: getApiBaseUrl(),
      latencyMs: health.latencyMs,
      lastChecked: new Date(),
      recordsCount: transactions.length,
      errorMessage: health.reachable ? undefined : health.statusText,
    });
  }, [transactions.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleSelectDistrictFromExplorer = (districtCode: string) => {
    setFilters(prev => ({
      ...prev,
      district: districtCode,
      page: 1,
    }));
    setActiveTab('explorer');
  };

  const handleSelectSegmentFromExplorer = (segment: MarketSegment) => {
    setFilters(prev => ({
      ...prev,
      marketSegment: segment,
      district: 'ALL',
      page: 1,
    }));
    setActiveTab('explorer');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={backendStatus}
        onRefresh={() => {
          checkHealth();
          loadData();
        }}
        onOpenApiHub={() => setActiveTab('api-hub')}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Market Overview Summary Row */}
        <MarketOverviewBanner
          summary={summary}
          onOpenApiHub={() => setActiveTab('api-hub')}
          previewMode={previewMode}
        />

        {/* Tab Views */}
        {activeTab === 'explorer' && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              onReset={handleResetFilters}
              onApply={loadData}
            />

            {/* Transactions Table & Empty/Placeholder state */}
            <PriceTransactionsTable
              transactions={transactions}
              isLoading={isLoading}
              totalCount={totalCount}
              page={filters.page}
              limit={filters.limit}
              onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))}
              onSelectProperty={(p) => setSelectedProperty(p)}
              onOpenApiHub={() => setActiveTab('api-hub')}
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
            />
          </div>
        )}

        {activeTab === 'districts' && (
          <DistrictsExplorer
            onSelectDistrict={handleSelectDistrictFromExplorer}
            onSelectSegment={handleSelectSegmentFromExplorer}
            onOpenApiHub={() => setActiveTab('api-hub')}
          />
        )}

        {activeTab === 'trends' && (
          <MarketTrendsView
            trends={trends}
            onOpenApiHub={() => setActiveTab('api-hub')}
            previewMode={previewMode}
          />
        )}

        {activeTab === 'api-hub' && (
          <ApiIntegrationHub
            status={backendStatus}
            onRefresh={() => {
              checkHealth();
              loadData();
            }}
          />
        )}
      </main>

      {/* Property Details & Stamp Duty Inspector Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-700">Singapore Private Property Prices</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Designed for integration with Singapore URA REALIS, SLA, and private real estate databases.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              API Status: Placeholder Mode
            </span>
            <button
              onClick={() => setActiveTab('api-hub')}
              className="text-red-600 hover:text-red-800 font-semibold"
            >
              API Blueprint
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
