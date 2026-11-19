import type { PlatformSettings } from '../types/settings';
import { initialPlatformSettings } from '../fixtures/settingsFixtures';

class SettingsService {
  private settings: PlatformSettings = JSON.parse(JSON.stringify(initialPlatformSettings));

  getSettings(): PlatformSettings {
    return JSON.parse(JSON.stringify(this.settings));
  }

  updateSettings(partial: Partial<PlatformSettings>): { success: boolean; settings: PlatformSettings; error?: string } {
    // Validate operational settings
    if (partial.operations) {
      if (partial.operations.seatHoldMinutes < 1 || partial.operations.seatHoldMinutes > 60) {
        return { success: false, settings: this.getSettings(), error: 'مهلة حجز المقاعد يجب أن تتراوح بين دقيقة و 60 دقيقة' };
      }
      if (partial.operations.maxSeatsPerBooking < 1 || partial.operations.maxSeatsPerBooking > 20) {
        return { success: false, settings: this.getSettings(), error: 'الحد الأقصى للمقاعد في الحجز الفردي يجب أن يكون بين 1 و 20' };
      }
    }

    // Validate financial settings
    if (partial.financials) {
      if (partial.financials.platformCommissionPercent < 0 || partial.financials.platformCommissionPercent > 50) {
        return { success: false, settings: this.getSettings(), error: 'نسبة عمولة المنصة يجب أن تتراوح بين 0% و 50%' };
      }
      if (partial.financials.brokerCommissionPercent < 0 || partial.financials.brokerCommissionPercent > 30) {
        return { success: false, settings: this.getSettings(), error: 'نسبة عمولة الوكيل يجب أن تتراوح بين 0% و 30%' };
      }
    }

    // Merge changes
    this.settings = {
      ...this.settings,
      ...partial,
      operations: { ...this.settings.operations, ...(partial.operations || {}) },
      financials: { ...this.settings.financials, ...(partial.financials || {}) },
      notifications: { ...this.settings.notifications, ...(partial.notifications || {}) },
      security: { ...this.settings.security, ...(partial.security || {}) },
      system: { ...this.settings.system, ...(partial.system || {}) },
    };

    return { success: true, settings: this.getSettings() };
  }

  resetToDefaults(): PlatformSettings {
    this.settings = JSON.parse(JSON.stringify(initialPlatformSettings));
    return this.getSettings();
  }

  testGatewayConnection(type: 'sms' | 'whatsapp' | 'bankak'): { success: boolean; message: string; latencyMs: number } {
    if (type === 'sms') {
      return {
        success: true,
        message: 'تم التحقق من بوابة Zain Sudan SMS بنجاح (الرصيد المتاح: 45,200 رسالة)',
        latencyMs: 142,
      };
    }
    if (type === 'whatsapp') {
      return {
        success: true,
        message: 'تم الاتصال بخادم Meta WhatsApp Business API وتأكيد الرمز التعريفي لقالب التذاكر الإلكترونية',
        latencyMs: 195,
      };
    }
    return {
      success: true,
      message: 'تم التحقق من بروتوكول تحويلات بنكك الآمن BOK API Gateway (حساب الشركات: #1892044)',
      latencyMs: 230,
    };
  }
}

export const settingsService = new SettingsService();
