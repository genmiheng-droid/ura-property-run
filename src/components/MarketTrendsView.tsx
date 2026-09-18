import { Activity, ArrowUpRight, BarChart3, Calendar, Info, LineChart, TrendingUp } from 'lucide-react';
import { MarketTrendPoint } from '../types/property';
import { formatPsf } from '../utils/formatters';

interface MarketTrendsViewProps {
  trends: MarketTrendPoint[];
  onOpenApiHub: () => void;
  previewMode: boolean;
}

export function MarketTrendsView({ trends, onOpenApiHub, previewMode }: MarketTrendsViewProps) {
  const hasData = trends.length > 0;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
              Historical Private Residential Price Movement
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Singapore Private Housing Price Index & PSF Trends
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Tracks quarterly PSF movement across Core Central (CCR), City Fringe (RCR), and Suburban (OCR) markets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              Endpoint: GET /api/market/trends
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800">CCR (Core Central Region)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="font-semibold text-slate-800">RCR (Rest of Central Region)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500"></span>
            <span className="font-semibold text-slate-800">OCR (Outside Central Region)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-800"></span>
            <span className="font-semibold text-slate-800">Overall Islandwide Median</span>
          </div>
        </div>
      </div>

      {/* Main Chart / Placeholder Area */}
      {!hasData ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
              <BarChart3 className="w-7 h-7 text-slate-600" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Awaiting Historical Trend Feed
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No historical price-per-square-foot data has been loaded yet. Once connected, quarterly trend visualizations will stream automatically.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left font-mono text-xs text-slate-600">
              <div className="text-slate-400 text-[11px] mb-1">// Expected trend JSON structure</div>
              {`{ "quarter": "2024-Q4", "ccrPsf": 2840, "rcrPsf": 2310, "ocrPsf": 1670 }`}
            </div>

            <button
              id="btn-trends-open-api-hub"
              type="button"
              onClick={onOpenApiHub}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              Configure API Feed
            </button>
          </div>
        </div>
      ) : (
        /* Rendered Visual Trends */
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="overflow-x-auto">
            <div className="min-w-[600px] space-y-6">
              {trends.map((pt) => (
                <div key={pt.quarter} className="border-b border-slate-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {pt.quarter}
                    </span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      Overall: {formatPsf(pt.overallPsf)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {/* CCR Bar */}
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-slate-600 font-semibold">CCR</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((pt.ccrPsf || 0) / 3500) * 100)}%` }}
                        />
                      </div>
                      <span className="w-24 text-right font-mono font-semibold text-slate-800">
                        {formatPsf(pt.ccrPsf)}
                      </span>
                    </div>

                    {/* RCR Bar */}
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-slate-600 font-semibold">RCR</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((pt.rcrPsf || 0) / 3500) * 100)}%` }}
                        />
                      </div>
                      <span className="w-24 text-right font-mono font-semibold text-slate-800">
                        {formatPsf(pt.rcrPsf)}
                      </span>
                    </div>

                    {/* OCR Bar */}
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-slate-600 font-semibold">OCR</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((pt.ocrPsf || 0) / 3500) * 100)}%` }}
                        />
                      </div>
                      <span className="w-24 text-right font-mono font-semibold text-slate-800">
                        {formatPsf(pt.ocrPsf)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
