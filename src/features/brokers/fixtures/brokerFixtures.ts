import type {
  BrokerOffice,
  BrokersMetrics,
} from '../types/broker';

export const mockBrokers: BrokerOffice[] = [
  // 1. Nile Travel Agency (Matches Stitch _14, _15, _16, _17 & Booking ZL-BR-19482)
  {
    id: 'AG-882',
    code: 'AG-882',
    name: 'وكالة النيل للسفر والسياحة',
    branchName: 'فرع الميناء البري — الخرطوم',
    city: 'الخرطوم',
    state: 'ولاية الخرطوم',
    address: 'الميناء البري، الصالة الجنوبية، مكتب رقم 14',
    phone: '+249 183 998 877',
    email: 'agency@niletravel.sd',
    status: 'active',
    statusLabel: 'معتمد ونشط',

    licenseNumber: 'LIC-TT-2023-882',
    commercialRegistrationNumber: 'CR-449108',
    licenseExpiryDate: '2025-12-31',
    accreditedSince: '2022-04-10',
    accreditationAuthority: 'وزارة السياحة والنقل البري',

    walletBalance: 84200.0,
    minimumBalanceAlertThreshold: 500.0,
    isLowBalanceAlert: false,
    unsettledAccruedCommissionSdg: 4850.0,
    activeSettlementCycle: '#W-44 (2024)',

    todaySalesSdg: 1240500.0,
    todayTicketsCount: 142,
    clerksCount: 4,
    posCount: 2,
    assignedCarriersCount: 6,

    managerName: 'عمر الفاتح',
    managerPhone: '+249 912 345 678',

    clerks: [
      {
        id: 'EMP-0419',
        name: 'مروان الكاتب',
        phone: '+249 912 334 455',
        roleTitle: 'موظف حجز وإصدار أول',
        permissions: 'full_access',
        permissionsLabel: 'صلاحيات كاملة',
        assignedPosTerminal: 'POS-Terminal #KRT-04',
        status: 'active',
        totalBookingsThisMonth: 194,
        lastActiveAt: '24 أكتوبر 2024 — 09:21 ص',
      },
      {
        id: 'EMP-0420',
        name: 'ندى البشير',
        phone: '+249 915 889 900',
        roleTitle: 'موظفة حجز واستقبال',
        permissions: 'booking_only',
        permissionsLabel: 'حجز وإصدار فقط',
        assignedPosTerminal: 'POS-Terminal #KRT-05',
        status: 'active',
        totalBookingsThisMonth: 128,
        lastActiveAt: '24 أكتوبر 2024 — 11:40 ص',
      },
      {
        id: 'EMP-0421',
        name: 'عثمان خضر',
        phone: '+249 922 110 033',
        roleTitle: 'مشرف الصالة والمبيعات',
        permissions: 'supervisor',
        permissionsLabel: 'مشرف فرع',
        assignedPosTerminal: 'POS-Terminal #KRT-04',
        status: 'active',
        totalBookingsThisMonth: 82,
        lastActiveAt: '23 أكتوبر 2024 — 06:15 م',
      },
    ],

    posTerminals: [
      {
        id: 'POS-KRT-04',
        serialNumber: 'SN-EPS-9912048',
        model: 'Sunmi V2s Pro (طابعة حرارية مدمجة)',
        ipAddress: '192.168.10.45',
        status: 'online',
        assignedClerkName: 'مروان الكاتب',
        batteryLevelPercent: 92,
        lastSyncAt: '24 أكتوبر 2024 — 09:20:11 ص',
      },
      {
        id: 'POS-KRT-05',
        serialNumber: 'SN-EPS-9912052',
        model: 'Sunmi V2s Pro (طابعة حرارية مدمجة)',
        ipAddress: '192.168.10.48',
        status: 'online',
        assignedClerkName: 'ندى البشير',
        batteryLevelPercent: 78,
        lastSyncAt: '24 أكتوبر 2024 — 11:38:00 ص',
      },
    ],

    carrierLinks: [
      {
        carrierId: 'CO-NL-01',
        carrierName: 'شركة النيل للنقل البري',
        carrierCode: 'TC-001',
        commissionRatePercent: 10,
        authorizedCorridors: ['الخرطوم ← مروي', 'الخرطوم ← بورتسودان', 'الخرطوم ← عطبرة'],
        status: 'authorized',
        authorizedSince: '2023-01-15',
        authorizerAdmin: 'أحمد السر (المشرف العام)',
      },
      {
        carrierId: 'CO-TJ-02',
        carrierName: 'سابتكو VIP Express',
        carrierCode: 'TC-002',
        commissionRatePercent: 10,
        authorizedCorridors: ['الخرطوم ← القضارف', 'الخرطوم ← كسلا'],
        status: 'authorized',
        authorizedSince: '2023-03-01',
        authorizerAdmin: 'أحمد السر (المشرف العام)',
      },
      {
        carrierId: 'CO-SH-03',
        carrierName: 'شركة شريان الشمال للنقل',
        carrierCode: 'TC-003',
        commissionRatePercent: 8,
        authorizedCorridors: ['الخرطوم ← دنقلا', 'الخرطوم ← مروي'],
        status: 'authorized',
        authorizedSince: '2023-06-10',
        authorizerAdmin: 'أحمد السر (المشرف العام)',
      },
    ],

    walletLedger: [
      {
        id: 'WLT-TXN-449102',
        timestamp: '24 أكتوبر 2024 — 09:20:14 ص',
        type: 'booking_debit',
        typeLabel: 'خصم حجز تذكرة مسافر',
        amount: 350.0,
        direction: 'debit',
        balanceAfter: 15150.0,
        relatedReference: 'ZL-BR-19482',
        executedBy: 'مروان الكاتب',
        notes: 'خصم فوري كامل لقيمة التذكرة الصادرة للمسافر حسن البدري',
      },
      {
        id: 'WLT-TXN-448900',
        timestamp: '23 أكتوبر 2024 — 02:15:00 م',
        type: 'prepaid_topup',
        typeLabel: 'إيداع رصيد محفظة بنكي',
        amount: 100000.0,
        direction: 'credit',
        balanceAfter: 15500.0,
        relatedReference: 'RCP-BNK-99014',
        executedBy: 'نظام التحقق الآلي / بنك الخرطوم',
        notes: 'شحن رصيد مسبق الدفع معتمد بحوالة مصرفية',
      },
      {
        id: 'WLT-TXN-448820',
        timestamp: '22 أكتوبر 2024 — 11:30:00 ص',
        type: 'booking_debit',
        typeLabel: 'خصم حجز تذكرة مسافر',
        amount: 700.0,
        direction: 'debit',
        balanceAfter: 14800.0,
        relatedReference: 'ZL-BR-19410',
        executedBy: 'ندى البشير',
        notes: 'خصم تذكرتين على خط الخرطوم عطبرة',
      },
    ],
  },

  // 2. Al-Safaa Travel Office (Low Balance Alert Case < 500 SDG)
  {
    id: 'AG-710',
    code: 'AG-710',
    name: 'مكتب الصفا للخدمات والسفريات',
    branchName: 'فرع بحري — المحطة الوسطى',
    city: 'بحري',
    state: 'ولاية الخرطوم',
    address: 'شارع السيد علي، مقابل مجمع خدمات الجمهور',
    phone: '+249 185 334 112',
    email: 'safaa.agency@gmail.com',
    status: 'active',
    statusLabel: 'معتمد ونشط',

    licenseNumber: 'LIC-TT-2023-710',
    commercialRegistrationNumber: 'CR-330114',
    licenseExpiryDate: '2025-09-15',
    accreditedSince: '2023-04-20',
    accreditationAuthority: 'وزارة النقل والطرق والجسور',

    walletBalance: 350.0, // LESS THAN 500 SDG -> LOW BALANCE ALERT!
    minimumBalanceAlertThreshold: 500.0,
    isLowBalanceAlert: true,
    unsettledAccruedCommissionSdg: 1240.0,
    activeSettlementCycle: '#W-44 (2024)',

    todaySalesSdg: 185000.0,
    todayTicketsCount: 22,
    clerksCount: 2,
    posCount: 1,
    assignedCarriersCount: 3,

    managerName: 'خالد التوم',
    managerPhone: '+249 912 660 088',

    clerks: [
      {
        id: 'EMP-0105',
        name: 'خالد التوم',
        phone: '+249 912 660 088',
        roleTitle: 'مدير المكتب وموظف حجز',
        permissions: 'full_access',
        permissionsLabel: 'صلاحيات كاملة',
        assignedPosTerminal: 'POS-Terminal #BHR-01',
        status: 'active',
        totalBookingsThisMonth: 64,
        lastActiveAt: '24 أكتوبر 2024 — 10:12 ص',
      },
    ],

    posTerminals: [
      {
        id: 'POS-BHR-01',
        serialNumber: 'SN-SUN-11904',
        model: 'Sunmi V2 Pro',
        ipAddress: '192.168.1.105',
        status: 'online',
        assignedClerkName: 'خالد التوم',
        batteryLevelPercent: 65,
        lastSyncAt: '24 أكتوبر 2024 — 10:12:00 ص',
      },
    ],

    carrierLinks: [
      {
        carrierId: 'CO-NL-01',
        carrierName: 'شركة النيل للنقل البري',
        carrierCode: 'TC-001',
        commissionRatePercent: 10,
        authorizedCorridors: ['الخرطوم ← مروي', 'الخرطوم ← عطبرة'],
        status: 'authorized',
        authorizedSince: '2023-04-20',
        authorizerAdmin: 'أحمد السر',
      },
    ],

    walletLedger: [
      {
        id: 'WLT-TXN-449190',
        timestamp: '24 أكتوبر 2024 — 10:12:10 ص',
        type: 'booking_debit',
        typeLabel: 'خصم حجز تذكرة مسافر',
        amount: 280.0,
        direction: 'debit',
        balanceAfter: 350.0,
        relatedReference: 'ZL-854935',
        executedBy: 'خالد التوم',
        notes: 'خصم تذكرة مقعد خط القضارف (المحفظة اقتربت من النفاد)',
      },
    ],
  },

  // 3. Al-Amana Travel Agency (Port Sudan)
  {
    id: 'AG-504',
    code: 'AG-504',
    name: 'وكالة الأمانة للسفريات',
    branchName: 'فرع بورتسودان — السوق الكبير',
    city: 'بورتسودان',
    state: 'ولاية البحر الأحمر',
    address: 'شارع ديم مدينة، عمارة الأوقاف، الطابق الأرضي',
    phone: '+249 311 822 455',
    email: 'info@amana-travel.sd',
    status: 'active',
    statusLabel: 'معتمد ونشط',

    licenseNumber: 'LIC-TT-2022-504',
    commercialRegistrationNumber: 'CR-119402',
    licenseExpiryDate: '2026-02-28',
    accreditedSince: '2022-02-10',
    accreditationAuthority: 'وزارة السياحة والنقل البري',

    walletBalance: 125000.0,
    minimumBalanceAlertThreshold: 500.0,
    isLowBalanceAlert: false,
    unsettledAccruedCommissionSdg: 8900.0,
    activeSettlementCycle: '#W-44 (2024)',

    todaySalesSdg: 640000.0,
    todayTicketsCount: 68,
    clerksCount: 3,
    posCount: 2,
    assignedCarriersCount: 5,

    managerName: 'هاشم مصطفى',
    managerPhone: '+249 912 770 044',

    clerks: [],
    posTerminals: [],
    carrierLinks: [],
    walletLedger: [],
  },

  // 4. Al-Shorooq Transport Office (Shendi - Low balance alert case)
  {
    id: 'AG-320',
    code: 'AG-320',
    name: 'مكتب الشروق لخدمات النقل',
    branchName: 'فرع الموقف العام — شندي',
    city: 'شندي',
    state: 'ولاية نهر النيل',
    address: 'الموقف العام للمواصلات السفرية، مكتب رقم 4',
    phone: '+249 211 824 100',
    email: 'shorooq.shendi@gmail.com',
    status: 'active',
    statusLabel: 'معتمد ونشط',

    licenseNumber: 'LIC-TT-2023-320',
    commercialRegistrationNumber: 'CR-904122',
    licenseExpiryDate: '2025-07-31',
    accreditedSince: '2023-01-20',
    accreditationAuthority: 'إدارة النقل البري بولاية نهر النيل',

    walletBalance: 220.0, // LESS THAN 500 SDG -> LOW BALANCE ALERT!
    minimumBalanceAlertThreshold: 500.0,
    isLowBalanceAlert: true,
    unsettledAccruedCommissionSdg: 650.0,
    activeSettlementCycle: '#W-44 (2024)',

    todaySalesSdg: 45000.0,
    todayTicketsCount: 8,
    clerksCount: 1,
    posCount: 1,
    assignedCarriersCount: 2,

    managerName: 'صلاح الدين عيسى',
    managerPhone: '+249 912 441 990',

    clerks: [],
    posTerminals: [],
    carrierLinks: [],
    walletLedger: [],
  },
];

export const mockBrokersMetrics: BrokersMetrics = {
  totalBrokers: 312,
  activeBrokers: 298,
  todaySalesSdg: 1240500,
  todayTicketsIssued: 1420,
  lowBalanceCount: 14, // Matching Stitch _14 KPI card: "14 مكتب يحتاج شحن (رصيد < 500 ج.س)"
};
