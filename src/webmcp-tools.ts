export const webmcpTools = [
  {
    name: 'create_table',
    description: 'Create a new database table in the visual schema designer.',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: { type: 'string', description: 'Name of the table' },
        columns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string' },
              isPrimary: { type: 'boolean' }
            },
            required: ['name', 'type']
          }
        },
        x: { type: 'number', description: 'Optional X position on canvas (0-1000)' },
        y: { type: 'number', description: 'Optional Y position on canvas (0-1000)' }
      },
      required: ['tableName', 'columns']
    }
  },
  {
    name: 'add_relation',
    description: 'Add a foreign key relationship between two tables.',
    inputSchema: {
      type: 'object',
      properties: {
        sourceTable: { type: 'string', description: 'The table containing the foreign key' },
        targetTable: { type: 'string', description: 'The table being referenced' }
      },
      required: ['sourceTable', 'targetTable']
    }
  }
];

export function registerWebMCP(callbacks: any) {
  if (typeof window !== 'undefined') {
    const doc = (window as any).document;
    const nav = (window as any).navigator;
    
    if (doc && !doc.modelContext) doc.modelContext = {};
    if (nav && !nav.modelContext) nav.modelContext = {};
    
    const registerTool = (tool: any) => {
      console.log('Registered WebMCP tool:', tool.name);
    };

    if (doc && !doc.modelContext.registerTool) doc.modelContext.registerTool = registerTool;
    if (nav && !nav.modelContext.registerTool) nav.modelContext.registerTool = registerTool;

    webmcpTools.forEach(toolDef => {
      const toolImpl = {
        ...toolDef,
        execute: async (input: any) => {
          if (toolDef.name === 'create_table' && callbacks.onCreateTable) {
            return await callbacks.onCreateTable(input);
          }
          if (toolDef.name === 'add_relation' && callbacks.onAddRelation) {
            return await callbacks.onAddRelation(input);
          }
          return { success: false, error: 'Tool not implemented' };
        }
      };
      
      if (doc) doc.modelContext.registerTool(toolImpl);
      if (nav) nav.modelContext.registerTool(toolImpl);
    });
  }
}
