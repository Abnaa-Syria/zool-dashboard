import { describe, it, expect, beforeEach } from 'vitest';
import { settingsService } from './settingsService';

describe('Settings Service', () => {
  beforeEach(() => {
    settingsService.resetToDefaults();
  });

  it('retrieves default initial platform settings accurately', () => {
    const settings = settingsService.getSettings();
    expect(settings.operations.seatHoldMinutes).toBe(15);
    expect(settings.financials.primaryCurrency).toBe('SDG');
    expect(settings.financials.platformCommissionPercent).toBe(8.0);
    expect(settings.notifications.smsProvider).toBe('zain');
    expect(settings.security.enforce2FAForAdmins).toBe(true);
  });

  it('updates operational settings successfully when parameters are within valid ranges', () => {
    const result = settingsService.updateSettings({
      operations: {
        seatHoldMinutes: 20,
        maxSeatsPerBooking: 8,
        cancellationCutoffHours: 3,
        manifestLockMinutesBeforeDeparture: 45,
        allowOverbookingBuffer: false,
        emergencyRoutingMode: true,
        emergencyNoticeText: 'طريق بديل معتمد',
      },
    });

    expect(result.success).toBe(true);
    expect(result.settings.operations.seatHoldMinutes).toBe(20);
    expect(result.settings.operations.emergencyRoutingMode).toBe(true);
  });

  it('rejects invalid operational settings exceeding allowed boundary', () => {
    const result = settingsService.updateSettings({
      operations: {
        seatHoldMinutes: 999, // Exceeds 60
        maxSeatsPerBooking: 8,
        cancellationCutoffHours: 3,
        manifestLockMinutesBeforeDeparture: 45,
        allowOverbookingBuffer: false,
        emergencyRoutingMode: false,
        emergencyNoticeText: '',
      },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('مهلة حجز المقاعد');
  });

  it('validates financial platform commission percentage boundary', () => {
    const invalidResult = settingsService.updateSettings({
      financials: {
        primaryCurrency: 'SDG',
        currencySymbolAr: 'ج.س',
        platformCommissionPercent: 75.0, // Exceeds 50%
        brokerCommissionPercent: 3.0,
        brokerMinWalletThreshold: 50000,
        sodThresholdAmount: 1000000,
        autoSettlementCycle: 'weekly',
        defaultDisbursementBank: 'BOK',
        vatEnabled: false,
        vatPercentage: 0,
      },
    });

    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error).toContain('نسبة عمولة المنصة');
  });

  it('resets settings back to defaults', () => {
    settingsService.updateSettings({
      operations: {
        seatHoldMinutes: 30,
        maxSeatsPerBooking: 10,
        cancellationCutoffHours: 4,
        manifestLockMinutesBeforeDeparture: 45,
        allowOverbookingBuffer: false,
        emergencyRoutingMode: true,
        emergencyNoticeText: '',
      },
    });

    expect(settingsService.getSettings().operations.seatHoldMinutes).toBe(30);
    const reset = settingsService.resetToDefaults();
    expect(reset.operations.seatHoldMinutes).toBe(15);
  });

  it('tests gateway connection and returns diagnostic latency', () => {
    const smsTest = settingsService.testGatewayConnection('sms');
    expect(smsTest.success).toBe(true);
    expect(smsTest.latencyMs).toBeGreaterThan(0);

    const bankakTest = settingsService.testGatewayConnection('bankak');
    expect(bankakTest.success).toBe(true);
    expect(bankakTest.message).toContain('بنكك');
  });
});
