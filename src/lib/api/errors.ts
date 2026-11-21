import { ApiError } from './client';

/** Arabic text per backend error code (clients branch on `code`, never on `message`). */
const MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'تعذر الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.',
  VALIDATION_ERROR: 'البيانات المدخلة غير صحيحة.',
  AUTHENTICATION_REQUIRED: 'انتهت الجلسة. سجّل الدخول مرة أخرى.',
  UNAUTHORIZED: 'غير مصرح. سجّل الدخول مرة أخرى.',
  PERMISSION_DENIED: 'ليست لديك صلاحية لتنفيذ هذا الإجراء.',
  NOT_FOUND: 'العنصر المطلوب غير موجود.',
  CONFLICT: 'تعارض مع بيانات موجودة.',
  RATE_LIMITED: 'محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.',
  OTP_INVALID: 'رمز التحقق غير صحيح.',
  OTP_EXPIRED: 'انتهت صلاحية رمز التحقق. اطلب رمزًا جديدًا.',
  OTP_LOCKED: 'تم إيقاف الرمز بسبب كثرة المحاولات. اطلب رمزًا جديدًا.',
  OTP_COOLDOWN: 'انتظر قليلًا قبل طلب رمز جديد.',
  RANGE_TOO_LARGE: 'النطاق كبير جدًا. ضيّق الفترة أو عوامل التصفية.',
  INSUFFICIENT_BALANCE: 'رصيد المحفظة غير كافٍ.',
  VEHICLE_BUSY: 'الحافلة مرتبطة برحلة أخرى في نفس الوقت.',
  DRIVER_BUSY: 'السائق مرتبط برحلة أخرى في نفس الوقت.',
  ASSIGNMENT_MISMATCH: 'الحافلة أو السائق لا يتبعان لنفس الشركة أو غير نشطين.',
  TRIP_SEATS_TAKEN: 'توجد مقاعد محجوزة أو مباعة في هذه الرحلة.',
  TRIP_NOT_CANCELLABLE: 'لا يمكن إلغاء رحلة انطلقت بالفعل.',
  BOOKING_NOT_CANCELLABLE: 'لا يمكن إلغاء هذا الحجز في حالته الحالية.',
  BOOKING_CHANNEL_UNSUPPORTED: 'إلغاء حجوزات تطبيق العميل من الإدارة غير متاح بعد.',
  TOP_UP_BELOW_MINIMUM: 'مبلغ الشحن أقل من الحد الأدنى المسموح.',
  TOP_UP_NOT_REVIEWABLE: 'لا يمكن مراجعة طلب الشحن هذا؛ تمت مراجعته مسبقًا أو ليس بانتظار المراجعة.',
  BOOTSTRAP_PROTECTED: 'إجراء محظور لحماية المدير العام التأسيسي أو الأدوار النظامية.',
  ROLE_IN_USE: 'لا يمكن حذف الدور لأنه ما زال مسندًا إلى مشرفين. أزل الدور عنهم أولًا.',
  SETTLEMENT_OVERLAP: 'توجد تسوية أخرى تتداخل مع هذه الفترة.',
  NOTHING_TO_SETTLE: 'لا توجد عمولات غير مسوّاة في هذه الفترة.',
  HOLD_REQUIRED: 'يجب حجز المقاعد مؤقتًا قبل تأكيد الحجز.',
  HOLD_EXPIRED: 'انتهت مهلة الحجز المؤقت للمقاعد. أعد اختيار المقاعد.',
  EXPOSURE_CEILING_EXCEEDED: 'تم تجاوز سقف المديونية المسموح للمكتب.',
  CARRIER_NOT_ASSIGNED: 'شركة النقل غير مُسندة لهذا المكتب.',
  SEAT_UNAVAILABLE: 'مقعد أو أكثر لم يعد متاحًا.',
  AUTH_AUTHZ_STALE: 'تغيّرت صلاحياتك. حدّث الصفحة أو سجّل الدخول مرة أخرى.',
};

export function errorMessage(error: unknown, fallback = 'حدث خطأ غير متوقع.'): string {
  if (error instanceof ApiError) {
    if (error.code === 'VALIDATION_ERROR' && Array.isArray(error.details) && error.details.length > 0) {
      const first = error.details[0] as { path?: string; message?: string };
      return `${MESSAGES.VALIDATION_ERROR} (${first.path ?? ''}: ${first.message ?? ''})`;
    }
    return MESSAGES[error.code] ?? error.message ?? fallback;
  }
  return fallback;
}
