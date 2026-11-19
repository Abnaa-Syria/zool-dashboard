import * as React from 'react';
import { Link } from 'react-router-dom';
import type { BrokerOffice } from '../types/broker';

interface BrokerCarriersStaffTabProps {
  broker: BrokerOffice;
}

export const BrokerCarriersStaffTab: React.FC<BrokerCarriersStaffTabProps> = ({ broker }) => {
  return (
    <div className="space-y-6">
      {/* SECTION A: Authorized Transport Carriers */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#003B27] rounded-full" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                شركات النقل المعتمدة للمكتب ({broker.carrierLinks.length} شركات نقل)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                الشركات المصرح للمكتب بالبحث في جداول رحلاتها وإصدار التذاكر المباشرة لركابها
              </p>
            </div>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
            تحديث فوري
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">شركة النقل المعتمدة</th>
                <th className="py-3 px-4">نسبة العمولة المقررة</th>
                <th className="py-3 px-4">تاريخ بدء الاعتماد</th>
                <th className="py-3 px-4">الممرات المصرح بها</th>
                <th className="py-3 px-4">حالة الربط والتشغيل</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {broker.carrierLinks.map((link) => (
                <tr key={link.carrierId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {link.carrierName.slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{link.carrierName}</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          كود: {link.carrierCode}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-emerald-700">
                        {link.commissionRatePercent.toFixed(1)}%
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        محددة من الناقل
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {link.authorizedSince}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="flex items-center gap-1 flex-wrap">
                      {link.authorizedCorridors.map((c, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        link.status === 'authorized'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          link.status === 'authorized' ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}
                      />
                      <span>
                        {link.status === 'authorized' ? 'نشط ومصرح بالكامل' : 'معلق مؤقتاً'}
                      </span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      to={`/companies/${link.carrierId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">directions_bus</span>
                      <span>ملف الشركة</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION B: Booking Clerks & POS Staff */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-emerald-700 rounded-full" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                دليل موظفي الحجز ونقاط البيع المعتمدة ({broker.clerks.length} موظفين)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                إدارة المستخدمين المفوضين بإصدار التذاكر المطبوعة ومراقبة مستويات الصلاحيات
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">الموظف والرقم الوظيفي</th>
                <th className="py-3 px-4">المسمى الوظيفي</th>
                <th className="py-3 px-4">مستوى الصلاحية في النظام</th>
                <th className="py-3 px-4">نقطة البيع (POS) المعينة</th>
                <th className="py-3 px-4">رقم الهاتف</th>
                <th className="py-3 px-4">تذاكر الشهر</th>
                <th className="py-3 px-4">آخر نشاط</th>
                <th className="py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {broker.clerks.map((clerk) => (
                <tr key={clerk.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {clerk.name.slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{clerk.name}</span>
                        <span className="font-mono text-[11px] text-slate-500">{clerk.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{clerk.roleTitle}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        clerk.permissions === 'supervisor'
                          ? 'bg-purple-100 text-purple-800'
                          : clerk.permissions === 'full_access'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {clerk.permissions === 'supervisor' ? 'admin_panel_settings' : 'badge'}
                      </span>
                      <span>{clerk.permissionsLabel}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {clerk.assignedPosTerminal}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700" dir="ltr">
                    {clerk.phone}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {clerk.totalBookingsThisMonth} حجز
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">{clerk.lastActiveAt}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>نشط</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
