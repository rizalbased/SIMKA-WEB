import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  RotateCw,
  Terminal,
  Copy,
  Check,
  Server,
  ShieldCheck,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export interface HealthTestState {
  status: 'idle' | 'testing' | 'success' | 'error';
  httpStatus?: number;
  errorName?: string;
  errorMessage?: string;
  responseBody?: any;
  latencyMs?: number;
  timestamp?: string;
  testType?: string;
}

interface NewsHealthTestProps {
  className?: string;
  onSuccess?: () => void;
}

export const NewsHealthTest: React.FC<NewsHealthTestProps> = ({ className = '', onSuccess }) => {
  const [testResult, setTestResult] = useState<HealthTestState>({ status: 'idle' });
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const runHealthTest = async () => {
    setTestResult({ status: 'testing' });
    const startTime = performance.now();

    try {
      console.log('[NewsHealthTest] Memanggil supabase.functions.invoke("news-search", { body: { health: true } })...');
      
      const response = await supabase.functions.invoke('news-search', {
        body: { health: true }
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const { data, error } = response;

      let httpStatus: number | undefined = undefined;
      let rawBody: any = data;

      // Extract HTTP context if error exists
      if (error && (error as any).context) {
        const ctx = (error as any).context;
        if (typeof ctx.status === 'number') {
          httpStatus = ctx.status;
        }
        if (typeof ctx.clone === 'function') {
          try {
            rawBody = await ctx.clone().json();
          } catch {
            try {
              rawBody = await ctx.clone().text();
            } catch {}
          }
        }
      }

      if (data && typeof data === 'object' && typeof data.status === 'number') {
        httpStatus = httpStatus || data.status;
      }

      if (!error && data && (data.success === true || data.status === 'online' || httpStatus === 200)) {
        setTestResult({
          status: 'success',
          httpStatus: httpStatus || 200,
          responseBody: data,
          latencyMs,
          timestamp: new Date().toLocaleTimeString('id-ID'),
          testType: 'POST (body: { health: true })'
        });
        if (onSuccess) onSuccess();
      } else {
        setTestResult({
          status: 'error',
          httpStatus: httpStatus,
          errorName: error?.name || 'FunctionsError',
          errorMessage: error?.message || 'Gagal mengeksekusi Edge Function news-search.',
          responseBody: rawBody || error,
          latencyMs,
          timestamp: new Date().toLocaleTimeString('id-ID'),
          testType: 'POST (body: { health: true })'
        });
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      console.error('[NewsHealthTest] Exception caught during health test:', err);
      setTestResult({
        status: 'error',
        httpStatus: undefined,
        errorName: err?.name || 'NetworkError',
        errorMessage: err?.message || 'Gagal mengirim request ke Supabase Edge Function',
        responseBody: err?.stack || err?.toString(),
        latencyMs,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        testType: 'POST (body: { health: true })'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div className={`bg-[#FFFDF9] border-2 border-[#18181B] rounded-2xl p-5 shadow-[3px_3px_0px_#18181B] space-y-4 ${className}`}>
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-neutral-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#0096D6]/10 border border-[#0096D6] text-[#0096D6]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-black text-sm sm:text-base text-[#18181B]">
              Diagnostik Jaringan Edge Function
            </h4>
            <p className="text-xs font-mono text-neutral-500">
              Target Function: <span className="font-bold text-neutral-800">news-search</span>
            </p>
          </div>
        </div>

        <button
          id="btn-test-health-edge-function"
          onClick={runHealthTest}
          disabled={testResult.status === 'testing'}
          className="px-4 py-2 bg-[#0096D6] hover:bg-[#0082ba] disabled:bg-neutral-300 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
        >
          <RotateCw className={`w-4 h-4 ${testResult.status === 'testing' ? 'animate-spin' : ''}`} />
          <span>{testResult.status === 'testing' ? 'MEMERIKSA KONEKSI...' : 'TEST HEALTH EDGE FUNCTION'}</span>
        </button>
      </div>

      {/* State: Idle Instruction */}
      {testResult.status === 'idle' && (
        <div className="p-4 bg-neutral-50 border border-dashed border-neutral-300 rounded-xl text-xs font-mono text-neutral-600 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-neutral-800">Klik tombol di atas</span> untuk mengirim request langsung ke{' '}
            <code className="px-1 py-0.5 bg-neutral-200 text-neutral-900 rounded font-bold">news-search</code> dan mengidentifikasi status ketersediaan Edge Function secara presisi.
          </div>
        </div>
      )}

      {/* State: Testing */}
      {testResult.status === 'testing' && (
        <div className="p-6 bg-[#FAF8F5] border border-neutral-300 rounded-xl text-center space-y-2 font-mono text-xs text-neutral-600 animate-pulse">
          <RotateCw className="w-6 h-6 text-[#0096D6] animate-spin mx-auto" />
          <p className="font-bold text-neutral-800">Mengirim request ke Supabase Edge Function...</p>
          <p className="text-[11px] text-neutral-500">Memeriksa routing gateway, CORS preflight, dan response status.</p>
        </div>
      )}

      {/* State: Success */}
      {testResult.status === 'success' && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-800 rounded-xl space-y-3 font-mono text-xs text-emerald-950 animate-fadeIn">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <span className="font-black text-sm tracking-wide text-emerald-900">
                EDGE_FUNCTION_ONLINE (HTTP {testResult.httpStatus || 200})
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 bg-white border border-emerald-800 rounded font-bold text-emerald-800">
                {testResult.latencyMs} ms
              </span>
              <span className="text-emerald-700">{testResult.timestamp}</span>
            </div>
          </div>

          <p className="text-emerald-900 font-bold text-xs">
            ✓ Edge Function news-search aktif.
          </p>

          <div className="bg-white border border-emerald-800/40 rounded-lg p-3 space-y-1.5 overflow-x-auto">
            <div className="flex items-center justify-between text-[11px] text-emerald-900 font-bold border-b border-emerald-100 pb-1">
              <span>Response Payload:</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(testResult.responseBody, null, 2))}
                className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin JSON'}</span>
              </button>
            </div>
            <pre className="text-[11px] text-emerald-900 overflow-x-auto">
              {JSON.stringify(testResult.responseBody, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* State: Error */}
      {testResult.status === 'error' && (
        <div className="p-4 bg-rose-50 border-2 border-rose-800 rounded-xl space-y-3 font-mono text-xs text-rose-950 animate-fadeIn">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {testResult.httpStatus === 404 ? (
                <AlertTriangle className="w-5 h-5 text-rose-700 flex-shrink-0" />
              ) : (
                <WifiOff className="w-5 h-5 text-rose-700 flex-shrink-0" />
              )}
              <span className="font-black text-sm tracking-wide text-rose-900">
                {testResult.httpStatus === 404
                  ? 'EDGE_FUNCTION_NOT_FOUND (HTTP 404)'
                  : `EDGE_FUNCTION_HTTP_ERROR ${testResult.httpStatus ? `(HTTP ${testResult.httpStatus})` : ''}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              {testResult.latencyMs !== undefined && (
                <span className="px-2 py-0.5 bg-white border border-rose-800 rounded font-bold text-rose-800">
                  {testResult.latencyMs} ms
                </span>
              )}
              <span className="text-rose-700">{testResult.timestamp}</span>
            </div>
          </div>

          {/* Diagnostic Details */}
          <div className="bg-white border border-rose-800/40 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-neutral-500 font-bold">Function Name: </span>
                <code className="px-1 py-0.5 bg-neutral-100 rounded text-neutral-900 font-bold">news-search</code>
              </div>
              <div>
                <span className="text-neutral-500 font-bold">HTTP Status: </span>
                <span className="font-bold text-rose-700">{testResult.httpStatus || 'None (Network Fail)'}</span>
              </div>
              {testResult.errorName && (
                <div>
                  <span className="text-neutral-500 font-bold">Error Type: </span>
                  <code className="px-1 py-0.5 bg-neutral-100 rounded text-neutral-800">{testResult.errorName}</code>
                </div>
              )}
              {testResult.errorMessage && (
                <div className="sm:col-span-2">
                  <span className="text-neutral-500 font-bold">Error Message: </span>
                  <span className="text-rose-900 font-semibold">{testResult.errorMessage}</span>
                </div>
              )}
            </div>

            {testResult.responseBody && (
              <div className="pt-2 border-t border-rose-100">
                <span className="text-neutral-500 font-bold block mb-1 text-[11px]">Response Body:</span>
                <pre className="p-2 bg-neutral-900 text-neutral-200 rounded text-[11px] overflow-x-auto">
                  {typeof testResult.responseBody === 'object'
                    ? JSON.stringify(testResult.responseBody, null, 2)
                    : String(testResult.responseBody)}
                </pre>
              </div>
            )}
          </div>

          {/* Solution: Deploy CLI command if HTTP 404 */}
          {testResult.httpStatus === 404 && (
            <div className="p-3 bg-neutral-900 text-emerald-400 rounded-lg border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800 pb-1">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Terminal className="w-3.5 h-3.5" />
                  Solusi: Jalankan Deployment Function
                </span>
                <span>Supabase CLI</span>
              </div>
              <p className="text-[11px] text-neutral-300">
                Kode 404 menandakan function <code className="text-emerald-300">news-search</code> belum terdaftar pada gateway Supabase. Jalankan perintah ini di terminal proyek:
              </p>
              <div className="flex items-center justify-between gap-2 p-2 bg-black/50 rounded border border-neutral-800">
                <code className="text-emerald-300 font-bold select-all text-xs">
                  npx supabase functions deploy news-search --no-verify-jwt
                </code>
                <button
                  onClick={() => copyCommand('npx supabase functions deploy news-search --no-verify-jwt')}
                  className="px-2 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 flex-shrink-0"
                >
                  {copiedCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
