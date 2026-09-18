import { Building2, Database, Globe, RefreshCw, Terminal, Activity } from 'lucide-react';
import { BackendConnectionStatus } from '../types/property';

interface NavbarProps {
  activeTab: 'explorer' | 'districts' | 'trends' | 'api-hub';
  setActiveTab: (tab: 'explorer' | 'districts' | 'trends' | 'api-hub') => void;
  status: BackendConnectionStatus;
  onRefresh: () => void;
  onOpenApiHub: () => void;
  previewMode: boolean;
  setPreviewMode: (val: boolean) => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  status,
  onRefresh,
  onOpenApiHub,
  previewMode,
  setPreviewMode,
}: NavbarProps) {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">
                  SG Private Property
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Singapore
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Private Residential Price & Transaction Tracking
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-tab-explorer"
              onClick={() => setActiveTab('explorer')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'explorer'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Price Explorer
            </button>
            <button
              id="nav-tab-districts"
              onClick={() => setActiveTab('districts')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'districts'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Districts (D01–D28)
            </button>
            <button
              id="nav-tab-trends"
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'trends'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Price Trends
            </button>
            <button
              id="nav-tab-api-hub"
              onClick={() => setActiveTab('api-hub')}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'api-hub'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Terminal className="w-4 h-4 text-red-600" />
              API Blueprint
            </button>
          </nav>

          {/* Right Action Bar: Status Pill & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mock Layout Preview Toggle (strictly labeled as test preview) */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-600 font-medium">UI Layout Test Mode:</span>
              <button
                id="toggle-preview-mode"
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  previewMode ? 'bg-red-600' : 'bg-slate-300'
                }`}
                title="Toggle UI sample layout rendering while awaiting your real backend API data"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    previewMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`font-semibold ${previewMode ? 'text-red-700' : 'text-slate-500'}`}>
                {previewMode ? 'Active (Sample UI)' : 'Off (0 Data)'}
              </span>
            </div>

            {/* Backend API Status Pill */}
            <button
              id="btn-status-pill"
              onClick={onOpenApiHub}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors shadow-xs"
              title="Click to view API documentation & endpoints"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="hidden sm:inline">Backend API:</span>
              <span className="font-semibold">
                {status.mode === 'placeholder' ? 'Placeholder Mode' : status.mode}
              </span>
            </button>

            {/* Refresh button */}
            <button
              id="btn-refresh-data"
              onClick={onRefresh}
              disabled={status.isChecking}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors disabled:opacity-50"
              title="Re-query API endpoints"
            >
              <RefreshCw className={`w-4 h-4 ${status.isChecking ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-200 py-2 space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'explorer' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Explorer
          </button>
          <button
            onClick={() => setActiveTab('districts')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'districts' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Districts (D01-D28)
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'trends' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveTab('api-hub')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'api-hub' ? 'bg-red-100 text-red-800' : 'text-slate-600'
            }`}
          >
            API Blueprint
          </button>
        </div>
      </div>
    </header>
  );
}
