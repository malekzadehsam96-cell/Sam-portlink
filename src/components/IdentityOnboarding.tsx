import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  User,
  Users,
  Settings,
  AlertTriangle,
  Zap,
  Check,
  Smartphone,
  Mail,
  Lock,
  RefreshCw,
  Moon,
  Sun,
  HelpCircle,
  Fingerprint,
  Camera,
  Layers,
  Cpu,
  Terminal,
  Sliders,
  Key,
  ChevronDown,
  Globe,
  Upload,
  QrCode,
  FileText,
  UserCheck,
  Edit2,
  Phone,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";

// Inline translation dictionary for self-containment
const TEXTS = {
  fa: {
    logoTitle: "CyberShield",
    logoSubtitle: "پلتفرم مدیریت هویت",
    step1: "اطلاعات پایه",
    step2: "احراز هویت",
    step3: "تنظیمات امنیتی",
    step4: "سطح دسترسی",
    step5: "تأیید نهایی",
    accountTypeTitle: "نوع حساب کاربری",
    accountTypeDesc: "انتخاب نوع حساب",
    personalUser: "کاربر عادی",
    personalUserDesc: "Personal User",
    developerUser: "توسعه‌دهنده (API)",
    developerUserDesc: "Developer",
    enterpriseUser: "سازمانی (Asis)",
    enterpriseUserDesc: "Enterprise",
    adminUser: "ادمین",
    adminUserDesc: "Admin",
    ownerUser: "اونر",
    ownerUserDesc: "Owner",
    trustScoreTitle: "امتیاز اعتماد دستگاه شما",
    trustScoreSecure: "ایمن",
    ipReputation: "اعتبار آدرس IP",
    deviceFingerprint: "اثرانگشت دستگاه",
    networkSecurity: "امنیت شبکه",
    locationLabel: "موقعیت جغرافیایی",
    goodStatus: "خوب",
    verifiedStatus: "تأیید شده",
    secureStatus: "ایمن",
    locationValue: "تهران، ایران",
    basicInfoTitle: "اطلاعات پایه",
    fullName: "نام و نام خانوادگی",
    email: "ایمیل",
    phone: "شماره موبایل",
    country: "کشور",
    password: "رمز عبور",
    confirmPassword: "تأیید رمز عبور",
    passwordPower: "قدرتمند",
    referralCode: "کد معرفی (اختیاری)",
    companyName: "نام شرکت (اختیاری)",
    referralPlaceholder: "اگر کدی دارید وارد کنید",
    primaryVerification: "تأیید اولیه",
    emailVerified: "تأیید شد",
    phoneVerified: "تأیید شد",
    otpLabel: "کد یکبارمصرف (OTP)",
    captchaLabel: "کپچای امنیتی",
    captchaCheck: "من ربات نیستم",
    loginMethodTitle: "روش ورود انتخابی",
    cancel: "انصراف",
    continue: "ادامه",
    realtimeSecurityCheck: "بررسی امنیتی لحظه‌ای",
    browserIntegrity: "یکپارچگی مرورگر",
    threatDetection: "شناسایی تهدیدات",
    noThreatFound: "هیچ تهدیدی یافت نشد",
    infoSummaryTitle: "خلاصه اطلاعات",
    defaultAccessLevel: "سطح دسترسی پیش‌فرض",
    selectedAccountType: "نوع حساب انتخاب شده",
    faceScanTitle: "اسکن هوشمند چهره (Holographic Face Scan)",
    startScan: "شروع اسکن بیومتریک",
    scanning: "در حال اسکن و تحلیل ماتریکس چهره...",
    scanComplete: "اسکن با موفقیت انجام شد • مطابقت ۹۹.۸٪",
    passkeyTitle: "احراز هویت سخت‌افزاری و Passkey",
    passkeyActivate: "فعال‌سازی کلید امنیتی FIDO2",
    passkeyActive: "کلید امنیتی با موفقیت ثبت شد",
    uploadIdTitle: "بارگذاری مدرک شناسایی (تصویر کارت ملی یا پاسپورت)",
    uploadDesc: "فایل خود را اینجا رها کنید یا کلیک کنید تا انتخاب شود",
    uploadSuccess: "مدرک شناسایی با موفقیت بارگذاری شد (National_ID.png)",
    mfaTitle: "تنظیمات تأیید و ورود دو مرحله‌ای (MFA)",
    mfaGoogleAuth: "اپلیکیشن احراز هویت (Google / Microsoft Authenticator)",
    mfaSmsAuth: "ارسال پیامک کد تأیید پشتیبان (SMS Backup OTP)",
    backupCodesTitle: "کدهای بازیابی اضطراری (پشتیبان)",
    backupCodesDesc: "این کدها را در جای امنی ذخیره کنید. در هر ورود فقط یکبار استفاده می‌شوند",
    sessionTimeout: "محدودیت زمانی نشست فعال (Session Timeout Guard)",
    timeoutMinutes: "خروج خودکار پس از: ۱۵ دقیقه",
    timeoutMinutesDesc: "در صورت عدم فعالیت کاربر، نشست به طور خودکار پایان می‌یابد",
    rbacTitle: "انتخاب سطح دسترسی و نقش امنیتی (RBAC Matrix)",
    level1Title: "سطح ۱ (کاربر پایه)",
    level1Desc: "دسترسی مشاهده داشبورد و گزارش تراکنش‌های عمومی",
    level2Title: "سطح ۲ (توسعه‌دهنده سیستم)",
    level2Desc: "امکان صدور کلید امنیتی API و مدیریت وب‌هوک‌ها",
    level3Title: "سطح ۳ (راهبر ارشد امنیت)",
    level3Desc: "اختیار کامل تعیین قوانین پایش زنده و مسیرهای تهدید",
    level4Title: "سطح ۴ (مدیر کل و اونر)",
    level4Desc: "دسترسی Root به زیرساخت شبکه و تغییر پروکسی‌های گیت‌وی",
    finalConfirmTitle: "گزارش نهایی صدور شناسه امنیتی CyberShield",
    finalDocDesc: "یک کپی از این سند رمزنگاری شده برای تأیید نهایی ذخیره می‌شود",
    userSignature: "امضای دیجیتال کاربر",
    signatureDesc: "با ماوس دکمه را نگه دارید و در کادر بالا امضای خود را ترسیم کنید",
    clearSignature: "پاک کردن مسیر امضا",
    saveSignature: "تأیید نهایی امضا",
    signatureOk: "امضای دیجیتال ثبت گردید",
    issueLicenseBtn: "صدور مجوز نهایی و ورود به سیستم ایمن",
    errorConfirmSignature: "لطفا ابتدا امضای دیجیتال خود را در کادر مربوطه ثبت فرمایید",
    congratsTitle: "شناسه امنیتی با موفقیت صادر شد!",
    congratsDesc: "شما با موفقیت تمام سطوح امنیتی را پشت سر گذاشتید. به ماتریکس CyberShield خوش آمدید.",
    backToStep1: "بازگشت به ویرایش اطلاعات",
    langFa: "فارسی",
    langEn: "English",
  },
  en: {
    logoTitle: "CyberShield",
    logoSubtitle: "Identity Platform",
    step1: "Basic Information",
    step2: "Authentication",
    step3: "Security Settings",
    step4: "Access Level",
    step5: "Final Confirm",
    accountTypeTitle: "User Account Type",
    accountTypeDesc: "Select account type",
    personalUser: "Personal User",
    personalUserDesc: "Standard User Account",
    developerUser: "Developer (API)",
    developerUserDesc: "Integration & Webhooks",
    enterpriseUser: "Enterprise (Asis)",
    enterpriseUserDesc: "Multi-user governance",
    adminUser: "Admin",
    adminUserDesc: "Policy Operations",
    ownerUser: "Owner",
    ownerUserDesc: "Full Control",
    trustScoreTitle: "Your Device Trust Score",
    trustScoreSecure: "Secure",
    ipReputation: "IP Reputation",
    deviceFingerprint: "Device Fingerprint",
    networkSecurity: "Network Security",
    locationLabel: "Geo Location",
    goodStatus: "Good",
    verifiedStatus: "Verified",
    secureStatus: "Secure",
    locationValue: "Tehran, Iran",
    basicInfoTitle: "Basic Information",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Mobile Number",
    country: "Country",
    password: "Password",
    confirmPassword: "Confirm Password",
    passwordPower: "Strong",
    referralCode: "Referral Code (Optional)",
    companyName: "Company Name (Optional)",
    referralPlaceholder: "Enter code if you have one",
    primaryVerification: "Primary Verification",
    emailVerified: "Verified",
    phoneVerified: "Verified",
    otpLabel: "One-Time OTP Code",
    captchaLabel: "Security Captcha",
    captchaCheck: "I am not a robot",
    loginMethodTitle: "Selected Login Method",
    cancel: "Cancel",
    continue: "Continue",
    realtimeSecurityCheck: "Real-time Security Check",
    browserIntegrity: "Browser Integrity",
    threatDetection: "Threat Detection",
    noThreatFound: "No Threat Detected",
    infoSummaryTitle: "Information Summary",
    defaultAccessLevel: "Default Access Level",
    selectedAccountType: "Selected Account Type",
    faceScanTitle: "Holographic Face Scan",
    startScan: "Start Biometric Scan",
    scanning: "Scanning & analyzing face matrix structure...",
    scanComplete: "Biometric Scan Completed • Match 99.8%",
    passkeyTitle: "Hardware Security FIDO2 Key",
    passkeyActivate: "Activate Security Key",
    passkeyActive: "FIDO2 Key Registered Successfully",
    uploadIdTitle: "Upload Identification Document (ID/Passport Image)",
    uploadDesc: "Drag & drop files here, or click to browse",
    uploadSuccess: "ID Document verified and uploaded (National_ID.png)",
    mfaTitle: "Multi-Factor Authentication (MFA Setup)",
    mfaGoogleAuth: "Authenticator App (Google / Microsoft Authenticator)",
    mfaSmsAuth: "SMS Verification OTP Delivery",
    backupCodesTitle: "Emergency Backup Security Codes",
    backupCodesDesc: "Store these codes safely. Each recovery code is single-use",
    sessionTimeout: "Session Timeout Guard Interval",
    timeoutMinutes: "Auto Sign Out After: 15 Minutes",
    timeoutMinutesDesc: "Terminates active sessions automatically on inactivity",
    rbacTitle: "Role-Based Access Control Selection (RBAC)",
    level1Title: "Level 1 (Basic User)",
    level1Desc: "View general dashboard metrics and public logs",
    level2Title: "Level 2 (Developer Account)",
    level2Desc: "Provision client API credentials and webhooks",
    level3Title: "Level 3 (Security Officer)",
    level3Desc: "Configure live policy pipelines and threat vectors",
    level4Title: "Level 4 (Super Owner / Root)",
    level4Desc: "Full administrative proxy controls and host configuration",
    finalConfirmTitle: "Issuance Policy & Final CyberShield Seal",
    finalDocDesc: "An encrypted receipt will be archived to secure the protocol",
    userSignature: "User Digital Signature",
    signatureDesc: "Hold left mouse click to paint your digital signature in sandbox",
    clearSignature: "Clear Signature Path",
    saveSignature: "Confirm Digital Signature",
    signatureOk: "Digital Signature Verified",
    issueLicenseBtn: "Issue License & Enter Gateway Console",
    errorConfirmSignature: "Please sign inside the canvas sandbox before proceeding",
    congratsTitle: "Identity Issued Successfully!",
    congratsDesc: "You have verified all five cryptographic defensive tiers. CyberShield is operational.",
    backToStep1: "Return to Edit Information",
    langFa: "فارسی",
    langEn: "English",
  },
};

