import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import Dashboard from "./components/Dashboard";
import { IdentityOnboarding } from "./components/IdentityOnboarding";

// Layout for the main dashboard so Sidebar and TopNav share it
function DashboardLayout() {
  const [activeTab, setActiveTab] = React.useState<string>("overview");

  return (
    <div className="flex h-screen bg-dash-bg text-slate-300 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0 bg-dash-bg">
        <TopNav />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<IdentityOnboarding />} />
      <Route path="/dashboard" element={<DashboardLayout />} />
    </Routes>
  );
}
