import {
  ArrowUpDown,
  Building,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  ExternalLink,
  Eye,
  Info,
  Layers,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { PropertyTransaction } from '../types/property';
import { formatDate, formatNumber, formatPsf, formatSgd } from '../utils/formatters';

interface PriceTransactionsTableProps {
  transactions: PropertyTransaction[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onSelectProperty: (property: PropertyTransaction) => void;
  onOpenApiHub: () => void;
  previewMode: boolean;
  setPreviewMode: (val: boolean) => void;
}

export function PriceTransactionsTable({
  transactions,
  isLoading,
  totalCount,
  page,
  limit,
  onPageChange,
  onSelectProperty,
  onOpenApiHub,
  previewMode,
  setPreviewMode,
}: PriceTransactionsTableProps) {
  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Render Empty / Placeholder State when transactions list is empty
  if (transactions.length === 0 && !isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs text-center">
        <div className="max-w-xl mx-auto space-y-5">
          {/* Central graphic */}
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500 shadow-inner">
            <Database className="w-8 h-8 text-slate-600" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200 mb-2">
              Awaiting Backend Data Feed
            </span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              No Private Property Data Loaded
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              As requested, no data is included out-of-the-box. The application and UI placeholders are configured to query your backend API endpoint at{' '}
              <code className="bg-slate-100 font-mono text-slate-900 px-1.5 py-0.5 rounded text-xs">
                GET /api/properties
              </code>
              .
            </p>
          </div>

          {/* Quick Integration Specs Box */}
          <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-700 font-semibold border-b border-slate-200 pb-2">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-slate-500" />
                Active API Endpoint Placeholder:
              </span>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                HTTP 200 Ready
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200 overflow-x-auto">
              GET /api/properties?district=D09&segment=CCR&minPsf=2000
            </div>
            <p className="text-slate-500 text-[11px]">
              Ready for your PostgreSQL, MongoDB, or Singapore URA REALIS / SingStat private residential transactions feed.
            </p>
          </div>

          {/* Primary Call to Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="btn-open-api-hub-empty-state"
              type="button"
              onClick={onOpenApiHub}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
            >
              <Terminal className="w-4 h-4" />
              View API Blueprint & Schema
            </button>

            <button
              id="btn-toggle-test-preview"
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-sm font-semibold transition-colors shadow-xs"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              {previewMode ? 'Turn Off UI Test Mode' : 'Toggle Sample UI Layout Test'}
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Note: "Sample UI Layout Test" renders temporary dummy records on the client purely to preview table formatting and sorting before your real database is wired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-base">
            Private Residential Transactions
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
            {formatNumber(totalCount)} records
          </span>
          {previewMode && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
              Sample UI Layout Active
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Showing page {page} of {totalPages}
        </p>
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3 px-4">Project & Location</th>
              <th scope="col" className="py-3 px-4">Segment</th>
              <th scope="col" className="py-3 px-4">Property Type</th>
              <th scope="col" className="py-3 px-4">Tenure</th>
              <th scope="col" className="py-3 px-4 text-right">Unit Size</th>
              <th scope="col" className="py-3 px-4 text-right">Price (SGD)</th>
              <th scope="col" className="py-3 px-4 text-right">PSF</th>
              <th scope="col" className="py-3 px-4">Contract Date</th>
              <th scope="col" className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-14"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                  <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                  <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-24 ml-auto"></div></td>
                  <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  <td className="py-4 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                </tr>
              ))
            ) : (
              transactions.map((item) => (
                <tr
                  key={item.id}
                  id={`transaction-row-${item.id}`}
                  onClick={() => onSelectProperty(item)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {/* Project & Location */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {item.projectName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.postalDistrict} {item.streetName ? `• ${item.streetName}` : ''}
                    </div>
                  </td>

                  {/* Market Segment Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        item.marketSegment === 'CCR'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : item.marketSegment === 'RCR'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-sky-50 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {item.marketSegment}
                    </span>
                  </td>

                  {/* Property Type */}
                  <td className="py-3.5 px-4 text-slate-700 text-xs">
                    {item.propertyType}
                  </td>

                  {/* Tenure */}
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    {item.tenure}
                  </td>

                  {/* Unit Size */}
                  <td className="py-3.5 px-4 text-right text-slate-900 font-mono text-xs">
                    <div>{formatNumber(item.areaSqft)} sqft</div>
                    {item.areaSqm && (
                      <div className="text-[10px] text-slate-400">({item.areaSqm} sqm)</div>
                    )}
                  </td>

                  {/* Price SGD */}
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono text-sm">
                    {formatSgd(item.priceSgd)}
                  </td>

                  {/* PSF */}
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-800 font-mono text-xs">
                    {formatPsf(item.psf)}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    <div>{formatDate(item.transactionDate)}</div>
                    <span className="text-[10px] text-slate-400">{item.typeOfSale}</span>
                  </td>

                  {/* View Details */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-xs text-slate-600">
          Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong>
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
