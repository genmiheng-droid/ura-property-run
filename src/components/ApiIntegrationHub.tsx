import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Copy,
  Database,
  ExternalLink,
  Key,
  Layers,
  RefreshCw,
  Server,
  Terminal,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  API_SCHEMA_BLUEPRINT,
  fetchUraServerlessStatus,
  getApiBaseUrl,
  setApiBaseUrl,
  testBackendConnection,
  testUraDailyToken,
  testUraTransactions,
} from '../services/propertyApi';
import { BackendConnectionStatus } from '../types/property';

interface ApiIntegrationHubProps {
  status: BackendConnectionStatus;
  onRefresh: () => void;
  onClose?: () => void;
}

export function ApiIntegrationHub({ status, onRefresh, onClose }: ApiIntegrationHubProps) {
  const [customUrl, setCustomUrl] = useState(getApiBaseUrl());
  const [isSaving, setIsSaving] = useState(false);
  const [pingResult, setPingResult] = useState<{
    tested: boolean;
    success: boolean;
    statusText: string;
    latencyMs: number;
    raw: any;
  } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeEndpointIndex, setActiveEndpointIndex] = useState<number>(0);

  // URA Serverless Connection State
  const [uraStatus, setUraStatus] = useState<{
    configured: boolean;
    keyConfigured: boolean;
    cachedTokenAvailable: boolean;
    cachedTokenDate: string | null;
    singaporeDate: string;
    error?: string;
  } | null>(null);
  const [uraTestingToken, setUraTestingToken] = useState(false);
  const [uraTestingTx, setUraTestingTx] = useState(false);
  const [uraOutput, setUraOutput] = useState<any>(null);

  useEffect(() => {
    checkUraStatus();
  }, []);

  const checkUraStatus = async () => {
    const s = await fetchUraServerlessStatus();
    setUraStatus(s);
  };

  const handleTestUraToken = async (force = false) => {
    setUraTestingToken(true);
    setUraOutput(null);
    try {
      const res = await testUraDailyToken(force);
      setUraOutput({ testType: "Step 1: Daily Token Exchange (GET /api/token)", ...res });
      checkUraStatus();
    } finally {
      setUraTestingToken(false);
    }
  };

  const handleTestUraTransactions = async (batch = 1) => {
    setUraTestingTx(true);
    setUraOutput(null);
    try {
      const res = await testUraTransactions(batch);
      setUraOutput({ testType: `Step 2: PMI_Resi_Transaction Data Call (Batch ${batch})`, ...res });
      checkUraStatus();
    } finally {
      setUraTestingTx(false);
    }
  };

  const handleSaveUrl = () => {
    setIsSaving(true);
    setApiBaseUrl(customUrl);
    setTimeout(() => {
      setIsSaving(false);
      onRefresh();
    }, 300);
  };

  const handlePingTest = async () => {
    setPingResult(null);
    const result = await testBackendConnection(customUrl);
    setPingResult({
      tested: true,
      success: result.reachable,
      statusText: result.statusText,
      latencyMs: result.latencyMs,
      raw: result.data,
    });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              API Integration & Developer Blueprint
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Backend API Placeholders & Connection Hub
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Connect your database, Node.js/Python microservice, or Singapore URA REALIS data feed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-lg font-mono font-semibold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              State: Ready for Backend
            </span>
          </div>
        </div>

        {/* API Base URL Configuration Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="api-base-url-input" className="block text-xs font-semibold text-slate-700 mb-1">
              API Base URL Endpoint
            </label>
            <div className="flex gap-2">
              <input
                id="api-base-url-input"
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="/api or https://api.yourdomain.com"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
              <button
                id="btn-save-api-url"
                type="button"
                onClick={handleSaveUrl}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0"
              >
                {isSaving ? 'Saving...' : 'Apply URL'}
              </button>
              <button
                id="btn-test-ping-api"
                type="button"
                onClick={handlePingTest}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Test Ping
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Defaults to local Express server at <code className="font-mono text-slate-600">/api</code>.
            </p>
          </div>

          {/* Ping status card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex flex-col justify-center">
            <span className="text-slate-500 font-medium text-[11px]">Last Health Ping:</span>
            {pingResult ? (
              <div className="mt-1">
                <span
                  className={`font-semibold font-mono flex items-center gap-1 ${
                    pingResult.success ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {pingResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                  {pingResult.statusText}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Latency: {pingResult.latencyMs}ms
                </span>
              </div>
            ) : (
              <span className="text-slate-400 mt-1 italic">Click "Test Ping" to check connectivity</span>
            )}
          </div>
        </div>
      </div>

      {/* URA Serverless Connection Tester */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
              <Database className="w-3.5 h-3.5" />
              URA Serverless Connector (/api)
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Singapore Urban Redevelopment Authority (URA) Data Connection
            </h3>
            <p className="text-xs text-slate-600">
              Two-step authenticated serverless workflow with daily token caching and transaction queries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-md font-mono font-semibold flex items-center gap-1.5 border ${
                uraStatus?.configured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  uraStatus?.configured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              ></span>
              URA_ACCESS_KEY: {uraStatus?.configured ? 'Configured' : 'Not Set in .env'}
            </span>
          </div>
        </div>

        {/* Workflow steps overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          {/* Step 1 Card */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  Trade AccessKey for Today's Token
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {uraStatus?.cachedTokenAvailable ? "Today's Token Cached" : 'No Token Cached'}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Trades <code className="font-mono text-slate-900 font-semibold">AccessKey</code> for today's token via URA's <code className="font-mono text-slate-800">insertNewToken/v1</code>.
              </p>
              <div className="font-mono text-[11px] p-2 bg-white rounded border border-slate-200 text-slate-700 break-all">
                Header: <span className="font-semibold text-slate-900">AccessKey: &lt;URA_ACCESS_KEY&gt;</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
              <button
                id="btn-test-ura-token"
                type="button"
                onClick={() => handleTestUraToken(false)}
                disabled={uraTestingToken}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                {uraTestingToken ? 'Trading...' : "Exchange for Today's Token"}
              </button>
              <button
                id="btn-force-ura-token"
                type="button"
                onClick={() => handleTestUraToken(true)}
                disabled={uraTestingToken}
                title="Bypass memory cache and request fresh token"
                className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-600 rounded-lg text-xs hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Force Fresh
              </button>
            </div>
          </div>

          {/* Step 2 Card */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  Data Calls (Both Headers)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  PMI_Resi_Transaction
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Queries URA dataset sending <code className="font-mono text-slate-900 font-semibold">AccessKey</code> AND <code className="font-mono text-slate-900 font-semibold">Token</code> headers.
              </p>
              <div className="font-mono text-[11px] p-2 bg-white rounded border border-slate-200 text-slate-700 break-all space-y-1">
                <div>Header: <span className="font-semibold text-slate-900">AccessKey: &lt;URA_ACCESS_KEY&gt;</span></div>
                <div>Header: <span className="font-semibold text-slate-900">Token: &lt;URA_DAILY_TOKEN&gt;</span></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
              <button
                id="btn-test-ura-tx-1"
                type="button"
                onClick={() => handleTestUraTransactions(1)}
                disabled={uraTestingTx}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                {uraTestingTx ? 'Querying URA...' : 'Fetch Batch 1 Transactions'}
              </button>
              <button
                id="btn-test-ura-tx-2"
                type="button"
                onClick={() => handleTestUraTransactions(2)}
                disabled={uraTestingTx}
                className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batch 2
              </button>
            </div>
          </div>
        </div>

        {/* Live URA Output / Response Inspector */}
        {uraOutput && (
          <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden bg-slate-950 text-slate-200">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                {uraOutput.testType || 'URA Test Result'}
              </span>
              <span className={uraOutput.success ? 'text-emerald-400' : 'text-red-400'}>
                {uraOutput.success ? '200 SUCCESS' : 'FAILED / CONFIG REQUIRED'}
              </span>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto max-h-64 text-emerald-300">
              {JSON.stringify(uraOutput, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Integration Guide Steps */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-600" />
          How to Connect Your Backend
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Option A: Edit server.ts</h4>
            <p className="text-slate-600 leading-relaxed">
              The built-in Express server in <code className="font-mono text-slate-900">server.ts</code> already contains endpoints ready for you to write queries to PostgreSQL, MySQL, or MongoDB.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Option B: External Backend</h4>
            <p className="text-slate-600 leading-relaxed">
              Host your backend independently (FastAPI, NestJS, Go, Spring) and set the <strong>API Base URL</strong> above or in <code className="font-mono text-slate-900">.env</code>.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Singapore URA REALIS Feed</h4>
            <p className="text-slate-600 leading-relaxed">
              Connect to the Singapore Urban Redevelopment Authority (URA) API by adding your token to <code className="font-mono text-slate-900">URA_ACCESS_KEY</code> in <code className="font-mono text-slate-900">.env</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Endpoints Documentation & Schemas */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-slate-600" />
            Expected API Specifications & JSON Schemas
          </h3>
          <span className="text-xs text-slate-500">
            Click endpoint to inspect payload schema
          </span>
        </div>

        {/* Endpoint Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {API_SCHEMA_BLUEPRINT.endpoints.map((ep, idx) => (
            <button
              key={ep.path}
              id={`btn-select-endpoint-${idx}`}
              type="button"
              onClick={() => setActiveEndpointIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeEndpointIndex === idx
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="text-emerald-400 mr-1.5">{ep.method}</span>
              {ep.path}
            </button>
          ))}
        </div>

        {/* Active Endpoint Spec Details */}
        {(() => {
          const ep = API_SCHEMA_BLUEPRINT.endpoints[activeEndpointIndex];
          const sampleJson = JSON.stringify(ep.sampleResponse, null, 2);
          const curlSnippet = `curl -X ${ep.method} "${window?.location?.origin || 'http://localhost:3000'}${ep.path}" -H "Accept: application/json"`;

          return (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono text-xs">
                    {ep.method}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{ep.path}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{ep.description}</p>
              </div>

              {/* cURL Copy Box */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>cURL Command</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(curlSnippet, 999)}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {copiedIndex === 999 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedIndex === 999 ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto">
                  {curlSnippet}
                </pre>
              </div>

              {/* Query Parameters (if any) */}
              {ep.queryParams && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Supported Query Parameters</h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2">Param</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Example</th>
                          <th className="p-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white font-mono text-[11px]">
                        {ep.queryParams.map((qp) => (
                          <tr key={qp.name}>
                            <td className="p-2 font-bold text-slate-900">{qp.name}</td>
                            <td className="p-2 text-slate-500">{qp.type}</td>
                            <td className="p-2 text-emerald-600">{String(qp.example)}</td>
                            <td className="p-2 text-slate-600 font-sans">{qp.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sample Response JSON */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Sample JSON Output Payload</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sampleJson, activeEndpointIndex)}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {copiedIndex === activeEndpointIndex ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedIndex === activeEndpointIndex ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto max-h-72">
                  {sampleJson}
                </pre>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
