import { useCallback, useEffect, useRef, useState } from "react";
import { SchemaCanvas } from "./components/SchemaCanvas";
import { WebMCPManager } from "./components/WebMCPManager";
import { Toolbar } from "./components/Toolbar";
import { EmptyState } from "./components/EmptyState";
import { TEMPLATE_ICONS } from "./components/Templates";
import "./index.css";

const MAX_HISTORY = 50;

function loadFromURL(): any[] | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("schema");
    if (!encoded) return null;
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch { return null; }
}

function getValidationWarnings(schema: any[]): string[] {
  const warnings: string[] = [];
  schema.forEach(t => {
    if (!(t.columns ?? []).some((c: any) => c.isPrimary)) {
      warnings.push(`جدول "${t.tableName}" بدون Primary Key`);
    }
  });
  return warnings;
}

function App() {
  const [schema, setSchemaRaw] = useState<any[]>(() => loadFromURL() ?? []);
  const [history, setHistory] = useState<any[][]>([]);
  const [future, setFuture] = useState<any[][]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const fitViewRef = useRef<(() => void) | null>(null);

  // Wrap setSchema to also push to history
  const setSchema = useCallback((updater: any[] | ((prev: any[]) => any[])) => {
    setSchemaRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setHistory(h => [...h.slice(-MAX_HISTORY), prev]);
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture(f => [schema, ...f]);
      setSchemaRaw(prev);
      return h.slice(0, -1);
    });
  }, [schema]);

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory(h => [...h, schema]);
      setSchemaRaw(next);
      return f.slice(1);
    });
  }, [schema]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const warnings = getValidationWarnings(schema);
  const handleClear = () => { setSchema([]); setActiveTemplate(null); };
  const handleFitView = () => fitViewRef.current?.();
  const handleSetSchema = (tables: any[], templateName?: string) => { setSchema(tables); setActiveTemplate(templateName ?? null); };
  const handleImportSchema = (tables: any[]) => {
    setSchema(prev => {
      const merged = [...prev];
      tables.forEach(newTable => {
        const idx = merged.findIndex(t => t.tableName === newTable.tableName);
        if (idx >= 0) merged[idx] = newTable;
        else merged.push(newTable);
      });
      return merged;
    });
  };

  return (
    <>
      <WebMCPManager schema={schema} setSchema={setSchema} setIsSimulating={setIsSimulating} />

      <div className="app-header glass-panel">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2 style={{ margin: 0, color: "var(--accent-color)", fontSize: "18px" }}>
            ✨ Edaad Schema Architect
          </h2>
          <span className="webmcp-pill">WebMCP</span>
          {activeTemplate && (
            <span className="template-active-pill">
              {TEMPLATE_ICONS[activeTemplate] ?? "📋"} {activeTemplate}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="warning-pill" title={warnings.join("\n")}>
              ⚠️ {warnings.length}
            </span>
          )}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          {isSimulating
            ? <span className="ai-thinking">🤖 الذكاء الاصطناعي يعمل...</span>
            : schema.length === 0
              ? "في انتظار أوامر ChatGPT عبر WebMCP"
              : `${schema.length} جداول تم إنشاؤها`}
        </div>
      </div>

      <Toolbar
        schema={schema}
        onClear={handleClear}
        onFitView={handleFitView}
        onUndo={undo}
        onRedo={redo}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onSetSchema={handleSetSchema}
        onImportSchema={handleImportSchema}
      />

      {schema.length === 0 ? (
        <EmptyState onSelectTemplate={handleSetSchema} />
      ) : (
        <SchemaCanvas schema={schema} onFitViewRef={fitViewRef} />
      )}
    </>
  );
}

export default App;
