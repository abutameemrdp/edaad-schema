import { useRef, useState } from "react";
import { SchemaCanvas } from "./components/SchemaCanvas";
import { WebMCPManager } from "./components/WebMCPManager";
import { Toolbar } from "./components/Toolbar";
import { EmptyState } from "./components/EmptyState";
import "./index.css";

function App() {
  const [schema, setSchema] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const fitViewRef = useRef<(() => void) | null>(null);

  const handleClear = () => setSchema([]);
  const handleFitView = () => fitViewRef.current?.();

  return (
    <>
      <WebMCPManager schema={schema} setSchema={setSchema} setIsSimulating={setIsSimulating} />

      <div className="app-header glass-panel">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2 style={{ margin: 0, color: "var(--accent-color)", fontSize: "18px" }}>
            ✨ Edaad Schema Architect
          </h2>
          <span className="webmcp-pill">WebMCP</span>
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          {isSimulating
            ? <span className="ai-thinking">🤖 الذكاء الاصطناعي يعمل...</span>
            : schema.length === 0
              ? "في انتظار أوامر ChatGPT عبر WebMCP"
              : `${schema.length} جداول تم إنشاؤها`}
        </div>
      </div>

      <Toolbar schema={schema} onClear={handleClear} onFitView={handleFitView} />

      {schema.length === 0 ? (
        <EmptyState />
      ) : (
        <SchemaCanvas schema={schema} onFitViewRef={fitViewRef} />
      )}
    </>
  );
}

export default App;
