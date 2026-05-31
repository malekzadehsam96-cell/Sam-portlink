import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English translations
const en = {
  translation: {
    // Sidebar
    overview: "Overview",
    intelligence: "INTELLIGENCE",
    riskEngine: "Risk Engine",
    ipIntelligence: "IP Intelligence",
    networkAnalysis: "Network Analysis",
    threatIntelligence: "Threat Intelligence",
    asnExplorer: "ASN Explorer",
    domainAnalysis: "Domain Analysis",
    behavioral: "BEHAVIORAL",
    behaviorAnalytics: "Behavior Analytics",
    sessions: "Sessions",
    deviceFingerprints: "Device Fingerprints",
    userJourneys: "User Journeys",
    dataAndEvents: "DATA & EVENTS",
    liveEvents: "Live Events",
    eventExplorer: "Event Explorer",
    dataStreams: "Data Streams",
    auditLogs: "Audit Logs",
    developer: "DEVELOPER",
    apiKeys: "API Keys",
    apiUsage: "API Usage",
    documentation: "Documentation",
    sdksAndTools: "SDKs & Tools",
    admin: "ADMIN",
    usersAndTeams: "Users & Teams",
    billingAndPlans: "Billing & Plans",
    settings: "Settings",
    currentPlan: "Current Plan",
    enterprise: "Enterprise",
    apiRequests: "API Requests",
    managePlan: "Manage Plan",

    // TopNav
    searchPlaceholder: "Search IP, User, Device, ASN, Country...",
    live: "Live",
    adminUser: "Admin",
    onboardingInfo: "Identity Gateway",

    // Onboarding
    title: "Identity Orchestration & Cyber Intelligence",
    subtitle: "Zero Trust Security Platform",
    hardwareKey: "Hardware Security Key",
    passkey: "Passkey Authentication",
    analyzeTrust: "Analyze Trust & Provision",
    aiCoreing: "AI Security Core Visualizer",
    radar: "Trust Radar",
    sessionEntropy: "Session Entropy",
    deviceIntegrity: "Device Integrity",
    fraudProbability: "Fraud Probability",
    clearanceLevel: "Clearance Level",

    // Dashboard Stats
    totalRequests: "Total Requests",
    blockedRequests: "Blocked Requests",
    avgRiskScore: "Avg Risk Score",
    activeSessions: "Active Sessions",
    threatsDetected: "Threats Detected",

    // Dashboard Sections
    realTimeTraffic: "Real-time Traffic",
    allTraffic: "All Traffic",
    topCountry: "Top Country",
    topAsn: "Top ASN",
    topCity: "Top City",
    topDevice: "Top Device",
    riskScoreDistribution: "Risk Score Distribution",
    total: "Total",
    highRisk: "High Risk",
    mediumRisk: "Medium Risk",
    lowRisk: "Low Risk",
    liveThreatFeed: "Live Threat Feed",
    seeAll: "See all",

    // Dashboard Rows
    requestsOverTime: "Requests Over Time",
    last24Hours: "Last 24 Hours",
    systemStatus: "System Status",
    allSystemsOperational: "All Systems Operational",
    recentAlerts: "Recent Alerts",
    topThreatCategories: "Top Threat Categories",
    topRiskyIps: "Top Risky IPs",
    ipAddress: "IP Address",
    country: "Country",
    risk: "Risk",
    threatType: "Threat Type",
    reqs: "Reqs",
    riskScoreOverTime: "Risk Score Over Time",
    topCountriesByRequests: "Top Countries By Requests",
    viewFullAnalytics: "View full analytics",
  },
};

