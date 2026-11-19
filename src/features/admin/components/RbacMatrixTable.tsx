import React, { useState } from 'react';
import type { RbacActionPermission } from '../types/admin';

interface RbacMatrixTableProps {
  permissions: RbacActionPermission[];
  onUpdatePermission: (id: string, updates: Partial<RbacActionPermission>) => void;
}

export const RbacMatrixTable: React.FC<RbacMatrixTableProps> = ({
  permissions,
  onUpdatePermission,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'assignments' | 'sessions'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [impactFilter, setImpactFilter] = useState<'all' | 'critical' | 'medium'>('all');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const filtered = permissions.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        p.module.toLowerCase().includes(q) ||
        p.resource.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (impactFilter === 'critical') {
      return p.impactLevel === 'critical' || p.impactLevel === 'high';
    }
    if (impactFilter === 'medium') {
      return p.impactLevel === 'medium' || p.impactLevel === 'normal';
    }
    return true;
  });

  const handleToggle = (
    permissionId: string,
    roleKey: 'superAdmin' | 'financialController' | 'fleetDispatcher' | 'supportLead' | 'complianceOfficer',
    currentVal: boolean
  ) => {
    // SuperAdmin cannot be disabled on critical core permissions to avoid lock-out
    if (roleKey === 'superAdmin' && currentVal) {
      return;
    }
    onUpdatePermission(permissionId, {
      [roleKey]: !currentVal,
    });
  };

  const handleSaveMatrix = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-space-md">
      {/* Tabs & Master Save Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-surface-container-high/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-lg text-xs shadow-sm transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-secondary text-on-secondary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            <span>عرض مصفوفة الصلاحيات المتقاطعة (Matrix View)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-lg text-xs transition-colors cursor-pointer ${
              activeTab === 'assignments'
                ? 'bg-secondary text-on-secondary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            <span>تعيين المشرفين للأدوار (Assignments - 18)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-lg text-xs transition-colors cursor-pointer ${
              activeTab === 'sessions'
                ? 'bg-secondary text-on-secondary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
            <span>جلسات الدخول والتوثيق الثنائي (2FA)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {saveSuccess && (
            <span className="text-secondary font-bold text-xs flex items-center gap-1 animate-in fade-in">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              تم اعتماد وحفظ المصفوفة بنجاح!
            </span>
          )}
          <span className="font-body-sm text-xs text-on-surface-variant ml-2 hidden sm:inline">
            آخر مزامنة: منذ دقيقتين
          </span>
          <button
            type="button"
            onClick={handleSaveMatrix}
            className="h-9 px-5 rounded-lg bg-secondary text-on-secondary font-label-lg text-xs shadow-sm hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>حفظ التعديلات على المصفوفة</span>
          </button>
        </div>
      </div>

      {/* Critical Governance Banner */}
      <div className="bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-md shadow-sm border border-surface-container-high/60">
        <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">gavel</span>
        </div>
        <div className="flex-1">
          <h2 className="font-headline-sm text-sm text-primary-container font-bold flex items-center gap-2">
            سياسة الفصل بين الصلاحيات (Separation of Duties - SoD)
          </h2>
          <p className="font-body-md text-xs text-on-surface mt-1 leading-relaxed">
            تتطلب أي تعديلات تمس صلاحيات{' '}
            <strong className="font-bold text-primary">الاعتماد المالي المباشر</strong> أو{' '}
            <strong className="font-bold text-primary">إلغاء التذاكر نقداً</strong> إدخال رمز التحقق
            الثنائي والموافقة الرقمية للمشرف العام لمنع أي تعارض تشغيلي أو تلاعب بالأرصدة.
          </p>
        </div>
        <div className="shrink-0 hidden md:block">
          <span className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface font-label-md text-xs font-semibold">
            بروتوكول أمني: ISO 27001
          </span>
        </div>
      </div>

      {/* Search & Filters Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm border border-surface-container-high/60">
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            filter_list
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="تصفية بالمورد (Module) أو العملية الفرعية..."
            className="w-full h-9 pr-10 pl-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-xs focus:outline-none focus:ring-2 focus:ring-secondary border border-transparent"
          />
        </div>
        <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
          <span className="font-label-md text-xs text-on-surface-variant">تصفية حسب الأثر:</span>
          <button
            type="button"
            onClick={() => setImpactFilter('all')}
            className={`px-2.5 py-1 rounded-full font-label-md text-xs transition-colors cursor-pointer ${
              impactFilter === 'all'
                ? 'bg-secondary text-on-secondary font-bold'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
            }`}
          >
            الكل ({permissions.length})
          </button>
          <button
            type="button"
            onClick={() => setImpactFilter('critical')}
            className={`px-2.5 py-1 rounded-full font-label-md text-xs transition-colors cursor-pointer ${
              impactFilter === 'critical'
                ? 'bg-primary-container text-on-primary font-bold'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
            }`}
          >
            حرج عالي
          </button>
          <button
            type="button"
            onClick={() => setImpactFilter('medium')}
            className={`px-2.5 py-1 rounded-full font-label-md text-xs transition-colors cursor-pointer ${
              impactFilter === 'medium'
                ? 'bg-secondary-container text-on-secondary-container font-bold'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
            }`}
          >
            متوسط / عادي
          </button>
        </div>
      </div>

      {/* RBAC Matrix Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container-high/60">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right">
            <thead className="bg-surface-container-high sticky top-0 z-20 text-on-surface font-label-lg text-xs">
              <tr>
                <th className="py-3 px-space-md text-right w-64" scope="col">
                  الوحدة والمورد (Module)
                </th>
                <th className="py-3 px-space-md text-right min-w-[220px]" scope="col">
                  الوظيفة / الإجراء الفرعي
                </th>
                <th className="py-3 px-3 text-center" scope="col" title="المشرف العام">
                  المشرف العام
                </th>
                <th className="py-3 px-3 text-center" scope="col" title="المدقق المالي">
                  المدقق المالي
                </th>
                <th className="py-3 px-3 text-center" scope="col" title="مدير الأسطول">
                  مدير الأسطول
                </th>
                <th className="py-3 px-3 text-center" scope="col" title="مسؤول الدعم">
                  مسؤول الدعم
                </th>
                <th className="py-3 px-3 text-center" scope="col" title="ضابط الامتثال">
                  ضابط الامتثال
                </th>
                <th className="py-3 px-space-md text-center" scope="col">
                  مستوى الأثر و SoD
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface font-body-sm text-xs">
              {filtered.map((perm) => (
                <tr key={perm.id} className="hover:bg-surface-container-low/60 transition-colors">
                  {/* Module & Resource */}
                  <td className="py-3 px-space-md font-semibold text-on-surface">
                    <span className="block text-secondary text-[11px] font-bold">{perm.module}</span>
                    <span className="text-on-surface text-xs mt-0.5">{perm.resource}</span>
                  </td>

                  {/* Action Name & Desc */}
                  <td className="py-3 px-space-md">
                    <span className="font-bold text-on-surface block">{perm.name}</span>
                    <span className="text-on-surface-variant text-[11px] block mt-0.5 leading-relaxed">
                      {perm.description}
                    </span>
                  </td>

                  {/* Super Admin Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={perm.superAdmin}
                      disabled
                      className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-not-allowed accent-primary"
                    />
                  </td>

                  {/* CFO Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={perm.financialController}
                      onChange={() =>
                        handleToggle(perm.id, 'financialController', perm.financialController)
                      }
                      className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer accent-secondary"
                    />
                  </td>

                  {/* Fleet Dispatcher Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={perm.fleetDispatcher}
                      onChange={() =>
                        handleToggle(perm.id, 'fleetDispatcher', perm.fleetDispatcher)
                      }
                      className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer accent-secondary"
                    />
                  </td>

                  {/* Support Lead Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={perm.supportLead}
                      onChange={() => handleToggle(perm.id, 'supportLead', perm.supportLead)}
                      className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer accent-secondary"
                    />
                  </td>

                  {/* Compliance Officer Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={perm.complianceOfficer}
                      onChange={() =>
                        handleToggle(perm.id, 'complianceOfficer', perm.complianceOfficer)
                      }
                      className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer accent-secondary"
                    />
                  </td>

                  {/* Impact & SoD */}
                  <td className="py-3 px-space-md text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full font-label-md text-[10px] font-bold ${
                          perm.impactLevel === 'critical'
                            ? 'bg-error-container text-on-error-container'
                            : perm.impactLevel === 'high'
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : 'bg-surface-container-high text-on-surface'
                        }`}
                      >
                        {perm.impactLevel === 'critical'
                          ? 'حرج قصوى'
                          : perm.impactLevel === 'high'
                          ? 'أثر مرتفع'
                          : 'تشغيلي عادي'}
                      </span>
                      {perm.requiresSoD && (
                        <span
                          className="p-1 rounded bg-surface-container-high text-primary-container"
                          title="يتطلب بروتوكول الفصل الصارم للمهام (SoD Required)"
                        >
                          <span className="material-symbols-outlined text-[14px]">gavel</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
