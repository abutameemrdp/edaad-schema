export function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">🧩</div>
      <h2 className="empty-state-title">مرحباً بك في Edaad Schema Architect</h2>
      <p className="empty-state-desc">
        افتح ChatGPT على جهازك وأخبره بما تريد بناءه،<br/>
        وسيقوم بإنشاء مخطط قاعدة البيانات هنا تلقائياً!
      </p>
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
      <div className="webmcp-badge">
        <span>⚡ مدعوم بـ WebMCP</span>
      </div>
    </div>
  );
}
