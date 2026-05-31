import React from "react";
import {
  Home,
  Shield,
  Target,
  Activity,
  Flame,
  Network,
  Globe,
  Users,
  Clock,
  Smartphone,
  Route,
  Radio,
  List,
  Database,
  FileText,
  Key,
  BarChart2,
  Book,
  Wrench,
  Settings,
  CreditCard,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

export function Sidebar({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const { t } = useTranslation();
  const [ipIntelOpen, setIpIntelOpen] = React.useState(true);

  // Auto-expand IP Intelligence group if any of its children are active
  React.useEffect(() => {
    const ipIntelSubTabs = [
      "ipIntelligence",
      "networkAnalysis",
      "threatIntelligence",
      "asnExplorer",
      "domainAnalysis",
    ];
    if (ipIntelSubTabs.includes(activeTab)) {
      setIpIntelOpen(true);
    }
  }, [activeTab]);

  return (
    <aside className="w-64 border-r border-dash-border bg-dash-panel flex flex-col h-screen overflow-y-auto custom-scrollbar flex-shrink-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center gap-3 px-6 shrink-0 border-b border-transparent">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]">
          P
        </div>
        <span className="font-semibold text-white tracking-wide text-[17px]">
          Passport
        </span>
      </div>

      {/* Main Nav */}
      <div className="p-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-right ltr:text-left focus:outline-none",
            activeTab === "overview"
              ? "bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-400 font-bold"
              : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
          )}
        >
          <Home className={cn("w-4 h-4", activeTab === "overview" ? "text-indigo-400" : "text-slate-500")} />
          <span className="text-sm">{t("overview")}</span>
        </button>
      </div>

      {/* Sections */}
      <div className="flex-1 pb-6 space-y-5">
        {/* INTELLIGENCE */}
        <div>
          <h3 className="px-6 text-[11px] font-semibold text-slate-500 tracking-wider mb-2">
            {t("intelligence")}
          </h3>
          <div className="space-y-0.5 px-3">
            <NavItem 
              icon={Shield} 
              label={t("riskEngine")} 
              slug="riskEngine" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("riskEngine")} 
            />
            <NavItem 
              icon={Target} 
              label={t("ipIntelligence")} 
              slug="ipIntelligence" 
              activeTab={activeTab} 
              onClick={() => {
                setActiveTab("ipIntelligence");
                setIpIntelOpen(!ipIntelOpen);
              }} 
              hasDropdown 
              isDropdownOpen={ipIntelOpen}
            />
            {ipIntelOpen && (
              <div className="relative ltr:ml-3 rtl:mr-3 ltr:pl-3.5 rtl:pr-3.5 ltr:border-l rtl:border-r border-slate-800/80 my-1 space-y-1">
                <NavItem 
                  icon={Activity} 
                  label={t("networkAnalysis")} 
                  slug="networkAnalysis" 
                  activeTab={activeTab} 
                  onClick={() => setActiveTab("networkAnalysis")} 
                  isSubItem
                />
                <NavItem 
                  icon={Flame} 
                  label={t("threatIntelligence")} 
                  slug="threatIntelligence" 
                  activeTab={activeTab} 
                  onClick={() => setActiveTab("threatIntelligence")} 
                  isSubItem
                />
                <NavItem 
                  icon={Network} 
                  label={t("asnExplorer")} 
                  slug="asnExplorer" 
                  activeTab={activeTab} 
                  onClick={() => setActiveTab("asnExplorer")} 
                  isSubItem
                />
                <NavItem 
                  icon={Globe} 
                  label={t("domainAnalysis")} 
                  slug="domainAnalysis" 
                  activeTab={activeTab} 
                  onClick={() => setActiveTab("domainAnalysis")} 
                  isSubItem
                />
              </div>
            )}
          </div>
        </div>

        {/* BEHAVIORAL */}
        <div>
          <h3 className="px-6 text-[11px] font-semibold text-slate-500 tracking-wider mb-2">
            {t("behavioral")}
          </h3>
          <div className="space-y-0.5 px-3">
            <NavItem 
              icon={Users} 
              label={t("behaviorAnalytics")} 
              slug="behaviorAnalytics" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("behaviorAnalytics")} 
            />
            <NavItem 
              icon={Clock} 
              label={t("sessions")} 
              slug="sessions" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("sessions")} 
            />
            <NavItem 
              icon={Smartphone} 
              label={t("deviceFingerprints")} 
              slug="deviceFingerprints" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("deviceFingerprints")} 
            />
            <NavItem 
              icon={Route} 
              label={t("userJourneys")} 
              slug="userJourneys" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("userJourneys")} 
            />
          </div>
        </div>

        {/* DATA & EVENTS */}
        <div>
          <h3 className="px-6 text-[11px] font-semibold text-slate-500 tracking-wider mb-2">
            {t("dataAndEvents")}
          </h3>
          <div className="space-y-0.5 px-3">
            <NavItem 
              icon={Radio} 
              label={t("liveEvents")} 
              slug="liveEvents" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("liveEvents")} 
              badge="LIVE" 
            />
            <NavItem 
              icon={List} 
              label={t("eventExplorer")} 
              slug="eventExplorer" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("eventExplorer")} 
            />
            <NavItem 
              icon={Database} 
              label={t("dataStreams")} 
              slug="dataStreams" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("dataStreams")} 
            />
            <NavItem 
              icon={FileText} 
              label={t("auditLogs")} 
              slug="auditLogs" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("auditLogs")} 
            />
          </div>
        </div>

        {/* DEVELOPER */}
        <div>
          <h3 className="px-6 text-[11px] font-semibold text-slate-500 tracking-wider mb-2">
            {t("developer")}
          </h3>
          <div className="space-y-0.5 px-3">
            <NavItem 
              icon={Key} 
              label={t("apiKeys")} 
              slug="apiKeys" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("apiKeys")} 
            />
            <NavItem 
              icon={BarChart2} 
              label={t("apiUsage")} 
              slug="apiUsage" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("apiUsage")} 
            />
            <NavItem 
              icon={Book} 
              label={t("documentation")} 
              slug="documentation" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("documentation")} 
            />
            <NavItem 
              icon={Wrench} 
              label={t("sdksAndTools")} 
              slug="sdksAndTools" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("sdksAndTools")} 
            />
          </div>
        </div>

        {/* ADMIN */}
        <div>
          <h3 className="px-6 text-[11px] font-semibold text-slate-500 tracking-wider mb-2">
            {t("admin")}
          </h3>
          <div className="space-y-0.5 px-3">
            <NavItem 
              icon={Users} 
              label={t("usersAndTeams")} 
              slug="usersAndTeams" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("settings")} 
            />
            <NavItem 
              icon={CreditCard} 
              label={t("billingAndPlans")} 
              slug="billingAndPlans" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("settings")} 
            />
            <NavItem 
              icon={Settings} 
              label={t("settings")} 
              slug="settings" 
              activeTab={activeTab} 
              onClick={() => setActiveTab("settings")} 
            />
          </div>
        </div>
      </div>

      {/* Bottom Plan Status */}
      <div className="mt-auto shrink-0 p-4 border-t border-dash-border">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-slate-400">{t("currentPlan")}</div>
          <ChevronRight className="w-3 h-3 text-slate-500 rtl:rotate-180" />
        </div>
        <div className="text-sm font-medium text-slate-200 mb-3">
          {t("enterprise")}
        </div>

        <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
          <span>{t("apiRequests")}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
          <span>12.4M / 50M</span>
          <span className="text-slate-500">24%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4 relative">
          <div className="h-full bg-indigo-500 rounded-full w-[24%] absolute rtl:right-0"></div>
        </div>

        <button className="w-full py-1.5 flex items-center justify-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
          {t("managePlan")} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  icon: Icon,
  label,
  slug,
  activeTab,
  onClick,
  hasDropdown,
  badge,
  isDropdownOpen,
  isSubItem,
}: {
  icon: any;
  label: string;
  slug: string;
  activeTab: string;
  onClick: () => void;
  hasDropdown?: boolean;
  badge?: string;
  isDropdownOpen?: boolean;
  isSubItem?: boolean;
}) {
  const isActive = activeTab === slug;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between rounded-md transition-all text-right ltr:text-left focus:outline-none group",
        isSubItem ? "px-3.5 py-1.5 text-xs text-slate-300" : "px-3 py-2 text-[13px] font-medium",
        isActive
          ? "bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500 rtl:border-l-0 rtl:border-r-2 rtl:border-indigo-500"
          : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={cn(
            isSubItem ? "w-3.5 h-3.5" : "w-4 h-4",
            "transition-colors",
            isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
          )}
        />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="bg-indigo-600/20 border border-indigo-505/30 text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none pt-1">
            {badge}
          </span>
        )}
        {hasDropdown && (
          <ChevronDown
            className={cn(
              "w-3 h-3 text-slate-500 transition-transform duration-200",
              isDropdownOpen ? "transform rotate-180" : ""
            )}
          />
        )}
      </div>
    </button>
  );
}
