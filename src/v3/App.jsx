import { useState } from "react";
import { AppProvider, useApp } from "./context.jsx";
import { ErrorBoundary, Notice, Sidebar, Topbar } from "./Shell.jsx";
import CheckinPage from "./CheckinPage.jsx";
import EventManagementPage from "./EventManagementPage.jsx";
import { EarlyBirdPage, HistoryPage, LotteryPage, MaterialsPage, ReportsPage, SurveyPage } from "./OperationsPages.jsx";
import "./styles.css";

const pages = {
  checkin: CheckinPage,
  history: HistoryPage,
  events: EventManagementPage,
  materials: MaterialsPage,
  reports: ReportsPage,
  survey: SurveyPage,
  earlybird: EarlyBirdPage,
  lottery: LotteryPage,
};

function AppShell() {
  const { page } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const Page = pages[page] || CheckinPage;
  return <div className="ec-app">
    <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
    {mobileOpen && <button className="mobile-scrim" type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
    <div className="ec-main"><Topbar onMenu={() => setMobileOpen(true)} /><main className="ec-content"><Notice /><Page /></main></div>
  </div>;
}

export default function App() {
  return <ErrorBoundary><AppProvider><AppShell /></AppProvider></ErrorBoundary>;
}
