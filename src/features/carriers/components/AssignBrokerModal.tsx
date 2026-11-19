import * as React from 'react';

interface AssignBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  carrierName: string;
  onAssign: (params: {
    brokerId: string;
    brokerName: string;
    commissionRatePercent: number;
    authorizedRoutesCount: number;
  }) => Promise<void> | void;
}

// Available candidate brokers
const candidateBrokers = [
  { id: 'AG-882', name: 'وكالة النيل للسفر والسياحة', branch: 'الخرطوم — الميناء البري' },
  { id: 'AG-710', name: 'مكتب الصفا للخدمات السفرية', branch: 'أم درمان — الشهداء' },
  { id: 'AG-504', name: 'وكالة الأمانة لخدمات الركاب', branch: 'بورتسودان — السوق الكبير' },
  { id: 'AG-320', name: 'مكتب الشروق لخدمات النقل', branch: 'شندي — المحطة الوسطى' },
  { id: 'AG-210', name: 'وكالة السلام للسفريات البرية', branch: 'مروي — السوق المركزي' },
];

export const AssignBrokerModal: React.FC<AssignBrokerModalProps> = ({
  isOpen,
  onClose,
  carrierName,
  onAssign,
}) => {
  const [selectedBrokerId, setSelectedBrokerId] = React.useState('AG-882');
  const [commissionRate, setCommissionRate] = React.useState(10.0);
  const [authorizedRoutesCount, setAuthorizedRoutesCount] = React.useState(14);
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const broker = candidateBrokers.find((b) => b.id === selectedBrokerId);
    if (!broker) return;

    try {
      setIsSubmitting(true);
      await onAssign({
        brokerId: broker.id,
        brokerName: broker.name,
        commissionRatePercent: commissionRate,
        authorizedRoutesCount,
      });
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
              <span className="material-symbols-outlined text-[24px]">handshake</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ربط مكتب وسيط بشركة النقل
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديد نسبة العمولة وتفويض بيع تذاكر {carrierName}
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اختر مكتب الوسيط المعتمد <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedBrokerId}
              onChange={(e) => setSelectedBrokerId(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-white cursor-pointer"
            >
              {candidateBrokers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.id}) — {b.branch}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                نسبة عمولة المكتب (%) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 pl-8 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                عدد المسارات المصرح بها
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={authorizedRoutesCount}
                onChange={(e) => setAuthorizedRoutesCount(parseInt(e.target.value, 10) || 1)}
                className="w-full h-10 px-3 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ملاحظات التفويض ورقم القرار الإداري
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تفويض وفق ملحق العقد رقم CON-2024-NL"
              className="w-full h-10 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">
              info
            </span>
            <p className="leading-relaxed">
              يتم تطبيق نسبة العمولة المحددة آلياً على كافة التذاكر التي يُصدرها المكتب لرحلات هذه
              الشركة، مع التقييد الفوري في المحافظ اللحظية.
            </p>
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
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#003B27] hover:bg-[#002B1D] rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>{isSubmitting ? 'جارٍ الربط...' : 'اعتماد ربط المكتب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
