import * as React from 'react';
import { Link } from 'react-router-dom';
import type { TransportCarrier } from '../types/carrier';

interface CarrierRoutesFleetTabProps {
  carrier: TransportCarrier;
}

// Sample live buses list matching carrier fleet and live tracking
const carrierFleetBuses = [
  {
    busId: 'ZG-BUS-018',
    plateNumber: 'خ 4 - 8912',
    model: 'Mercedes-Benz Travego VIP',
    capacity: 45,
    tripNumber: 'TRIP-983',
    route: 'الخرطوم ↔ بورتسودان',
    driver: 'عثمان عبد الرحيم',
    speedKmH: 84,
    gpsDevice: 'Teltonika FMB920',
    gpsSignal: 'ممتاز (4G/GNSS)',
    status: 'on_route',
    statusLabel: 'على الطريق (شريان الشمال)',
  },
  {
    busId: 'ZG-BUS-004',
    plateNumber: 'خ 2 - 4401',
    model: 'King Long XMQ6129 VIP',
    capacity: 49,
    tripNumber: 'TRIP-702',
    route: 'الخرطوم ↔ مروي',
    driver: 'جعفر محجوب',
    speedKmH: 78,
    gpsDevice: 'Teltonika FMB920',
    gpsSignal: 'ممتاز (4G/GNSS)',
    status: 'on_route',
    statusLabel: 'على الطريق (الولاية الشمالية)',
  },
  {
    busId: 'ZG-BUS-022',
    plateNumber: 'خ 7 - 1205',
    model: 'Mercedes-Benz Tourismo',
    capacity: 48,
    tripNumber: 'TRIP-441',
    route: 'الخرطوم ↔ عطبرة',
    driver: 'طارق البدوي',
    speedKmH: 0,
    gpsDevice: 'Teltonika FMB920',
    gpsSignal: 'متصل (صالة الركاب)',
    status: 'boarding',
    statusLabel: 'في الميناء البري (صعود)',
  },
  {
    busId: 'ZG-BUS-031',
    plateNumber: 'ب ر - 5019',
    model: 'King Long Express',
    capacity: 45,
    tripNumber: '—',
    route: 'بورتسودان ↔ الخرطوم (احتياطي)',
    driver: 'صلاح كباشي',
    speedKmH: 0,
    gpsDevice: 'Teltonika FMB920',
    gpsSignal: 'إشارة خاملة',
    status: 'idle',
    statusLabel: 'جاهزية بالموقف',
  },
  {
    busId: 'ZG-BUS-040',
    plateNumber: 'خ 9 - 3311',
    model: 'Mercedes-Benz Travego',
    capacity: 45,
    tripNumber: '—',
    route: 'ورشة الصيانة المركزية',
    driver: '—',
    speedKmH: 0,
    gpsDevice: 'مفصول مؤقتاً',
    gpsSignal: 'صيانة دورية',
    status: 'maintenance',
    statusLabel: 'قيد الصيانة الدورية',
  },
];

