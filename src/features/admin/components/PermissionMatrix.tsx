import * as React from 'react';
import type { Permission } from '../api';
import { MODULE_LABEL, PERMISSION_LABEL, label } from '../labels';

export interface PermissionMatrixProps {
  catalog: Permission[];
  selected: Set<string>;
  readOnly: boolean;
  onChange: (next: Set<string>) => void;
}

/** GET /permissions grouped by `module`, one checkbox per key. */
export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ catalog, selected, readOnly, onChange }) => {
  const groups = React.useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of catalog) map.set(p.module, [...(map.get(p.module) ?? []), p]);
    return [...map.entries()];
  }, [catalog]);

  const toggle = (keys: string[], on: boolean) => {
    const next = new Set(selected);
    for (const k of keys) {
      if (on) next.add(k);
      else next.delete(k);
    }
    onChange(next);
  };

  return (
    <div className="grid gap-space-sm md:grid-cols-2">
      {groups.map(([module, perms]) => {
        const keys = perms.map((p) => p.key);
        const count = keys.filter((k) => selected.has(k)).length;
        const all = count === keys.length;
        return (
          <fieldset key={module} className="rounded-lg border border-outline-variant/40 p-3">
            <legend className="px-1 flex items-center gap-2 text-sm font-semibold text-on-surface">
              <input
                type="checkbox"
                className="accent-secondary"
                aria-label={`كل صلاحيات ${label(MODULE_LABEL, module)}`}
                checked={all}
                ref={(el) => {
                  if (el) el.indeterminate = count > 0 && !all;
                }}
                disabled={readOnly}
                onChange={(e) => toggle(keys, e.target.checked)}
              />
              {label(MODULE_LABEL, module)}
              <span className="text-[11px] font-normal text-outline">
                {count}/{keys.length}
              </span>
            </legend>
            <ul className="space-y-1 mt-1">
              {perms.map((p) => (
                <li key={p.key}>
                  <label className={`flex items-start gap-2 rounded-md px-1 py-1 text-sm ${readOnly ? '' : 'cursor-pointer hover:bg-surface-container-low'}`}>
                    <input
                      type="checkbox"
                      className="mt-1 accent-secondary"
                      checked={selected.has(p.key)}
                      disabled={readOnly}
                      onChange={(e) => toggle([p.key], e.target.checked)}
                    />
                    <span className="flex flex-col">
                      <span>{PERMISSION_LABEL[p.key] ?? p.description ?? p.key}</span>
                      <span className="text-[11px] text-outline font-mono" dir="ltr">{p.key}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        );
      })}
    </div>
  );
};