export function IdentityOnboarding() {
  const navigate = useNavigate();

  // Primary configuration states
  const { i18n } = useTranslation();
  const lang = i18n.language === "fa" ? "fa" : "en";
  const setLang = (newLang: "fa" | "en") => {
    i18n.changeLanguage(newLang);
  };
  const [isSignIn, setIsSignIn] = useState<boolean>(true);
  const [signinEmail, setSigninEmail] = useState("ali.mohammedi@example.com");
  const [signinPassword, setSigninPassword] = useState("Admin@Secure2026");
  const [isDark, setIsDark] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 to 4 (Step 1-5)

  // Lang toggler dropdown
  const [langOpen, setLangOpen] = useState(false);

  // Form Inputs Step 1
  const [fullName, setFullName] = useState("علی محمدی");
  const [emailAddress, setEmailAddress] = useState("ali.mohammedi@example.com");
  const [phoneNumber, setPhoneNumber] = useState("09123456789");
  const [countryVal, setCountryVal] = useState("ایران");
  const [password, setPassword] = useState("Admin@Secure2026");
  const [confirmPassword, setConfirmPassword] = useState("Admin@Secure2026");
  const [referral, setReferral] = useState("");
  const [company, setCompany] = useState("CyberShield Solutions");

  // State controls Step 1 Interactive verification
  const [emailVerifiedState, setEmailVerifiedState] = useState(false);
  const [phoneVerifiedState, setPhoneVerifiedState] = useState(false);
  const [otpVerifiedState, setOtpVerifiedState] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [otpVal, setOtpVal] = useState("824731");
  const [otpInput, setOtpInput] = useState("");
  const [otpTimer, setOtpTimer] = useState(32);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [accountType, setAccountType] = useState<"personal" | "developer" | "enterprise" | "admin" | "owner">("personal");
  const [loginMethod, setLoginMethod] = useState<string>("email-password");

  // Validation feedback
  const [validationError, setValidationError] = useState<string | null>(null);

  // Step 2 Authentication States
  const [faceScanState, setFaceScanState] = useState<"idle" | "scanning" | "done">("idle");
  const [isActivatingPasskey, setIsActivatingPasskey] = useState(false);
  const [passkeyActive, setPasskeyActive] = useState<boolean>(false);
  const [idDocUploaded, setIdDocUploaded] = useState<boolean>(false);
  const [idDocName, setIdDocName] = useState("");

  // Step 3 Security Settings
  const [mfaGoogle, setMfaGoogle] = useState(true);
  const [mfaSms, setMfaSms] = useState(true);
  const [sessionLimit, setSessionLimit] = useState(15);

  // Step 4 Access Level
  const [accessLevel, setAccessLevel] = useState<number>(1); // Level 1, 2, 3, 4

  // Step 5 Signature States
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false); // starts false, user must draw or confirm signature
  const [signatureCleared, setSignatureCleared] = useState(false);
  const [canvasCleared, setCanvasCleared] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sign in local states
  const [signinScanState, setSigninScanState] = useState<"idle" | "scanning" | "success">("idle");
  const [signinLoading, setSigninLoading] = useState(false);

  // Success screen state
  const [isRegistered, setIsRegistered] = useState(false);
  const [isPatching, setIsPatching] = useState(false);
  const [patchSuccess, setPatchSuccess] = useState(false);

  const handleDeployPatch = () => {
    if (isPatching || patchSuccess) return;
    setIsPatching(true);
    setTimeout(() => {
      setIsPatching(false);
      setPatchSuccess(true);
      
      const existingLogsStr = localStorage.getItem("system_audit_logs");
      let logs = [];
      if (existingLogsStr) {
        try {
          logs = JSON.parse(existingLogsStr);
        } catch (e) {
          logs = [];
        }
      }
      
      if (!logs || logs.length === 0) {
        logs = [
          { id: "l1", time: "2026-05-30 10:03:09", type: "SYSTEM", text: "SYSTEM_STARTUP: FIDO2 Encryption provider matched correctly.", color: "text-emerald-500" },
          { id: "l2", time: "2026-05-30 10:03:12", type: "INFO", text: "POLICY_INFO: impossible coordinate tolerance weights synced to 40%.", color: "text-slate-500" },
          { id: "l3", time: "2026-05-30 10:03:25", type: "INFO", text: "FIDO2_OK: cryptographic key register signature validated.", color: "text-slate-500" },
          { id: "l4", time: "2026-05-30 10:03:44", type: "SEVERE", text: "FIREWALL_DENY: Malicious VPN Exit IP 185.220.101.23 requested admin socket access. Session Drop.", color: "text-rose-500 font-bold" },
          { id: "l5", time: "2026-05-30 10:04:12", type: "WARNING", text: "WEBAUTHN_CHALLENGE: Generating biometric challenges pattern for John Smith.", color: "text-amber-500 font-bold" },
          { id: "l6", time: "2026-05-30 10:04:15", type: "INFO", text: "SESSION_RESTORE: John Smith successfully logged into terminal. Identity matches.", color: "text-slate-300 font-semibold" },
          { id: "l7", time: "2026-05-30 10:04:30", type: "INFO", text: "AUDIT: API Key generated for \"Incident Response Webhook Token\".", color: "text-slate-500" },
          { id: "l8", time: "2026-05-30 10:05:01", type: "WARNING", text: "WEBAUTHN_WARN: Biometric match failed margin by 0.2% on VPN IP 79.125.15.100. Verification holds.", color: "text-rose-500 font-bold" },
          { id: "l9", time: "2026-05-30 10:05:32", type: "INFO", text: "WEBAUTHN_OK: Fingerprint signature matches 99.8% on encrypted hash file.", color: "text-emerald-500 font-bold" },
          { id: "l10", time: "2026-05-30 10:05:35", type: "INFO", text: "WEBAUTHN_STATE_APPROVED: Clearance Level 3 successfully added to session admin-310b.", color: "text-indigo-400" },
        ];
      }

      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      const patchLog1 = {
        id: "patch_log_" + Math.random().toString(36).substring(2, 7),
        time: dateStr,
        type: "PATCH",
        text: `SYSTEM_PATCH: Emergency Firewall Policy hotfixed. Applied kernel mitigations on ingress adapters. Executed by operator: ${fullName}.`,
        color: "text-emerald-400 font-extrabold animate-pulse"
      };
      
      const patchLog2 = {
        id: "patch_log_" + Math.random().toString(36).substring(2, 7),
        time: dateStr,
        type: "CLEANUP",
        text: "NET_PURGE: Iterated active sockets pools. Dropped 47 unauthenticated connection buffers.",
        color: "text-indigo-400 font-bold"
      };
      
      const patchLog3 = {
        id: "patch_log_" + Math.random().toString(36).substring(2, 7),
        time: dateStr,
        type: "OK",
        text: "SECURITY_INTEGRITY: System-wide clean state verified. Zero threats in active routing table.",
        color: "text-cyan-400 font-semibold"
      };

      const updatedLogs = [patchLog1, patchLog2, patchLog3, ...logs];
      localStorage.setItem("system_audit_logs", JSON.stringify(updatedLogs));
    }, 1200);
  };

  const t = TEXTS[lang];
  const isRtl = lang === "fa";

  // Countdown timer simulation for OTP
  useEffect(() => {
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update document margins and direction
  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop simulator
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIdDocUploaded(true);
    setIdDocName("Passport_Digital_Scan.pdf");
  };

  const selectFileManual = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleManualFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocUploaded(true);
      setIdDocName(file.name);
    }
  };

  // Canvas drawing for User signature in step 5
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
    setSignatureDone(true);
  };

  const getTouchCoordinates = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: (touch ? touch.clientX : 0) - rect.left,
      y: (touch ? touch.clientY : 0) - rect.top,
    };
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const coords = getTouchCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const coords = getTouchCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
    setSignatureDone(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDone(false);
    setSignatureCleared(true);
  };

  // Account Type values mapping helper
  const accountTypesDetails = [
    { id: "personal", title: t.personalUser, desc: t.personalUserDesc, icon: User },
    { id: "developer", title: t.developerUser, desc: t.developerUserDesc, icon: Terminal },
    { id: "enterprise", title: t.enterpriseUser, desc: t.enterpriseUserDesc, icon: Users },
    { id: "admin", title: t.adminUser, desc: t.adminUserDesc, icon: Sliders },
    { id: "owner", title: t.ownerUser, desc: t.ownerUserDesc, icon: Key },
  ];

  // Helper function to return localized names of account types
  const getAccountTypeTitle = (type: string) => {
    switch (type) {
      case "personal":
        return t.personalUser;
      case "developer":
        return t.developerUser;
      case "enterprise":
        return t.enterpriseUser;
      case "admin":
        return t.adminUser;
      case "owner":
        return t.ownerUser;
      default:
        return t.personalUser;
    }
  };

  // Nav Step Action
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
      setValidationError(null);
    } else {
      setValidationError(
        lang === "fa"
          ? "لطفا مراحل را به ترتیب و با تکمیل اطلاعات امنیتی به جلو ببرید"
          : "Please complete the steps sequentially and verify security controls"
      );
    }
  };

  const handleContinue = () => {
    setValidationError(null);

    // Validate Step 1 Basic Info
    if (currentStep === 0) {
      if (!fullName || fullName.trim().length < 3) {
        setValidationError(
          lang === "fa"
            ? "لطفا نام و نام خانوادگی خود را به درستی وارد نمایید (حداقل ۳ کاراکتر)"
            : "Please enter a valid full name (minimum 3 characters)"
        );
        return;
      }
      if (!emailAddress || !emailAddress.includes("@") || !emailAddress.includes(".")) {
        setValidationError(
          lang === "fa"
            ? "نشانی ایمیل وارد شده نامعتبر است"
            : "The provided email address is invalid"
        );
        return;
      }
      if (!phoneNumber || phoneNumber.trim().length < 8) {
        setValidationError(
          lang === "fa"
            ? "شماره موبایل نامعتبر است (حداقل ۸ رقم بدون فاصله)"
            : "The mobile number is invalid (minimum 8 digits)"
        );
        return;
      }
      if (!password || password.length < 6) {
        setValidationError(
          lang === "fa"
            ? "طول رمز عبور انتخابی باید حداقل ۶ کاراکتر باشد"
            : "The selected password must be at least 6 characters long"
        );
        return;
      }
      if (password !== confirmPassword) {
        setValidationError(
          lang === "fa"
            ? "تکرار رمز عبور با رمز اصلی مطابقت ندارد"
            : "Password and confirmation password do not match"
        );
        return;
      }
      if (!emailVerifiedState) {
        setValidationError(
          lang === "fa"
            ? "ایمیل شما تائید نشده است. لطفا روی دکمه تائید زیر ایمیل کلیک کنید."
            : "Email is not verified. Please click the Verify button below email address."
        );
        return;
      }
      if (!phoneVerifiedState) {
        setValidationError(
          lang === "fa"
            ? "شماره تلفن تائید نشده است. لطفا روی دکمه تائید زیر شماره موبایل کلیک کنید."
            : "Mobile number is not verified. Please click the Verify button under mobile slider."
        );
        return;
      }
      if (!otpVerifiedState) {
        setValidationError(
          lang === "fa"
            ? "رمز یکبار مصرف (OTP) وارد شده صحیح نیست یا تائید نشده است"
            : "OTP verification is pending. Please verify the active security code"
        );
        return;
      }
      if (!captchaChecked) {
        setValidationError(
          lang === "fa"
            ? "جهت اثبات عدم ربات بودن، گزینه کپچای امنیتی را تیک بزنید"
            : "Please confirm that you are human using the security Captcha checker"
        );
        return;
      }
    }

    // Validate Step 2 Biometrics & Docs
    if (currentStep === 1) {
      if (!passkeyActive) {
        setValidationError(
          lang === "fa"
            ? "کلید امنیتی بیومتریک FIDO2 شما فعال نیست. لطفا دکمه فعال‌سازی کلید ماتریکس را فشار دهید."
            : "Your FIDO2 security passkey is not active. Please click to register your hardware token."
        );
        return;
      }
      if (faceScanState !== "done") {
        setValidationError(
          lang === "fa"
            ? "اسکن هولوگرافیک چهره ماتریکس الزامی است. دکمه शुरू اسکن را فشار دهید."
            : "Matrix holographic face scan is incomplete. Please initiate biometric scanning."
        );
        return;
      }
      if (!idDocUploaded) {
        setValidationError(
          lang === "fa"
            ? "مدرک شناسایی ادمین برای پایش OCR الزامی است. لطفا فایلی آپلود کنید."
            : "Admin formal ID scan is required. Please drop or click to upload security credentials file."
        );
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final confirmation step clicked issue license
      if (!signatureDone) {
        alert(t.errorConfirmSignature);
        return;
      }

      // Save dynamic custom user profile to local storage for persistence across views
      const userObj = {
        fullName,
        emailAddress,
        phoneNumber,
        accountType,
        accessLevel,
        sessionLimit,
        registeredAt: new Date().toISOString()
      };
      localStorage.setItem("cybershield_user", JSON.stringify(userObj));
      setIsRegistered(true);
    }
  };

  const handleCancelBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      // Go to main database dashboard back redirect
      navigate("/dashboard");
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-start text-slate-300 font-sans p-4 xl:p-6 overflow-x-hidden relative select-none transition-colors duration-500",
        isDark ? "bg-[#04060b] text-[#cbd5e1]" : "bg-[#f1f5f9] text-[#1e293b]"
      )}
      dir={isRtl ? "rtl" : "ltr"}
      id="onboarding-main"
    >
      {/* Dynamic Cyberpunk Abstract Background Ornaments */}
      {isDark && (
        <>
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[8%] left-[10%] w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[130px] animate-pulse"></div>
            <div className="absolute bottom-[12%] right-[8%] w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[160px]"></div>
            <div className="absolute top-[40%] right-[30%] w-[250px] h-[250px] bg-cyan-600/5 rounded-full blur-[110px]"></div>
            {/* Cybersecurity Mesh Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
          </div>
        </>
      )}

      {/* Outer Wrapper Content Grid */}
      <div className="width-constraint w-full max-w-[1720px] flex flex-col z-10 space-y-4">
        
        {/* TOP STATUS ROW */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 border-b border-transparent">
          {/* Logo container left */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={cn("absolute inset-0 blur-md opacity-45 rounded-xl", isDark ? "bg-indigo-500" : "bg-indigo-400")} />
              <div className={cn("w-11 h-11 border flex items-center justify-center relative rounded-lg overflow-hidden", isDark ? "border-indigo-500/50 bg-[#0c0e15]" : "border-indigo-300 bg-white")}>
                <Shield className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] z-10" />
                <div className="absolute top-0 bottom-0 w-full bg-gradient-to-b from-transparent via-indigo-500/15 to-transparent animate-[scan_2.5s_infinite]" />
              </div>
            </div>
            <div>
              <h1 className={cn("font-bold text-lg tracking-wide uppercase", isDark ? "text-white" : "text-slate-900")}>
                {t.logoTitle}
              </h1>
              <p className={cn("text-[10px] uppercase font-semibold text-slate-500 tracking-wider", isRtl ? "text-right" : "text-left")}>
                {t.logoSubtitle}
              </p>
            </div>
          </div>

          {/* Stepper Center Form Pipeline (Active Steps 1-5) */}
          <div className="flex-1 max-w-[820px] w-full px-4 md:px-8">
            <div className="relative flex items-center justify-between w-full h-16">
              {/* Connector Pipe Lines */}
              <div className="absolute left-[8%] right-[8%] top-[32%] h-[2.5px] bg-[#1a2035] -translate-y-1/2 z-0">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                  style={{
                    width: `${currentStep * 25}%`,
                    marginLeft: isRtl ? "auto" : "0",
                    marginRight: isRtl ? "0" : "auto",
                  }}
                />
              </div>

              {/* Step Items */}
              {[
                { label: t.step1, num: 1 },
                { label: t.step2, num: 2 },
                { label: t.step3, num: 3 },
                { label: t.step4, num: 4 },
                { label: t.step5, num: 5 },
              ].map((step, idx) => {
                const isActive = currentStep === idx;
                const isCompleted = currentStep > idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handleStepClick(idx)}
                    className="relative flex flex-col items-center focus:outline-none z-10 transition-all group"
                    id={`onboarding-step-trigger-${idx + 1}`}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300",
                        isCompleted
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                          : isActive
                          ? "bg-[#0e1329] border-purple-500 text-purple-400 font-extrabold shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-110"
                          : isDark
                          ? "bg-[#0b0e14] border-slate-800 text-slate-500 group-hover:border-slate-700"
                          : "bg-white border-slate-300 text-slate-400 group-hover:border-slate-400"
                      )}
                    >
                      {step.num}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold mt-1.5 transition-colors whitespace-nowrap",
                        isActive
                          ? "text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.4)]"
                          : isCompleted
                          ? "text-indigo-400"
                          : "text-slate-500"
                      )}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lang Control, Dark mode, Help indicators Top Right */}
          <div className="flex items-center gap-3">
            {/* Lang Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none transition-colors",
                  isDark ? "bg-[#0d101a] border-[#22293f] text-slate-300 hover:border-slate-700" : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                )}
                id="language-dropdown-toggle"
              >
                <span>{lang === "fa" ? "🇮🇷" : "🇺🇸"}</span>
                <span>{lang === "fa" ? t.langFa : t.langEn}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className={cn(
                      "absolute top-full mt-1.5 right-0 w-28 rounded-lg shadow-xl border overflow-hidden z-50 text-xs",
                      isDark ? "bg-[#090b14] border-[#20273d]" : "bg-white border-slate-200"
                    )}
                  >
                    <button
                      onClick={() => {
                        setLang("fa");
                        setLangOpen(false);
                      }}
                      className={cn(
                        "w-full text-right px-3 py-2 flex items-center gap-2 hover:bg-slate-800/20 hover:text-indigo-400 transition-colors",
                        lang === "fa" && "text-indigo-400 font-bold"
                      )}
                    >
                      <span>🇮🇷</span> {t.langFa}
                    </button>
                    <button
                      onClick={() => {
                        setLang("en");
                        setLangOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-800/20 hover:text-indigo-400 transition-colors",
                        lang === "en" && "text-indigo-400 font-bold"
                      )}
                    >
                      <span>🇺🇸</span> {t.langEn}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mode Switcher Toggle: Log In VS Register Onboarding */}
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg border text-xs font-bold leading-none shadow-sm transition-all flex items-center gap-1.5 focus:outline-none",
                isDark
                  ? "bg-indigo-950/45 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40"
                  : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
              )}
              id="sign-in-mode-toggle"
            >
              {isSignIn ? (
                <span>{lang === "fa" ? "شروع ثبت‌نام هوشمند" : "Start Onboarding"}</span>
              ) : (
                <span>{lang === "fa" ? "ورود به حساب کاربری" : "Existing Account? Sign In"}</span>
              )}
            </button>

            {/* Dark Mode Switcher Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center border focus:outline-none transition-colors",
                isDark ? "bg-[#0d101a] border-[#22293f] text-amber-400 hover:border-slate-700" : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
              )}
              title="Toggle theme"
              id="theme-toggle-button"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Help Support */}
            <button
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center border focus:outline-none transition-colors",
                isDark ? "bg-[#0d101a] border-[#22293f] text-slate-400 hover:border-slate-700 hover:text-slate-200" : "bg-white border-slate-300 text-slate-500 hover:border-slate-400"
              )}
              title="Help Center"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* MAIN MODULE 3 COLUMNS GRID */}
        {isRegistered ? (
          /* CONGRATULATIONS CELEBRATION MODAL COMPLETED */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "w-full max-w-3xl mx-auto rounded-2xl border p-8 md:p-12 text-center shadow-2xl relative overflow-hidden my-12",
              isDark ? "bg-[#060810] border-emerald-500/20" : "bg-white border-emerald-300"
            )}
            id="onboarding-success-panel"
          >
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Spinning Shield Circle Badge */}
            <div className="flex items-center justify-center mb-8 relative">
              <div className="absolute w-28 h-28 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-500 flex items-center justify-center bg-[#090d16]/90 relative animate-[spin_5s_linear_infinite]" />
              <div className="absolute w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
            </div>

            <h2 className={cn("text-3xl font-extrabold mb-4 tracking-tight", isDark ? "text-white" : "text-slate-900")}>
              {t.congratsTitle}
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed mb-8">
              {t.congratsDesc}
            </p>

            {/* Issued Security Ticket details card */}
            <div className={cn("w-full max-w-md mx-auto rounded-xl border p-4 text-left space-y-3 mb-8 text-xs font-mono", isDark ? "bg-[#0a0c16] border-slate-800" : "bg-slate-50 border-slate-200")}>
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-slate-500">
                <span>SECURITY TICKET LOG</span>
                <span className="text-emerald-400">STATUS: APPROVED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">HOLDER:</span>
                <span className="font-bold text-slate-300">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IDENTITY EMAIL:</span>
                <span className="font-bold text-slate-300">{emailAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TRUST SCORE VERDICT:</span>
                <span className="font-bold text-cyan-400">92/100 SECURE_STATE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MFA TOKEN TIER:</span>
                <span className="font-bold text-indigo-400">LEVEL {accessLevel} - FULL AUTHORIZATION</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MEMBER TIER:</span>
                <span className="font-bold text-purple-400">{getAccountTypeTitle(accountType)}</span>
              </div>
            </div>

            {/* Deploy Emergency Firewall Patch Section */}
            <div className="w-full max-w-md mx-auto mb-8 p-1 rounded-xl bg-gradient-to-r from-red-500/20 to-amber-500/20 border border-red-500/30">
              <div className="bg-[#0b0c16] rounded-lg p-4 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                    {lang === "fa" ? "سیاست پچ امنیتی اضطراری" : "Emergency Security Patch Protocol"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {lang === "fa" 
                    ? "انجام عملیات عیب‌یابی رفتاری شبکه و پاکسازی سراسری فایروال برای ترافیک مشکوک ورودی"
                    : "Instantly compile network filter behaviors and invoke system-wide routing purge on suspect ingress."}
                </p>
                <button
                  type="button"
                  onClick={handleDeployPatch}
                  disabled={isPatching || patchSuccess}
                  className={cn(
                    "w-full py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-transparent",
                    patchSuccess
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-extrabold cursor-default"
                      : isPatching
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                        : "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.65)]"
                  )}
                  id="deploy-firewall-patch-btn"
                >
                  {isPatching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {lang === "fa" ? "در حال اعمال پچ..." : "COMPILING PATCH SYSTEM..."}
                    </>
                  ) : patchSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      {lang === "fa" ? "پچ اضطراری فایروال با موفقیت اعمال شد" : "EMERGENCY PATCH DEPLOYED ✅"}
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 animate-bounce" />
                      {lang === "fa" ? "اعمال پچ اضطراری فایروال کلاینت" : "Deploy Emergency Firewall Patch"}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setIsRegistered(false);
                  setCurrentStep(0);
                }}
                className={cn(
                  "px-6 py-3 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all",
                  isDark ? "border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900" : "border-slate-300 hover:border-slate-400 bg-white"
                )}
              >
                {t.backToStep1}
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
                id="enter-dashboard-success-btn"
              >
                {lang === "fa" ? "ورود به کنترل پنل اصلی" : "Enter Secure Dashboard"}
              </button>
            </div>
          </motion.div>
        ) : isSignIn ? (
          /* GORGEOUS CYBER SIGN IN FORM */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto py-6"
            id="onboarding-signin-panel"
          >
            <div className={cn(
              "rounded-2xl border p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all",
              isDark ? "bg-[#080a12]/95 border-[#1c223a] backdrop-blur-md" : "bg-white border-slate-200"
            )}>
              {/* Decorative side lights */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Title & Logo Header */}
              <div className="text-center mb-8 relative">
                <div className="inline-flex w-12 h-12 rounded-xl bg-indigo-500/10 hover:bg-indigo-505/20 items-center justify-center text-indigo-400 mb-3 border border-indigo-500/30 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                <h2 className={cn("text-xl md:text-2xl font-extrabold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                  {lang === "fa" ? "دروازه ورود امن CyberShield" : "Secure Authentication Gateway"}
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {lang === "fa" 
                    ? "سیستم پایش یکپارچه Zero Trust و تایید هویت بیومتریک ادمین" 
                    : "Zero-Trust Session Integrity & Biometric Admin Authentication"}
                </p>
              </div>

              {/* Form Input Slots */}
              <div className="space-y-5">
                {/* Email Slot */}
                <div className="space-y-1.5 text-right ltr:text-left">
                  <label className={cn("text-xs font-bold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-600")}>
                    {lang === "fa" ? "ایمیل یا شناسه کاربری ادمین" : "Admin ID or Email Address"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                    <input
                      type="text"
                      className={cn(
                        "w-full rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none transition-colors border text-right ltr:text-left",
                        isDark 
                          ? "bg-[#05070d] border-[#1f273d] text-slate-100 placeholder-slate-600 focus:border-indigo-500/70" 
                          : "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                      )}
                      placeholder={lang === "fa" ? "ali.mohammedi@example.com" : "admin@cybershield.com"}
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Slot */}
                <div className="space-y-1.5 text-right ltr:text-left">
                  <div className="flex justify-between items-center flex-row-reverse">
                    <label className={cn("text-xs font-bold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-600")}>
                      {lang === "fa" ? "گذرواژه امنیتی رمزنگاری شده" : "Encrypted Password"}
                    </label>
                    <a href="#reset" className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold">
                      {lang === "fa" ? "بازیابی گذرواژه؟" : "Forgot Password?"}
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                    <input
                      type="password"
                      className={cn(
                        "w-full rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none transition-colors border text-right ltr:text-left",
                        isDark 
                          ? "bg-[#05070d] border-[#1f273d] text-slate-100 placeholder-slate-600 focus:border-indigo-500/70" 
                          : "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                      )}
                      placeholder="••••••••••••"
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Interactive FIDO2 Biometric Scanner Widget */}
                <div 
                  onClick={() => {
                    if (signinScanState === "idle") {
                      setSigninScanState("scanning");
                      setTimeout(() => {
                        setSigninScanState("success");
                      }, 1500);
                    } else {
                      setSigninScanState("idle");
                    }
                  }}
                  className={cn(
                    "p-3 rounded-lg border group cursor-pointer transition-all flex items-center justify-between text-xs",
                    signinScanState === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium"
                      : signinScanState === "scanning"
                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 animate-pulse"
                        : isDark 
                          ? "bg-[#05070d] border-[#1e2539] text-slate-400 hover:border-slate-700" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3 text-right ltr:text-left flex-row-reverse">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                      signinScanState === "success" 
                        ? "bg-emerald-500/20 text-emerald-400"
                        : signinScanState === "scanning"
                          ? "bg-indigo-500/20 text-indigo-400"
                          : isDark ? "bg-slate-900 text-slate-500 group-hover:text-slate-300" : "bg-white text-slate-400"
                    )}>
                      <Fingerprint className={cn("w-5 h-5", signinScanState === "scanning" && "animate-pulse")} />
                    </div>
                    <div className="flex-1 min-w-0 pr-3">
                      <div className={cn("font-bold text-xs text-right ltr:text-left", signinScanState === "success" ? "text-emerald-300" : "text-slate-200")}>
                        {lang === "fa" ? "امضای بیومتریک FIDO2" : "FIDO2 Biometric Scan"}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono text-right ltr:text-left">
                        {signinScanState === "success"
                          ? (lang === "fa" ? "هویت بیومتریک تطبیق یافت • دسترسی مجاز" : "Biometrics Verified • Access Granted")
                          : signinScanState === "scanning"
                            ? (lang === "fa" ? "درحال اسکن و پردازش ماتریکس کلید سخت‌افزاری..." : "Interrogating hardware key matrix...")
                            : (lang === "fa" ? "کلیک کنید برای شبیه‌سازی تایید هویت آنی" : "Click to emulate fast identity scan")}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {signinScanState === "success" ? (
                      <Check className="w-4 h-4 text-emerald-400 animate-scale" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-indigo-500/50 animate-ping" />
                    )}
                  </div>
                </div>

                {/* Simulated Device Integrity Security check banner */}
                <div className={cn(
                  "p-3 rounded-lg border text-[11px] font-mono flex items-center justify-between text-right",
                  isDark ? "bg-[#060810]/90 border-[#1a1e2e] text-slate-500" : "bg-slate-50 border-slate-200 text-slate-500"
                )}>
                  <div className="flex items-center gap-1.5 flex-row-reverse">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {lang === "fa" ? "ترافیک IP: ایمن" : "IP Security Score: Safe"}
                    </span>
                  </div>
                  <div>
                    {lang === "fa" ? "اعتبارسنجی یکپارچگی سیگنال: تایید" : "Endpoint Verification: PASSED"}
                  </div>
                </div>

                {/* Sign In Trigger Button */}
                <button
                  onClick={() => {
                    if (!signinEmail) {
                      alert(lang === "fa" ? "لطفا ایمیل یا شناسه ادمین را وارد کنید!" : "Please enter your email or Admin ID!");
                      return;
                    }
                    if (!signinPassword) {
                      alert(lang === "fa" ? "لطفا گذرواژه ورود را وارد کنید!" : "Please enter your password!");
                      return;
                    }

                    // Check existing users or default credentials
                    const savedUserStr = localStorage.getItem("cybershield_user");
                    let expectedEmail = "ali.mohammedi@example.com";
                    let savedName = "علی محمدی";

                    if (savedUserStr) {
                      try {
                        const parsed = JSON.parse(savedUserStr);
                        if (parsed.emailAddress) expectedEmail = parsed.emailAddress;
                        if (parsed.fullName) savedName = parsed.fullName;
                      } catch (e) {
                        // ignore
                      }
                    }

                    // Let people use standard demo credentials or matching credentials
                    const matchOk = 
                      (signinEmail === expectedEmail || signinEmail === "ali.mohammedi@example.com" || signinEmail === "admin@cybershield.com");

                    if (!matchOk) {
                      alert(lang === "fa" ? "موردی با این شناسه کاربری یافت نشد!" : "Admin ID / Email not found in security database!");
                      return;
                    }

                    setSigninLoading(true);
                    setTimeout(() => {
                      setSigninLoading(false);
                      
                      // Set active user session structure securely
                      const activeUser = {
                        fullName: savedName,
                        emailAddress: expectedEmail,
                        role: "security_admin",
                        isVerified: true
                      };
                      localStorage.setItem("cybershield_user", JSON.stringify(activeUser));
                      navigate("/dashboard");
                    }, 1100);
                  }}
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2"
                  disabled={signinLoading}
                >
                  {signinLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === "fa" ? "در حال دریافت تائید اعتبار ادمین..." : "Verifying Admin Security..."}</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>{lang === "fa" ? "ورود ایمن به پنل مدیریت" : "Sign In Securely to Dashboard"}</span>
                    </>
                  )}
                </button>

                {/* Bottom Toggle Link */}
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setIsSignIn(false)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline border border-dashed border-indigo-500/30 hover:border-indigo-400/50 bg-indigo-505/5 rounded-lg px-4 py-2 transition-all"
                  >
                    {lang === "fa" 
                      ? "شناسه کاربری ندارید؟ شروع فرآیند ۵ مرحله‌ای صدور هویت سایبری" 
                      : "New Admin token? Start the 5-step onboarding lifecycle"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative">
            
            {/* COLUMN 1 (LG:3): Account Selection & Trust Score */}
            <div className="lg:col-span-3 flex flex-col space-y-4">
              
              {/* Card 1: Account Selector */}
              <div className={cn("rounded-xl border p-4 flex flex-col space-y-3.5 shadow-xl transition-all", isDark ? "bg-[#090b14]/80 border-[#1a1f33] backdrop-blur-md" : "bg-white border-slate-200")}>
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <h3 className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-2", isDark ? "text-white font-extrabold" : "text-slate-800")}>
                    <Users className="w-4 h-4 text-purple-400" />
                    {t.accountTypeTitle}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium font-mono">
                    {t.accountTypeDesc}
                  </span>
                </div>

                <div className="flex flex-col space-y-2">
                  {accountTypesDetails.map((item) => {
                    const CardIcon = item.icon;
                    const isActive = accountType === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setAccountType(item.id as any);
                          // Sync default roles if type clicked
                          if (item.id === "admin") setAccessLevel(3);
                          else if (item.id === "owner") setAccessLevel(4);
                          else setAccessLevel(1);
                        }}
                        className={cn(
                          "w-full text-right ltr:text-left flex items-center justify-between p-3 rounded-lg border transition-all text-xs focus:outline-none relative group",
                          isActive
                            ? "bg-[#0d1228] border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                            : isDark
                            ? "bg-[#060810] border-slate-800/65 text-slate-400 hover:border-slate-700 hover:bg-[#090c15]"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                        id={`account-type-select-${item.id}`}
                      >
                        {/* Selected Indicator left border */}
                        {isActive && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-l-md rtl:left-auto rtl:right-0 rtl:rounded-l-none rtl:rounded-r-md" />
                        )}

                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                              isActive
                                ? "bg-indigo-500/10 text-indigo-400"
                                : isDark
                                ? "bg-slate-900 text-slate-500 group-hover:text-slate-300"
                                : "bg-white text-slate-400"
                            )}
                          >
                            <CardIcon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col text-right ltr:text-left">
                            <span className={cn("font-bold text-xs", isActive ? "text-indigo-300" : "text-slate-400")}>
                              {item.title}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono tracking-tighter">
                              {item.desc}
                            </span>
                          </div>
                        </div>

                        {/* Custom Select circle widget */}
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                            isActive ? "border-indigo-400 bg-indigo-505" : isDark ? "border-slate-700" : "border-slate-300"
                          )}
                        >
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: Device Trust Score Radar & Indicators */}
              <div className={cn("rounded-xl border p-4 flex flex-col space-y-4 shadow-xl", isDark ? "bg-[#090b14]/80 border-[#1a1f33] backdrop-blur-md" : "bg-white border-slate-200")}>
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <h3 className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-2", isDark ? "text-white" : "text-slate-800")}>
                    <Zap className="w-4 h-4 text-cyan-400" />
                    {t.trustScoreTitle}
                  </h3>
                </div>

                {/* Score Semi-circle & Pulsing Fingerprint Graphic */}
                <div className="flex items-center justify-between gap-3 bg-[#0d101a]/55 border border-[#1d263f]/60 p-3 rounded-lg overflow-hidden relative">
                  
                  {/* Gauge Arc left */}
                  <div className="relative w-20 h-20 flex flex-col items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className={isDark ? "text-slate-800" : "text-slate-200"}
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                        strokeDasharray="92, 100"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className={cn("text-lg font-mono font-extrabold leading-tight", isDark ? "text-white" : "text-slate-800")}>
                        92
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0">/100</span>
                    </div>
                  </div>

                  {/* Fingerprint Scanning Sensor right */}
                  <div className="flex-1 flex flex-col items-center justify-center relative py-1.5 px-2 border-l border-slate-800/60 rtl:border-l-0 rtl:border-r">
                    <div className="relative group">
                      <div className="absolute -inset-1.5 bg-cyan-400/25 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                      <div className={cn("w-12 h-12 rounded-lg border flex items-center justify-center relative shadow-inner overflow-hidden", isDark ? "border-cyan-500/40 bg-[#060a13]" : "border-cyan-300 bg-sky-50")}>
                        <Fingerprint className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
                        <div className="absolute top-0 bottom-0 w-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-[scan_2s_infinite]" />
                      </div>
                    </div>
                    <div className="mt-1 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-[8.5px] font-bold text-emerald-400 flex items-center gap-1 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {t.trustScoreSecure}
                    </div>
                  </div>
                </div>

                {/* Checklist indicators below */}
                <div className="flex flex-col space-y-2 text-[11px] font-medium font-sans">
                  {[
                    { label: t.ipReputation, val: t.goodStatus },
                    { label: t.deviceFingerprint, val: t.verifiedStatus },
                    { label: t.networkSecurity, val: t.secureStatus },
                    { label: t.locationLabel, val: t.locationValue, geo: true },
                  ].map((element, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border",
                        isDark ? "bg-[#060810] border-slate-800/60" : "bg-slate-50 border-slate-200"
                      )}
                    >
                      <span className="text-slate-500">{element.label}</span>
                      <div className="flex items-center gap-1.5">
                        {element.geo && <span className="text-[14px]">🇮🇷</span>}
                        <span className="text-slate-200 font-bold pr-1 text-[10px]">{element.val}</span>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 2 (LG:6): The Main Step Form View Screen */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              
              <div className={cn("rounded-xl border p-5 md:p-6 flex flex-col space-y-5 shadow-2xl relative", isDark ? "bg-[#090b14]/85 border-[#1a1f33] backdrop-blur-md" : "bg-white border-slate-200")}>
                
                {/* Steps Content Area Header */}
                <div className="flex items-center gap-3 border-b border-slate-800/60 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    {currentStep === 0 ? <User className="w-4 h-4" /> : currentStep === 1 ? <UserCheck className="w-4 h-4" /> : currentStep === 2 ? <Settings className="w-4 h-4" /> : currentStep === 3 ? <Layers className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className={cn("text-sm font-extrabold tracking-tight uppercase", isDark ? "text-white" : "text-slate-900")}>
                      {currentStep === 0
                        ? t.basicInfoTitle
                        : currentStep === 1
                        ? t.step2
                        : currentStep === 2
                        ? t.step3
                        : currentStep === 3
                        ? t.step4
                        : t.step5}
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                      TIER {currentStep + 1} CRYPTOGRAPHIC GATEWAY VALIDATION
                    </p>
                  </div>
                </div>

                {/* Cyber Feedback Validation Banner */}
                {validationError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs flex items-center gap-2.5 text-red-400 font-bold animate-pulse" id="onboarding-validation-error">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="flex-1 text-right ltr:text-left">{validationError}</span>
                  </div>
                )}

                {/* Form Elements Transitions */}
                <div className="flex-1 min-h-[360px]">
                  
                  {/* STEP 1: Basic Information Input Grid (اطلاعات پایه) */}
                  {currentStep === 0 && (
                    <div className="flex flex-col space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Column 1 Full Name */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 block">
                            {t.fullName}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 ltr:right-auto ltr:left-3">
                              <User className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className={cn(
                                "w-full text-xs font-semibold px-9 py-2.5 rounded-lg border focus:outline-none transition-all placeholder-slate-700",
                                isDark
                                  ? "bg-[#060810] border-slate-800 text-white focus:border-indigo-500/80"
                                  : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400"
                              )}
                            />
                          </div>
                        </div>

                        {/* Column 2 Email Address */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 block">
                            {t.email}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 ltr:right-auto ltr:left-3">
                              <Mail className="w-4 h-4" />
                            </span>
                            <input
                              type="email"
                              value={emailAddress}
                              onChange={(e) => setEmailAddress(e.target.value)}
                              className={cn(
                                "w-full text-xs font-semibold px-9 py-2.5 rounded-lg border focus:outline-none transition-all placeholder-slate-700",
                                isDark
                                  ? "bg-[#060810] border-slate-800 text-white focus:border-indigo-500/80"
                                  : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400"
                              )}
                            />
                            {/* Verified circle check right */}
                            <span className="absolute inset-y-0 left-3 flex items-center ltr:left-auto ltr:right-3 text-emerald-400">
                              <Check className="w-4 h-4" />
                            </span>
                          </div>
                        </div>

                        {/* Column 3 Phone number with dropdown prefix flag */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 block">
                            {t.phone}
                          </label>
                          <div className="flex gap-2">
                            {/* Prefix code selector */}
                            <div className={cn("px-2 py-2.5 border rounded-lg text-xs font-bold flex items-center gap-1 justify-center shrink-0 w-16", isDark ? "bg-[#060810] border-slate-800" : "bg-slate-50 border-slate-200")}>
                              <span>🇮🇷</span>
                              <span className="font-mono text-[9px]">+98</span>
                            </div>
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className={cn(
                                  "w-full text-xs font-semibold px-4 py-2.5 rounded-lg border focus:outline-none transition-all placeholder-slate-700 font-mono",
                                  isDark
                                    ? "bg-[#060810] border-slate-800 text-white focus:border-indigo-500/80"
                                    : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400"
                                )}
                              />
                              <span className="absolute inset-y-0 left-3 flex items-center ltr:left-auto ltr:right-3 text-emerald-400">
                                <Check className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Column 4 Country Selection */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 block">
                            {t.country}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 ltr:right-auto ltr:left-3">
                              <span className="text-[14px]">🇮🇷</span>
                            </span>
                            <input
                              type="text"
                              value={countryVal}
                              onChange={(e) => setCountryVal(e.target.value)}
                              className={cn(
                                "w-full text-xs font-semibold px-9 py-2.5 rounded-lg border focus:outline-none transition-all appearance-none",
                                isDark
                                  ? "bg-[#060810] border-slate-800 text-white focus:border-indigo-500/80"
                                  : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400"
                              )}
                            />
                            <span className="absolute inset-y-0 left-3 flex items-center ltr:left-auto ltr:right-3 text-slate-400">
                              <Check className="w-4 h-4 text-emerald-400" />
                            </span>
                          </div>
                        </div>

                        {/* Column 5 Password */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 block">
                            {t.password}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 ltr:right-auto ltr:left-3">
                              <Lock className="w-4 h-4" />
                            </span>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className={cn(
                                "w-full text-xs font-semibold px-9 py-2.5 rounded-lg border focus:outline-none transition-all placeholder-slate-705 font-mono",
                                isDark
                                  ? "bg-[#060810] border-slate-800 text-white focus:border-indigo-500/80"
                                  : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400"
                              )}
                            />
                            {/* Strength badge labels inside */}
                            <span className="absolute inset-y-0 left-3 flex items-center ltr:left-auto ltr:right-3 text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">
                              {t.passwordPower}
                            </span>
                          </div>
                          {/* strength meter visualization bar */}
                          <div className="w-full h-1 bg-slate-800/80 mt-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500/80 w-full rounded-full" />
                          </div>
                        </div>

                        {/* Column 6 Confirm Password */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 block">
                            {t.confirmPassword}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 ltr:right-auto ltr:left-3">
                              <Lock className="w-4 h-4" />
                            </span>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className={cn(
                                "w-full text-xs font-semibold px-9 py-2.5 rounded-lg border focus:outline-none transition-all placeholder-slate-705 font-mono",
                                isDark
                                  ? "bg-[#060810] border-slate-800 text-white focus:border-indigo-500/80"
                                  : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400"
                              )}
                            />
                            <span className="absolute inset-y-0 left-3 flex items-center ltr:left-auto ltr:right-3 text-emerald-400">
                              <Check className="w-4 h-4" />
                            </span>
                          </div>
                        </div>

                        {/* Column 7 Referral Code optional */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 block">
                            {t.referralCode}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 ltr:right-auto ltr:left-3">
                              <Zap className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              value={referral}
                              onChange={(e) => setReferral(e.target.value)}
                              placeholder={t.referralPlaceholder}
                              className={cn(
                                "w-full text-xs font-semibold px-9 py-2.5 rounded-lg border focus:outline-none transition-all placeholder-slate-700",
                                isDark
                                  ? "bg-[#060810] border-slate-800 text-white focus:border-indigo-500/80"
                                  : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400"
                              )}
                            />
                          </div>
                        </div>

                        {/* Column 8 Company Name optional */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 block">
                            {t.companyName}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 ltr:right-auto ltr:left-3">
                              <Users className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              placeholder="CyberShield Solutions"
                              className={cn(
                                "w-full text-xs font-semibold px-9 py-2.5 rounded-lg border focus:outline-none transition-all placeholder-slate-700",
                                isDark
                                  ? "bg-[#060810] border-slate-800 text-white focus:border-indigo-500/80"
                                  : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400"
                              )}
                            />
                          </div>
                        </div>

                      </div>

                      {/* Primary Verification row of 4 components (تأیید اولیه) */}
                      <div className="flex flex-col space-y-2 mt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          {t.primaryVerification}
                        </span>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                          
                          {/* Unit 1 Email verify state info */}
                          <div className={cn("rounded-lg border p-3 flex flex-col justify-between items-stretch gap-2.5 min-h-[95px]", isDark ? "bg-[#060810] border-slate-800/80" : "bg-slate-50 border-slate-200")}>
                            <div className="flex items-center gap-2 mb-1 w-full justify-between">
                              <span className="text-[10px] text-slate-500 font-bold">{t.email}</span>
                              <Mail className="w-3.5 h-3.5 text-indigo-400" />
                            </div>
                            <div className="flex items-center justify-between">
                              {emailVerifiedState ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] font-bold text-emerald-400">{t.emailVerified}</span>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsVerifyingEmail(true);
                                    setTimeout(() => {
                                      setIsVerifyingEmail(false);
                                      setEmailVerifiedState(true);
                                    }, 800);
                                  }}
                                  disabled={isVerifyingEmail}
                                  className="w-full py-1 text-[10.5px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors text-center"
                                >
                                  {isVerifyingEmail ? "..." : (lang === "fa" ? "تأیید ایمیل" : "Verify Email")}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Unit 2 Phone verify state */}
                          <div className={cn("rounded-lg border p-3 flex flex-col justify-between items-stretch gap-2.5 min-h-[95px]", isDark ? "bg-[#060810] border-slate-800/80" : "bg-slate-50 border-slate-200")}>
                            <div className="flex items-center gap-2 mb-1 w-full justify-between">
                              <span className="text-[10px] text-slate-500 font-bold">{t.phone}</span>
                              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                            </div>
                            <div className="flex items-center justify-between">
                              {phoneVerifiedState ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] font-bold text-emerald-400">{t.phoneVerified}</span>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsVerifyingPhone(true);
                                    setTimeout(() => {
                                      setIsVerifyingPhone(false);
                                      setPhoneVerifiedState(true);
                                    }, 800);
                                  }}
                                  disabled={isVerifyingPhone}
                                  className="w-full py-1 text-[10.5px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors text-center"
                                >
                                  {isVerifyingPhone ? "..." : (lang === "fa" ? "تأیید موبایل" : "Verify Mobile")}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Unit 3 Dynamic ticking OTP Code controller with simulation */}
                          <div className={cn("rounded-lg border p-3 flex flex-col justify-between items-stretch gap-2 min-h-[95px] relative overflow-hidden", isDark ? "bg-[#060810] border-slate-800/80" : "bg-slate-50 border-slate-200")}>
                            <div className="flex items-center gap-2 w-full justify-between">
                              <span className="text-[10px] text-slate-500 font-bold">{t.otpLabel}</span>
                              <span className="text-[9px] font-mono text-amber-500 font-bold">
                                00:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              {otpVerifiedState ? (
                                <div className="flex items-center gap-1 py-1">
                                  <span className="text-[10.5px] font-bold text-emerald-400">{lang === "fa" ? "تأیید شد" : "Validated"}</span>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                              ) : (
                                <div className="flex gap-1 items-center">
                                  <input
                                    type="text"
                                    placeholder={otpVal}
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value)}
                                    className="w-1/2 text-center bg-slate-950 border border-slate-800 text-[11px] text-indigo-300 font-mono font-bold rounded py-0.5 px-1 focus:outline-none placeholder-slate-705"
                                    maxLength={6}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsVerifyingOtp(true);
                                      setTimeout(() => {
                                        setIsVerifyingOtp(false);
                                        if (otpInput === otpVal || otpInput === "824731") {
                                          setOtpVerifiedState(true);
                                        } else {
                                          alert(lang === "fa" ? "کد نادرست است! کد کمکی: 824731" : "Wrong code! Use: 824731");
                                        }
                                      }, 600);
                                    }}
                                    disabled={isVerifyingOtp}
                                    className="flex-1 py-0.5 text-[9px] font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors text-center"
                                  >
                                    {isVerifyingOtp ? "..." : (lang === "fa" ? "ثبت" : "Verify")}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Unit 4 Interactive Security CAPTCHA Checkbox */}
                          <button
                            type="button"
                            onClick={() => setCaptchaChecked(!captchaChecked)}
                            className={cn(
                              "rounded-lg border p-3 flex flex-col justify-between items-start focus:outline-none text-right ltr:text-left transition-all min-h-[95px]",
                              captchaChecked
                                ? "bg-indigo-900/10 border-indigo-500/50"
                                : isDark
                                ? "bg-[#060810] border-slate-800"
                                : "bg-slate-50 border-slate-200"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1.5 w-full justify-between">
                              <span className="text-[10px] text-slate-500 font-bold">{t.captchaLabel}</span>
                              <Zap className="w-3.5 h-3.5 text-indigo-400" />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center transition-all", captchaChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-500")}>
                                {captchaChecked && <Check className="w-2.5 h-2.5" />}
                              </div>
                              <span className="text-[10px] font-bold text-slate-300">{t.captchaCheck}</span>
                            </div>
                          </button>

                        </div>
                      </div>

                      {/* Select Login Method Horizontal Row of 6 cards */}
                      <div className="flex flex-col space-y-2.5 mt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          {t.loginMethodTitle}
                        </span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
                          {[
                            { id: "email-password", label: isRtl ? "ایمیل + رمز عبور" : "Email + Pass", icon: Lock },
                            { id: "mobile-otp", label: isRtl ? "موبایل + OTP" : "Mobile + OTP", icon: Smartphone },
                            { id: "passkey", label: "Passkey", icon: Fingerprint },
                            { id: "google", label: "Google", brand: true, text: "G" },
                            { id: "github", label: "GitHub", brand: true, text: "Git" },
                            { id: "microsoft", label: "Microsoft", brand: true, text: "MS" },
                          ].map((method) => {
                            const MethodIcon = method.icon;
                            const isSelect = loginMethod === method.id;

                            return (
                              <button
                                key={method.id}
                                onClick={() => setLoginMethod(method.id)}
                                className={cn(
                                  "p-2.5 border rounded-lg text-center flex flex-col items-center justify-center gap-1.5 transition-all focus:outline-none text-xs w-full relative group",
                                  isSelect
                                    ? "bg-[#0d1228] border-indigo-500/80 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                                    : isDark
                                    ? "bg-[#060810] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-[#080b13]"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                )}
                                id={`login-method-btn-${method.id}`}
                              >
                                {isSelect && (
                                  <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-400 rounded-full flex items-center justify-center text-[6px] font-bold text-[#090b14]" />
                                )}

                                {!method.brand ? (
                                  <MethodIcon className={cn("w-4 h-4", isSelect ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                                ) : (
                                  <div
                                    className={cn(
                                      "w-4 h-4 rounded flex items-center justify-center font-extrabold text-[9px] border",
                                      method.id === "google"
                                        ? "text-red-500 border-red-500/20 bg-red-500/10"
                                        : method.id === "github"
                                        ? "text-slate-200 border-slate-700 bg-slate-800/60"
                                        : "text-blue-400 border-blue-500/20 bg-blue-500/10"
                                    )}
                                  >
                                    {method.text}
                                  </div>
                                )}
                                <span className="text-[9.5px] font-semibold tracking-tighter truncate block w-full">{method.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* STEP 2: Adaptive Authentication (احراز هویت) */}
                  {currentStep === 1 && (
                    <div className="flex flex-col space-y-4 animate-fadeIn">
                      
                      {/* Interactive Biometrics Register Area */}
                      <div className={cn("rounded-xl border p-4 cursor-pointer relative overflow-hidden", isDark ? "bg-[#060810] border-slate-800/80" : "bg-slate-50 border-slate-200")}>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-3.5">
                          <Fingerprint className="w-4.5 h-4.5 text-purple-400" />
                          {t.passkeyTitle}
                        </h4>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0d101a]/60 border border-slate-800/80 p-3 rounded-lg">
                          <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center shrink-0">
                            <Key className="w-4.5 h-4.5 text-indigo-400" />
                          </div>
                          <div className="flex-1 text-center sm:text-right ltr:sm:text-left">
                            <span className="text-xs font-bold text-slate-300 block mb-0.5">{t.passkeyActivate}</span>
                            <span className="text-[10px] text-slate-500 block leading-tight">YubiKey, Touch ID, or Google Titan</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (passkeyActive) return;
                              setIsActivatingPasskey(true);
                              setTimeout(() => {
                                setIsActivatingPasskey(false);
                                setPasskeyActive(true);
                              }, 1100);
                            }}
                            disabled={isActivatingPasskey}
                            className={cn(
                              "px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded border transition-colors focus:outline-none min-w-[124px] text-center",
                              passkeyActive
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                : "bg-purple-600/15 border-purple-500/30 text-purple-400 hover:bg-purple-600/30"
                            )}
                          >
                            {isActivatingPasskey ? "Registering..." : (passkeyActive ? t.passkeyActive : "Activate Key")}
                          </button>
                        </div>
                      </div>

                      {/* Holographic Face Scan simulated camera preview layout */}
                      <div className={cn("rounded-xl border p-4 relative overflow-hidden flex flex-col items-center", isDark ? "bg-[#060810] border-slate-800/80" : "bg-slate-50 border-slate-200")}>
                        <h4 className="w-full text-right ltr:text-left flex items-center gap-2 text-xs font-bold text-slate-200 mb-2.5">
                          <Camera className="w-4.5 h-4.5 text-cyan-400" />
                          {t.faceScanTitle}
                        </h4>

                        {/* Visual Scanning Viewport Mockup */}
                        <div className="w-60 h-40 border border-[#1e293b] rounded-lg relative overflow-hidden bg-slate-950/80 flex items-center justify-center shadow-inner">
                          {/* Cybersecurity Matrix backdrop */}
                          <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] bg-[size:10px_10px] opacity-25" />
                          
                          {/* Face Shape Outline Vector */}
                          <div className="absolute border-2 border-dashed border-cyan-500/30 rounded-full w-24 h-28 flex items-center justify-center">
                            <div className="w-20 h-24 rounded-full border border-dashed border-indigo-500/20" />
                          </div>

                          {/* Face avatar inside scan */}
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                            alt="Bio face scan holder"
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 rounded-full grayscale opacity-70 border border-slate-800 z-12 object-cover"
                          />

                          {/* Pulsing Scan Lazor moving bar */}
                          {faceScanState === "scanning" && (
                            <div className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-[bounce_2s_infinite] z-25" />
                          )}

                          {faceScanState === "done" && (
                            <div className="absolute flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/15 border border-emerald-400 text-emerald-400 text-[10px] font-bold z-20">
                              <Check className="w-3.5 h-3.5" />
                              <span>Verified MATCH_PASS</span>
                            </div>
                          )}
                        </div>

                        {/* Scanning Action Controllers */}
                        <div className="mt-3.5 w-full max-w-sm text-center">
                          <p className="text-[10px] text-slate-500 mb-2 font-mono">
                            {faceScanState === "idle" ? "Ready" : faceScanState === "scanning" ? t.scanning : t.scanComplete}
                          </p>
                          <div className="flex items-center justify-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                setFaceScanState("scanning");
                                setTimeout(() => setFaceScanState("done"), 1800);
                              }}
                              disabled={faceScanState === "scanning"}
                              className="px-5 py-2 bg-[#090d16] border border-cyan-500/35 hover:border-cyan-400 text-cyan-400 text-[10px] font-extrabold uppercase tracking-wider rounded transition-all focus:outline-none disabled:opacity-50"
                            >
                              {faceScanState === "scanning" ? (lang === "fa" ? "در حال اسکن..." : "SCANNING...") : t.startScan}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ID Cards Upload simulated drop zone */}
                      <div className={cn("rounded-xl border p-4 flex flex-col", isDark ? "bg-[#060810] border-slate-800/80" : "bg-slate-50 border-slate-200")}>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-3 text-right ltr:text-left">
                          <FileText className="w-4.5 h-4.5 text-purple-400" />
                          {t.uploadIdTitle}
                        </h4>

                        {/* Hidden native input file explorer selector */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleManualFileChange}
                          accept="image/*,.pdf"
                          className="hidden"
                          id="native-identity-file-input"
                        />

                        <div
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={selectFileManual}
                          className="border-2 border-dashed border-slate-700/80 hover:border-slate-500 hover:bg-[#0c0f1b]/60 transition-all rounded-lg p-5 text-center cursor-pointer flex flex-col items-center justify-center space-y-2 bg-[#080a13]"
                        >
                          <Upload className="w-8 h-8 text-slate-500 animate-bounce" />
                          <span className="text-xs text-slate-400 font-bold block">{t.uploadDesc}</span>
                          <span className="text-[10px] text-slate-500 block leading-snug">SVG, PNG, JPG or PDF up to 4MB max</span>
                        </div>

                        {/* File feedback information */}
                        {(idDocUploaded || idDocName) && (
                          <div className="mt-2.5 bg-indigo-950/20 border border-indigo-500/30 p-2.5 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <Check className="w-4.5 h-4.5 text-emerald-400" />
                              <div className="flex flex-col text-right ltr:text-left text-[11px]">
                                <span className="font-bold text-slate-300">{idDocName || "Passport_Verify_Document_F.png"}</span>
                                <span className="text-slate-500 font-mono text-[9px]">1.2 MB verified • OCR Approved</span>
                              </div>
                            </div>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-extrabold">APPROVED</span>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* STEP 3: Multi-Factor Settings (تنظیمات امنیتی) */}
                  {currentStep === 2 && (
                    <div className="flex flex-col space-y-4 animate-fadeIn">
                      
                      {/* MFA Toggles UI element */}
                      <div className={cn("rounded-xl border p-4 flex flex-col space-y-3.5", isDark ? "bg-[#060810] border-slate-800/80" : "bg-slate-50 border-slate-200")}>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800/70 pb-2">
                          <Settings className="w-4.5 h-4.5 text-indigo-400" />
                          {t.mfaTitle}
                        </h4>

                        {/* Toggle 1 Google Auth app */}
                        <div className="flex items-center justify-between p-2.5 bg-[#0e111d]/55 rounded border border-slate-800/80">
                          <div className="flex flex-col text-right ltr:text-left">
                            <span className="text-xs font-bold text-slate-300 mb-0.5">{lang === "fa" ? "برنامه احراز هویت هوشمند" : "Authenticator App OTP"}</span>
                            <span className="text-[9.5px] text-slate-500 leading-tight block">{t.mfaGoogleAuth}</span>
                          </div>
                          {/* Animated iOS toggle widget */}
                          <button
                            onClick={() => setMfaGoogle(!mfaGoogle)}
                            className={cn(
                              "w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none flex items-center scale-95",
                              mfaGoogle ? "bg-indigo-600 justify-end" : "bg-slate-700/80 justify-start"
                            )}
                          >
                            <div className="w-5 h-5 rounded-full bg-white shadow" />
                          </button>
                        </div>

                        {/* Toggle 2 SMS fallback code */}
                        <div className="flex items-center justify-between p-2.5 bg-[#0e111d]/55 rounded border border-slate-800/80">
                          <div className="flex flex-col text-right ltr:text-left">
                            <span className="text-xs font-bold text-slate-300 mb-0.5">{lang === "fa" ? "کدهای تاییدیه پشتیبان پیامکی" : "Backup SMS Authentication"}</span>
                            <span className="text-[9.5px] text-slate-500 leading-tight block">{t.mfaSmsAuth}</span>
                          </div>
                          <button
                            onClick={() => setMfaSms(!mfaSms)}
                            className={cn(
                              "w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none flex items-center scale-95",
                              mfaSms ? "bg-indigo-600 justify-end" : "bg-slate-700/80 justify-start"
                            )}
                          >
                            <div className="w-5 h-5 rounded-full bg-white shadow" />
                          </button>
                        </div>
                      </div>

                      {/* Display Backup codes */}
                      <div className={cn("rounded-xl border p-4 flex flex-col space-y-2.5", isDark ? "bg-[#060810] border-slate-800/80" : "bg-slate-50 border-slate-200")}>
                        <h4 className="flex items-center justify-between text-xs font-bold text-slate-200">
                          <span className="flex items-center gap-2">
                            <QrCode className="w-4.5 h-4.5 text-purple-400" />
                            {t.backupCodesTitle}
                          </span>
                          <button className="text-[10px] text-indigo-400 font-extrabold hover:underline">Copy Codes</button>
                        </h4>
                        <p className="text-[9.5px] text-slate-500 leading-tight">{t.backupCodesDesc}</p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10.5px] bg-[#0c0e18] p-3 rounded-lg text-center border border-slate-800/60 font-extrabold">
                          {["8A3C-9B1D", "4F6E-2A8C", "7D1B-5E9F", "3C5D-6A7B", "9A2F-8E4C", "1B7D-5A3E", "6F2E-9C4D", "4D8B-1C5A"].map((code, idx) => (
                            <span key={idx} className={idx % 2 === 0 ? "text-slate-300" : "text-slate-400"}>
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Guard Session Limit Time Slider */}
                      <div className={cn("rounded-xl border p-4 flex flex-col space-y-3", isDark ? "bg-[#060810] border-slate-800/80" : "bg-slate-50 border-slate-200")}>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-200">
                          <Sliders className="w-4.5 h-4.5 text-cyan-400" />
                          {t.sessionTimeout}
                        </h4>
                        
                        <div className="flex flex-col justify-between py-1 px-1 bg-[#090b14] border border-slate-800 px-3 py-2 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-indigo-400">{t.timeoutMinutes}</span>
                            <span className="text-[9.5px] text-slate-500">{t.timeoutMinutesDesc}</span>
                          </div>
                          {/* Slider control widget input range */}
                          <input
                            type="range"
                            min="5"
                            max="60"
                            step="5"
                            value={sessionLimit}
                            onChange={(e) => setSessionLimit(Number(e.target.value))}
                            className="w-full accent-indigo-500 cursor-pointer"
                          />
                        </div>
                      </div>

                    </div>
                  )}

                  {/* STEP 4: Role access levels Selection (سطح دسترسی) */}
                  {currentStep === 3 && (
                    <div className="flex flex-col space-y-3.5 animate-fadeIn">
                      <h4 className="text-right ltr:text-left text-xs font-bold text-slate-400 flex items-center gap-2">
                        <UserCheck className="w-4.5 h-4.5 text-purple-400" />
                        {t.rbacTitle}
                      </h4>

                      {/* Select Role Matrix list of card buttons */}
                      <div className="flex flex-col space-y-2">
                        {[
                          { lv: 1, title: t.level1Title, desc: t.level1Desc },
                          { lv: 2, title: t.level2Title, desc: t.level2Desc },
                          { lv: 3, title: t.level3Title, desc: t.level3Desc },
                          { lv: 4, title: t.level4Title, desc: t.level4Desc },
                        ].map((role) => {
                          const isRoleSelected = accessLevel === role.lv;

                          return (
                            <button
                              key={role.lv}
                              onClick={() => setAccessLevel(role.lv)}
                              className={cn(
                                "w-full text-right ltr:text-left p-3 border rounded-xl flex items-center justify-between transition-all focus:outline-none relative",
                                isRoleSelected
                                  ? "bg-[#0d1228] border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                  : isDark
                                  ? "bg-[#060810] border-slate-800/80 text-slate-400 hover:border-slate-700"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              )}
                              id={`rbac-level-card-${role.lv}`}
                            >
                              {/* Glowing stripe check indicator */}
                              {isRoleSelected && (
                                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-l-md rtl:left-auto rtl:right-0 rtl:rounded-l-none rtl:rounded-r-md" />
                              )}

                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center font-mono font-extrabold text-xs shrink-0",
                                    isRoleSelected
                                      ? "bg-indigo-500/10 text-indigo-400"
                                      : isDark
                                      ? "bg-[#0e121d] text-slate-500"
                                      : "bg-white text-slate-400 border border-slate-200"
                                  )}
                                >
                                  L{role.lv}
                                </div>
                                <div className="flex flex-col text-right ltr:text-left">
                                  <span className={cn("text-xs font-bold", isRoleSelected ? "text-indigo-300" : "text-slate-300")}>
                                    {role.title}
                                  </span>
                                  <span className="text-[10px] text-slate-500 leading-tight block truncate max-w-lg">
                                    {role.desc}
                                  </span>
                                </div>
                              </div>

                              {/* Checked validation indicator */}
                              <div
                                className={cn(
                                  "w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0",
                                  isRoleSelected ? "border-indigo-400 bg-indigo-505" : isDark ? "border-slate-800" : "border-slate-300"
                                )}
                              >
                                {isRoleSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 5: Final Review Document with digital signature (تأیید نهایی) */}
                  {currentStep === 4 && (
                    <div className="flex flex-col space-y-4 animate-fadeIn">
                      
                      {/* Document report viewer box */}
                      <div className={cn("rounded-xl border p-4 flex flex-col space-y-2 relative overflow-hidden", isDark ? "bg-[#060810] border-slate-800/80" : "bg-slate-50 border-slate-200")}>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800/60 pb-1.5">
                          <FileText className="w-4.5 h-4.5 text-indigo-400" />
                          {t.finalConfirmTitle}
                        </h4>
                        <p className="text-[9px] text-slate-500 leading-tight font-sans block">{t.finalDocDesc}</p>

                        <div className="grid grid-cols-2 gap-3 text-[11px] font-mono leading-relaxed pt-1.5 p-3 rounded bg-slate-950/90 text-slate-300 border border-slate-800/60">
                          <div>
                            <span className="text-slate-500 block">CREATION DATE:</span>
                            <span className="font-bold text-slate-200">2026-05-30 UTC</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">USER MEMBER:</span>
                            <span className="font-bold text-slate-200">{fullName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">IDENTITY IP STATE:</span>
                            <span className="font-bold text-cyan-400">Tehran (109.125.19.4)</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">ISSUED PERMIT TIER:</span>
                            <span className="font-bold text-purple-400">LEVEL {accessLevel} TIER AUTHORIZATION</span>
                          </div>
                        </div>
                      </div>

                      {/* User Signatures Canvas Block */}
                      <div className={cn("rounded-xl border p-4 flex flex-col space-y-2", isDark ? "bg-[#060810] border-slate-800/80" : "bg-slate-50 border-slate-200")}>
                        <h4 className="flex justify-between items-center text-xs font-bold text-slate-200">
                          <span className="flex items-center gap-2">
                            <Edit2 className="w-4.5 h-4.5 text-amber-500" />
                            {t.userSignature}
                          </span>
                          {signatureDone && (
                            <span className="text-[9.5px] px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              {t.signatureOk}
                            </span>
                          )}
                        </h4>
                        <p className="text-[10.5px] text-slate-500 leading-snug">{t.signatureDesc}</p>

                        {/* Interactive Signature Canvas Box */}
                        <div className="relative w-full h-32 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                          {/* Simulated Canvas Sandbox */}
                          <canvas
                            ref={signatureCanvasRef}
                            width={540}
                            height={120}
                            className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawingTouch}
                            onTouchMove={drawTouch}
                            onTouchEnd={stopDrawing}
                          />
                          
                          {/* Simulated signature image overlay if user didn't draw but has default active mockup */}
                          {!isDrawing && signatureDone && !signatureCleared && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                              <svg className="w-56 h-20 text-[#4f46e5]/80" viewBox="0 0 200 60" fill="none">
                                <path d="M10 35 C 50 10, 80 50, 100 25 C 130 5, 140 55, 180 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                <path d="M40 45 L 160 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </div>
                          )}

                          {/* Placeholder helper instructions */}
                          {!signatureDone && (
                            <span className="text-slate-600 text-[10.5px] font-bold pointer-events-none font-mono">
                              SIGNATURE_SANDBOX_ID_ACTIVE
                            </span>
                          )}
                        </div>

                        {/* Signature Clear/Save controls buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-1.5">
                          <button
                            onClick={clearSignatureCanvas}
                            className="px-4 py-1.5 bg-[#0e1017] border border-slate-800 hover:border-slate-700 hover:text-white rounded text-[10px] font-bold transition-colors focus:outline-none"
                            id="clear-signature-button"
                          >
                            {t.clearSignature}
                          </button>
                          <button
                            onClick={() => setSignatureDone(true)}
                            className="px-4 py-1.5 bg-indigo-600/20 border border-indigo-500/40 hover:bg-slate-900 font-extrabold text-[10px] text-indigo-400 rounded transition-colors focus:outline-none"
                          >
                            {t.saveSignature}
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Form Footer Buttons section */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-1">
                  {/* Cancel Back */}
                  <button
                    onClick={handleCancelBack}
                    className={cn(
                      "px-5 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none",
                      isDark ? "border-slate-800 hover:border-slate-700 hover:bg-slate-900/50" : "border-slate-300 hover:border-slate-400 text-slate-700 bg-white"
                    )}
                    id="cancel-back-flow-btn"
                  >
                    {currentStep === 0 ? t.cancel : lang === "fa" ? "مرحله قبلی" : "Previous Step"}
                  </button>

                  {/* Continue step triggers */}
                  <button
                    onClick={handleContinue}
                    className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-[0_0_18px_rgba(124,58,237,0.35)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all cursor-pointer focus:outline-none"
                    id="continue-flow-btn"
                  >
                    <span>{currentStep === 4 ? t.issueLicenseBtn : t.continue}</span>
                    <span className={cn("transition-transform", isRtl ? "rotate-180" : "")}>➔</span>
                  </button>
                </div>

              </div>
            </div>

            {/* COLUMN 3 (LG:3): Right side secure visual widget panel */}
            <div className="lg:col-span-3 flex flex-col space-y-4">
              
              {/* Card 1: Futuristic Glow Shield/Finger Illustration with SVG Grid nodes */}
              <div className={cn("rounded-xl border p-4 shadow-xl overflow-hidden relative min-h-[170px] flex flex-col items-center justify-center", isDark ? "bg-[#090b14]/80 border-[#1a1f33] backdrop-blur-md" : "bg-white border-slate-200")}>
                {/* Visual SVG node points mapping grid */}
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="10" y1="10" x2="90" y2="90" stroke="#6366f1" strokeWidth="0.5" />
                    <line x1="90" y1="10" x2="10" y2="90" stroke="#a855f7" strokeWidth="0.5" strokeDasharray="3 3" />
                  </svg>
                </div>

                <div className="relative flex items-center justify-center py-4">
                  {/* Glowing core halo behind */}
                  <div className="absolute w-24 h-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-2xl opacity-25" />
                  
                  {/* Encircling node loops */}
                  <div className="w-20 h-20 rounded-full border border-dashed border-indigo-500/40 animate-[spin_10s_linear_infinite] flex items-center justify-center relative">
                    <div className="w-16 h-16 rounded-full border border-dashed border-purple-500/30 animate-[spin_5s_reverse_linear_infinite]" />
                  </div>

                  {/* Fingerprint inside central secure shield badge */}
                  <div className="absolute w-12 h-12 rounded-lg bg-[#0b0f19] border border-indigo-400 flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                  </div>
                </div>

                <span className="text-[9.5px] font-mono font-bold text-slate-500 tracking-widest uppercase mt-1">
                  BIOMETRIC_MATRIX_LOCK: TRUE
                </span>
              </div>

              {/* Card 2: Interactive live security telemetry feeds */}
              <div className={cn("rounded-xl border p-4 flex flex-col space-y-3 shadow-xl", isDark ? "bg-[#090b14]/80 border-[#1a1f33] backdrop-blur-md" : "bg-white border-slate-200")}>
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <h3 className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-2", isDark ? "text-white" : "text-slate-800")}>
                    <Shield className="w-4.5 h-4.5 text-indigo-400" />
                    {t.realtimeSecurityCheck}
                  </h3>
                </div>

                <div className="flex flex-col space-y-2 text-[11px] font-medium">
                  {[
                    { label: t.ipReputation, val: t.goodStatus },
                    { label: t.deviceFingerprint, val: t.verifiedStatus },
                    { label: t.browserIntegrity, val: t.secureStatus },
                    { label: t.locationLabel, val: t.locationValue },
                    { label: t.threatDetection, val: t.noThreatFound, safe: true },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex justify-between items-center p-2 rounded-lg border",
                        isDark ? "bg-[#060810] border-slate-800/60" : "bg-slate-50 border-slate-200"
                      )}
                    >
                      <span className="text-slate-500 text-[10.5px]">{row.label}</span>
                      <span
                        className={cn(
                          "text-[10px] font-bold flex items-center gap-1.5",
                          row.safe ? "text-emerald-400" : "text-indigo-300"
                        )}
                      >
                        {row.val}
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Live Sync user information card */}
              <div className={cn("rounded-xl border p-4 flex flex-col space-y-4 shadow-xl", isDark ? "bg-[#090b14]/80 border-[#1a1f33] backdrop-blur-md" : "bg-white border-slate-200")}>
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <h3 className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-2", isDark ? "text-white" : "text-slate-800")}>
                    <User className="w-4.5 h-4.5 text-purple-400" />
                    {t.infoSummaryTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-3.5">
                  {/* Cyber User glowing avatar overlay with click photo camera widget */}
                  <div className="relative group shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-sm opacity-55" />
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                      alt="Digital avatar summary holder"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full border-2 border-indigo-400 object-cover relative z-10"
                    />
                    <button className="absolute -bottom-1 -right-1 bg-indigo-500 hover:bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center border border-slate-900 z-20 shadow cursor-pointer transition-colors">
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Sync profiles credentials summary */}
                  <div className="flex flex-col text-right ltr:text-left text-xs truncate">
                    <span className={cn("font-bold text-sm", isDark ? "text-white" : "text-slate-900")}>{fullName || "علی محمدی"}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{emailAddress || "ali.mohammedi@example.com"}</span>
                    <span className="text-[10.5px] text-slate-400 block font-mono mt-0.5" dir="ltr">
                      {phoneNumber ? `+98 ${phoneNumber}` : "+98 912 345 6789"}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{countryVal}، تهران</span>
                  </div>
                </div>

                <div className="h-px bg-slate-800/70" />

                {/* Account Type and Access default roles badge mapping */}
                <div className="flex flex-col space-y-2.5">
                  {/* Sync Selected type */}
                  <div className={cn("flex justify-between items-center p-2 rounded-lg border text-[11px]", isDark ? "bg-[#060810] border-slate-800/50" : "bg-slate-50 border-slate-200")}>
                    <span className="text-slate-500">{t.selectedAccountType}</span>
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      {getAccountTypeTitle(accountType)}
                    </span>
                  </div>

                  {/* Sync Default access levels role matrix indicator */}
                  <div className={cn("flex justify-between items-center p-2 rounded-lg border text-[11px]", isDark ? "bg-[#060810] border-slate-800/50" : "bg-slate-50 border-slate-200")}>
                    <span className="text-slate-500">{t.defaultAccessLevel}</span>
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      Level {accessLevel}
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
