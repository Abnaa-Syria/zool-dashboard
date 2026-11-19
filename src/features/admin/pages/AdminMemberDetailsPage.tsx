import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminUser } from '../hooks/useAdmin';

export const AdminMemberDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const adminId = id || 'ADM-004';
  const {
    user,
    updateUser,
    terminateSession,
    terminateAllSessions,
    freezeAccount,
    unfreezeAccount,
  } = useAdminUser(adminId);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  if (!user) {
    return (
      <div className="p-space-xl text-center">
        <h2 className="text-xl font-bold text-on-surface">لم يتم العثور على المشرف المطلوب ({adminId})</h2>
        <Link to="/admin/team" className="text-secondary font-bold mt-4 inline-block">
          العودة إلى قائمة فريق الإدارة
        </Link>
      </div>
    );
  }

  const isFrozen = user.status === 'restricted';

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="w-full max-w-[1520px] mx-auto p-space-lg lg:p-space-xl space-y-space-lg">
        {/* Top Breadcrumb & Return Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <nav aria-label="مسار التنقل" className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-xs">
            <Link to="/overview" className="hover:text-secondary transition-colors">
              الرئيسية والعمليات
            </Link>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_left</span>
            <span className="text-on-surface-variant">إدارة النظام والصلاحيات</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_left</span>
            <Link to="/admin/team" className="hover:text-secondary transition-colors">
              فريق الإدارة
            </Link>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_left</span>
            <span className="text-on-surface font-semibold bg-surface-container-high px-2.5 py-0.5 rounded-full">
              ملف المشرف: {user.name} ({user.id})
            </span>
          </nav>

          <Link
            to="/admin/team"
            className="inline-flex items-center gap-space-xs self-start md:self-auto px-3.5 py-2 rounded-lg bg-surface-container-lowest text-secondary font-label-lg text-xs font-bold shadow-sm hover:bg-surface-container transition-colors border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            <span>العودة إلى قائمة فريق الإدارة</span>
          </Link>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div className="p-3 bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-between font-label-md text-xs font-bold shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{notification}</span>
            </div>
            <button type="button" onClick={() => setNotification(null)}>
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Header Banner: Admin Persona & Core Actions */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg border border-surface-container-high/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md">
            {/* Avatar with Status Indicator */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-xl bg-surface-container-high overflow-hidden shadow-sm flex items-center justify-center">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-headline-lg text-2xl font-bold text-secondary">
                    {user.avatarInitials}
                  </span>
                )}
              </div>
              <span
                className={`absolute -bottom-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md ring-2 ring-surface-container-lowest ${
                  isFrozen ? 'bg-error text-on-error' : 'bg-secondary text-on-secondary'
                }`}
                title={isFrozen ? 'حساب مجمد' : 'متصل ونشط'}
              >
                {!isFrozen && <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>}
                {isFrozen && <span className="material-symbols-outlined text-[12px]">lock</span>}
              </span>
            </div>

            {/* Identity & Role Badges */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-space-xs">
                <h1 className="font-headline-lg text-lg md:text-xl text-on-surface font-bold tracking-tight">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-md text-xs font-mono font-bold">
                  #{user.id}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-md text-xs font-semibold ${
                    isFrozen
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isFrozen ? 'bg-error' : 'bg-secondary'}`}
                  ></span>
                  {isFrozen ? 'حساب مقيد احترازياً' : 'حساب نشط ومعتمد'}
                </span>
              </div>
              <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-space-xs flex-wrap">
                <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
                <span className="font-bold text-on-surface">{user.arabicRoleTitle}</span>
                <span className="text-outline">•</span>
                <span>{user.workLocation}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              type="button"
              onClick={() => {
                const newPhone = prompt('أدخل رقم الهاتف الجديد للمشرف:', user.phone);
                if (newPhone && newPhone.trim()) {
                  updateUser({ phone: newPhone.trim() });
                  showNotice('تم تحديث بيانات الاتصال بنجاح.');
                }
              }}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-label-lg text-xs font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit_square</span>
              <span>تعديل بيانات الحساب</span>
            </button>

            {isFrozen ? (
              <button
                type="button"
                onClick={() => {
                  unfreezeAccount();
                  showNotice('تم رفع التجميد واستعادة صلاحيات المشرف.');
                }}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-secondary text-on-secondary hover:opacity-90 transition-colors font-label-lg text-xs font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">lock_open</span>
                <span>رفع التجميد وتفعيل الحساب</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const reason = prompt('سبب تجميد الحساب:', 'تدقيق أمني احترازي دوري');
                  if (reason) {
                    freezeAccount(reason);
                    showNotice('تم تجميد الحساب وإلغاء الجلسات النشطة فوراً.');
                  }
                }}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-surface-container text-error hover:bg-error-container hover:text-on-error-container transition-colors font-label-lg text-xs font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">lock_person</span>
                <span>تجميد الحساب مؤقتاً</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (confirm('هل أنت متأكد من إنهاء كافة الجلسات النشطة لهذا المشرف؟')) {
                  terminateAllSessions();
                  showNotice('تم إنهاء كافة الجلسات النشطة بنجاح.');
                }
              }}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary-container text-on-primary hover:bg-primary shadow-sm transition-colors font-label-lg text-xs font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
              <span>إنهاء كافة الجلسات النشطة فوراً</span>
            </button>
          </div>
        </div>

        {/* Two-Column Asymmetric Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Right Column: Profile Identity, Security Policies & Scopes (5 Cols) */}
          <div className="lg:col-span-5 space-y-space-lg">
            {/* 1. Administrator Identity Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md border border-surface-container-high/60">
              <div className="flex items-center justify-between pb-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[22px]">badge</span>
                  <h2 className="font-headline-sm text-sm text-on-surface font-bold">
                    البيانات الإدارية والوظيفية
                  </h2>
                </div>
                <span className="font-label-md text-xs text-secondary bg-surface-container-lowest px-2 py-0.5 rounded font-mono">
                  ZoolGo Internal
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs text-xs">
                <div className="bg-surface-container-low p-space-sm rounded-lg">
                  <div className="text-on-surface-variant font-medium">الاسم الرسمي الكامل</div>
                  <div className="text-on-surface font-bold mt-1">{user.name}</div>
                </div>
                <div className="bg-surface-container-low p-space-sm rounded-lg">
                  <div className="text-on-surface-variant font-medium">الرقم التعريفي (UID)</div>
                  <div className="text-on-surface font-mono font-bold mt-1">{user.employeeCode}</div>
                </div>
                <div className="sm:col-span-2 bg-surface-container-low p-space-sm rounded-lg">
                  <div className="text-on-surface-variant font-medium">المسمى الإشرافي المعتمد</div>
                  <div className="text-on-surface font-semibold mt-1">{user.arabicRoleTitle}</div>
                </div>
                <div className="sm:col-span-2 bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-on-surface-variant font-medium">البريد الإلكتروني المهني</div>
                    <div className="text-on-surface font-mono font-medium mt-1">{user.email}</div>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    mark_email_read
                  </span>
                </div>
                <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-on-surface-variant font-medium">هاتف الاتصال المشفر</div>
                    <div className="text-on-surface font-mono font-medium mt-1" dir="ltr">
                      {user.phone}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-[20px]">call</span>
                </div>
                <div className="bg-surface-container-low p-space-sm rounded-lg">
                  <div className="text-on-surface-variant font-medium">تاريخ مباشرة العمل</div>
                  <div className="text-on-surface font-medium mt-1">{user.joinedDate}</div>
                </div>
              </div>
            </div>

            {/* 2. Security & Zero-Trust Profile */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md border border-surface-container-high/60">
              <div className="flex items-center justify-between pb-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[22px]">security</span>
                  <h2 className="font-headline-sm text-sm text-on-surface font-bold">
                    إعدادات الأمان وسياسة الوصول
                  </h2>
                </div>
                <span className="font-label-md text-xs text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-full font-bold">
                  Tier-1 Cleared
                </span>
              </div>

              <div className="space-y-space-sm text-xs">
                {/* 2FA */}
                <div className="p-space-sm bg-surface-container-low rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-highest text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">phonelink_lock</span>
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">المصادقة الثنائية (2FA)</div>
                      <div className="text-[11px] text-on-surface-variant">{user.twoFactorLabel}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[10px]">
                    مفعل ونشط
                  </span>
                </div>

                {/* IP Whitelist */}
                <div className="p-space-sm bg-surface-container-low rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-highest text-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">lan</span>
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">نطاق الآي بي المسموح (IP Whitelist)</div>
                        <div className="text-[11px] text-on-surface-variant">
                          مقيد بشبكة بنك الخرطوم ومكتب ZoolGo
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                  </div>
                  <div className="bg-surface-container-lowest px-space-sm py-1 rounded text-left font-mono text-[11px] text-on-surface-variant border border-surface-container" dir="ltr">
                    CIDR: {user.ipWhitelist ? user.ipWhitelist.join(' | ') : '196.29.112.0/24'}
                  </div>
                </div>

                {/* Approved Device */}
                <div className="p-space-sm bg-surface-container-low rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-highest text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">laptop_mac</span>
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">بصمة الجهاز المصرح به</div>
                      <div className="text-[11px] text-on-surface-variant">
                        {user.approvedDevice || 'MacBook Pro M2 (Chrome 130 Enterprise)'}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-mono text-[10px] font-bold">
                    Hardware ID
                  </span>
                </div>

                {/* Password Policy */}
                <div className="p-space-sm bg-surface-container-low rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-highest text-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">password</span>
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">صلاحية كلمة المرور</div>
                        <div className="text-[11px] text-on-surface-variant">
                          تم التحديث منذ {90 - user.passwordDaysRemaining} يوماً (الحد الأقصى 90 يوماً)
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-secondary text-[11px]">
                      متبقي {user.passwordDaysRemaining} يوماً
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full transition-all"
                      style={{ width: `${Math.round((user.passwordDaysRemaining / 90) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Explicit Scopes & Restrictions Matrix */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md border border-surface-container-high/60">
              <div className="flex items-center justify-between pb-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[22px]">policy</span>
                  <h2 className="font-headline-sm text-sm text-on-surface font-bold">
                    مصفوفة الصلاحيات والحواجز
                  </h2>
                </div>
                <span className="font-label-md text-xs text-secondary font-mono font-bold">
                  RBAC Enforced
                </span>
              </div>

              {/* Granted Capabilities */}
              <div className="space-y-space-sm text-xs">
                <div className="text-secondary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>الصلاحيات الممنوحة والمعتمدة</span>
                </div>
                <div className="space-y-1.5">
                  {user.grantedCapabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-2 bg-surface-container-low p-2 rounded-lg">
                      <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">
                        verified
                      </span>
                      <span className="text-on-surface leading-relaxed">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strict Prohibitions */}
              <div className="space-y-space-sm pt-space-xs text-xs">
                <div className="text-primary-container font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">block</span>
                  <span>القيود والموانع الصارمة (Zero Override)</span>
                </div>
                <div className="space-y-1.5">
                  {user.strictRestrictions.map((res, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 bg-error-container/30 text-on-error-container p-2 rounded-lg border border-error/20"
                    >
                      <span className="material-symbols-outlined text-error text-[16px] shrink-0 mt-0.5">
                        do_not_disturb_on
                      </span>
                      <span className="leading-relaxed">{res}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Left Column: Active Live Sessions & Forensic Audit Trail (7 Cols) */}
          <div className="lg:col-span-7 space-y-space-lg">
            {/* 1. Live Active Sessions Widget */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md border border-surface-container-high/60">
              <div className="flex items-center justify-between pb-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[22px]">devices</span>
                  <h2 className="font-headline-sm text-sm text-on-surface font-bold">
                    الجلسات الحية المتصلة الآن
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-bold">
                  {user.activeSessions.length} جلسات نشطة
                </span>
              </div>

              {user.activeSessions.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant text-xs">
                  <span className="material-symbols-outlined text-3xl mb-1 block">no_accounts</span>
                  لا توجد جلسات عمل نشطة في الوقت الحالي لهذا المشرف.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {user.activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-surface-container-low rounded-xl p-space-md space-y-space-sm border border-surface-container-high/60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-space-xs">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              session.isCurrent ? 'bg-secondary animate-pulse' : 'bg-surface-variant'
                            }`}
                          ></span>
                          <span className="font-bold text-xs text-on-surface">{session.device}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-md text-[10px] font-bold">
                          {session.lastActive}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-on-surface-variant">
                        <div className="flex items-center justify-between">
                          <span>الموقع الجغرافي:</span>
                          <span className="text-on-surface font-medium">{session.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>عنوان الآي بي:</span>
                          <span className="font-mono text-on-surface" dir="ltr">
                            {session.ipAddress}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>البيئة والنظام:</span>
                          <span className="text-on-surface font-mono text-[11px]">
                            {session.browser} / {session.os}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          terminateSession(session.id);
                          showNotice(`تم إنهاء الجلسة (${session.device}) بنجاح.`);
                        }}
                        className="w-full mt-2 py-1.5 rounded-lg bg-surface-container text-primary-container font-label-md text-xs font-bold hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer"
                      >
                        إنهاء هذه الجلسة
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Administrative Activity Audit Trail */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md border border-surface-container-high/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[22px]">history_edu</span>
                  <div>
                    <h2 className="font-headline-sm text-sm text-on-surface font-bold">
                      سجل الإجراءات الحساسة والقرارات الإدارية
                    </h2>
                    <p className="font-body-sm text-[11px] text-on-surface-variant">
                      سجل تدقيق زمني مشفر وموقع رقمياً (Audit Trail)
                    </p>
                  </div>
                </div>
                <span className="font-label-md text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                  {user.auditTrail.length} عمليات موثقة
                </span>
              </div>

              <div className="space-y-3">
                {user.auditTrail.map((log) => (
                  <div
                    key={log.id}
                    className="p-space-sm bg-surface-container-low/70 rounded-xl border border-surface-container flex flex-col gap-1.5 hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.actionType === 'financial'
                              ? 'bg-secondary'
                              : log.actionType === 'security'
                              ? 'bg-primary-container'
                              : 'bg-surface-tint'
                          }`}
                        ></span>
                        <span className="font-bold text-xs text-on-surface">{log.action}</span>
                        {log.targetRef && (
                          <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface font-mono text-[10px] font-bold">
                            {log.targetRef}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-on-surface-variant">
                        {log.timestamp}
                      </span>
                    </div>

                    <p className="font-body-sm text-xs text-on-surface leading-relaxed">
                      {log.details}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant pt-1 border-t border-surface-container/60 font-mono" dir="ltr">
                      <span>IP: {log.ipAddress}</span>
                      <span className="text-outline">{log.hash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
