import { useEffect, useState, type FormEvent } from 'react';

type Step = 'email' | 'code' | 'done';

export function SubscribeModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    const desktopBtn = document.getElementById('subscribe-btn');
    desktopBtn?.addEventListener('click', handler);
    window.addEventListener('open-subscribe', handler);
    return () => {
      desktopBtn?.removeEventListener('click', handler);
      window.removeEventListener('open-subscribe', handler);
    };
  }, []);

  if (!open) return null;

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }

      setStep('code');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/subscribe/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Invalid code');
        return;
      }

      setStep('done');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep('email');
    setEmail('');
    setCode('');
    setError('');
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={reset}>
      <div
        className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-[#e5e5e5] dark:border-[#222] w-full max-w-sm mx-4 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-[#111] dark:text-[#eee]">Get Updates</h2>
            <p className="text-sm text-[#888] dark:text-[#555]">Receive email alerts when a service goes down.</p>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-transparent px-4 py-2.5 text-sm text-[#111] dark:text-[#eee] placeholder:text-[#999] dark:placeholder:text-[#555] outline-none focus:border-[#111] dark:focus:border-[#eee] transition-colors"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#111] dark:bg-[#eee] text-white dark:text-black text-sm font-medium py-2.5 hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-[#111] dark:text-[#eee]">Check your email</h2>
            <p className="text-sm text-[#888] dark:text-[#555]">Enter the 6-digit code sent to {email}.</p>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-transparent px-4 py-2.5 text-sm text-center text-[#111] dark:text-[#eee] placeholder:text-[#999] dark:placeholder:text-[#555] outline-none focus:border-[#111] dark:focus:border-[#eee] tracking-[8px] transition-colors"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#111] dark:bg-[#eee] text-white dark:text-black text-sm font-medium py-2.5 hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#111] dark:text-[#eee]">You're subscribed</h2>
            <p className="text-sm text-[#888] dark:text-[#555]">We'll let you know when something changes.</p>
            <button
              onClick={reset}
              className="w-full rounded-xl bg-[#111] dark:bg-[#eee] text-white dark:text-black text-sm font-medium py-2.5 hover:opacity-80 transition-opacity"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
