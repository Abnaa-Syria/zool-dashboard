import * as React from 'react';
import type { BrokerOffice } from '../types/broker';

interface TopUpWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  broker: BrokerOffice | null;
  onTopUp: (
    amount: number,
    paymentMethod: string,
    reference: string,
    notes?: string
  ) => Promise<void> | void;
}

export const TopUpWalletModal: React.FC<TopUpWalletModalProps> = ({
  isOpen,
  onClose,
  broker,
  onTopUp,
}) => {
  const [amount, setAmount] = React.useState<number>(10000);
  const [paymentMethod, setPaymentMethod] = React.useState('bankak_bok');
  const [reference, setReference] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !broker) return null;

  const currentBalance = broker.walletBalance;
  const newBalance = currentBalance + (amount || 0);

  const presets = [5000, 10000, 25000, 50000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    try {
      setIsSubmitting(true);
      await onTopUp(
        amount,
        paymentMethod,
        reference || `DEP-${Date.now().toString().slice(-6)}`,
        notes
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-right border border-slate-100"
        dir="rtl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">add_card</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                شحن فوري لمحفظة الوكيل المسبقة الدفع
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {broker.name} ({broker.code})
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

        {/* Current vs New Balance Preview */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] text-slate-500 block mb-1">الرصيد المتاح الحالي</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-lg font-bold text-slate-900">
                {currentBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-[10px] text-slate-400">ج.س</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-emerald-800 font-semibold block mb-1">
              الرصيد بعد الشحن الفوري
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-lg font-bold text-emerald-700">
                {newBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-[10px] text-emerald-600">ج.س</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              مبلغ الشحن المطلوب (ج.س) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="100"
                step="500"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full h-11 px-3 pl-12 text-sm font-mono font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ج.س
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-2 mt-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg border transition-colors ${
                    amount === p
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  +{p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              قناة الإيداع البنكي / التحصيل
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-white cursor-pointer"
            >
              <option value="bankak_bok">بنك الخرطوم — تطبيق بنكك (BOK Bankak)</option>
              <option value="fawry_fib">بنك فيصل الإسلامي — تطبيق فوري (Fawry FIB)</option>
              <option value="cash_hq">إيداع نقدي بالخزينة المركزية لـ ZoolGo</option>
              <option value="clearing_cheque">شيك مصرفي معتمد</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              رقم إشعار الإيداع / العملية البنكية
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="مثال: TRX-BOK-984210"
              className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ملاحظات التحصيل (اختياري)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: شحن لتعزيز سيولة بيع تذاكر عطلة الأسبوع"
              className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || amount <= 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{isSubmitting ? 'جارٍ قيد الرصيد...' : 'تأكيد الشحن الفوري'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
