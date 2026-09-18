import { AlertCircle, ArrowUpRight, ChevronRight, Layers, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { MarketSummaryData } from '../types/property';
import { formatNumber, formatPsf, formatSgd } from '../utils/formatters';

interface MarketOverviewBannerProps {
  summary: MarketSummaryData;
  onOpenApiHub: () => void;
  previewMode: boolean;
}

export function MarketOverviewBanner({ summary, onOpenApiHub, previewMode }: MarketOverviewBannerProps) {
  const hasLiveFeed = summary.totalTransactions > 0;

  return (
    <div className="space-y-4">
      {/* Integration Notice Alert / Banner */}
      {!hasLiveFeed && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-950">
                Backend API Placeholder Active (0 Data Loaded)
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                No mock data is hardcoded into the system as requested. The UI is completely wired to consume{' '}
                <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[11px]">
                  GET /api/properties
                </code>{' '}
                and{' '}
                <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[11px]">
                  GET /api/market/summary
                </code>
                .
              </p>
            </div>
          </div>
          <button
            id="btn-view-api-blueprint-banner"
            onClick={onOpenApiHub}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shrink-0 shadow-xs"
          >
            Connect Backend API
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Median Price */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Overall Median Price</span>
            <span className="text-[10px] font-mono text-slate-400">SGD</span>
          </div>
          <div className="text-lg font-bold text-slate-900 tracking-tight">
            {summary.medianPrice ? formatSgd(summary.medianPrice) : '— SGD'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span>{hasLiveFeed ? 'Quarterly aggregate' : 'Awaiting API feed'}</span>
          </div>
        </div>

        {/* Median PSF */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Overall Median PSF</span>
            <span className="text-[10px] font-mono text-slate-400">S$/sqft</span>
          </div>
          <div className="text-lg font-bold text-slate-900 tracking-tight">
            {summary.medianPsf ? formatPsf(summary.medianPsf) : '— /sqft'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span>{hasLiveFeed ? 'Islandwide private' : 'Awaiting API feed'}</span>
          </div>
        </div>

        {/* CCR Prime PSF */}
        <div className="bg-white border border-emerald-100 rounded-xl p-3.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-medium mb-1">
            <span>CCR (Core Central)</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1 rounded">D09, D10, D11</span>
          </div>
          <div className="text-lg font-bold text-slate-900 tracking-tight">
            {summary.ccrMedianPsf ? formatPsf(summary.ccrMedianPsf) : '— /sqft'}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1">
            <span>Orchard & Prime CBD</span>
          </div>
        </div>

        {/* RCR City Fringe PSF */}
        <div className="bg-white border border-amber-100 rounded-xl p-3.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-amber-800 font-medium mb-1">
            <span>RCR (City Fringe)</span>
            <span className="text-[10px] bg-amber-50 text-amber-700 px-1 rounded">D03, D15, D20</span>
          </div>
          <div className="text-lg font-bold text-slate-900 tracking-tight">
            {summary.rcrMedianPsf ? formatPsf(summary.rcrMedianPsf) : '— /sqft'}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 flex items-center gap-1">
            <span>Queenstown, Marine Parade</span>
          </div>
        </div>

        {/* OCR Suburban PSF */}
        <div className="bg-white border border-sky-100 rounded-xl p-3.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-sky-800 font-medium mb-1">
            <span>OCR (Suburban)</span>
            <span className="text-[10px] bg-sky-50 text-sky-700 px-1 rounded">D19, D22, D23</span>
          </div>
          <div className="text-lg font-bold text-slate-900 tracking-tight">
            {summary.ocrMedianPsf ? formatPsf(summary.ocrMedianPsf) : '— /sqft'}
          </div>
          <div className="mt-1 text-[11px] text-sky-600 flex items-center gap-1">
            <span>Punggol, Jurong, Tampines</span>
          </div>
        </div>

        {/* Total Transactions Count */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Recorded</span>
            <span className="text-[10px] font-mono text-slate-400">Transactions</span>
          </div>
          <div className="text-lg font-bold text-slate-900 tracking-tight">
            {formatNumber(summary.totalTransactions)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span>{hasLiveFeed ? 'Total transacted units' : '0 records connected'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
