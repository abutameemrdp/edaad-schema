import { useState } from 'react'
import { SchemaCanvas } from './components/SchemaCanvas'
import { WebMCPManager } from './components/WebMCPManager'
import './index.css'

function App() {
  const [schema, setSchema] = useState<any[]>([])
  const [prompt, setPrompt] = useState('')
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSimulateAI = async () => {
    if (!prompt) return;
    setIsSimulating(true);
    
    // Simulate AI thinking and calling WebMCP tools
    setTimeout(() => {
      const p = prompt.toLowerCase();
      
      if (p.includes('user') || p.includes('product') || p.includes('order')) {
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
      <WebMCPManager schema={schema} setSchema={setSchema} setIsSimulating={setIsSimulating} />
      
      <div className="app-header glass-panel" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ margin: 0, color: 'var(--accent-color)' }}>✨ Edaad AI Schema Architect</h2>
          <span style={{ background: 'rgba(88, 166, 255, 0.2)', color: 'var(--accent-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>WebMCP Ready</span>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isSimulating ? <span className="ai-thinking">🤖 AI is thinking...</span> : schema.length === 0 ? 'التطبيق جاهز لتلقي أوامر WebMCP' : `${schema.length} جداول تم إنشاؤها`}
        </div>
      </div>
      
      {/* Mock AI Panel for Demo Video */}
      <div className="glass-panel" style={{ position: 'absolute', bottom: '20px', right: '20px', width: '350px', padding: '15px', zIndex: 10 }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          🤖 محاكي ChatGPT (لتصوير الهاكاثون)
        </h3>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
          هذا الصندوق يحاكي ما يفعله الذكاء الاصطناعي عند استدعاء أدوات WebMCP. يمكنك أيضاً استخدام ChatGPT الحقيقي من الموبايل.
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
