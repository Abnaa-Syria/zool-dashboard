import * as React from 'react';
import { Link } from 'react-router-dom';
import type { TransportCarrier } from '../types/carrier';
import { AssignBrokerModal } from './AssignBrokerModal';

interface CarrierBrokersCommissionsTabProps {
  carrier: TransportCarrier;
  onAssignBroker: (params: {
    brokerId: string;
    brokerName: string;
    commissionRatePercent: number;
    authorizedRoutesCount: number;
  }) => Promise<void> | void;
}

export const CarrierBrokersCommissionsTab: React.FC<CarrierBrokersCommissionsTabProps> = ({
  carrier,
  onAssignBroker,
}) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">مكاتب الوسطاء المعيّنة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">handshake</span>
            </div>
          </div>
          <div className="py-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-slate-900">
                {carrier.linkedBrokersCount}
              </span>
              <span className="text-xs text-slate-500">مكتب وسيط معتمد</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-emerald-700 text-xs">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>تغطية موزعة عبر 5 ولايات</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">التعيينات النشطة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <div className="py-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-emerald-700">
                {carrier.assignedBrokers.filter((b) => b.status === 'active').length}
              </span>
              <span className="text-xs text-slate-500">مكتب نشط فورياً</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>
                {carrier.assignedBrokers.filter((b) => b.status !== 'active').length} مكتب معلق للمراجعة
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#003B27] text-white p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-200">
            <span className="text-xs font-semibold">نسبة عمولة الشركة المطبقة</span>
            <span className="bg-emerald-900/60 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">lock</span>
              محددة من الناقل
            </span>
          </div>
          <div className="py-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold">10.0%</span>
              <span className="text-xs text-emerald-300">عن كل تذكرة مصدرة</span>
            </div>
            <span className="text-[11px] text-emerald-300/80 block mt-1">
              تُقيد آلياً في محفظة الوكيل اللحظية
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">العمولات المستحقة للتسوية</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#8E1B32] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="py-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-[#8E1B32]">384,500</span>
              <span className="text-xs font-bold text-slate-500">ج.س</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium block mt-1">
              دورة التسوية الأسبوعية الجارية
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar & Assigned Brokers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#003B27] rounded-full" />
            <h2 className="text-sm font-bold text-slate-900">
              قائمة مكاتب الوسطاء المفوضين ببيع تذاكر الشركة
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="bg-[#003B27] hover:bg-[#002B1D] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>+ ربط مكتب وسيط بشركة النقل</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">مكتب الوسيط المعتمد</th>
                <th className="py-3 px-4">الفرع والولاية</th>
                <th className="py-3 px-4">نسبة العمولة المقررة</th>
                <th className="py-3 px-4">تاريخ التعيين والمفوض</th>
                <th className="py-3 px-4">المسارات المصرحة</th>
                <th className="py-3 px-4">مبيعات الشهر</th>
                <th className="py-3 px-4">حالة التشغيل</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carrier.assignedBrokers.map((broker) => (
                <tr key={broker.brokerId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {broker.brokerName.slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{broker.brokerName}</span>
                        <span className="font-mono text-[11px] text-slate-500">{broker.brokerId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{broker.brokerBranch}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm font-bold text-emerald-700">
                        {broker.commissionRatePercent.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">
                        آلي
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-800 block">{broker.assignedAt}</span>
                    <span className="text-[10px] text-slate-400">{broker.assignedBy}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {broker.authorizedRoutesCount} مساراً
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 block">
                      {broker.totalGmvThisMonthSdg.toLocaleString()} ج.س
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {broker.totalBookingsThisMonth} حجز
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        broker.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          broker.status === 'active' ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}
                      />
                      <span>{broker.status === 'active' ? 'نشط ومصرح' : 'معلق للمراجعة'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      to={`/brokers/${broker.brokerId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">storefront</span>
                      <span>ملف الوكيل</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section: Commission Change Audit Log */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-amber-600 rounded-full" />
            <h3 className="text-sm font-bold text-slate-900">
              سجل قرارات تعديل نسب العمولات التاريخية (Audit Log)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            تخضع كافة التعديلات لتوثيق القرار والمفوض المسؤول
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4">القرار المرجعي</th>
                <th className="py-2.5 px-4">مكتب الوسيط</th>
                <th className="py-2.5 px-4">النسبة السابقة ← الجديدة</th>
                <th className="py-2.5 px-4">تاريخ الاعتماد</th>
                <th className="py-2.5 px-4">المفوض المعتمد</th>
                <th className="py-2.5 px-4">الأسباب والمبررات التعاقدية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carrier.commissionHistory.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">
                    {record.decisionReference}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {record.brokerName} ({record.brokerId})
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-400 line-through mr-1">
                      {record.previousRatePercent.toFixed(1)}%
                    </span>
                    <span className="material-symbols-outlined text-slate-400 text-[14px] align-middle mx-1">
                      arrow_left_alt
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {record.newRatePercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{record.decisionDate}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{record.authorizerName}</td>
                  <td className="py-3 px-4 text-slate-600">{record.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssignBrokerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        carrierName={carrier.name}
        onAssign={onAssignBroker}
      />
    </div>
  );
};
