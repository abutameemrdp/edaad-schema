import { useState, useEffect } from 'react'
import { SchemaCanvas } from './components/SchemaCanvas'
import { registerWebMCP } from './webmcp-tools'
import './index.css'

function App() {
  const [schema, setSchema] = useState<any[]>([])

  useEffect(() => {
    // Register WebMCP Tools when the app loads
    registerWebMCP({
      onCreateTable: async (input: any) => {
        try {
          setSchema(prev => {
            // Check if table already exists
            if (prev.find(t => t.tableName === input.tableName)) {
              return prev.map(t => t.tableName === input.tableName ? { ...t, columns: input.columns, x: input.x || t.x, y: input.y || t.y } : t);
            }
            return [...prev, { tableName: input.tableName, columns: input.columns, relations: [], x: input.x, y: input.y }];
          });
          return { success: true, message: `Table ${input.tableName} created successfully.` };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
      onAddRelation: async (input: any) => {
        try {
          let success = false;
          setSchema(prev => {
            const sourceExists = prev.find(t => t.tableName === input.sourceTable);
            const targetExists = prev.find(t => t.tableName === input.targetTable);
            
            if (!sourceExists || !targetExists) return prev;

            success = true;
            return prev.map(t => {
              if (t.tableName === input.sourceTable) {
                const relations = t.relations || [];
                if (!relations.find((r: any) => r.targetTable === input.targetTable)) {
                  return { ...t, relations: [...relations, { targetTable: input.targetTable }] };
                }
              }
              return t;
            });
          });
          
          if (success) {
            return { success: true, message: `Relation added between ${input.sourceTable} and ${input.targetTable}.` };
          } else {
            return { success: false, error: 'One or both tables not found in schema.' };
          }
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      }
    });
  }, []);

  return (
    <>
      <div className="app-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ margin: 0, color: 'var(--accent-color)' }}>✨ Edaad AI Schema Architect</h2>
          <span style={{ background: 'rgba(88, 166, 255, 0.2)', color: 'var(--accent-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>WebMCP Enabled</span>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {schema.length === 0 ? 'ابدأ بالتحدث مع الذكاء الاصطناعي لإنشاء الجداول' : `${schema.length} جداول تم إنشاؤها`}
        </div>
      </div>
      <SchemaCanvas schema={schema} />
    </>
  )
}

export default App
