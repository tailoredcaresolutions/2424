import React from "react";
import { useI18n } from "../LanguageProvider";

const WelcomeScreen = ({ onStart }) => {
  const { t } = useI18n();
  return (
    <div style={{ paddingTop: 60 }}>
      <h1>Welcome to the PSW Voice Reporting System</h1>
      <p style={{ color: "#1B365D", fontSize: "1.2em", fontWeight: "bold" }}>Tailored Care Solutions</p>
      <button style={{ background: "#1B365D", color: "#fff" }} onClick={onStart}>
        {t.start}
      </button>
    </div>
  );
};

export default WelcomeScreen;
