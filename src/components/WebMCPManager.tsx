import { useWebMCP } from 'use-webmcp-tool';

interface WebMCPManagerProps {
  schema: any[];
  setSchema: React.Dispatch<React.SetStateAction<any[]>>;
  setIsSimulating: React.Dispatch<React.SetStateAction<boolean>>;
}

export function WebMCPManager({ schema, setSchema, setIsSimulating }: WebMCPManagerProps) {
  // 1. Create Table Tool
  useWebMCP({
    name: 'create_table',
    description: 'Create a new database table in the visual schema designer.',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: { type: 'string', description: 'Name of the table (e.g. users, products)' },
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
    },
    execute: async (input: any) => {
      setIsSimulating(true);
      let message = '';
      setSchema(prev => {
        if (prev.find(t => t.tableName === input.tableName)) {
          message = `Table ${input.tableName} updated successfully.`;
          return prev.map(t => t.tableName === input.tableName ? { ...t, columns: input.columns, x: input.x || t.x, y: input.y || t.y } : t);
        }
        message = `Table ${input.tableName} created successfully.`;
        return [...prev, { tableName: input.tableName, columns: input.columns, relations: [], x: input.x || Math.floor(Math.random()*500), y: input.y || Math.floor(Math.random()*500) }];
      });
      setTimeout(() => setIsSimulating(false), 1000);
      return message;
    }
  });

  // 2. Add Relation Tool
  useWebMCP({
    name: 'add_relation',
    description: 'Add a foreign key relationship between two tables.',
    inputSchema: {
      type: 'object',
      properties: {
        sourceTable: { type: 'string', description: 'The table containing the foreign key' },
        targetTable: { type: 'string', description: 'The table being referenced' }
      },
      required: ['sourceTable', 'targetTable']
    },
    execute: async (input: any) => {
      setIsSimulating(true);
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
      setTimeout(() => setIsSimulating(false), 1000);
      
      if (success) {
        return `Relation added between ${input.sourceTable} and ${input.targetTable}.`;
      } else {
        throw new Error(`One or both tables not found in schema. source: ${input.sourceTable}, target: ${input.targetTable}`);
      }
    }
  });

  // 3. Analyze Schema Tool
  useWebMCP({
    name: 'analyze_schema',
    description: 'Analyze the current database schema and suggest improvements, missing relations, or missing standard columns (like created_at).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    execute: async () => {
      setIsSimulating(true);
      setTimeout(() => setIsSimulating(false), 1000);
      return JSON.stringify(schema, null, 2);
    }
  });

  // 4. Update Column Tool
  useWebMCP({
    name: 'update_column',
    description: 'Modify an existing column in a table (e.g. change type or name).',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: { type: 'string', description: 'The table containing the column' },
        oldColumnName: { type: 'string', description: 'The current name of the column' },
        newColumnName: { type: 'string', description: 'The new name of the column' },
        newType: { type: 'string', description: 'The new data type of the column' },
        isPrimary: { type: 'boolean' }
      },
      required: ['tableName', 'oldColumnName']
    },
    execute: async (input: any) => {
      setIsSimulating(true);
      let success = false;
      setSchema(prev => {
        const table = prev.find(t => t.tableName === input.tableName);
        if (!table) return prev;

        success = true;
        return prev.map(t => {
          if (t.tableName === input.tableName) {
            const columns = t.columns.map((c: any) => {
              if (c.name === input.oldColumnName) {
                return {
                  name: input.newColumnName || c.name,
                  type: input.newType || c.type,
                  isPrimary: input.isPrimary !== undefined ? input.isPrimary : c.isPrimary
                };
              }
              return c;
            });
            return { ...t, columns };
          }
          return t;
        });
      });
      setTimeout(() => setIsSimulating(false), 1000);
      
      if (success) {
        return `Column ${input.oldColumnName} updated in table ${input.tableName}.`;
      } else {
        throw new Error(`Table ${input.tableName} not found.`);
      }
    }
  });

  // 5. Export to SQL Tool
  useWebMCP({
    name: 'export_to_sql',
    description: 'Export the current visual schema into raw SQL statements.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    execute: async () => {
      setIsSimulating(true);
      let sql = '';
      schema.forEach(t => {
        sql += `CREATE TABLE ${t.tableName} (\n`;
        const cols = t.columns.map((c: any) => `  ${c.name} ${c.type}${c.isPrimary ? ' PRIMARY KEY' : ''}`);
        sql += cols.join(',\n');
        sql += `\n);\n\n`;
      });
      setTimeout(() => setIsSimulating(false), 1000);
      return sql || 'No tables in schema to export.';
    }
  });

  return null;
}
