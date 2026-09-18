import {
  Building2,
  Calendar,
  Check,
  CircleDollarSign,
  Compass,
  DollarSign,
  ExternalLink,
  Layers,
  MapPin,
  Scale,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { PropertyTransaction } from '../types/property';
import { calculateSingaporeBsd, formatDate, formatNumber, formatPsf, formatSgd } from '../utils/formatters';

interface PropertyDetailModalProps {
  property: PropertyTransaction | null;
  onClose: () => void;
}

export function PropertyDetailModal({ property, onClose }: PropertyDetailModalProps) {
  const [buyerProfile, setBuyerProfile] = useState<'citizen_1st' | 'citizen_2nd' | 'pr_1st' | 'foreigner'>('citizen_1st');

  if (!property) return null;

  const bsd = calculateSingaporeBsd(property.priceSgd);

  // Singapore ABSD Rates:
  // Citizen 1st: 0%
  // Citizen 2nd: 20%
  // PR 1st: 5%
  // Foreigner: 60%
  const getAbsdRate = () => {
    switch (buyerProfile) {
      case 'citizen_1st': return 0;
      case 'citizen_2nd': return 0.20;
      case 'pr_1st': return 0.05;
      case 'foreigner': return 0.60;
    }
  };

  const absdRate = getAbsdRate();
  const absd = Math.round(property.priceSgd * absdRate);
  const totalStampDuty = bsd + absd;
  const totalCost = property.priceSgd + totalStampDuty;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  property.marketSegment === 'CCR'
                    ? 'bg-emerald-100 text-emerald-800'
                    : property.marketSegment === 'RCR'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-sky-100 text-sky-800'
                }`}
              >
                {property.marketSegment}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {property.postalDistrict}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {property.id}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {property.projectName}
            </h3>
            {property.streetName && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {property.streetName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm">
          {/* Main Key Figures Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">Transacted Price</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {formatSgd(property.priceSgd)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">Price Per Sqft</span>
              <span className="text-base font-bold text-emerald-700 font-mono">
                {formatPsf(property.psf)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">Floor Area</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {formatNumber(property.areaSqft)} sqft
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">Tenure</span>
              <span className="text-base font-bold text-slate-900">
                {property.tenure}
              </span>
            </div>
          </div>

          {/* Unit & Development Specs */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400 mb-3">
              Property Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-1">Property Type</span>
                <span className="font-semibold text-slate-800">{property.propertyType}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-1">Floor Level</span>
                <span className="font-semibold text-slate-800">{property.floorLevel || 'Standard Floor'}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-1">Sale Type</span>
                <span className="font-semibold text-slate-800">{property.typeOfSale}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-1">Contract Date</span>
                <span className="font-semibold text-slate-800">{formatDate(property.transactionDate)}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-1">Metric Area</span>
                <span className="font-semibold text-slate-800">
                  {property.areaSqm ? `${property.areaSqm} sqm` : '—'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-1">Postal Sector</span>
                <span className="font-semibold text-slate-800">{property.postalDistrict}</span>
              </div>
            </div>
          </div>

          {/* Singapore Buyer's Stamp Duty (BSD & ABSD) Calculator */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-slate-600" />
                Singapore Stamp Duty Estimate (IRAS Rules)
              </h4>
              <span className="text-[11px] text-slate-500">Live Calculation</span>
            </div>

            {/* Buyer profile buttons */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setBuyerProfile('citizen_1st')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  buyerProfile === 'citizen_1st'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                SG Citizen (1st Home)
              </button>
              <button
                type="button"
                onClick={() => setBuyerProfile('citizen_2nd')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  buyerProfile === 'citizen_2nd'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                SG Citizen (2nd Home - 20% ABSD)
              </button>
              <button
                type="button"
                onClick={() => setBuyerProfile('pr_1st')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  buyerProfile === 'pr_1st'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Permanent Resident (5% ABSD)
              </button>
              <button
                type="button"
                onClick={() => setBuyerProfile('foreigner')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  buyerProfile === 'foreigner'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Foreigner (60% ABSD)
              </button>
            </div>

            {/* Duty details breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Buyer Stamp Duty (BSD)</span>
                <span className="font-bold text-slate-900 font-mono">{formatSgd(bsd)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">
                  ABSD ({Math.round(absdRate * 100)}%)
                </span>
                <span className="font-bold text-slate-900 font-mono">{formatSgd(absd)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Total Acquisition Cost</span>
                <span className="font-bold text-red-700 font-mono">{formatSgd(totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Raw API Record Representation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-mono">
                API Endpoint: GET /api/properties/{property.id}
              </span>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg text-xs font-mono overflow-x-auto max-h-40">
              {JSON.stringify(property, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
