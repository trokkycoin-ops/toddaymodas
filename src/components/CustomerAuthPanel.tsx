import React, { useState } from 'react';
import { ArrowRight, KeyRound, LoaderCircle, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { Logo } from './Logo';

type AuthMode = 'login' | 'register' | 'recovery';

export function CustomerAuthPanel() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === 'recovery') {
        const result: any = await api('/auth/lost-password', { method: 'POST', body: { user_login: email } });
        setMessage(result.data?.message || 'Confira seu e-mail para redefinir a senha.');
      } else {
        const result: any = await api(`/auth/${mode}`, {
          method: 'POST',
          body: mode === 'login' ? { username: email, password } : { name, email, password },
        });
        if (result.success) window.location.reload();
      }
    } catch (requestError: any) {
      setError(requestError?.message || 'Não foi possível concluir a operação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7fb] px-4 py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-[#EBDDF0] bg-white shadow-xl lg:grid-cols-[1fr_1.05fr]">
        <section className="relative flex flex-col justify-between overflow-hidden bg-[#271E2D] p-7 text-white sm:p-10">
          <div className="relative z-10">
            <Logo variant="full" size="md" theme="dark" />
            <span className="mt-12 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#DFBA5A]">Área exclusiva</span>
            <h1 className="mt-4 max-w-sm font-serif text-3xl font-black leading-tight sm:text-4xl">Suas compras, sempre por perto.</h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#DAC9DF]">Acompanhe pedidos, rastreios, recibos e avaliações em um único lugar.</p>
          </div>
          <div className="relative z-10 mt-12 flex items-center gap-2 text-xs font-bold text-[#DAC9DF]"><ShieldCheck className="h-4 w-4 text-[#DFBA5A]" /> Seus dados ficam protegidos.</div>
        </section>
        <section className="p-6 sm:p-10">
          <div className="mb-7 flex gap-2 border-b border-[#EBDDF0] pb-3">
            {(['login', 'register'] as AuthMode[]).map((tab) => <button key={tab} type="button" onClick={() => { setMode(tab); setError(null); setMessage(null); }} className={`rounded-xl px-4 py-2 text-xs font-black ${mode === tab ? 'bg-[#271E2D] text-white' : 'text-gray-500 hover:bg-[#FAF7FA]'}`}>{tab === 'login' ? 'Entrar' : 'Criar conta'}</button>)}
          </div>
          <h2 className="font-serif text-2xl font-black text-[#271E2D]">{mode === 'login' ? 'Bem-vinda de volta' : mode === 'register' ? 'Crie sua conta' : 'Recuperar senha'}</h2>
          <p className="mt-1 text-xs text-gray-500">{mode === 'login' ? 'Entre para acompanhar seus pedidos.' : mode === 'register' ? 'Seu cadastro leva menos de um minuto.' : 'Enviaremos instruções para seu e-mail.'}</p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === 'register' && <label className="block text-xs font-bold text-gray-700">Nome<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-[#EBDDF0] bg-[#FAF7FA] px-3 py-3 font-normal outline-none focus:border-[#846391]" /></label>}
            <label className="block text-xs font-bold text-gray-700">E-mail<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-[#EBDDF0] bg-[#FAF7FA] px-3 py-3 font-normal outline-none focus:border-[#846391]" /></label>
            {mode !== 'recovery' && <label className="block text-xs font-bold text-gray-700">Senha<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-[#EBDDF0] bg-[#FAF7FA] px-3 py-3 font-normal outline-none focus:border-[#846391]" /></label>}
            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</p>}
            {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">{message}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#271E2D] px-4 py-3 text-xs font-black text-white disabled:opacity-60">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}{mode === 'login' ? 'Entrar na minha conta' : mode === 'register' ? 'Criar minha conta' : 'Enviar instruções'}</button>
          </form>
          {mode !== 'recovery' && <button type="button" onClick={() => { setMode('recovery'); setError(null); setMessage(null); }} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#846391] hover:text-[#271E2D]"><KeyRound className="h-3.5 w-3.5" /> Esqueci minha senha</button>}
          {mode === 'recovery' && <button type="button" onClick={() => setMode('login')} className="mt-5 text-xs font-bold text-[#846391]">Voltar para o login</button>}
        </section>
      </div>
    </main>
  );
}
