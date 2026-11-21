import * as React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { errorMessage } from '../../lib/api/errors';
import { useAuth, type OtpChallenge } from './auth-context';

/** Admin sign-in: Sudan phone → 6-digit OTP (API_CONVENTIONS §2). */
export const LoginPage: React.FC = () => {
  const { status, requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/overview';

  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [challenge, setChallenge] = React.useState<OtpChallenge | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (status === 'authenticated') return <Navigate to={from} replace />;

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await requestOtp(phone.trim());
      setChallenge(result);
      setCode('');
      setCooldown(result.cooldownSeconds ?? 60);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;
    setError(null);
    setBusy(true);
    try {
      await verifyOtp({ phone: phone.trim(), code: code.trim(), challengeId: challenge.challengeId });
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-space-md" dir="rtl">
      <div className="w-full max-w-sm bg-surface-container-lowest border border-surface-container-high rounded-2xl shadow-sm p-space-lg space-y-space-md">
        <div className="text-center space-y-1">
          <img src="/log-zool.svg" alt="ZoolGo" className="h-12 mx-auto" />
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">لوحة الإدارة المركزية</h1>
          <p className="text-body-sm text-on-surface-variant">
            {challenge ? `أدخل الرمز المرسل إلى ${phone}` : 'سجّل الدخول برقم الجوال المسجّل'}
          </p>
        </div>

        {!challenge ? (
          <form onSubmit={sendCode} className="space-y-space-md">
            <Input
              label="رقم الجوال"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+2499XXXXXXXX"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" isLoading={busy} disabled={phone.trim().length < 9}>
              إرسال رمز التحقق
            </Button>
          </form>
        ) : (
          <form onSubmit={confirm} className="space-y-space-md">
            <Input
              label="رمز التحقق (6 أرقام)"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              dir="ltr"
              className="text-center tracking-[0.5em] font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
              required
            />
            {challenge.devOtp && (
              <p className="text-xs text-on-surface-variant bg-surface-container rounded-lg px-3 py-2">
                بيئة التطوير — الرمز: <span className="font-mono font-bold" dir="ltr">{challenge.devOtp}</span>
              </p>
            )}
            <Button type="submit" className="w-full" isLoading={busy} disabled={code.length !== 6}>
              تأكيد الدخول
            </Button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" className="text-secondary disabled:text-outline" disabled={cooldown > 0 || busy} onClick={() => sendCode()}>
                {cooldown > 0 ? `إعادة الإرسال بعد ${cooldown} ث` : 'إعادة إرسال الرمز'}
              </button>
              <button type="button" className="text-on-surface-variant" onClick={() => setChallenge(null)}>
                تغيير الرقم
              </button>
            </div>
          </form>
        )}

        {error && (
          <p role="alert" className="text-sm text-error bg-error-container/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
