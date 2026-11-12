import "./globals.css";
import React from "react";

export const metadata = {
  title: "Sneaker Legit Check Study - CSE 594 Assignment 3",
  description: "Human-AI Interaction Experiment on Sneaker Authentication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)", padding: "14px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>👟</span>
              <span style={{ fontWeight: 800, letterSpacing: "-0.02em", fontSize: 18 }}>
                SNEAKER<span style={{ color: "var(--accent-cyan)" }}>AUTH</span> LAB
              </span>
              <span className="badge badge-blue" style={{ marginLeft: 8 }}>CSE 594 STUDY</span>
            </div>
            <nav style={{ display: "flex", gap: 16, fontSize: 14, color: "var(--text-muted)" }}>
              <a href="/" style={{ color: "var(--text-main)" }}>Hub</a>
              <a href="/without-ai">Without AI</a>
              <a href="/with-ai">With AI</a>
              <a href="/admin">Admin / Export</a>
            </nav>
          </div>
        </header>

        <main style={{ flex: 1 }}>{children}</main>

        <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)", padding: "16px 24px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          CSE 594: Designing AI-Assisted Tasks • Fall 2026 • University Research Study
        </footer>
      </body>
    </html>
  );
}

