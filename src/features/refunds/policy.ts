import { formatSdg } from '../../lib/money';
import type { SystemSetting } from '../admin/api';

/** Human value for a policy setting (read-only view; editing happens on the settings page). */
export function formatPolicyValue(s: Pick<SystemSetting, 'key' | 'type' | 'value'>): string {
  if (s.type === 'boolean') return s.value === true ? 'مفعّل' : 'معطّل';
  if (s.type !== 'integer') return String(s.value);
  const n = Number(s.value);
  if (s.key.endsWith('Minor')) return formatSdg(n);
  if (s.key.endsWith('BasisPoints')) return `${(n / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
  if (/Minutes/.test(s.key)) return `${n.toLocaleString('en-US')} دقيقة`;
  if (/Seconds$/.test(s.key)) return `${n.toLocaleString('en-US')} ثانية`;
  return n.toLocaleString('en-US');
}
