import { Search, RotateCcw, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { SINGAPORE_DISTRICTS } from '../data/singaporeDistricts';
import { PropertyFilterParams } from '../types/property';

interface FilterBarProps {
  filters: PropertyFilterParams;
  setFilters: React.Dispatch<React.SetStateAction<PropertyFilterParams>>;
  onReset: () => void;
  onApply: () => void;
}

export function FilterBar({ filters, setFilters, onReset, onApply }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value, page: 1 }));
  };

  const handleSegmentChange = (segment: 'ALL' | 'CCR' | 'RCR' | 'OCR') => {
    setFilters(prev => ({ ...prev, marketSegment: segment, page: 1 }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      {/* Top row: Search input + Region Selector + Advanced Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="filter-search-input"
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by Project (e.g. Marina One, Amber Park) or Street..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>

        {/* Region Segment Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto">
          {(['ALL', 'CCR', 'RCR', 'OCR'] as const).map(seg => (
            <button
              key={seg}
              id={`filter-segment-${seg.toLowerCase()}`}
              type="button"
              onClick={() => handleSegmentChange(seg)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filters.marketSegment === seg
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {seg === 'ALL' ? 'All Segments' : seg}
            </button>
          ))}
        </div>

        {/* Action buttons: Advanced Filters toggle & Reset */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-advanced-filters"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium transition-colors ${
              isExpanded
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          <button
            id="btn-reset-filters"
            type="button"
            onClick={onReset}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded filters row */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* District selector */}
          <div>
            <label htmlFor="filter-district-select" className="block text-slate-600 font-medium mb-1">
              Singapore Postal District
            </label>
            <select
              id="filter-district-select"
              value={filters.district}
              onChange={e => setFilters(prev => ({ ...prev, district: e.target.value, page: 1 }))}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All 28 Districts</option>
              {SINGAPORE_DISTRICTS.map(d => (
                <option key={d.districtCode} value={d.districtCode}>
                  {d.districtCode} - {d.name.slice(0, 30)}... ({d.region})
                </option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label htmlFor="filter-property-type-select" className="block text-slate-600 font-medium mb-1">
              Property Type
            </label>
            <select
              id="filter-property-type-select"
              value={filters.propertyType}
              onChange={e => setFilters(prev => ({ ...prev, propertyType: e.target.value as any, page: 1 }))}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All Property Types</option>
              <option value="Condominium">Condominium</option>
              <option value="Apartment">Apartment</option>
              <option value="Executive Condominium">Executive Condominium (EC)</option>
              <option value="Landed">Landed (Terrace, Semi-D, Detached)</option>
            </select>
          </div>

          {/* Tenure */}
          <div>
            <label htmlFor="filter-tenure-select" className="block text-slate-600 font-medium mb-1">
              Tenure
            </label>
            <select
              id="filter-tenure-select"
              value={filters.tenure}
              onChange={e => setFilters(prev => ({ ...prev, tenure: e.target.value as any, page: 1 }))}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All Tenures</option>
              <option value="Freehold">Freehold</option>
              <option value="Leasehold">99-year Leasehold</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="filter-sort-select" className="block text-slate-600 font-medium mb-1">
              Sort Results By
            </label>
            <select
              id="filter-sort-select"
              value={filters.sortBy}
              onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any, page: 1 }))}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="date_desc">Latest Transaction Date</option>
              <option value="price_desc">Price (Highest first)</option>
              <option value="price_asc">Price (Lowest first)</option>
              <option value="psf_desc">PSF (Highest first)</option>
              <option value="psf_asc">PSF (Lowest first)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
