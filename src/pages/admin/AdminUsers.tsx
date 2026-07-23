import { useEffect, useState, type FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { Profile } from '@/lib/database.types';

/**
 * Cliente aislado (sin persistir sesión) usado solo para dar de alta usuarios
 * nuevos vía signUp, para no pisar la sesión del admin que está logueado en
 * la pestaña actual. Usa la misma anon key: signUp es una operación pública.
 */
const signupClient = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function InviteUserForm({ onCreated }: { onCreated: () => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await signupClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({
        type: 'ok',
        text: `Cuenta creada para ${email}. Se le asignó el rol "vendedor" por defecto — puedes cambiarlo abajo.`,
      });
      setFullName('');
      setEmail('');
      setPassword('');
      setTimeout(onCreated, 1000);
    }
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card-stub grid grid-cols-1 gap-3 p-5 sm:grid-cols-4 sm:items-end sm:p-6">
      <div className="space-y-1.5">
        <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink-700">Nombre</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-tag border-2 border-ink-950/20 bg-white px-3 py-2.5 font-body text-ink-950 focus:border-ink-950 focus:outline-none"
        />
      </div>
      <div className="space-y-1.5">
        <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink-700">Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-tag border-2 border-ink-950/20 bg-white px-3 py-2.5 font-body text-ink-950 focus:border-ink-950 focus:outline-none"
        />
      </div>
      <div className="space-y-1.5">
        <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink-700">Contraseña</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          placeholder="mín. 6 caracteres"
          className="w-full rounded-tag border-2 border-ink-950/20 bg-white px-3 py-2.5 font-body text-ink-950 focus:border-ink-950 focus:outline-none"
        />
      </div>
      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? 'Creando…' : '+ Crear vendedor'}
      </button>
      {message && (
        <p
          className={`sm:col-span-4 font-body text-sm font-semibold ${
            message.type === 'ok' ? 'text-mint-600' : 'text-coral-600'
          }`}
        >
          {message.text}
        </p>
      )}
      <p className="font-body text-xs text-ink-700/70 sm:col-span-4">
        
      </p>
    </form>
  );
}

function UserRow({ profile, onChanged }: { profile: Profile; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);

  async function setRole(role: 'admin' | 'vendedor') {
    setBusy(true);
    await supabase.from('profiles').update({ role }).eq('id', profile.id);
    setBusy(false);
    onChanged();
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b-2 border-ink-800 py-3 last:border-0">
      <div>
        <p className="font-body font-semibold text-paper">{profile.full_name}</p>
        <p className="font-mono text-[11px] text-paper/50">
          {new Date(profile.created_at).toLocaleDateString('es')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="badge-pill">{profile.role}</span>
        {profile.role === 'vendedor' ? (
          <button disabled={busy} onClick={() => setRole('admin')} className="btn-secondary !px-3 !py-1.5 !text-[11px]">
            Hacer admin
          </button>
        ) : (
          <button disabled={busy} onClick={() => setRole('vendedor')} className="btn-secondary !px-3 !py-1.5 !text-[11px]">
            Quitar admin
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from('profiles').select('*').order('created_at');
    setProfiles(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <InviteUserForm onCreated={load} />

      <div className="card-stub-dark p-5 sm:p-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-paper">Equipo</h2>
        {loading && <p className="font-body text-sm text-paper/60">Cargando…</p>}
        {profiles.map((p) => (
          <UserRow key={p.id} profile={p} onChanged={load} />
        ))}
      </div>
    </div>
  );
}
