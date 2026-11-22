import * as React from 'react';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg, minorToSdg, sdgToMinor } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import { adminErrorMessage, useResetSystemSetting, useSystemSettings, useUpdateSystemSettings, type SettingValue, type SystemSetting } from '../api';
import { SETTING_GROUPS, SETTING_LABEL, SETTING_OPTION_LABEL } from '../labels';
import { InlineError } from '../components/AdminUi';

/** Money settings are stored in minor units but edited in SDG. */
const isMoney = (s: SystemSetting) => s.type === 'integer' && s.key.endsWith('Minor');

/** Draft text for number inputs; booleans/options keep their typed value. */
type Draft = Record<string, string | boolean>;

function toDraft(s: SystemSetting, value: SettingValue = s.value): string | boolean {
  if (s.type === 'boolean') return value === true;
  if (s.type === 'integer') return String(isMoney(s) ? minorToSdg(Number(value)) : value);
  return String(value);
}

/** Parses a draft back to the API value, or returns an Arabic error. */
function parse(s: SystemSetting, raw: string | boolean): { value?: SettingValue; error?: string } {
  if (s.type === 'boolean') return { value: raw === true };
  if (s.type === 'string') {
    const v = String(raw);
    if (s.options && !s.options.includes(v)) return { error: 'قيمة غير مسموح بها' };
    if (s.maxLength !== undefined && v.length > s.maxLength) return { error: `بحد أقصى ${s.maxLength} حرفًا` };
    return { value: v };
  }
  const text = String(raw).trim();
  if (text === '' || !Number.isFinite(Number(text))) return { error: 'أدخل رقمًا صحيحًا' };
  const n = Number(text);
  const value = isMoney(s) ? sdgToMinor(n) : n;
  if (!Number.isInteger(value)) return { error: isMoney(s) ? 'بحد أقصى خانتين عشريتين' : 'يجب أن يكون عددًا صحيحًا' };
  if (s.min !== undefined && value < s.min) return { error: `الحد الأدنى ${display(s, s.min)}` };
  if (s.max !== undefined && value > s.max) return { error: `الحد الأقصى ${display(s, s.max)}` };
  return { value };
}

function display(s: SystemSetting, value: SettingValue): string {
  if (s.type === 'boolean') return value ? 'مفعّل' : 'معطّل';
  if (isMoney(s)) return formatSdg(Number(value));
  if (s.options) return SETTING_OPTION_LABEL[String(value)] ?? String(value);
  return String(value);
}

function unit(s: SystemSetting): string | null {
  if (isMoney(s)) return 'ج.س';
  if (/Seconds$/.test(s.key)) return 'ثانية';
  if (/Minutes/.test(s.key)) return 'دقيقة';
  return null;
}

export const GeneralSettingsPage: React.FC = () => {
  const settings = useSystemSettings();
  const version = React.useMemo(() => JSON.stringify((settings.data ?? []).map((s) => [s.key, s.value, s.updatedAt])), [settings.data]);

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-lg">
      <Breadcrumbs items={[{ label: 'إدارة النظام' }, { label: 'الإعدادات العامة' }]} />
      {settings.isLoading ? (
        <div className="grid gap-space-md lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : settings.isError ? (
        <ErrorState title="تعذّر تحميل الإعدادات" message={adminErrorMessage(settings.error)} onRetry={() => settings.refetch()} />
      ) : settings.data ? (
        <SettingsForm key={version} settings={settings.data} />
      ) : null}
    </div>
  );
};