export const CarrierRoutesFleetTab: React.FC<CarrierRoutesFleetTabProps> = ({ carrier }) => {
  return (
    <div className="space-y-6">
      {/* Top Analytical Banner (Capacity & IoT Sync Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Capacity Card */}
        <div className="lg:col-span-8 bg-[#003B27] text-white p-5 rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
            <div>
              <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                حالة الركاب وسعة المقاعد اليوم
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-3xl font-bold">1,120</span>
                <span className="text-xs text-emerald-200">راكب مسافر اليوم عبر 32 رحلة</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs">
              <span className="material-symbols-outlined text-emerald-300 text-[18px]">
                pie_chart
              </span>
              <div>
                <span className="text-emerald-200 block text-[10px]">نسبة الإشغال الإجمالية</span>
                <span className="font-bold text-white">91.4% (سعة مكتملة)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-800/80 flex flex-wrap items-center justify-between text-xs text-emerald-200 gap-2">
            <span>التشغيل وفق تراخيص الهيئة القومية للطرق والجسور</span>
            <span className="text-white font-medium">
              كافة الرحلات تخضع للتتبع الجغرافي اللحظي الإلزامي
            </span>
          </div>
        </div>

        {/* GPS Hardware Status */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">جاهزية أجهزة Teltonika GPS</span>
            <span className="material-symbols-outlined text-emerald-700 text-[20px]">
              satellite_alt
            </span>
          </div>
          <div className="py-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-slate-900">
                {carrier.activeGpsBusesCount} / {carrier.totalFleetCount}
              </span>
              <span className="text-xs text-emerald-600 font-bold">
                (
                {Math.round((carrier.activeGpsBusesCount / carrier.totalFleetCount) * 100)}
                %)
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              حافلة تبث الإحداثيات كل 30 ثانية
            </span>
          </div>
          <Link
            to={`/tracking?carrier=${encodeURIComponent(carrier.code)}`}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            <span>عرض في شاشة التتبع المباشر</span>
          </Link>
        </div>
      </div>

      {/* SECTION A: Approved Corridor Routes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#003B27] rounded-full" />
            <h2 className="text-sm font-bold text-slate-900">
              المسارات والمحطات المعتمدة رسميـاً ({carrier.routes.length} مساراً)
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            تراخيص النقل المعتمدة بين العاصمة والولايات
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {carrier.routes.map((route) => (
            <div
              key={route.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded">
                  {route.id}
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>نشط ومصرح</span>
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{route.originCity}</span>
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">
                    arrow_left_alt
                  </span>
                  <span>{route.destinationCity}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  من {route.originTerminal} إلى {route.destinationTerminal}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">المسافة والزمن:</span>
                  <span className="font-semibold text-slate-800">
                    {route.distanceKm} كم ({route.durationFormatted})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">الرحلات اليومية:</span>
                  <span className="font-semibold text-slate-800">
                    {route.dailyDeparturesCount} رحلات / اليوم
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">المحطات المصرحة:</span>
                  <span className="font-semibold text-slate-800">
                    {route.approvedStopsCount} محطات
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">سعر التذكرة المرجعي:</span>
                  <span className="font-mono font-bold text-[#8E1B32]">
                    {route.baseFareSdg.toLocaleString()} ج.س
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION B: Live Bus Fleet Roster */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-emerald-700 rounded-full" />
            <h2 className="text-sm font-bold text-slate-900">
              قائمة أسطول الحافلات والبث اللحظي
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              إجمالي الأسطول: <strong>{carrier.totalFleetCount} حافلة</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">كود الحافلة واللوحة</th>
                <th className="py-3 px-4">الموديل والسعة</th>
                <th className="py-3 px-4">الرحلة المعينة</th>
                <th className="py-3 px-4">السائق المعتمد</th>
                <th className="py-3 px-4">جهاز التتبع (IoT) والسرعة</th>
                <th className="py-3 px-4">الحالة التشغيلية</th>
                <th className="py-3 px-4 text-center">التتبع الميداني</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carrierFleetBuses.map((bus) => (
                <tr key={bus.busId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        <span className="material-symbols-outlined text-[18px]">
                          directions_bus
                        </span>
                      </div>
                      <div>
                        <span className="font-mono font-bold text-slate-900 block">
                          {bus.busId}
                        </span>
                        <span className="text-[11px] text-slate-500">{bus.plateNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 block">{bus.model}</span>
                    <span className="text-[11px] text-slate-500">{bus.capacity} مقعداً</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-800 block">{bus.tripNumber}</span>
                    <span className="text-[11px] text-slate-500">{bus.route}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{bus.driver}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-700 font-medium">
                        {bus.gpsDevice}
                      </span>
                      {bus.speedKmH > 0 && (
                        <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded">
                          {bus.speedKmH} كم/س
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">{bus.gpsSignal}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        bus.status === 'on_route'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bus.status === 'boarding'
                            ? 'bg-amber-100 text-amber-800'
                            : bus.status === 'idle'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {bus.status === 'on_route' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      )}
                      <span>{bus.statusLabel}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      to={`/tracking?busId=${bus.busId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                      title="فتح على الخريطة الحية"
                    >
                      <span className="material-symbols-outlined text-[16px]">fmd_good</span>
                      <span>الخريطة</span>
                    </Link>
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
