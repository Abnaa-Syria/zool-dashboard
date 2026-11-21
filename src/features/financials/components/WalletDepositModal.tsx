import React, { useState } from 'react';
import type { BrokerWalletSummary, PaymentChannel } from '../types/financials';

interface WalletDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWallet?: BrokerWalletSummary | null;
  wallets: BrokerWalletSummary[];
  onConfirmDeposit: (
    brokerId: string,
    amount: number,
    channel: PaymentChannel,
    referenceNumber: string,
    notes?: string
  ) => void;
}

export const WalletDepositModal: React.FC<WalletDepositModalProps> = ({
  isOpen,
  onClose,
  selectedWallet,
  wallets,
  onConfirmDeposit,
}) => {
  const [brokerId, setBrokerId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [channel, setChannel] = useState<PaymentChannel>('bankak');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Pick the broker from the selected wallet, else default to the first wallet
  // (adjusted during render instead of in an effect).
  const [syncedWallet, setSyncedWallet] = useState<typeof selectedWallet | undefined>(undefined);
  if (syncedWallet !== selectedWallet) {
    setSyncedWallet(selectedWallet);
    if (selectedWallet) setBrokerId(selectedWallet.brokerId);
  }
  if (!selectedWallet && !brokerId && wallets.length > 0) {
    setBrokerId(wallets[0].brokerId);
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerId || !amount || Number(amount) <= 0) return;

    onConfirmDeposit(
      brokerId,
      Number(amount),
      channel,
      referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
      notes.trim() || undefined
    );

    // Reset and close
    setAmount('');
    setReferenceNumber('');
    setNotes('');
    onClose();
  };

  const activeWallet = wallets.find((w) => w.brokerId === brokerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Dialog Content */}
      <div className="relative bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-border z-10 flex flex-col gap-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-dark text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">add_card</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-text-primary">
                تسجيل شحن رصيد استثنائي لمحفظة وكيل
              </h2>
              <span className="text-xs text-text-muted">
                إيداع مالي فوري مع توليد قيد مزدوج في دفتر الأستاذ العام
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Select Broker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">مكتب السفر أو الوكالة المستفيدة:</label>
            <select
              value={brokerId}
              onChange={(e) => setBrokerId(e.target.value)}
              className="h-10 px-3 rounded-lg bg-surface-subtle text-text-primary text-xs font-semibold border border-border focus:outline-none focus:border-primary-dark cursor-pointer"
            >
              {wallets.map((w) => (
                <option key={w.brokerId} value={w.brokerId}>
                  {w.brokerName} ({w.brokerId}) — الرصيد الحالي: {w.currentBalanceSdg.toLocaleString()} ج.س
                </option>
              ))}
            </select>
          </div>

          {/* Current balance indicator */}
          {activeWallet && (
            <div className="p-3 rounded-lg bg-surface-subtle border border-border flex items-center justify-between text-xs">
              <span className="text-text-muted">الرصيد الفعلي قبل الإيداع:</span>
              <span className="font-bold text-primary-dark tabular-nums">
                {activeWallet.currentBalanceSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
              </span>
            </div>
          )}

          {/* Amount and Channel Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary">المبلغ المودع (ج.س):</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="مثال: 50000"
                  className="w-full h-10 pr-3 pl-12 rounded-lg bg-surface-subtle text-text-primary text-xs font-bold border border-border focus:outline-none focus:border-primary-dark tabular-nums"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-medium pointer-events-none">
                  ج.س
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary">قناة الإيداع والتحويل:</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as PaymentChannel)}
                className="h-10 px-3 rounded-lg bg-surface-subtle text-text-primary text-xs font-semibold border border-border focus:outline-none focus:border-primary-dark cursor-pointer"
              >
                <option value="bankak">بنك الخرطوم (بنكك)</option>
                <option value="sadad">سداد إلكتروني (Sadad)</option>
                <option value="fauwr">فوري بنك فيصل</option>
                <option value="cash_deposit">إيداع نقدي بالخزينة</option>
              </select>
            </div>
          </div>

          {/* Bank Reference Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">
              الرقم المرجعي للإشعار البنكي / رقم الحوالة:
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="مثال: BOK-REF-9921048 أو SDD-TR-1849"
              className="h-10 px-3 rounded-lg bg-surface-subtle text-text-primary text-xs font-mono border border-border focus:outline-none focus:border-primary-dark"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">ملاحظات العملية والاعتماد الإداري:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أدخل أي ملاحظات حول الإيداع أو مبرر الشحن الاستثنائي..."
              className="p-2.5 rounded-lg bg-surface-subtle text-text-primary text-xs border border-border focus:outline-none focus:border-primary-dark"
            />
          </div>

          {/* Summary Preview */}
          {amount && Number(amount) > 0 && activeWallet && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <span>الرصيد بعد الشحن:</span>
              <span className="font-bold tabular-nums">
                {(activeWallet.currentBalanceSdg + Number(amount)).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}{' '}
                ج.س
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-subtle text-text-primary hover:bg-border text-xs font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!brokerId || !amount || Number(amount) <= 0}
              className="px-5 py-2 rounded-lg bg-primary-dark hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              تأكيد وإيداع الرصيد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
