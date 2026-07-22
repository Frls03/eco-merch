import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { session, signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) setError('Correo o contraseña incorrectos.');
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <form onSubmit={handleSubmit} className="card-stub -rotate-1 space-y-5 p-6 sm:p-8">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-950">Control de stock</h1>
            <p className="mt-1 font-body text-sm text-ink-700">
              Ingresa con tu cuenta de equipo para continuar.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="font-mono text-xs font-bold uppercase tracking-wider text-ink-700">
              Correo
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-tag border-2 border-ink-950/20 bg-white px-4 py-2.5 font-body text-ink-950 placeholder:text-ink-700/40 focus:border-ink-950 focus:outline-none"
              placeholder="tu@nexlum.site"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="font-mono text-xs font-bold uppercase tracking-wider text-ink-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-tag border-2 border-ink-950/20 bg-white px-4 py-2.5 font-body text-ink-950 placeholder:text-ink-700/40 focus:border-ink-950 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-tag border-2 border-coral-500 bg-coral-500/10 px-3 py-2 font-body text-sm font-semibold text-coral-500">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>

          <p className="text-center font-body text-xs text-ink-700/70">
            ¿No tienes cuenta? Pídele a un administrador que te la cree desde el panel.
          </p>
        </form>
      </div>
    </div>
  );
}
