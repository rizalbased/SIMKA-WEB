import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Check profile in public.admins
        const { data: profile, error: profileError } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (profileError) {
          await supabase.auth.signOut();
          throw new Error('Profil pengguna tidak ditemukan atau Anda tidak memiliki akses.');
        }

        if (!profile.is_active) {
          await supabase.auth.signOut();
          throw new Error('Akun Anda tidak aktif. Silakan hubungi administrator.');
        }

        onLoginSuccess();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Gagal login. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border-4 border-[#18181B] shadow-[12px_12px_0px_#18181B] rounded-3xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-[#FFD166] border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] rounded-2xl mb-2">
            <Lock className="w-8 h-8 text-[#18181B]" />
          </div>
          <h1 className="text-3xl font-black font-display text-[#18181B] uppercase tracking-tight">
            SIMKA LOGIN
          </h1>
          <p className="text-sm font-medium text-neutral-600">
            Masuk untuk mengelola Digital Signage EMKA
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-500 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
            <p className="text-sm font-bold text-rose-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-black font-display text-[#18181B] uppercase">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-[#0096D6] transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@simka.com"
                className="w-full bg-white border-3 border-[#18181B] rounded-xl py-3 pl-12 pr-4 text-sm font-bold placeholder:text-neutral-300 focus:outline-none focus:ring-0 focus:border-[#0096D6] shadow-[4px_4px_0px_#18181B] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_#18181B] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black font-display text-[#18181B] uppercase">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-[#0096D6] transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border-3 border-[#18181B] rounded-xl py-3 pl-12 pr-4 text-sm font-bold placeholder:text-neutral-300 focus:outline-none focus:ring-0 focus:border-[#0096D6] shadow-[4px_4px_0px_#18181B] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_#18181B] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0096D6] hover:bg-[#007AB0] text-white font-black font-display py-4 rounded-xl border-3 border-[#18181B] shadow-[6px_6px_0px_#18181B] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#18181B] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>MOHON TUNGGU...</span>
              </>
            ) : (
              <span>MASUK SEKARANG</span>
            )}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
            SIMKA DIGITAL SIGNAGE v2.0 • EMKA GROUP
          </p>
        </div>
      </div>
    </div>
  );
};
