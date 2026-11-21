import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import type { PlatformSettings } from '../types/settings';

export const GeneralSettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetSettings,
    testGateway,
    testingGateway,
    toastMessage,
    dismissToast,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<'operations' | 'financials' | 'notifications' | 'security' | 'system'>('operations');
  const [formState, setFormState] = useState<PlatformSettings>(settings);
  const [syncedSettings, setSyncedSettings] = useState<PlatformSettings>(settings);

  // Re-sync the form when settings are updated externally (during render, not in an effect)
  if (syncedSettings !== settings) {
    setSyncedSettings(settings);
    setFormState(settings);
  }

  const handleSave = () => {
    updateSettings(formState);
  };

  const tabs = [
    { id: 'operations', name: 'معايير الحجز والتشغيل', icon: 'departure_board' },
    { id: 'financials', name: 'السياسات المالية وبوابات الدفع', icon: 'payments' },
    { id: 'notifications', name: 'بوابات الإشعارات والاتصال', icon: 'mark_chat_read' },
    { id: 'security', name: 'ضوابط الأمان والجلسات', icon: 'security' },
    { id: 'system', name: 'الصيانة وخوادم المنصة', icon: 'dns' },
  ] as const;

  return (
    <div className="flex flex-col gap-space-lg pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-700'
              : 'bg-red-950 text-red-100 border-red-700'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {toastMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-body-md text-sm font-medium">{toastMessage.text}</span>
          <button
            onClick={dismissToast}
            className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
            <span>لوحة التحكم المركزية</span>
            <span className="material-symbols-outlined text-xs">chevron_left</span>
            <span>إدارة النظام</span>
            <span className="material-symbols-outlined text-xs">chevron_left</span>
            <span className="text-on-surface">الإعدادات العامة</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="font-headline-lg text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              الإعدادات العامة والتشغيلية للمنصة
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {formState.system.systemVersion}
            </span>
          </div>
          <p className="font-body-md text-sm text-on-surface-variant max-w-3xl">
            إدارة بارامترات حجز المقاعد القومية، النسب المالية وعمولات الوكلاء، بوابات الاتصالات المحلية (Zain/MTN/Sudani)، وضوابط أمان الحسابات.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={resetSettings}
            className="px-4 py-2.5 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface font-label-md text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base text-outline">history</span>
            استعادة الافتراضي
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-focus text-on-primary font-label-md text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">save</span>
            حفظ التعديلات
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-outline-variant gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 font-label-lg text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-t-xl'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OPERATIONS */}
      {activeTab === 'operations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Booking Parameters */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant">
              <span className="p-2 rounded-xl bg-primary/10 text-primary material-symbols-outlined text-xl">
                timer
              </span>
              <div>
                <h3 className="font-title-md text-base font-bold text-on-surface">محددات الحجز وتثبيت المقاعد</h3>
                <p className="text-xs text-on-surface-variant">التحكم في فترات الاحتفاظ بالمقعد في مرحلة الدفع وسقف التذاكر</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  مهلة تثبيت المقعد المؤقت قبل الإلغاء الآلي (Seat Hold TTL)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formState.operations.seatHoldMinutes}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        operations: { ...formState.operations, seatHoldMinutes: Number(e.target.value) },
                      })
                    }
                    className="w-28 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-tabular-stat text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">دقيقة</span>
                  <span className="text-xs text-outline mr-auto">الموصى به لشبكات السودان: 15 دقيقة لتفادي انقطاع الإنترنت</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  الحد الأقصى للمقاعد في الحجز الفردي
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formState.operations.maxSeatsPerBooking}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        operations: { ...formState.operations, maxSeatsPerBooking: Number(e.target.value) },
                      })
                    }
                    className="w-28 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-tabular-stat text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">مقاعد</span>
                  <span className="text-xs text-outline mr-auto">يمنع الاحتكار والحجوزات العشوائية</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  الحد الأدنى لوقت إلغاء التذكرة قبل انطلاق الرحلة
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={formState.operations.cancellationCutoffHours}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        operations: { ...formState.operations, cancellationCutoffHours: Number(e.target.value) },
                      })
                    }
                    className="w-28 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-tabular-stat text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">ساعات</span>
                  <span className="text-xs text-outline mr-auto">بموجب لائحة تنظيم النقل البري</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  إغلاق وتوليد مانيفست الرحلة قبل المغادرة
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={formState.operations.manifestLockMinutesBeforeDeparture}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        operations: { ...formState.operations, manifestLockMinutesBeforeDeparture: Number(e.target.value) },
                      })
                    }
                    className="w-28 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-tabular-stat text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">دقيقة</span>
                  <span className="text-xs text-outline mr-auto">تسليم الكشف المطبوع لسائق الحافلة والمحطة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Emergency Routing Mode */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 material-symbols-outlined text-xl">
                traffic
              </span>
              <div>
                <h3 className="font-title-md text-base font-bold text-on-surface">إدارة الطوارئ ومسارات السفر القومية</h3>
                <p className="text-xs text-on-surface-variant">تجاوب سريع مع إغلاقات الطرق وأحوال الطقس والفيضانات</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-on-surface">وضع تشغيل مسارات الطوارئ (Emergency Routing Mode)</span>
                  <span className="text-xs text-on-surface-variant max-w-sm">
                    عند التفعيل، يتم عرض إشعار إجباري للمسافرين والوكلاء عند حجز مسارات السفر المتأثرة.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.operations.emergencyRoutingMode}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        operations: { ...formState.operations, emergencyRoutingMode: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  نص التنبيه التشغيلي العام للمسافرين والوكلاء
                </label>
                <textarea
                  rows={4}
                  value={formState.operations.emergencyNoticeText}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      operations: { ...formState.operations, emergencyNoticeText: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-on-surface">سماح بـ Overbooking Buffer (مقاعد احتياط)</span>
                  <span className="text-xs text-on-surface-variant">السماح بحجز مقعدين إضافيين كقائمة انتظار للرحلات المكتملة</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.operations.allowOverbookingBuffer}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        operations: { ...formState.operations, allowOverbookingBuffer: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIALS */}
      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Revenue Sharing & Commission */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant">
              <span className="p-2 rounded-xl bg-primary/10 text-primary material-symbols-outlined text-xl">
                percent
              </span>
              <div>
                <h3 className="font-title-md text-base font-bold text-on-surface">نسب العمولات والرسوم</h3>
                <p className="text-xs text-on-surface-variant">توزيع الإيراد بين المنصة والوكلاء والشركات الناقلة</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  نسبة عمولة منصة ZoolGo الافتراضية
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={formState.financials.platformCommissionPercent}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        financials: { ...formState.financials, platformCommissionPercent: Number(e.target.value) },
                      })
                    }
                    className="w-28 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-tabular-stat text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">% من قيمة التذكرة الإجمالية</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  نسبة عمولة مكتب الوكيل (Broker Commission)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    value={formState.financials.brokerCommissionPercent}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        financials: { ...formState.financials, brokerCommissionPercent: Number(e.target.value) },
                      })
                    }
                    className="w-28 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-tabular-stat text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">% تقيد فوراً في محفظة الوكيل عند الحجز</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  الحد الأدنى الحرج لرصيد محفظة الوكيل قبل إيقاف الحجز
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={formState.financials.brokerMinWalletThreshold}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        financials: { ...formState.financials, brokerMinWalletThreshold: Number(e.target.value) },
                      })
                    }
                    className="w-40 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-tabular-stat text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">ج.س</span>
                  <span className="text-xs text-outline mr-auto">إرسال تنبيه SMS عند وصول الرصيد لهذا الحد</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  سقف الصرف الذي يتطلب مصادقة ثنائية مالية (SoD Threshold)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="100000"
                    min="0"
                    value={formState.financials.sodThresholdAmount}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        financials: { ...formState.financials, sodThresholdAmount: Number(e.target.value) },
                      })
                    }
                    className="w-40 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-tabular-stat text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">ج.س</span>
                  <span className="text-xs text-amber-700 font-semibold mr-auto">يتطلب موافقة المراقب المالي هشام كمال</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Banking & Settlement Channels */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant">
              <span className="p-2 rounded-xl bg-secondary/10 text-secondary material-symbols-outlined text-xl">
                account_balance
              </span>
              <div>
                <h3 className="font-title-md text-base font-bold text-on-surface">الحسابات البنكية وبوابة بنكك</h3>
                <p className="text-xs text-on-surface-variant">قنوات الصرف وتسوية مستحقات شركات النقل</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  حساب الصرف المصرفي المعتمد
                </label>
                <input
                  type="text"
                  value={formState.financials.defaultDisbursementBank}
                  readOnly
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container text-on-surface font-semibold text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  دورة التسوية التلقائية للشركات
                </label>
                <select
                  value={formState.financials.autoSettlementCycle}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      financials: {
                        ...formState.financials,
                        autoSettlementCycle: e.target.value as 'weekly' | 'biweekly' | 'monthly',
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="weekly">أسبوعياً (كل يوم خميس نهاية أسبوع العمل)</option>
                  <option value="biweekly">نصف شهري (يومي 15 و 30 من الشهر)</option>
                  <option value="monthly">شهرياً (اليوم الأخير من كل شهر ميلادي)</option>
                </select>
              </div>

              {/* BOK Gateway Diagnostic Box */}
              <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-lg">verified</span>
                    <span className="text-xs font-bold text-on-surface">بوابة التحويلات المباشرة بنكك (BOK API Gateway)</span>
                  </div>
                  <span className="text-xs font-bold text-secondary">حساب الشركات #1892044</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  تتيح البوابة تصدير وتمرير ملفات الصرف الجماعي المعتمدة مع تشفير 256-bit وقفل أمان التحويل.
                </p>
                <button
                  type="button"
                  onClick={() => testGateway('bankak')}
                  disabled={testingGateway === 'bankak'}
                  className="self-start px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">
                    {testingGateway === 'bankak' ? 'sync' : 'network_check'}
                  </span>
                  {testingGateway === 'bankak' ? 'جاري الفحص...' : 'اختبار اتصال بوابة بنكك'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: SMS Gateways */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 material-symbols-outlined text-xl">
                sms
              </span>
              <div>
                <h3 className="font-title-md text-base font-bold text-on-surface">بوابة الرسائل القصيرة (SMS Gateway)</h3>
                <p className="text-xs text-on-surface-variant">تأكيد التذاكر ورموز OTP واسترداد الأموال عبر الشبكات المحلية</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  مزود خدمة الاتصالات الرئيسي في السودان
                </label>
                <select
                  value={formState.notifications.smsProvider}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      notifications: {
                        ...formState.notifications,
                        smsProvider: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="zain">زين السودان (Zain Sudan - Direct SMPP Gateway)</option>
                  <option value="mtn">إم تي إن السودان (MTN Sudan Corporate Gateway)</option>
                  <option value="sudani">سوداني (Sudatel Sudani SMS Service)</option>
                  <option value="twilio">Twilio Global (للمسافرين من الخارج)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  اسم المرسل المعتمد (Sender ID)
                </label>
                <input
                  type="text"
                  value={formState.notifications.smsSenderId}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      notifications: { ...formState.notifications, smsSenderId: e.target.value },
                    })
                  }
                  className="w-48 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-bold text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-on-surface">تفعيل إرسال الرسائل القصيرة للمسافرين</span>
                  <span className="text-xs text-on-surface-variant">إرسال تفاصيل المقعد ورقم التذكرة فور نجاح الدفع</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.notifications.smsEnabled}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        notifications: { ...formState.notifications, smsEnabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <button
                type="button"
                onClick={() => testGateway('sms')}
                disabled={testingGateway === 'sms'}
                className="self-start px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  {testingGateway === 'sms' ? 'sync' : 'cell_tower'}
                </span>
                {testingGateway === 'sms' ? 'جاري الفحص...' : 'فحص رصيد واتصال Zain SMS'}
              </button>
            </div>
          </div>

          {/* Card: WhatsApp Business Integration */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 material-symbols-outlined text-xl">
                chat
              </span>
              <div>
                <h3 className="font-title-md text-base font-bold text-on-surface">واتساب للأعمال (WhatsApp Business)</h3>
                <p className="text-xs text-on-surface-variant">إرسال التذكرة الإلكترونية كملف PDF ورابط تتبع الباص المباشر</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-on-surface">إرسال التذكرة كرسالة واتساب موثقة</span>
                  <span className="text-xs text-on-surface-variant">يقلل الحاجة لطباعة الورق في الموانئ والمحطات البرية</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.notifications.whatsappEnabled}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        notifications: { ...formState.notifications, whatsappEnabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  بوابة وتوثيق ميتا (Meta Cloud Provider)
                </label>
                <input
                  type="text"
                  value={formState.notifications.whatsappProvider}
                  readOnly
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container text-on-surface font-semibold text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  إشعار الركاب عند تأخر الرحلة بأكثر من
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="15"
                    max="180"
                    step="15"
                    value={formState.notifications.autoNotifyDelayMinutes}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        notifications: {
                          ...formState.notifications,
                          autoNotifyDelayMinutes: Number(e.target.value),
                        },
                      })
                    }
                    className="w-28 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-tabular-stat text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">دقيقة تأخير</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => testGateway('whatsapp')}
                disabled={testingGateway === 'whatsapp'}
                className="self-start px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  {testingGateway === 'whatsapp' ? 'sync' : 'phonelink_ring'}
                </span>
                {testingGateway === 'whatsapp' ? 'جاري الفحص...' : 'فحص قالب رسائل الواتساب'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Session & 2FA */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant">
              <span className="p-2 rounded-xl bg-primary/10 text-primary material-symbols-outlined text-xl">
                lock
              </span>
              <div>
                <h3 className="font-title-md text-base font-bold text-on-surface">الجلسات والمصادقة الثنائية (2FA)</h3>
                <p className="text-xs text-on-surface-variant">حماية حسابات المشرفين والمدراء الماليين في المنصة</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  مهلة خمول الجلسة قبل تسجيل الخروج التلقائي
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={formState.security.sessionTimeoutMinutes}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        security: { ...formState.security, sessionTimeoutMinutes: Number(e.target.value) },
                      })
                    }
                    className="w-28 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-tabular-stat text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">دقيقة</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-on-surface">إلزام مدراء النظام (Super Admins) برمز 2FA</span>
                  <span className="text-xs text-on-surface-variant">طلب كود مصادقة Google Authenticator عند كل تسجيل دخول</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.security.enforce2FAForAdmins}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        security: { ...formState.security, enforce2FAForAdmins: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-on-surface">إلزام المشرفين الماليين برمز 2FA</span>
                  <span className="text-xs text-on-surface-variant">حماية إضافية قبل اعتماد أي دفعة أو تسوية بنكية</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.security.enforce2FAForFinance}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        security: { ...formState.security, enforce2FAForFinance: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Card: Audit & Access Restrictions */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant">
              <span className="p-2 rounded-xl bg-secondary/10 text-secondary material-symbols-outlined text-xl">
                fingerprint
              </span>
              <div>
                <h3 className="font-title-md text-base font-bold text-on-surface">سياسات التدقيق وسجل الأنشطة</h3>
                <p className="text-xs text-on-surface-variant">الاحتفاظ بالسجلات الرقابية وحماية محاولات التسلل</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  فترة الاحتفاظ بسجلات التدقيق (Audit Retention)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="30"
                    max="1825"
                    value={formState.security.auditRetentionDays}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        security: { ...formState.security, auditRetentionDays: Number(e.target.value) },
                      })
                    }
                    className="w-28 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-tabular-stat text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">يوماً (365 = سنة كاملة)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  أقصى عدد لمحاولات الدخول الخاطئة قبل القفل المؤقت
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={formState.security.maxLoginAttempts}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        security: { ...formState.security, maxLoginAttempts: Number(e.target.value) },
                      })
                    }
                    className="w-28 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-tabular-stat text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">محاولات</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-on-surface">تقييد المشرفين بنطاق IP محدد</span>
                  <span className="text-xs text-on-surface-variant">حصر الدخول من مكاتب إدارة محطات الميناء البري</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.security.ipWhitelistingEnabled}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        security: { ...formState.security, ipWhitelistingEnabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM & MAINTENANCE */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Maintenance Mode */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant">
              <span className="p-2 rounded-xl bg-red-500/10 text-red-600 material-symbols-outlined text-xl">
                construction
              </span>
              <div>
                <h3 className="font-title-md text-base font-bold text-on-surface">وضع الصيانة العامة (Maintenance Mode)</h3>
                <p className="text-xs text-on-surface-variant">تعليق الحجوزات مؤقتاً لأعمال الترقية دون التأثير على التتبع</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-on-surface">تفعيل وضع الصيانة</span>
                  <span className="text-xs text-on-surface-variant">يتم توجيه المستخدمين والتطبيقات إلى صفحة الترقية</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.system.maintenanceMode}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        system: { ...formState.system, maintenanceMode: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  رسالة الصيانة المعروضة للمستخدمين
                </label>
                <textarea
                  rows={3}
                  value={formState.system.maintenanceMessage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      system: { ...formState.system, maintenanceMessage: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-xl">cloud_done</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-emerald-900">آخر نسخة احتياطية ناجحة لقاعدة البيانات</span>
                  <span className="text-xs text-emerald-800">{formState.system.lastBackupTimestamp}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Cluster & Infra Info */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant">
              <span className="p-2 rounded-xl bg-primary/10 text-primary material-symbols-outlined text-xl">
                server
              </span>
              <div>
                <h3 className="font-title-md text-base font-bold text-on-surface">البنية التحتية والخوادم</h3>
                <p className="text-xs text-on-surface-variant">مواصفات بيئة تشغيل ZoolGo Production Core</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant text-xs">
                <span className="text-on-surface-variant">بيئة التشغيل:</span>
                <span className="font-bold text-on-surface">إنتاج مباشر (Production Cluster - Sudan/MENA)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant text-xs">
                <span className="text-on-surface-variant">محرك قاعدة البيانات:</span>
                <span className="font-bold text-on-surface">PostgreSQL 16 High-Availability (Replication Sync)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant text-xs">
                <span className="text-on-surface-variant">ذاكرة التخزين المؤقت (Cache):</span>
                <span className="font-bold text-on-surface">Redis Cluster (6 Nodes - 0.4ms Latency)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant text-xs">
                <span className="text-on-surface-variant">وقت التشغيل المتواصل (Uptime):</span>
                <span className="font-bold text-emerald-700">99.98% (آخر 90 يوماً)</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    alert('تم تفريغ ذاكرة التخزين المؤقت بنجاح (Redis Cache Flushed)');
                  }}
                  className="px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-container text-red-600 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">cached</span>
                  تفريغ الكاش وإعادة بناء الفهارس
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
