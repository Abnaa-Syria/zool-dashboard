import * as React from 'react';
import type { BrokerOffice } from '../types/broker';

interface AddBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<
      BrokerOffice,
      'id' | 'code' | 'clerks' | 'posTerminals' | 'carrierLinks' | 'walletLedger'
    >
  ) => Promise<void> | void;
}

export const AddBrokerModal: React.FC<AddBrokerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState({
    name: '',
    branchName: '',
    city: 'الخرطوم',
    state: 'ولاية الخرطوم',
    address: '',
    phone: '+249 ',
    email: '',
    licenseNumber: '',
    commercialRegistrationNumber: '',
    licenseExpiryDate: '2026-12-31',
    accreditationAuthority: 'وزارة النقل والسياحة',
    managerName: '',
    managerPhone: '+249 ',
    initialFloatSdg: 10000,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.branchName) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: formData.name,
        branchName: formData.branchName,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        status: 'active',
        statusLabel: 'معتمد ونشط',
        licenseNumber: formData.licenseNumber || `LIC-AG-${Date.now().toString().slice(-4)}`,
        commercialRegistrationNumber: formData.commercialRegistrationNumber || 'CR-NEW',
        licenseExpiryDate: formData.licenseExpiryDate,
        accreditedSince: new Date().toISOString().split('T')[0],
        accreditationAuthority: formData.accreditationAuthority,
        walletBalance: formData.initialFloatSdg,
        minimumBalanceAlertThreshold: 500.0,
        isLowBalanceAlert: formData.initialFloatSdg < 500,
        unsettledAccruedCommissionSdg: 0,
        activeSettlementCycle: '#W-44 (2024)',
        todaySalesSdg: 0,
        todayTicketsCount: 0,
        clerksCount: 1,
        posCount: 1,
        assignedCarriersCount: 1,
        managerName: formData.managerName,
        managerPhone: formData.managerPhone,
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
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">storefront</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                تسجيل واعتماد مكتب وكيل جديد
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                إضافة وكالة سفر معتمدة وفتح محفظة نقدية مسبقة الدفع لإصدار التذاكر
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم الوكالة التجاري <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: وكالة النيل للسفر والسياحة"
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم الفرع والموقع <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.branchName}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                placeholder="مثال: فرع الميناء البري — الخرطوم"
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">الولاية</label>
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
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">المدينة</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                العنوان التفصيلي وموقع نقطة البيع
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="مثال: الميناء البري، الصالة الجنوبية، مكتب رقم 14"
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رقم الترخيص التجاري / السياحي
              </label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="LIC-TT-XXXX"
                className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                السجل التجاري (CRN)
              </label>
              <input
                type="text"
                value={formData.commercialRegistrationNumber}
                onChange={(e) => setFormData({ ...formData, commercialRegistrationNumber: e.target.value })}
                placeholder="CR-XXXXXX"
                className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم مدير المكتب المسؤول
              </label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                placeholder="اسم المدير"
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                هاتف المدير للتواصل
              </label>
              <input
                type="text"
                value={formData.managerPhone}
                onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                dir="ltr"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                مبلغ الإيداع الافتتاحي للمحفظة (ج.س) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  step="500"
                  required
                  value={formData.initialFloatSdg}
                  onChange={(e) => setFormData({ ...formData, initialFloatSdg: parseFloat(e.target.value) || 0 })}
                  className="w-full h-10 px-3 pl-12 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ج.س
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                يجب ألا يقل الرصيد الافتتاحي عن حد الأمان الأدنى (500.00 ج.س) لتفادي توقف الحجوزات.
              </p>
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
              disabled={isSubmitting || !formData.name || !formData.branchName}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#003B27] hover:bg-[#002B1D] rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>{isSubmitting ? 'جارٍ التسجيل والاعتماد...' : 'اعتماد المكتب وفتح المحفظة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
