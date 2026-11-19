import React, { useState } from 'react';
import type { AdminDepartment } from '../types/admin';

interface AdminInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: {
    name: string;
    email: string;
    phone: string;
    roleId: string;
    department: AdminDepartment;
    workLocation: string;
  }) => void;
}

export const AdminInviteModal: React.FC<AdminInviteModalProps> = ({
  isOpen,
  onClose,
  onInvite,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+249 912 ');
  const [roleId, setRoleId] = useState('cfo');
  const [department, setDepartment] = useState<AdminDepartment>('finance');
  const [workLocation, setWorkLocation] = useState('الخرطوم (المقر الرئيسي) - شارع الجمهورية');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('يرجى ملء كافة الحقول الأساسية المطلوبة.');
      return;
    }
    if (!email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني رسمي صحيح.');
      return;
    }

    onInvite({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      roleId,
      department,
      workLocation,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tertiary-container/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-xl shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-space-lg py-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-base text-on-surface font-bold">
                دعوة مشرف جديد لطاقم إدارة ZoolGo
              </h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                إنشاء حساب موثق وتعيين الدور الوظيفي وضوابط الأمان
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-space-lg space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-error-container text-on-error-container font-label-md text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
              الاسم الرسمي الكامل للمشرف <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="مثال: مهند تاج السر البشير"
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
                البريد الإلكتروني المهني <span className="text-error">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="supervisor@zoolgo.sd"
                dir="ltr"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary text-left font-mono"
              />
            </div>
            <div>
              <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
                رقم هاتف الاتصال المشفر <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary text-left font-mono"
              />
            </div>
          </div>

          {/* Role & Department Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
                الدور الوظيفي والصلاحيات <span className="text-error">*</span>
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
              >
                <option value="cfo">المشرف والمدقق المالي</option>
                <option value="fleet">مدير تشغيل الأسطول والعمليات</option>
                <option value="support">مسؤول الدعم وحجوزات التذاكر</option>
                <option value="compliance">ضابط الامتثال ومكافحة الاحتيال</option>
                <option value="super-admin">المشرف العام (Super Admin)</option>
              </select>
            </div>
            <div>
              <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
                القطاع الإداري التابع له <span className="text-error">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as AdminDepartment)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
              >
                <option value="finance">القطاع المالي والتسويات</option>
                <option value="operations">العمليات ومراقبة الموانئ البرية</option>
                <option value="support">خدمة الركاب والنزاعات</option>
                <option value="security">الأمن والشبكات الرقمية</option>
                <option value="executive">الإدارة العليا التنفيذية</option>
              </select>
            </div>
          </div>

          {/* Primary Work Location */}
          <div>
            <label className="block font-label-md text-xs font-semibold text-on-surface mb-1">
              مقر العمل الرئيسي المصرح له
            </label>
            <input
              type="text"
              value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
              placeholder="مثال: الخرطوم (المقر الرئيسي) أو ميناء بورتسودان"
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Security Policy Reminder */}
          <div className="p-3 rounded-xl bg-surface-container-low/70 border border-surface-container flex items-start gap-2.5">
            <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
              security
            </span>
            <div className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface font-semibold block mb-0.5">
                بروتوكول التحقق الثنائي الإلزامي (Zero-Trust):
              </strong>
              سيتم إرسال رابط تفعيل مشفر يستلزم إعداد مفتاح أمني صلب أو تطبيق المصادقة (TOTP) وتأكيد بصمة الجهاز في أول جلسة تسجيل دخول.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-container">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-xs hover:bg-surface-dim transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-xs font-bold hover:opacity-95 transition-opacity shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>إرسال دعوة التفعيل الرسمية</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
