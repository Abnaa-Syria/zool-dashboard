import * as React from 'react';
import type { TransportCarrier } from '../types/carrier';

interface AddCarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (carrierData: Partial<TransportCarrier>) => Promise<void> | void;
}

export const AddCarrierModal: React.FC<AddCarrierModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState({
    name: '',
    commercialName: '',
    commercialRegistrationNumber: '',
    taxIdentificationNumber: '',
    transportLicenseDoc: '',
    licenseExpiryDate: '2026-12-31',
    state: 'ولاية الخرطوم',
    city: 'الخرطوم',
    headOfficeAddress: '',
    phone: '+249 ',
    email: '',
    contactName: '',
    contactRole: 'مدير العمليات والأسطول',
    contactPhone: '+249 ',
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.commercialRegistrationNumber) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: formData.name,
        commercialName: formData.commercialName || formData.name,
        commercialRegistrationNumber: formData.commercialRegistrationNumber,
        taxIdentificationNumber: formData.taxIdentificationNumber,
        transportLicenseDoc: formData.transportLicenseDoc || 'ترخيص هيئة الطرق المعتمد',
        licenseExpiryDate: formData.licenseExpiryDate,
        state: formData.state,
        city: formData.city,
        headOfficeAddress: formData.headOfficeAddress,
        phone: formData.phone,
        email: formData.email,
        contacts: [
          {
            name: formData.contactName || 'المفوض التشغيلي',
            role: formData.contactRole,
            phone: formData.contactPhone,
            email: formData.email,
            isPrimary: true,
          },
        ],
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-right border border-slate-100"
        dir="rtl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">how_to_reg</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                إضافة شركة نقل جديدة — متطلبات التدقيق والاعتماد
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تخضع كافة الشركات للتحقق من السجل التجاري الوطني (CRN) والتكامل مع نظام التتبع
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Regulatory Governance Alert */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-emerald-800">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>اشتراطات هيئة النقل البري لمنصة ZoolGo</span>
          </div>
          <p className="text-emerald-700 leading-relaxed">
            يجب أن تكون الشركة حاصلة على ترخيص ساري المفعول من الهيئة العامة للطرق والجسور ومسجلة بالسجل التجاري السوداني.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم الشركة التجاري <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: شركة النيل للنقل البري"
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الاسم القانوني المسجل <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.commercialName}
                onChange={(e) => setFormData({ ...formData, commercialName: e.target.value })}
                placeholder="مثال: شركة النيل للنقل والاستثمار المحدودة"
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رقم السجل التجاري (CRN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.commercialRegistrationNumber}
                onChange={(e) => setFormData({ ...formData, commercialRegistrationNumber: e.target.value })}
                placeholder="CR-XXXXXX"
                className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الرقم الضريبي (TIN)
              </label>
              <input
                type="text"
                value={formData.taxIdentificationNumber}
                onChange={(e) => setFormData({ ...formData, taxIdentificationNumber: e.target.value })}
                placeholder="TIN-XXXXXX-SD"
                className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الولاية ومقر الإدارة
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-white cursor-pointer"
              >
                <option value="ولاية الخرطوم">ولاية الخرطوم</option>
                <option value="ولاية البحر الأحمر">ولاية البحر الأحمر</option>
                <option value="ولاية نهر النيل">ولاية نهر النيل</option>
                <option value="الولاية الشمالية">الولاية الشمالية</option>
                <option value="ولاية الجزيرة">ولاية الجزيرة</option>
                <option value="ولاية كسلا">ولاية كسلا</option>
                <option value="ولاية القضارف">ولاية القضارف</option>
                <option value="ولاية النيل الأبيض">ولاية النيل الأبيض</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                تاريخ انتهاء الترخيص الرسمي
              </label>
              <input
                type="date"
                value={formData.licenseExpiryDate}
                onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الهاتف الرسمي للتواصل
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                البريد الإلكتروني للعمليات
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="operations@company.sd"
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                dir="ltr"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                عنوان المقر الرئيسي والمكاتب المركزية
              </label>
              <input
                type="text"
                value={formData.headOfficeAddress}
                onChange={(e) => setFormData({ ...formData, headOfficeAddress: e.target.value })}
                placeholder="مثال: الخرطوم، الميناء البري، الصالة الرئيسية مكاتب 12-14"
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم المفوض التشغيلي / مدير الأسطول
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="اسم المسؤول"
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                هاتف المفوض المباشر
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              إلغاء الأمر
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.commercialRegistrationNumber}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#8E1B32] hover:bg-[#6D001E] rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>{isSubmitting ? 'جارٍ التدقيق والتسجيل...' : 'إرسال لتدقيق الاعتماد'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