// Persian translations
const fa = {
  translation: {
    // Sidebar
    overview: "نمای کلی",
    intelligence: "اطلاعات پایه",
    riskEngine: "موتور ریسک",
    ipIntelligence: "هوش آدرس IP",
    networkAnalysis: "تحلیل شبکه",
    threatIntelligence: "اطلاعات تهدیدات",
    asnExplorer: "کاوشگر ASN",
    domainAnalysis: "تحلیل دامنه",
    behavioral: "رفتاری",
    behaviorAnalytics: "آنالیز رفتار",
    sessions: "نشست‌ها",
    deviceFingerprints: "اثرانگشت دستگاه",
    userJourneys: "سفرهای کاربر",
    dataAndEvents: "داده و رویدادها",
    liveEvents: "رویدادهای زنده",
    eventExplorer: "کاوشگر رویداد",
    dataStreams: "جریان‌های داده",
    auditLogs: "گزارش‌های حسابرسی",
    developer: "توسعه‌دهنده",
    apiKeys: "کلیدهای API",
    apiUsage: "مصرف API",
    documentation: "مستندات",
    sdksAndTools: "ابزارها و SDK",
    admin: "مدیریت",
    usersAndTeams: "کاربران و تیم‌ها",
    billingAndPlans: "صورت‌حساب و پلن‌ها",
    settings: "تنظیمات",
    currentPlan: "طرح فعلی",
    enterprise: "پروژه تجاری",
    apiRequests: "درخواست‌های API",
    managePlan: "مدیریت طرح",

    // TopNav
    searchPlaceholder: "جستجوی IP، کاربر، دستگاه، کشور...",
    live: "زنده",
    adminUser: "مدیرسیستم",
    onboardingInfo: "ورود به سیستم و تایید هویت",

    // Onboarding
    title: "سیستم مدیریت هویت و هوش سایبری",
    subtitle: "پلتفرم امنیتی Zero Trust",
    hardwareKey: "کلید امنیتی سخت‌افزاری",
    passkey: "احراز هویت با Passkey",
    analyzeTrust: "تحلیل اعتماد و تخصیص",
    aiCoreing: "هسته امنیت هوش مصنوعی",
    radar: "رادار اعتماد",
    sessionEntropy: "آنتروپی نشست",
    deviceIntegrity: "یکپارچگی دستگاه",
    fraudProbability: "احتمال تقلب",
    clearanceLevel: "سطح دسترسی",

    // Dashboard Stats
    totalRequests: "کل درخواست‌ها",
    blockedRequests: "درخواست‌های مسدود",
    avgRiskScore: "میانگین نمره ریسک",
    activeSessions: "نشست‌های فعال",
    threatsDetected: "تهدیدات یافت شده",

    // Dashboard Sections
    realTimeTraffic: "ترافیک لحظه‌ای",
    allTraffic: "همه ترافیک",
    topCountry: "کشور برتر",
    topAsn: "ASN برتر",
    topCity: "شهر برتر",
    topDevice: "دستگاه برتر",
    riskScoreDistribution: "توزیع امتیاز ریسک",
    total: "کل",
    highRisk: "ریسک بالا",
    mediumRisk: "ریسک متوسط",
    lowRisk: "ریسک پایین",
    liveThreatFeed: "فید تهدیدات زنده",
    seeAll: "مشاهده همه",

    // Dashboard Rows
    requestsOverTime: "درخواست‌ها در طول زمان",
    last24Hours: "۲۴ ساعت گذشته",
    systemStatus: "وضعیت سیستم",
    allSystemsOperational: "تمامی سیستم‌ها عملیاتی هستند",
    recentAlerts: "هشدارهای اخیر",
    topThreatCategories: "دسته‌بندی‌های اصلی تهدیدات",
    topRiskyIps: "IPهای پر خطر برتر",
    ipAddress: "آدرس IP",
    country: "کشور",
    risk: "ریسک",
    threatType: "نوع تهدید",
    reqs: "درخواست‌ها",
    riskScoreOverTime: "نمره ریسک در طول زمان",
    topCountriesByRequests: "کشورهای برتر بر اساس درخواست",
    viewFullAnalytics: "مشاهده آنالیز کامل",
  },
};

i18n.use(initReactI18next).init({
  resources: {
    en,
    fa,
  },
  lng: "en", // default
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
