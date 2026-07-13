import { Bell, ChevronDown, Languages } from "lucide-react";

export default function Topbar({ language, setLanguage, t }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo-mark" aria-hidden="true"><span>F</span></div>
        <div className="brand-copy">
          <strong>{t("product")}</strong>
          <span>{t("productCaption")}</span>
        </div>
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="language-button"
          onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
          aria-label="Switch language"
        >
          <Languages size={17} />
          <span>{t("language")}</span>
        </button>
        <button type="button" className="icon-button" aria-label="Notifications">
          <Bell size={19} />
          <span className="notification-dot" />
        </button>
        <button type="button" className="profile-button">
          <span className="avatar">LC</span>
          <span className="profile-copy"><strong>Louis Chen</strong><small>{t("operator")}</small></span>
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}
