import { useState, useEffect } from 'react'
import { SchemaCanvas } from './components/SchemaCanvas'
import { registerWebMCP } from './webmcp-tools'
import './index.css'

function App() {
  const [schema, setSchema] = useState<any[]>([])
  const [prompt, setPrompt] = useState('')
  const [isSimulating, setIsSimulating] = useState(false)

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

  const handleSimulateAI = async () => {
    if (!prompt) return;
    setIsSimulating(true);
    
    // Simulate AI thinking and calling WebMCP tools
    setTimeout(() => {
      const p = prompt.toLowerCase();
      
      if (p.includes('user') || p.includes('product') || p.includes('order')) {
        // Execute tools as an AI would
        // variable removed
        // In a real scenario, the browser intercepts this, but here we just trigger the registered callbacks directly for the demo
        
        setSchema(prev => [
            ...prev.filter(t => !['users','products','orders'].includes(t.tableName)),
            { 
              tableName: 'users', 
              columns: [{ name: 'id', type: 'uuid', isPrimary: true }, { name: 'name', type: 'varchar' }, { name: 'email', type: 'varchar' }],
              relations: [], x: 100, y: 150 
            }
        ]);
        
        setTimeout(() => {
          setSchema(prev => [
              ...prev.filter(t => t.tableName !== 'products'),
              { 
                tableName: 'products', 
                columns: [{ name: 'id', type: 'uuid', isPrimary: true }, { name: 'title', type: 'varchar' }, { name: 'price', type: 'decimal' }],
                relations: [], x: 600, y: 150 
              }
          ]);
          
          setTimeout(() => {
            setSchema(prev => [
                ...prev.filter(t => t.tableName !== 'orders'),
                { 
                  tableName: 'orders', 
                  columns: [{ name: 'id', type: 'uuid', isPrimary: true }, { name: 'user_id', type: 'uuid' }, { name: 'total', type: 'decimal' }],
                  relations: [{ targetTable: 'users' }], x: 350, y: 450 
                }
            ]);
            
            setIsSimulating(false);
          }, 800);
        }, 800);
      } else {
        setIsSimulating(false);
      }
    }, 1000);
  };

  return (
    <>
      <div className="app-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ margin: 0, color: 'var(--accent-color)' }}>✨ Edaad AI Schema Architect</h2>
          <span style={{ background: 'rgba(88, 166, 255, 0.2)', color: 'var(--accent-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>WebMCP Enabled</span>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {schema.length === 0 ? 'التطبيق جاهز لتلقي أوامر WebMCP' : `${schema.length} جداول تم إنشاؤها`}
        </div>
      </div>
      
      {/* Mock AI Panel for Demo Video */}
      <div className="glass-panel" style={{ position: 'absolute', bottom: '20px', right: '20px', width: '350px', padding: '15px', zIndex: 10 }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          🤖 محاكي ChatGPT (لتصوير الهاكاثون)
        </h3>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
          هذا الصندوق يحاكي ما يفعله الذكاء الاصطناعي عند استدعاء أدوات WebMCP.
        </p>
        <textarea 
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="اكتب هنا: Create a users, products, and orders table..."
          style={{ width: '100%', height: '80px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', marginBottom: '10px', fontSize: '13px', fontFamily: 'inherit', resize: 'none' }}
        />
        <button 
          onClick={handleSimulateAI}
          disabled={isSimulating}
          className="btn btn-primary" style={{ width: '100%' }}
        >
          {isSimulating ? '⏳ جاري استدعاء أدوات WebMCP...' : 'إرسال الأمر'}
        </button>
      </div>

      <SchemaCanvas schema={schema} />
    </>
  )
}

export default App
