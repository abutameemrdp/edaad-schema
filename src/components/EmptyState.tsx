import { useState } from "react";
import { Templates } from "./Templates";

interface EmptyStateProps {
  onSelectTemplate: (tables: any[], name: string) => void;
}

const PROMPTS = [
  { icon: "🛒", text: "\"Build an e-commerce schema with users, products, orders and reviews\"" },
  { icon: "📝", text: "\"Create a blog platform with posts, comments, tags and authors\"" },
  { icon: "🏢", text: "\"Design a multi-tenant SaaS schema with organizations, users and subscriptions\"" },
  { icon: "📱", text: "\"Build a food delivery schema with restaurants, products and orders\"" },
  { icon: "🏥", text: "\"Build a hospital management schema with patients, doctors and appointments\"" },
  { icon: "📥", text: "\"Import this SQL file and fix the missing relations: [paste SQL]\"" },
];

const STEPS = [
  { num: "1", label: "Open ChatGPT", sub: "in browser with WebMCP enabled" },
  { num: "2", label: "Describe your schema", sub: "in plain language" },
  { num: "3", label: "Watch it build", sub: "live on the canvas" },
];

export function EmptyState({ onSelectTemplate }: EmptyStateProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [activePrompt, setActivePrompt] = useState<number | null>(null);

  return (
    <>
      <div className="empty-state">

        {/* Hero */}
        <div className="empty-hero">
          <div className="empty-state-icon">🧩</div>
          <h1 className="empty-state-title">Edaad Schema Architect</h1>
          <p className="empty-state-subtitle">
            AI-powered database design — where ChatGPT and humans build together in real time
          </p>
          <div className="webmcp-badge-hero">
            <span className="webmcp-dot"></span>
            WebMCP Ready — 16 tools available to ChatGPT
          </div>
        </div>

        {/* How it works */}
        <div className="empty-steps">
          {STEPS.map(s => (
            <div className="empty-step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <div>
                <div className="step-label">{s.label}</div>
                <div className="step-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Example prompts */}
        <div className="empty-prompts-title">Try saying to ChatGPT:</div>
        <div className="empty-prompts-grid">
          {PROMPTS.map((p, i) => (
            <div
              key={i}
              className={`prompt-card ${activePrompt === i ? "prompt-card-active" : ""}`}
              onClick={() => setActivePrompt(i === activePrompt ? null : i)}
            >
              <span className="prompt-icon">{p.icon}</span>
              <span className="prompt-text">{p.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="empty-cta-row">
          <button
            className="tb-btn tb-btn-purple"
            style={{ fontSize: "14px", padding: "10px 28px" }}
            onClick={() => setShowTemplates(true)}
          >
            📋 Start from a template
          </button>
          <span className="empty-or">or ask ChatGPT to build one</span>
        </div>

      </div>

      {showTemplates && (
        <Templates onSelect={onSelectTemplate} onClose={() => setShowTemplates(false)} />
      )}
    </>
  );
}
