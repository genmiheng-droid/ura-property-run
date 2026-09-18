import { Building2, Compass, ExternalLink, Filter, MapPin, Tag } from 'lucide-react';
import { REGION_DETAILS, SINGAPORE_DISTRICTS } from '../data/singaporeDistricts';
import { MarketSegment } from '../types/property';

interface DistrictsExplorerProps {
  onSelectDistrict: (districtCode: string) => void;
  onSelectSegment: (segment: MarketSegment) => void;
  onOpenApiHub: () => void;
}

export function DistrictsExplorer({ onSelectDistrict, onSelectSegment, onOpenApiHub }: DistrictsExplorerProps) {
  const regions: MarketSegment[] = ['CCR', 'RCR', 'OCR'];

  return (
    <div className="space-y-6">
      {/* Intro Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 mb-2">
            <Compass className="w-3.5 h-3.5" />
            Singapore Postal Districts Reference (D01 – D28)
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Private Housing Regional Classification
          </h2>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Singapore's private residential market is officially segmented into three distinct market tiers:
            <strong> Core Central Region (CCR)</strong>, <strong>Rest of Central Region (RCR)</strong>, and <strong>Outside Central Region (OCR)</strong>.
            Click any district to filter API query parameters.
          </p>
        </div>

        {/* Region Segment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {regions.map((regKey) => {
            const reg = REGION_DETAILS[regKey];
            return (
              <div
                key={regKey}
                className={`p-4 rounded-xl border transition-all ${
                  regKey === 'CCR'
                    ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                    : regKey === 'RCR'
                    ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                    : 'bg-sky-50/50 border-sky-200 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">{reg.name} ({reg.code})</span>
                  <button
                    onClick={() => onSelectSegment(regKey)}
                    className="text-xs font-semibold px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                  >
                    Filter {reg.code}
                  </button>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {reg.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {reg.districts.map((d) => (
                    <button
                      key={d}
                      onClick={() => onSelectDistrict(d)}
                      className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete District Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            All 28 Singapore Districts & Postal Sectors
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Ready for query parameter: ?district=Dxx
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {SINGAPORE_DISTRICTS.map((d) => (
            <div
              key={d.districtCode}
              className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {d.districtCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      d.region === 'CCR'
                        ? 'bg-emerald-100 text-emerald-800'
                        : d.region === 'RCR'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {d.region}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 leading-snug">
                  {d.name}
                </h4>
                <div className="text-[11px] text-slate-500 mt-1">
                  Postal Sectors: {d.postalSectors.join(', ')}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  GET /api/properties?district={d.districtCode}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectDistrict(d.districtCode)}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Filter className="w-3 h-3" />
                  Filter
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
