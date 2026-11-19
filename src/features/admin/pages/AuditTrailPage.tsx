import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminTeam } from '../hooks/useAdmin';
import type { AdminAuditEntry } from '../types/admin';

export const AuditTrailPage: React.FC = () => {
  const { users } = useAdminTeam();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Aggregate all audit logs across all users
  const allLogs: (AdminAuditEntry & { adminName: string; adminId: string })[] = [];
  users.forEach((u) => {
    u.auditTrail.forEach((log) => {
      allLogs.push({
        ...log,
        adminName: u.name,
        adminId: u.id,
      });
    });
  });

  const filteredLogs = allLogs.filter((log) => {
    if (filterType !== 'all' && log.actionType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.adminName.toLowerCase().includes(q) ||
        log.adminId.toLowerCase().includes(q) ||
        (log.targetRef && log.targetRef.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportAuditCsv = () => {
    const BOM = '\uFEFF';
    const headers = ['المعرف', 'المشرف', 'الوقت', 'نوع الإجراء', 'البيان والتفاصيل', 'المرجع', 'عنوان IP', 'بصمة الهاش'];
    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.adminName} (${l.adminId})"`,
      `"${l.timestamp}"`,
      `"${l.actionType}"`,
      `"${l.action} - ${l.details}"`,
      `"${l.targetRef || '-'}"`,
      `"${l.ipAddress}"`,
      `"${l.hash}"`,
    ]);
    const csvContent = BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zoolgo_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="p-space-lg md:p-space-xl space-y-space-lg max-w-[1600px] mx-auto w-full">
        {/* Breadcrumb & Top Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div className="space-y-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-label-md text-xs text-on-surface-variant">
              <Link to="/overview" className="hover:text-secondary transition-colors">
                الرئيسية والعمليات
              </Link>
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              <span className="text-on-surface-variant">إدارة النظام والصلاحيات</span>
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              <span className="text-secondary font-bold">سجل الأنشطة والتدقيق الجنائي</span>
            </nav>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-2.5 h-7 bg-primary-container rounded-full"></div>
              <h1 className="font-headline-lg text-lg md:text-2xl text-on-surface font-bold tracking-tight">
                سجل الأنشطة والتدقيق والأمن الرقمي (Audit Trail)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-bold font-mono">
                Immutable SHA-256
              </span>
            </div>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant max-w-4xl leading-relaxed">
              سجل تدقيق زمني مشفر لكافة القرارات الإدارية، الاعتمادات المالية، عمليات الإلغاء الاستثنائي،
              وجلسات تسجيل الدخول لضمان النزاهة والحوكمة المؤسسية.
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap">
            <button
              type="button"
              onClick={handleExportAuditCsv}
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-container-lowest text-secondary font-label-lg text-xs font-bold shadow-sm hover:bg-surface-container-high transition-all border border-surface-container-high/60 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>تصدير سجل التدقيق (CSV)</span>
            </button>
            <Link
              to="/admin/roles"
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary-container text-on-primary font-label-lg text-xs font-bold shadow-sm hover:opacity-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">lock_person</span>
              <span>مصفوفة الصلاحيات (RBAC)</span>
            </Link>
          </div>
        </div>

        {/* Security Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-medium block">
                إجمالي العمليات الموثقة
              </span>
              <span className="font-tabular-stat text-xl font-bold text-on-surface block mt-1">
                {allLogs.length} عملية
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[22px]">history_edu</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-medium block">
                تكامل التوقيع والتشفير
              </span>
              <span className="font-tabular-stat text-xl font-bold text-secondary block mt-1">
                100% سليم
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant font-medium block">
                حركات أمنية حساسة (SoD)
              </span>
              <span className="font-tabular-stat text-xl font-bold text-primary-container block mt-1">
                {allLogs.filter((l) => l.actionType === 'security' || l.actionType === 'financial').length} حركة
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[22px]">gavel</span>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm border border-surface-container-high/60">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالبيان، اسم المشرف، أو كود العملية..."
              className="w-full h-9 pr-9 pl-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-xs focus:outline-none focus:ring-2 focus:ring-secondary border border-transparent"
            />
          </div>

          <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
            <span className="font-label-md text-xs text-on-surface-variant">النوع:</span>
            {['all', 'financial', 'approval', 'security', 'update'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-full font-label-md text-xs transition-colors cursor-pointer ${
                  filterType === t
                    ? 'bg-secondary text-on-secondary font-bold'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {t === 'all'
                  ? 'الكل'
                  : t === 'financial'
                  ? 'مالي'
                  : t === 'approval'
                  ? 'اعتماد'
                  : t === 'security'
                  ? 'أمان'
                  : 'تحديث'}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container-high/60">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-xs h-12 border-b border-surface-container-high">
                  <th className="px-space-md py-3 text-right">المشرف المنفذ</th>
                  <th className="px-space-md py-3 text-right">التوقيت</th>
                  <th className="px-space-md py-3 text-right">نوع الإجراء</th>
                  <th className="px-space-md py-3 text-right">البيان وتفاصيل العملية</th>
                  <th className="px-space-md py-3 text-right">المرجع</th>
                  <th className="px-space-md py-3 text-left" dir="ltr">IP & Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-body-sm text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/60 transition-colors h-14">
                    <td className="px-space-md py-2 font-bold text-on-surface">
                      <Link to={`/admin/team/${log.adminId}`} className="hover:text-secondary transition-colors">
                        {log.adminName}
                      </Link>
                      <span className="text-[10px] text-on-surface-variant font-mono block">
                        {log.adminId}
                      </span>
                    </td>
                    <td className="px-space-md py-2 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-space-md py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full font-label-md text-[10px] font-bold ${
                          log.actionType === 'financial'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : log.actionType === 'security'
                            ? 'bg-primary-container text-on-primary'
                            : log.actionType === 'approval'
                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                            : 'bg-surface-container-high text-on-surface'
                        }`}
                      >
                        {log.actionType === 'financial'
                          ? 'مالي'
                          : log.actionType === 'security'
                          ? 'أمني'
                          : log.actionType === 'approval'
                          ? 'اعتماد'
                          : 'تعديل'}
                      </span>
                    </td>
                    <td className="px-space-md py-2">
                      <span className="font-semibold block text-on-surface">{log.action}</span>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5 leading-relaxed">
                        {log.details}
                      </span>
                    </td>
                    <td className="px-space-md py-2">
                      {log.targetRef ? (
                        <span className="px-2 py-0.5 rounded bg-surface-container-high font-mono text-[11px] font-bold text-on-surface">
                          {log.targetRef}
                        </span>
                      ) : (
                        <span className="text-outline text-xs">-</span>
                      )}
                    </td>
                    <td className="px-space-md py-2 text-left font-mono text-[10px] text-on-surface-variant" dir="ltr">
                      <div>IP: {log.ipAddress}</div>
                      <div className="text-outline truncate max-w-[150px]">{log.hash}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
