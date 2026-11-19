import React, { useState } from 'react';
import type { Traveler } from '../types/traveler';

interface TravelerKycTabProps {
  traveler: Traveler;
  onVerifyKyc: (decision: 'approve' | 'reject', notes?: string) => void;
  onAddNote: (author: string, role: string, content: string) => void;
}

export const TravelerKycTab: React.FC<TravelerKycTabProps> = ({
  traveler,
  onVerifyKyc,
  onAddNote,
}) => {
  const [isNationalIdRevealed, setIsNationalIdRevealed] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [kycDecisionNotes, setKycDecisionNotes] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const isPendingOrRejected =
    traveler.verificationStatus === 'pending' || traveler.verificationStatus === 'rejected';

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    setIsSubmittingNote(true);
    onAddNote('المشرف العام (أحمد السر)', 'Super Admin', newNoteContent.trim());
    setNewNoteContent('');
    setIsSubmittingNote(false);
  };

  const handleKycDecision = (decision: 'approve' | 'reject') => {
    onVerifyKyc(decision, kycDecisionNotes.trim() || undefined);
    setKycDecisionNotes('');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Behavior & Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl p-4 border border-border shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">إجمالي الرحلات</span>
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-primary-dark">
              <span className="material-symbols-outlined text-[18px]">commute</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary-dark tabular-nums">
              {traveler.totalTrips}
            </span>
            <span className="text-xs text-text-muted">رحلة مجدولة</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted bg-surface-subtle px-2 py-1 rounded">
            <span className="text-emerald-700 font-bold">{traveler.completedTrips} مكتملة</span>
            <span>•</span>
            <span className="text-primary-ruby font-bold">{traveler.activeTrips} جارية</span>
            <span>•</span>
            <span className="text-text-muted">{traveler.cancelledTrips} ملغاة</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl p-4 border border-border shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">إجمالي المبالغ المنفقة</span>
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-primary-dark">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary-dark tabular-nums">
              {traveler.totalSpendSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-primary-dark font-bold">ج.س</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary-dark">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>
              متوسط التذكرة:{' '}
              {traveler.totalTrips > 0
                ? (traveler.totalSpendSdg / traveler.totalTrips).toFixed(2)
                : '0.00'}{' '}
              ج.س
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl p-4 border border-border shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">نسبة الالتزام بالحضور</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-primary-dark">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">
              {traveler.attendanceRatePercent}%
            </span>
            <span className="text-xs text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
              ممتاز جداً
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>معدل التخلف (No-show): 0%</span>
            <span className="text-primary-dark font-bold">
              {traveler.completedTrips + traveler.activeTrips}/{traveler.totalTrips} صعود
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl p-4 border border-border shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">المقعد والدرجة المفضلة</span>
            <div className="w-8 h-8 rounded-lg bg-[#ffdadb] flex items-center justify-center text-primary-ruby">
              <span className="material-symbols-outlined text-[18px]">airline_seat_recline_extra</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-text-primary">
              {traveler.preferences?.preferredSeat || 'نافذة أمامية (Window A12)'}
            </span>
            <span className="text-xs text-primary-ruby font-bold truncate">
              {traveler.preferences?.preferredClass || 'حافلات الـ VIP Express'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <span className="material-symbols-outlined text-[14px]">route</span>
            <span className="truncate">
              {traveler.preferences?.preferredCorridor || 'طريق التحدي السريع'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Column A (Identity Card 7 Cols) + Column B (Companions & Notes 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column A: Identity & Verification (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Identity Card */}
          <div className="bg-white rounded-xl p-6 border border-border shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-dark text-[24px]">
                  verified_user
                </span>
                <h2 className="text-base font-bold text-primary-dark">
                  بيانات الهوية والتحقق الشخصي
                </h2>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  traveler.verificationStatus === 'verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : traveler.verificationStatus === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {traveler.verificationStatus === 'verified' ? 'check' : 'report'}
                </span>
                <span>
                  {traveler.verificationStatus === 'verified'
                    ? 'موثق آلياً (السجل المدني)'
                    : traveler.verificationStatus === 'pending'
                    ? 'قيد مراجعة المستندات'
                    : 'مرفوض / غير مكتمل'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Legal Name */}
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-subtle">
                <span className="text-xs text-text-muted">الاسم القانوني الكامل</span>
                <span className="text-sm font-bold text-text-primary">
                  {traveler.legalFullName}
                </span>
                <span className="text-[11px] text-primary-dark">
                  مطابق للأوراق الثبوتية وبطاقة السفر
                </span>
              </div>

              {/* National ID with Reveal Toggle */}
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    {traveler.documentType === 'national_id'
                      ? 'رقم الهوية الوطنية'
                      : 'رقم جواز السفر'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsNationalIdRevealed(!isNationalIdRevealed)}
                    className="flex items-center gap-1 text-primary-ruby hover:text-primary-dark text-xs font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isNationalIdRevealed ? 'visibility_off' : 'visibility'}
                    </span>
                    <span>{isNationalIdRevealed ? 'إخفاء الرقم' : 'كشف الرقم'}</span>
                  </button>
                </div>
                <span className="text-base font-bold text-primary-dark font-mono dir-ltr text-right tabular-nums">
                  {isNationalIdRevealed ? traveler.nationalId : traveler.maskedNationalId}
                </span>
                <span className="text-[11px] text-text-muted">
                  إخفاء تلقائي لحماية بيانات الخصوصية وحوكمة النقل
                </span>
              </div>

              {/* DOB & Residence */}
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-subtle">
                <span className="text-xs text-text-muted">تاريخ الميلاد ومحل الإقامة</span>
                <span className="text-sm font-bold text-text-primary">
                  {traveler.birthDate} ({traveler.age} عاماً)
                </span>
                <span className="text-xs text-text-muted">{traveler.residenceArea}</span>
              </div>

              {/* Verification Timestamp */}
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-subtle">
                <span className="text-xs text-text-muted">تاريخ وتأكيد التحقق</span>
                <span className="text-sm font-bold text-text-primary">
                  {traveler.verifiedAt || 'لم يتم الاعتماد بعد'}
                </span>
                <span className="text-[11px] text-primary-dark">
                  {traveler.verificationProvider || 'منصة السجل المدني للتحقق الموحد'}
                </span>
              </div>

              {/* Verified Email */}
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-subtle">
                <span className="text-xs text-text-muted">البريد الإلكتروني المعتمد</span>
                <span className="text-sm font-bold text-text-primary font-mono">
                  {traveler.email}
                </span>
                <span className="text-[11px] text-primary-dark flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">mark_email_read</span>
                  تم التحقق عبر رسالة التفعيل
                </span>
              </div>

              {/* Emergency Contact */}
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-subtle">
                <span className="text-xs text-text-muted">جهة الاتصال بحالات الطوارئ</span>
                {traveler.emergencyContact ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-text-primary font-mono dir-ltr">
                        {traveler.emergencyContact.phone}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-subtle text-primary-dark text-xs font-bold border border-border">
                        {traveler.emergencyContact.relationship}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {traveler.emergencyContact.name} (متاح للاتصال الفوري)
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-text-muted">لم يتم تسجيل جهة طوارئ</span>
                )}
              </div>
            </div>
          </div>

          {/* Pending KYC Action Card (If Pending or Rejected) */}
          {isPendingOrRejected && (
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-300 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-700 text-[26px]">
                  security
                </span>
                <div>
                  <h3 className="font-bold text-sm text-amber-950">
                    مراجعة وثيقة الهوية والموافقة الأمنية
                  </h3>
                  <p className="text-xs text-amber-800">
                    هذا الحساب يتطلب مراجعة الأوراق الثبوتية المرفوعة قبل إتاحة الحجز والشحن التلقائي.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-amber-950">
                  ملاحظات قرار المراجعة والتدقيق:
                </label>
                <input
                  type="text"
                  value={kycDecisionNotes}
                  onChange={(e) => setKycDecisionNotes(e.target.value)}
                  placeholder="أدخل ملاحظات التدقيق أو سبب القبول/الرفض..."
                  className="w-full h-9 px-3 rounded-lg bg-white border border-amber-300 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-dark"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleKycDecision('approve')}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>اعتماد وتوثيق الهوية وتنشيط الحساب</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleKycDecision('reject')}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  <span>رفض الوثيقة وتعليق الحساب</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Column B: Companions & Admin Notes (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Frequent Companions Card */}
          <div className="bg-white rounded-xl p-6 border border-border shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="font-bold text-sm text-primary-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span>المرافقون المعتادون في السفر</span>
              </span>
              <span className="text-xs text-text-muted">
                {traveler.companions?.length || 0} مرافقين
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {traveler.companions && traveler.companions.length > 0 ? (
                traveler.companions.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3 rounded-lg bg-surface-subtle border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-primary-dark flex items-center justify-center font-bold text-xs">
                        {comp.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-primary">{comp.name}</span>
                        <span className="text-[11px] text-text-muted font-mono dir-ltr text-right">
                          {comp.phone}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded bg-white text-text-primary text-[10px] font-semibold border border-border">
                        {comp.relationship}
                      </span>
                      <span className="text-[11px] text-primary-dark font-medium">
                        {comp.tripsCount} رحلات مشتركة
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-text-muted">لا يوجد مرافقين مسجلين للحساب.</span>
              )}
            </div>
          </div>

          {/* Internal Administrative Notes */}
          <div className="bg-white rounded-xl p-6 border border-border shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="font-bold text-sm text-primary-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">sticky_note_2</span>
                <span>الملاحظات الإدارية وسجل التدقيق الداخلي</span>
              </span>
              <span className="text-xs text-text-muted">{traveler.notes?.length || 0} ملاحظات</span>
            </div>

            {/* Notes List */}
            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
              {traveler.notes && traveler.notes.length > 0 ? (
                traveler.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg bg-surface-subtle border border-border flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-text-muted text-[11px]">
                      <span className="font-bold text-primary-dark">
                        {note.author} ({note.role})
                      </span>
                      <span>{note.timestamp}</span>
                    </div>
                    <p className="text-text-primary leading-relaxed mt-1">{note.content}</p>
                  </div>
                ))
              ) : (
                <span className="text-xs text-text-muted">لا توجد ملاحظات إدارية مدونة.</span>
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNoteSubmit} className="flex flex-col gap-2 pt-2 border-t border-border">
              <label className="text-xs font-semibold text-text-primary">
                إضافة ملاحظة إدارية جديدة:
              </label>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="أدخل تفاصيل التوجيه أو ملحوظات التدقيق..."
                rows={2}
                className="w-full p-2.5 rounded-lg bg-surface-subtle border border-border text-xs text-text-primary focus:outline-none focus:border-primary-dark"
              />
              <button
                type="submit"
                disabled={!newNoteContent.trim() || isSubmittingNote}
                className="self-end px-3 py-1.5 rounded-lg bg-primary-dark hover:bg-emerald-900 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                حفظ الملاحظة
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
