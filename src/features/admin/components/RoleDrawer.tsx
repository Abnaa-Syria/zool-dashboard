import React, { useState } from 'react';
import type { AdminDepartment, RoleArchetype } from '../types/admin';

interface RoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRole: (roleData: {
    nameArabic: string;
    nameEnglish: string;
    department: AdminDepartment;
    description: string;
    colorToken: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'surface-tint';
    financialApprovalCapSdg?: number;
    riskLevel?: 'high' | 'medium' | 'low';
  }) => void;
  selectedRole?: RoleArchetype | null;
}

export const RoleDrawer: React.FC<RoleDrawerProps> = ({
  isOpen,
  onClose,
  onCreateRole,
  selectedRole,
}) => {
  const [nameArabic, setNameArabic] = useState(selectedRole?.nameArabic || 'مدقق تسويات وضمان الجودة المالية');
  const [nameEnglish, setNameEnglish] = useState(selectedRole?.nameEnglish || 'Settlements & Quality Auditor');
  const [department, setDepartment] = useState<AdminDepartment>(selectedRole?.department || 'finance');
  const [description, setDescription] = useState(
    selectedRole?.description ||
      'متابعة وتدقيق حركات شحن محافظ الوكلاء وتأكيد تسويات مبيعات تذاكر الحافلات، مع التحقق الاستباقي من الإشعارات المصرفية ومنع العمليات المكررة.'
  );
  const [colorToken, setColorToken] = useState<RoleArchetype['colorToken']>(selectedRole?.colorToken || 'secondary');
  const [financialApprovalCap, setFinancialApprovalCap] = useState<number>(selectedRole?.financialApprovalCapSdg || 250000);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(true);
  const [sodStrictCheck, setSodStrictCheck] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameArabic.trim() || !nameEnglish.trim()) return;

    onCreateRole({
      nameArabic: nameArabic.trim(),
      nameEnglish: nameEnglish.trim(),
      department,
      description: description.trim(),
      colorToken,
      financialApprovalCapSdg: financialApprovalCap,
      riskLevel: department === 'finance' || department === 'executive' ? 'high' : 'medium',
    });

    onClose();
  };

  return (
    <>
      {/* Soft Emerald Backdrop Wash */}
      <div
        className="fixed inset-0 bg-tertiary-container/30 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Left-Anchored Configuration Drawer Container (580px width) */}
      <aside
        aria-label="نافذة ودرج إنشاء وتعيين دور إداري جديد"
        className="fixed top-0 left-0 bottom-0 w-full max-w-[580px] bg-surface-container-lowest z-50 flex flex-col shadow-2xl border-r border-surface-container-high animate-in slide-in-from-left duration-300"
      >
        {/* Drawer Header */}
        <div className="px-space-lg py-space-md bg-surface-container-low shrink-0 flex items-start justify-between border-b border-surface-container-high">
          <div className="space-y-1 pr-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                إعدادات الحوكمة والأمان v2.4
              </span>
              <span className="font-label-md text-xs text-on-surface-variant font-mono">
                #ROL-2024-91
              </span>
            </div>
            <h2 className="font-headline-md text-base text-on-surface font-bold pt-1">
              {selectedRole ? 'تعديل بيانات الدور الوظيفي' : 'إنشاء دور وظيفي جديد وضبط الصلاحيات'}
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              حدد مسمى الدور، المستوى الإداري، وفصّل الصلاحيات الممنوحة لمنع تعارض الصلاحيات (SoD
              Compliance) وحماية المعاملات النقدية.
            </p>
          </div>
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
            title="إغلاق النافذة"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-space-lg py-space-md space-y-space-lg">
          {/* Section 1: Role Basic Info */}
          <section className="space-y-space-md">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-md text-xs font-bold">
                1
              </div>
              <div>
                <h3 className="font-headline-sm text-sm text-on-surface font-bold">
                  البيانات الأساسية للدور الوظيفي
                </h3>
                <span className="font-body-sm text-[11px] text-on-surface-variant">
                  التعريف الإداري والارتباط الهيكلي بالنظام
                </span>
              </div>
            </div>

            <div className="space-y-space-sm bg-surface-container-low/60 p-space-md rounded-xl border border-surface-container-high/60">
              {/* Arabic Name */}
              <div>
                <label className="block font-label-lg text-xs font-semibold text-on-surface mb-1">
                  اسم الدور الإداري باللغة العربية <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameArabic}
                  onChange={(e) => setNameArabic(e.target.value)}
                  placeholder="مثال: مدقق تسويات وضمان الجودة المالية"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              {/* English Name */}
              <div>
                <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
                  المسمى بالإنجليزية (System Identifier) <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameEnglish}
                  onChange={(e) => setNameEnglish(e.target.value)}
                  dir="ltr"
                  placeholder="e.g. Settlements & Quality Auditor"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary text-left font-mono"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
                  القسم التابع له <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as AdminDepartment)}
                    className="w-full h-10 px-3 pr-4 pl-9 rounded-lg bg-surface-container-lowest text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary appearance-none cursor-pointer"
                  >
                    <option value="finance">القسم المالي والمحاسبة المركزية</option>
                    <option value="operations">قسم العمليات الميدانية والجدولة</option>
                    <option value="support">قسم خدمة العملاء والوكلاء</option>
                    <option value="security">قسم الحوكمة وإدارة المخاطر والامتثال</option>
                    <option value="executive">الإدارة العليا التنفيذية</option>
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
                  الوصف الوظيفي والغرض من الدور
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب نبذة توضح نطاق صلاحيات هذا الدور وغرض اعتماده داخل منصة ZoolGo..."
                  className="w-full p-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary resize-none leading-relaxed"
                />
              </div>

              {/* Color Token */}
              <div>
                <label className="block font-label-md text-xs font-semibold text-on-surface mb-2">
                  لون الشارة الرمزية للدور في واجهات النظام
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { token: 'secondary' as const, label: 'زمردي', bg: 'bg-secondary' },
                    { token: 'primary' as const, label: 'قرمزي', bg: 'bg-primary-container' },
                    { token: 'tertiary' as const, label: 'أخضر داكن', bg: 'bg-tertiary-container' },
                    { token: 'surface-tint' as const, label: 'بنفسجي', bg: 'bg-surface-tint' },
                    { token: 'outline' as const, label: 'رمادي', bg: 'bg-outline' },
                  ].map((item) => (
                    <button
                      key={item.token}
                      type="button"
                      onClick={() => setColorToken(item.token)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        colorToken === item.token
                          ? 'border-secondary bg-surface-container-lowest shadow-xs font-bold text-on-surface'
                          : 'border-transparent text-on-surface-variant hover:bg-surface-container-lowest'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${item.bg}`} />
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Security & Governance Constraints */}
          <section className="space-y-space-md">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-md text-xs font-bold">
                2
              </div>
              <div>
                <h3 className="font-headline-sm text-sm text-on-surface font-bold">
                  قيود الأمان وإجراءات الفصل بين المهام (SoD)
                </h3>
                <span className="font-body-sm text-[11px] text-on-surface-variant">
                  حوكمة الصرف المالي وإلزام بروتوكولات التحقق
                </span>
              </div>
            </div>

            <div className="space-y-space-sm bg-surface-container-low/60 p-space-md rounded-xl border border-surface-container-high/60">
              {/* Financial Cap Limit in SDG */}
              <div>
                <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
                  سقف الاعتماد المالي المباشر لكل معاملة (ج.س)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={financialApprovalCap}
                    onChange={(e) => setFinancialApprovalCap(Number(e.target.value))}
                    className="w-full h-10 px-3 pl-16 rounded-lg bg-surface-container-lowest text-on-surface font-tabular-stat text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant pointer-events-none">
                    ج.س
                  </span>
                </div>
                <span className="font-body-sm text-[10px] text-on-surface-variant mt-1 block">
                  أي معاملة تتجاوز هذا السقف تتطلب توقيعاً ثنائياً من المشرف العام تلقائياً.
                </span>
              </div>

              {/* 2FA Enforcement Toggle */}
              <label className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest border border-surface-container cursor-pointer hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    phonelink_lock
                  </span>
                  <div>
                    <span className="font-label-md text-xs font-bold text-on-surface block">
                      إلزام التحقق الثنائي (2FA Enforcement)
                    </span>
                    <span className="font-body-sm text-[10px] text-on-surface-variant">
                      منع تسجيل الدخول دون رمز TOTP أو مفتاح صلب
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={requiresTwoFactor}
                  onChange={(e) => setRequiresTwoFactor(e.target.checked)}
                  className="w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary"
                />
              </label>

              {/* SoD Strict Enforcement Toggle */}
              <label className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest border border-surface-container cursor-pointer hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">
                    gavel
                  </span>
                  <div>
                    <span className="font-label-md text-xs font-bold text-on-surface block">
                      حظر تعارض المصالح (SoD Separation)
                    </span>
                    <span className="font-body-sm text-[10px] text-on-surface-variant">
                      منع شاغل هذا الدور من تعديل رحلات الحافلات الميدانية
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sodStrictCheck}
                  onChange={(e) => setSodStrictCheck(e.target.checked)}
                  className="w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary"
                />
              </label>
            </div>
          </section>

          {/* Drawer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-surface-container">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-xs hover:bg-surface-dim transition-colors"
            >
              إلغاء التغييرات
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-xs font-bold hover:opacity-95 transition-opacity shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>{selectedRole ? 'حفظ التعديلات المعتمدة' : 'اعتماد وإنشاء الدور الوظيفي'}</span>
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};
