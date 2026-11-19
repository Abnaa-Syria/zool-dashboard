import React, { useState } from 'react';
import type {
  Traveler,
  TravelerSecuritySession,
  TravelerSecurityLog,
  TravelerAccountStatus,
} from '../types/traveler';

interface TravelerSecurityTabProps {
  traveler: Traveler;
  sessions: TravelerSecuritySession[];
  securityLogs: TravelerSecurityLog[];
  onTerminateSession: (sessionId: string) => void;
  onUpdateStatus: (status: TravelerAccountStatus, reason?: string) => void;
}

export const TravelerSecurityTab: React.FC<TravelerSecurityTabProps> = ({
  traveler,
  sessions,
  securityLogs,
  onTerminateSession,
  onUpdateStatus,
}) => {
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusReason, setStatusReason] = useState('');
  const [targetStatus, setTargetStatus] = useState<TravelerAccountStatus>('suspended');

  const handleConfirmTerminate = (sessionId: string) => {
    onTerminateSession(sessionId);
    setTerminatingId(null);
  };

  const handleApplyStatusChange = () => {
    onUpdateStatus(targetStatus, statusReason || undefined);
    setShowStatusModal(false);
    setStatusReason('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sessions and Devices (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        <div className="bg-white rounded-xl p-6 border border-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-dark text-[24px]">
                phonelink_lock
              </span>
              <h2 className="text-base font-bold text-text-primary">
                سجل جلسات تسجيل الدخول والأجهزة الموثوقة
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-surface-subtle text-text-primary text-xs font-semibold">
              {sessions.length} أجهزة مسجلة
            </span>
          </div>

          <p className="text-xs text-text-muted mb-5 leading-relaxed">
            استعراض شامل للجلسات النشطة وسجل الأجهزة المصرح لها بالحجز التلقائي وإدارة المحفظة
            الرقمية للمسافر عبر منصة ZoolGo.
          </p>

          {/* Devices List */}
          <div className="flex flex-col gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-surface-subtle rounded-xl p-4 border border-border flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-dark text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">
                        {session.deviceType === 'mobile'
                          ? 'phone_iphone'
                          : session.deviceType === 'tablet'
                          ? 'tablet_mac'
                          : 'laptop_chromebook'}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-text-primary">
                          {session.deviceName}
                        </span>
                        {session.isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            الجلسة الحالية (نشطة)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[11px] font-medium">
                            جلسة محفوظة
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-primary-dark font-medium mt-0.5">
                        {session.appVersion} ({session.osInfo})
                      </span>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <button
                      type="button"
                      onClick={() => setTerminatingId(session.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">power_settings_new</span>
                      <span>إنهاء الجلسة فوراً</span>
                    </button>
                  )}
                </div>

                {/* Network & Location Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-2 text-xs text-text-muted bg-white/70 p-3 rounded-lg border border-border/40">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-text-muted">dns</span>
                    <span className="font-mono text-text-primary font-semibold dir-ltr">
                      {session.ipAddress}
                    </span>
                    <span className="text-[11px] text-primary-dark font-medium">({session.isp})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-text-muted">
                      location_on
                    </span>
                    <span>{session.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-text-muted">
                      schedule
                    </span>
                    <span>آخر نشاط: {session.lastActivity}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-text-muted">
                      fingerprint
                    </span>
                    <span className="font-mono text-[11px]">مفتاح المصادقة: {session.authKey}</span>
                  </div>
                </div>

                {/* Confirm Terminate Alert Bar */}
                {terminatingId === session.id && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between gap-2 text-xs">
                    <span className="text-red-900 font-semibold">
                      هل أنت متأكد من إنهاء جلسة {session.deviceName} وتسجيل خروجه فوراً؟
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirmTerminate(session.id)}
                        className="px-2.5 py-1 rounded bg-red-700 text-white font-bold hover:bg-red-800 transition-colors"
                      >
                        تأكيد الإلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => setTerminatingId(null)}
                        className="px-2 py-1 rounded bg-white text-gray-700 border border-border hover:bg-surface-subtle"
                      >
                        تراجع
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Account Governance & Suspension Controls */}
        <div className="bg-white rounded-xl p-6 border border-border shadow-xs flex flex-col gap-3">
          <span className="font-bold text-sm text-primary-dark flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            <span>حوكمة حالة الحساب والصلاحيات</span>
          </span>
          <p className="text-xs text-text-muted">
            الحالة التشغيلية الحالية لحساب المسافر:{' '}
            <strong
              className={
                traveler.accountStatus === 'active'
                  ? 'text-emerald-700'
                  : traveler.accountStatus === 'suspended'
                  ? 'text-red-700'
                  : 'text-amber-700'
              }
            >
              {traveler.accountStatus === 'active'
                ? 'نشط ومصرح له بالحجز والشحن'
                : traveler.accountStatus === 'suspended'
                ? 'معلق مؤقتاً (ممنوع من الحجز)'
                : 'قيد المراجعة الأمنية'}
            </strong>
          </p>

          <div className="flex items-center gap-3 pt-2">
            {traveler.accountStatus === 'active' ? (
              <button
                type="button"
                onClick={() => {
                  setTargetStatus('suspended');
                  setShowStatusModal(true);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">block</span>
                <span>تعليق حساب المسافر مؤقتاً</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTargetStatus('active');
                  setShowStatusModal(true);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>إلغاء التعليق وتنشيط الحساب</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setTargetStatus('review');
                setShowStatusModal(true);
              }}
              className="px-3 py-2 rounded-lg bg-surface-subtle hover:bg-border text-text-primary text-xs font-semibold border border-border transition-colors"
            >
              تحويل للمراجعة الأمنية
            </button>
          </div>
        </div>
      </div>

      {/* Security Logs Timeline (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-white rounded-xl p-6 border border-border shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
            <span className="font-bold text-sm text-primary-dark flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">history_toggle_off</span>
              <span>سجل الأنشطة والتدقيق الأمني</span>
            </span>
            <span className="text-xs text-text-muted">{securityLogs.length} أحداث</span>
          </div>

          <div className="flex flex-col gap-3">
            {securityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">{log.description}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      log.status === 'success'
                        ? 'bg-emerald-500'
                        : log.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-text-muted text-[11px] pt-1 border-t border-border/40">
                  <span>{log.timestamp}</span>
                  <span className="font-mono dir-ltr">{log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Dialog for Status Change */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setShowStatusModal(false)}
          />
          <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-border z-10 flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                  targetStatus === 'suspended'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <span className="material-symbols-outlined">
                  {targetStatus === 'suspended' ? 'warning' : 'verified'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-text-primary">
                  {targetStatus === 'suspended'
                    ? 'تأكيد تعليق حساب المسافر'
                    : targetStatus === 'active'
                    ? 'تأكيد تنشيط حساب المسافر'
                    : 'تحويل الحساب للمراجعة'}
                </span>
                <span className="text-xs text-text-muted">
                  المسافر: {traveler.fullName} ({traveler.id})
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary">
                سبب القرار الإداري (سيسجل في سجل التدقيق):
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="أدخل ملاحظات القرار الإداري أو سبب الإيقاف..."
                rows={3}
                className="w-full p-2.5 rounded-lg bg-surface-subtle border border-border text-xs text-text-primary focus:outline-none focus:border-primary-dark"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-3 py-1.5 rounded-lg bg-surface-subtle text-text-primary hover:bg-border text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleApplyStatusChange}
                className={`px-4 py-1.5 rounded-lg text-white text-xs font-bold ${
                  targetStatus === 'suspended'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                تنفيذ القرار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