const SettingsForm: React.FC<{ settings: SystemSetting[] }> = ({ settings }) => {
  const { can } = useAuth();
  const readOnly = !can('settings.manage');
  const update = useUpdateSystemSettings();
  const reset = useResetSystemSetting();
  const initial = React.useMemo(() => Object.fromEntries(settings.map((s) => [s.key, toDraft(s)])) as Draft, [settings]);
  const [draft, setDraft] = React.useState<Draft>(initial);
  const [savedCount, setSavedCount] = React.useState<number | null>(null);

  const results = settings.map((s) => ({ s, ...parse(s, draft[s.key]) }));
  const errors = results.filter((r) => r.error);
  const changed = results.filter((r) => r.value !== undefined && r.value !== r.s.value);

  const groups = React.useMemo(() => {
    const known = SETTING_GROUPS.map((g) => ({ ...g, items: settings.filter((s) => s.key.split('.')[0] === g.prefix) }));
    const other = settings.filter((s) => !SETTING_GROUPS.some((g) => g.prefix === s.key.split('.')[0]));
    return [...known, { prefix: 'other', label: 'أخرى', icon: 'settings', items: other }].filter((g) => g.items.length > 0);
  }, [settings]);

  const save = () => {
    if (errors.length || !changed.length) return;
    const values = Object.fromEntries(changed.map((r) => [r.s.key, r.value as SettingValue]));
    update.mutate(values, { onSuccess: () => setSavedCount(changed.length) });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface">الإعدادات العامة</h1>
            {readOnly && <Badge variant="neutral">للقراءة فقط</Badge>}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">إعدادات تشغيل المنصة (D-SET-02). تسري التغييرات فورًا وتُسجّل في سجل التدقيق.</p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {changed.length > 0 && (
              <Button variant="ghost" onClick={() => (setDraft(initial), update.reset())}>
                تراجع
              </Button>
            )}
            <Button icon="save" disabled={!changed.length || errors.length > 0} isLoading={update.isPending} onClick={save}>
              {changed.length ? `حفظ ${changed.length} تغيير` : 'حفظ'}
            </Button>
          </div>
        )}
      </div>

      <InlineError message={update.isError ? adminErrorMessage(update.error) : reset.isError ? adminErrorMessage(reset.error) : null} />
      {savedCount !== null && !changed.length && <p className="text-xs text-secondary">تم حفظ {savedCount} إعداد.</p>}

      <div className="grid gap-space-md lg:grid-cols-2 items-start">
        {groups.map((g) => (
          <section key={g.prefix} className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
            <h2 className="font-bold text-on-surface flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">{g.icon}</span>
              {g.label}
            </h2>
            <div className="divide-y divide-surface-container">
              {g.items.map((s) => {
                const r = results.find((x) => x.s.key === s.key)!;
                const isChanged = r.value !== undefined && r.value !== s.value;
                return (
                  <SettingField
                    key={s.key}
                    setting={s}
                    value={draft[s.key]}
                    error={r.error}
                    changed={isChanged}
                    readOnly={readOnly}
                    onChange={(v) => {
                      setSavedCount(null);
                      setDraft((d) => ({ ...d, [s.key]: v }));
                    }}
                    // Server-side reset (DELETE override). The refreshed list remounts the form, so it waits for unsaved edits.
                    resetBlocked={changed.length > 0}
                    resetting={reset.isPending && reset.variables === s.key}
                    onResetDefault={() => {
                      update.reset();
                      setSavedCount(null);
                      reset.mutate(s.key);
                    }}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
};

interface SettingFieldProps {
  setting: SystemSetting;
  value: string | boolean;
  error?: string;
  changed: boolean;
  readOnly: boolean;
  onChange: (v: string | boolean) => void;
  /** Unsaved edits exist elsewhere in the form. */
  resetBlocked: boolean;
  resetting: boolean;
  onResetDefault: () => void;
}

const SettingField: React.FC<SettingFieldProps> = ({ setting: s, value, error, changed, readOnly, resetBlocked, resetting, onChange, onResetDefault }) => {
  const id = `setting-${s.key}`;
  const u = unit(s);
  const money = isMoney(s);

  let control: React.ReactNode;
  if (s.type === 'boolean') {
    control = (
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={value === true}
        disabled={readOnly}
        onClick={() => onChange(value !== true)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${value === true ? 'bg-secondary' : 'bg-outline-variant'}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${value === true ? '-translate-x-5' : '-translate-x-0.5'}`} />
      </button>
    );
  } else if (s.options) {
    control = (
      <select
        id={id}
        value={String(value)}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-40 rounded-lg bg-surface-container-lowest text-sm border border-outline-variant/60 px-2 disabled:opacity-60"
      >
        {s.options.map((o) => (
          <option key={o} value={o}>
            {SETTING_OPTION_LABEL[o] ?? o}
          </option>
        ))}
      </select>
    );
  } else {
    control = (
      <div className="flex items-center gap-1">
        <input
          id={id}
          type={s.type === 'integer' ? 'number' : 'text'}
          inputMode={money ? 'decimal' : 'numeric'}
          step={money ? 0.01 : 1}
          min={s.min !== undefined ? (money ? minorToSdg(s.min) : s.min) : undefined}
          max={s.max !== undefined ? (money ? minorToSdg(s.max) : s.max) : undefined}
          maxLength={s.maxLength}
          value={String(value)}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          dir="ltr"
          className={`h-9 ${s.type === 'string' ? 'w-56' : 'w-32'} rounded-lg bg-surface-container-lowest text-sm text-left tabular-nums border px-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-secondary/30 ${error ? 'border-error' : 'border-outline-variant/60'}`}
        />
        {u && <span className="text-xs text-on-surface-variant">{u}</span>}
      </div>
    );
  }

  const range =
    s.type === 'integer' && (s.min !== undefined || s.max !== undefined)
      ? [s.min !== undefined ? `من ${display(s, s.min)}` : null, s.max !== undefined ? `إلى ${display(s, s.max)}` : null].filter(Boolean).join(' ')
      : null;

  return (
    <div className="py-3 flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label htmlFor={id} className="text-sm font-semibold text-on-surface flex items-center gap-2 flex-wrap">
            {SETTING_LABEL[s.key] ?? s.description}
            {changed && <Badge size="sm" variant="warning">معدّل</Badge>}
            {s.isDefault && !changed && <Badge size="sm" variant="neutral">افتراضي</Badge>}
          </label>
          <p className="text-[11px] text-outline font-mono" dir="ltr">{s.key}</p>
        </div>
        {control}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-on-surface-variant">
        <span>الافتراضي: {display(s, s.defaultValue)}</span>
        {!changed && !s.isDefault && <span>الحالي: {display(s, s.value)}</span>}
        {range && <span>{range}</span>}
        {s.updatedAt && (
          <span>
            آخر تعديل {formatDateTime(s.updatedAt)}
            {s.updatedBy ? ` بواسطة ${s.updatedBy.displayName}` : ''}
          </span>
        )}
        {!readOnly && !s.isDefault && (
          <button
            type="button"
            onClick={onResetDefault}
            disabled={resetBlocked || resetting}
            title={resetBlocked ? 'احفظ التغييرات الحالية أو تراجع عنها أولًا' : 'حذف القيمة المخزنة والعودة إلى القيمة الافتراضية'}
            className="text-secondary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
          >
            {resetting ? 'جارٍ الاستعادة…' : 'استعادة الافتراضي'}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};
