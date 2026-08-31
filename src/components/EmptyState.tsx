import { useState } from "react";
import { Templates } from "./Templates";

interface EmptyStateProps {
  onSelectTemplate: (tables: any[]) => void;
}

export function EmptyState({ onSelectTemplate }: EmptyStateProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <>
      <div className="empty-state">
        <div className="empty-state-icon">🧩</div>
        <h2 className="empty-state-title">مرحباً بك في Edaad Schema Architect</h2>
        <p className="empty-state-desc">
          افتح ChatGPT على جهازك وأخبره بما تريد بناءه،<br/>
          وسيقوم بإنشاء مخطط قاعدة البيانات هنا تلقائياً!
        </p>
        <button className="tb-btn tb-btn-purple" style={{ fontSize: "14px", padding: "10px 24px" }} onClick={() => setShowTemplates(true)}>
          📋 ابدأ من قالب جاهز
        </button>
        <div className="empty-state-examples">
          <div className="example-card">
            <span className="example-icon">💬</span>
            <p>"أنشئ مخطط لنظام تجارة إلكترونية فيه users و products و orders"</p>
          </div>
          <div className="example-card">
            <span className="example-icon">💬</span>
            <p>"Create a blog schema with posts, comments, and tags tables"</p>
          </div>
          <div className="example-card">
            <span className="example-icon">💬</span>
            <p>"صمم قاعدة بيانات لتطبيق توصيل طعام مع العلاقات بين الجداول"</p>
          </div>
        </div>
        <div className="webmcp-badge">⚡ مدعوم بـ WebMCP + ChatGPT</div>
      </div>

      {showTemplates && (
        <Templates onSelect={onSelectTemplate} onClose={() => setShowTemplates(false)} />
      )}
    </>
  );
}
