import React, { useState } from "react";
import {
  Search,
  Bell,
  Globe,
  Moon,
  BookOpen,
  ChevronDown,
  UserSquare,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function TopNav() {
  const { t, i18n } = useTranslation();

  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="h-16 border-b border-dash-border bg-dash-bg flex items-center justify-between px-6 sticky top-0 z-20 shrink-0">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full max-w-md bg-dash-panel border border-dash-border rounded-md pl-9 pr-12 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors shadow-sm ltr:pl-9 rtl:pr-9 rtl:pl-12"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rtl:left-2 rtl:right-auto">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        <Link
          to="/login"
          className="hidden lg:flex items-center gap-2 bg-indigo-900/40 border border-indigo-500/30 px-3 py-1 rounded text-xs text-indigo-300 font-medium hover:bg-indigo-800/50 transition-colors"
        >
          <UserSquare className="w-3.5 h-3.5" />
          {t("onboardingInfo")}
        </Link>

        {/* Live Indicator */}
        <button className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs text-emerald-400 font-medium hover:bg-slate-800 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {t("live")}
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block"></div>

        {/* Icons */}
        <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white border-2 border-dash-bg">
            12
          </span>
        </button>

        {/* Language Switcher */}
        <div className="relative">
          <button
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => setLangOpen(!langOpen)}
          >
            <Globe className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase ml-1">
              {i18n.language}
            </span>
          </button>

          {langOpen && (
            <div className="absolute top-full right-0 mt-2 w-24 bg-dash-panel border border-dash-border rounded shadow-lg overflow-hidden py-1 z-50">
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => {
                  i18n.changeLanguage("en");
                  setLangOpen(false);
                }}
              >
                English
              </button>
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => {
                  i18n.changeLanguage("fa");
                  setLangOpen(false);
                }}
              >
                فارسی
              </button>
            </div>
          )}
        </div>

        <button className="text-slate-400 hover:text-slate-200 transition-colors hidden sm:block">
          <Moon className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1"></div>

        {/* User Profile */}
        {(() => {
          const cachedUser = localStorage.getItem("cybershield_user");
          let displayName = "John Smith";
          let displayRoleName = t("adminUser");
          if (cachedUser) {
            try {
              const parsed = JSON.parse(cachedUser);
              if (parsed.fullName) displayName = parsed.fullName;
              if (parsed.accountType) {
                const rolesMap: Record<string, string> = {
                  personal: "Standard User",
                  developer: "Developer Account",
                  enterprise: "Enterprise",
                  admin: "Security Admin",
                  owner: "Super Owner"
                };
                displayRoleName = rolesMap[parsed.accountType] || parsed.accountType;
              }
            } catch (e) {}
          }
          return (
            <button className="flex items-center gap-3 text-left group">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden md:block">
                <div className="text-[13px] font-medium text-slate-200 group-hover:text-white transition-colors">
                  {displayName}
                </div>
                <div className="text-[11px] text-slate-500">{displayRoleName}</div>
              </div>
            </button>
          );
        })()}
      </div>
    </header>
  );
}
