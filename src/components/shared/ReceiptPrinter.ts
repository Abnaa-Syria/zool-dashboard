// Compound API for the receipt printer. Components live in ReceiptPrinterParts.tsx
// (kept separate so that file only exports components, which fast refresh requires).
import {
  ReceiptPrinterRoot,
  ReceiptPrinterMachine,
  ReceiptPrinterHeader,
  ReceiptPrinterScreen,
  ReceiptPrinterStatus,
  ReceiptPrinterPaper,
  ReceiptPrinterOutput,
} from './ReceiptPrinterParts';

export type {
  ReceiptPrinterStage,
  ReceiptFeedMotion,
  ReceiptPrinterRootProps,
  ReceiptPrinterMachineProps,
  ReceiptPrinterHeaderProps,
  ReceiptPrinterScreenProps,
  ReceiptPrinterOutputProps,
  ReceiptPrinterPaperProps,
  ReceiptPrinterStatusProps,
} from './ReceiptPrinterParts';

export const ReceiptPrinter = {
  Header: ReceiptPrinterHeader,
  Machine: ReceiptPrinterMachine,
  Output: ReceiptPrinterOutput,
  Paper: ReceiptPrinterPaper,
  Root: ReceiptPrinterRoot,
  Screen: ReceiptPrinterScreen,
  Status: ReceiptPrinterStatus,
};
