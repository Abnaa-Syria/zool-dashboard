import { useState, useCallback } from 'react';
import type { PlatformSettings } from '../types/settings';
import { settingsService } from '../services/settingsService';

export function useSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(() => settingsService.getSettings());
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [testingGateway, setTestingGateway] = useState<'sms' | 'whatsapp' | 'bankak' | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const updateSettings = useCallback((partial: Partial<PlatformSettings>) => {
    const result = settingsService.updateSettings(partial);
    if (result.success) {
      setSettings(result.settings);
      showToast('تم حفظ وتطبيق التعديلات بنجاح في قاعدة إعدادات المنصة', 'success');
      return true;
    } else {
      showToast(result.error || 'تعذر حفظ الإعدادات، يرجى مراجعة المدخلات', 'error');
      return false;
    }
  }, []);

  const resetSettings = useCallback(() => {
    const defaultSettings = settingsService.resetToDefaults();
    setSettings(defaultSettings);
    showToast('تمت استعادة الإعدادات المصنعية الافتراضية بنجاح', 'success');
  }, []);

  const testGateway = useCallback((type: 'sms' | 'whatsapp' | 'bankak') => {
    setTestingGateway(type);
    setTimeout(() => {
      const result = settingsService.testGatewayConnection(type);
      setTestingGateway(null);
      showToast(`${result.message} (${result.latencyMs}ms)`, result.success ? 'success' : 'error');
    }, 600);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    testGateway,
    testingGateway,
    toastMessage,
    dismissToast: () => setToastMessage(null),
  };
}
