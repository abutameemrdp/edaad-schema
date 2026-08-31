import { useState } from 'react'
import { SchemaCanvas } from './components/SchemaCanvas'
import { WebMCPManager } from './components/WebMCPManager'
import './index.css'

function App() {
  const [schema, setSchema] = useState<any[]>([])
  const [isSimulating, setIsSimulating] = useState(false)

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

      <SchemaCanvas schema={schema} />
    </>
  )
}

export default App
