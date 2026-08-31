import { useWebMCP } from "use-webmcp-tool";

interface WebMCPManagerProps {
  schema: any[];
  setSchema: React.Dispatch<React.SetStateAction<any[]>>;
  setIsSimulating: React.Dispatch<React.SetStateAction<boolean>>;
}

export function WebMCPManager({ schema, setSchema, setIsSimulating }: WebMCPManagerProps) {

  // 1. create_table
  useWebMCP({
    name: "create_table",
    description: "Create a new database table in the visual schema designer. Call this once per table.",
    inputSchema: {
      type: "object",
      properties: {
        tableName: { type: "string", description: "Name of the table (e.g. users, products)" },
        columns: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string", description: "SQL type: UUID, VARCHAR, INTEGER, TEXT, BOOLEAN, DECIMAL, TIMESTAMP, etc." },
              isPrimary: { type: "boolean" }
            },
            required: ["name", "type"]
          }
        }
      },
      required: ["tableName", "columns"]
    },
    execute: async (input: any) => {
      setIsSimulating(true);
      let message = "";
      setSchema(prev => {
        if (prev.find(t => t.tableName === input.tableName)) {
          message = `Table "${input.tableName}" updated.`;
          return prev.map(t => t.tableName === input.tableName ? { ...t, columns: input.columns } : t);
        }
        message = `Table "${input.tableName}" created with ${input.columns.length} columns.`;
        return [...prev, { tableName: input.tableName, columns: input.columns, relations: [] }];
      });
      setTimeout(() => setIsSimulating(false), 800);
      return message;
    }
  });

  // 2. add_relation
  useWebMCP({
    name: "add_relation",
    description: "Add a foreign key relationship between two tables (draws an arrow from source to target).",
    inputSchema: {
      type: "object",
      properties: {
        sourceTable: { type: "string", description: "The table containing the foreign key" },
        targetTable: { type: "string", description: "The table being referenced" },
        label: { type: "string", description: "Optional label for the relation arrow (e.g. has many, belongs to)" }
      },
      required: ["sourceTable", "targetTable"]
    },
    execute: async (input: any) => {
      setIsSimulating(true);
      let success = false;
      setSchema(prev => {
        const srcExists = prev.find(t => t.tableName === input.sourceTable);
        const tgtExists = prev.find(t => t.tableName === input.targetTable);
        if (!srcExists || !tgtExists) return prev;
        success = true;
        return prev.map(t => {
          if (t.tableName === input.sourceTable) {
            const relations = t.relations || [];
            if (!relations.find((r: any) => r.targetTable === input.targetTable)) {
              return { ...t, relations: [...relations, { targetTable: input.targetTable, label: input.label ?? "" }] };
            }
          }
          return t;
        });
      });
      setTimeout(() => setIsSimulating(false), 800);
      if (success) return `Relation: ${input.sourceTable} → ${input.targetTable} added.`;
      throw new Error(`Tables not found: ${input.sourceTable}, ${input.targetTable}`);
    }
  });

  // 3. analyze_schema
  useWebMCP({
    name: "analyze_schema",
    description: "Read and analyze the current schema. Use this before making changes to understand what tables already exist.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      setIsSimulating(true);
      setTimeout(() => setIsSimulating(false), 500);
      if (schema.length === 0) return "Schema is empty. No tables created yet.";
      const summary = schema.map(t => `- ${t.tableName}: ${(t.columns ?? []).map((c: any) => c.name).join(", ")}`).join("\n");
      return `Current schema has ${schema.length} tables:\n${summary}`;
    }
  });

  // 4. list_tables
  useWebMCP({
    name: "list_tables",
    description: "Returns a list of existing table names to avoid creating duplicates.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      if (schema.length === 0) return "No tables yet.";
      return schema.map(t => t.tableName).join(", ");
    }
  });

  // 5. clear_schema
  useWebMCP({
    name: "clear_schema",
    description: "Remove all tables and relations from the canvas. Use with caution — this cannot be undone.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      setSchema([]);
      return "Schema cleared. Canvas is now empty.";
    }
  });

  // 6. update_column
  useWebMCP({
    name: "update_column",
    description: "Modify an existing column in a table (rename, change type, set primary key).",
    inputSchema: {
      type: "object",
      properties: {
        tableName: { type: "string" },
        oldColumnName: { type: "string" },
        newColumnName: { type: "string" },
        newType: { type: "string" },
        isPrimary: { type: "boolean" }
      },
      required: ["tableName", "oldColumnName"]
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
            return {
              ...t,
              columns: t.columns.map((c: any) => c.name === input.oldColumnName
                ? { name: input.newColumnName ?? c.name, type: input.newType ?? c.type, isPrimary: input.isPrimary ?? c.isPrimary }
                : c)
            };
          }
          return t;
        });
      });
      setTimeout(() => setIsSimulating(false), 800);
      if (success) return `Column "${input.oldColumnName}" updated in "${input.tableName}".`;
      throw new Error(`Table "${input.tableName}" not found.`);
    }
  });

  // 7. export_to_sql
  useWebMCP({
    name: "export_to_sql",
    description: "Generate and return SQL CREATE TABLE statements for all tables in the schema.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      if (schema.length === 0) return "No tables to export.";
      let sql = "-- Generated by Edaad AI Schema Architect\n\n";
      schema.forEach(t => {
        sql += `CREATE TABLE ${t.tableName} (\n`;
        const cols = (t.columns ?? []).map((c: any) => `  ${c.name} ${c.type.toUpperCase()}${c.isPrimary ? " PRIMARY KEY" : ""}`);
        sql += cols.join(",\n") + "\n);\n\n";
      });
      return sql;
    }
  });


  // 8. suggest_improvements
  useWebMCP({
    name: "suggest_improvements",
    description: "Analyze the current schema and suggest improvements such as missing timestamps, missing primary keys, or unlinked tables.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      if (schema.length === 0) return "Schema is empty. Create some tables first.";
      const suggestions: string[] = [];
      schema.forEach(t => {
        if (!(t.columns ?? []).some((c: any) => c.isPrimary)) suggestions.push(`- Table "${t.tableName}" has no PRIMARY KEY.`);
        if (!(t.columns ?? []).some((c: any) => ["created_at","createdAt","created"].includes(c.name))) suggestions.push(`- Table "${t.tableName}" is missing a created_at timestamp.`);
        if (!(t.columns ?? []).some((c: any) => ["updated_at","updatedAt","updated"].includes(c.name))) suggestions.push(`- Table "${t.tableName}" is missing an updated_at timestamp.`);
      });
      if (suggestions.length === 0) return "Schema looks great! No improvements needed.";
      return "Suggested improvements:\n" + suggestions.join("\n");
    }
  });
  return null;
}

