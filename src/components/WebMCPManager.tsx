import { useWebMCP } from "use-webmcp-tool";

interface WebMCPManagerProps {
  schema: any[];
  setSchema: React.Dispatch<React.SetStateAction<any[]>>;
  setIsSimulating: React.Dispatch<React.SetStateAction<boolean>>;
}

// ─── SQL Parser Utility ───────────────────────────────────────────────────────
function parseSQLToSchema(sql: string): any[] {
  const tables: any[] = [];
  // Match CREATE TABLE blocks (case-insensitive)
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?\s*\(([^;]+)\)/gi;
  let tableMatch;
  while ((tableMatch = tableRegex.exec(sql)) !== null) {
    const tableName = tableMatch[1];
    const body = tableMatch[2];
    const columns: any[] = [];
    const lines = body.split(",").map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      // Skip constraints
      if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|INDEX|CHECK|CONSTRAINT)/i.test(line)) continue;
      const colMatch = line.match(/^[`"']?(\w+)[`"']?\s+(\w+(?:\(\d+(?:,\d+)?\))?)/i);
      if (!colMatch) continue;
      const colName = colMatch[1];
      const rawType = colMatch[2].toUpperCase();
      // Normalize type
      let type = rawType;
      if (/^VARCHAR|^CHAR|^NVARCHAR/.test(rawType)) type = "VARCHAR";
      else if (/^INT|^BIGINT|^SMALLINT|^TINYINT/.test(rawType)) type = "INTEGER";
      else if (/^FLOAT|^DOUBLE|^NUMERIC|^DECIMAL/.test(rawType)) type = "DECIMAL";
      else if (/^BOOL/.test(rawType)) type = "BOOLEAN";
      else if (/^DATETIME|^TIMESTAMP|^DATE/.test(rawType)) type = "TIMESTAMP";
      else if (/^UUID/.test(rawType)) type = "UUID";
      else if (/^TEXT|^CLOB/.test(rawType)) type = "TEXT";
      const isPrimary = /PRIMARY\s+KEY/i.test(line);
      columns.push({ name: colName, type, isPrimary });
    }
    if (columns.length > 0) tables.push({ tableName, columns, relations: [] });
  }
  return tables;
}

// ─── Prisma Parser Utility ────────────────────────────────────────────────────
function parsePrismaToSchema(prismaText: string): any[] {
  const tables: any[] = [];
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  const prismaTypeMap: Record<string, string> = {
    String: "VARCHAR", Int: "INTEGER", Float: "DECIMAL",
    Boolean: "BOOLEAN", DateTime: "TIMESTAMP", BigInt: "INTEGER",
    Decimal: "DECIMAL", Json: "TEXT",
  };
  let modelMatch;
  while ((modelMatch = modelRegex.exec(prismaText)) !== null) {
    const tableName = modelMatch[1].toLowerCase();
    const body = modelMatch[2];
    const columns: any[] = [];
    for (const line of body.split("\n").map(l => l.trim()).filter(Boolean)) {
      if (line.startsWith("//") || line.startsWith("@@")) continue;
      const parts = line.split(/\s+/);
      if (parts.length < 2) continue;
      const colName = parts[0];
      const rawType = parts[1].replace("?", "").replace("[]", "");
      const type = prismaTypeMap[rawType] ?? "TEXT";
      const isPrimary = line.includes("@id");
      columns.push({ name: colName, type, isPrimary });
    }
    if (columns.length > 0) tables.push({ tableName, columns, relations: [] });
  }
  return tables;
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
  // ─── Option 1: Diagnosis Tools ────────────────────────────────────────────

  // 9. diagnose_schema_problem
  useWebMCP({
    name: "diagnose_schema_problem",
    description: "Diagnose a developer's problem by comparing it against the current schema. Describe the error or issue and the tool will identify mismatches, missing tables, missing columns, or broken relations.",
    inputSchema: {
      type: "object",
      properties: {
        problem: { type: "string", description: "The problem or error the developer is facing (e.g. 'foreign key constraint fails on orders.user_id')" }
      },
      required: ["problem"]
    },
    execute: async (input: any) => {
      if (schema.length === 0) return "Schema is empty — no tables to diagnose against. Ask the user to build or import their schema first.";
      const issues: string[] = [];
      const problem = input.problem.toLowerCase();

      // Extract mentioned table/column names from the problem text
      const mentionedWords = problem.match(/\b\w+\b/g) ?? [];
      const tableNames = schema.map((t: any) => t.tableName.toLowerCase());
      const mentionedTables = mentionedWords.filter((w: string) => tableNames.includes(w));
      const unmatchedWords = mentionedWords.filter((w: string) =>
        w.length > 3 && !tableNames.includes(w) &&
        !['the','and','or','not','with','from','that','this','when','does','have','been','fail','error','issue'].includes(w)
      );

      // Check for foreign key issues
      if (/foreign.?key|fk|reference|constraint/i.test(input.problem)) {
        schema.forEach((t: any) => {
          (t.relations ?? []).forEach((r: any) => {
            const target = schema.find((x: any) => x.tableName === r.targetTable);
            if (!target) issues.push(`⚠️ Table "${t.tableName}" references "${r.targetTable}" but that table does not exist in the schema.`);
          });
        });
        if (issues.length === 0) issues.push("✅ All foreign key relations in the schema point to existing tables.");
      }

      // Check if mentioned tables exist
      mentionedTables.forEach((name: string) => {
        const table = schema.find((t: any) => t.tableName.toLowerCase() === name);
        if (table) {
          const hasPK = (table.columns ?? []).some((c: any) => c.isPrimary);
          if (!hasPK) issues.push(`⚠️ Table "${table.tableName}" has no PRIMARY KEY — this can cause join and relation errors.`);
        }
      });

      // Check for missing timestamps if mentioned
      if (/creat|updat|timestamp|date|time/i.test(input.problem)) {
        schema.forEach((t: any) => {
          const hasCreated = (t.columns ?? []).some((c: any) => /created/i.test(c.name));
          const hasUpdated = (t.columns ?? []).some((c: any) => /updated/i.test(c.name));
          if (!hasCreated || !hasUpdated) issues.push(`📅 Table "${t.tableName}" is missing timestamp columns (created_at / updated_at).`);
        });
      }

      const summary = [
        `**Problem:** ${input.problem}`,
        `**Tables in schema:** ${schema.map((t: any) => t.tableName).join(", ")}`,
        mentionedTables.length > 0 ? `**Mentioned tables found:** ${mentionedTables.join(", ")}` : "",
        unmatchedWords.length > 0 ? `**Keywords not matched to any table:** ${[...new Set(unmatchedWords)].join(", ")}` : "",
        issues.length > 0 ? `\n**Findings:**\n${issues.join("\n")}` : "\n✅ No schema-level issues detected for this problem."
      ].filter(Boolean).join("\n");
      return summary;
    }
  });

  // 10. check_schema_consistency
  useWebMCP({
    name: "check_schema_consistency",
    description: "Check whether the current schema satisfies a specific requirement. Example: 'Does this schema support multi-tenant SaaS?' or 'Can this schema handle user authentication?'",
    inputSchema: {
      type: "object",
      properties: {
        requirement: { type: "string", description: "The feature or requirement to check against (e.g. 'user authentication with roles', 'soft deletes', 'multi-tenancy')" }
      },
      required: ["requirement"]
    },
    execute: async (input: any) => {
      if (schema.length === 0) return "Schema is empty. No tables to check.";
      const req = input.requirement.toLowerCase();
      const allColumns = schema.flatMap((t: any) => (t.columns ?? []).map((c: any) => ({ table: t.tableName, col: c.name.toLowerCase() })));
      const allTables = schema.map((t: any) => t.tableName.toLowerCase());
      const findings: string[] = [];
      const missing: string[] = [];

      // Auth
      if (/auth|login|user|password|session|token/.test(req)) {
        if (!allTables.some(t => /user|account/.test(t))) missing.push("users / accounts table");
        if (!allColumns.some(c => /email/.test(c.col))) missing.push("email column");
        if (!allColumns.some(c => /password|hash/.test(c.col))) missing.push("password/hash column");
        if (/role|permission/.test(req) && !allTables.some(t => /role|permission/.test(t))) missing.push("roles / permissions table");
      }
      // Soft deletes
      if (/soft.?delet|deleted_at|archive/.test(req)) {
        schema.forEach((t: any) => {
          const has = (t.columns ?? []).some((c: any) => /deleted_at|archived/.test(c.name));
          if (!has) missing.push(`deleted_at on "${t.tableName}"`);
        });
      }
      // Multi-tenancy
      if (/tenant|org|workspace|company/.test(req)) {
        if (!allTables.some(t => /tenant|org|workspace/.test(t))) missing.push("tenants / organizations table");
        if (!allColumns.some(c => /tenant_id|org_id|workspace_id/.test(c.col))) missing.push("tenant_id column in data tables");
      }
      // Timestamps
      if (/audit|log|histor|track|timestamp/.test(req)) {
        schema.forEach((t: any) => {
          if (!(t.columns ?? []).some((c: any) => /created_at/.test(c.name))) missing.push(`created_at on "${t.tableName}"`);
        });
      }

      if (missing.length === 0) {
        findings.push(`✅ The schema appears to support: **${input.requirement}**`);
      } else {
        findings.push(`⚠️ To support **${input.requirement}**, the following are missing:`);
        missing.forEach(m => findings.push(`  - ${m}`));
      }
      findings.push(`\n**Current tables:** ${schema.map((t: any) => t.tableName).join(", ")}`);
      return findings.join("\n");
    }
  });

  // ─── Option 3: Import Tools ────────────────────────────────────────────────

  // 11. import_schema_from_sql
  useWebMCP({
    name: "import_schema_from_sql",
    description: "Parse raw SQL CREATE TABLE statements and load them into the visual canvas. Supports PostgreSQL, MySQL, and SQLite syntax. Call this when the user provides or pastes SQL code.",
    inputSchema: {
      type: "object",
      properties: {
        sql_text: { type: "string", description: "The full SQL text containing CREATE TABLE statements" }
      },
      required: ["sql_text"]
    },
    execute: async (input: any) => {
      setIsSimulating(true);
      const parsed = parseSQLToSchema(input.sql_text);
      if (parsed.length === 0) {
        setIsSimulating(false);
        return "❌ No valid CREATE TABLE statements found. Make sure the SQL uses standard syntax.";
      }
      setSchema(prev => {
        const merged = [...prev];
        parsed.forEach(newTable => {
          const idx = merged.findIndex(t => t.tableName === newTable.tableName);
          if (idx >= 0) merged[idx] = newTable;
          else merged.push(newTable);
        });
        return merged;
      });
      setTimeout(() => setIsSimulating(false), 800);
      return `✅ Successfully imported ${parsed.length} table(s) from SQL: ${parsed.map(t => `"${t.tableName}" (${t.columns.length} cols)`).join(", ")}. The canvas has been updated.`;
    }
  });

  // 12. import_schema_from_prisma
  useWebMCP({
    name: "import_schema_from_prisma",
    description: "Parse a Prisma schema file content and load the models into the visual canvas as tables. Call this when the user provides their schema.prisma file content.",
    inputSchema: {
      type: "object",
      properties: {
        prisma_text: { type: "string", description: "The full content of the Prisma schema file" }
      },
      required: ["prisma_text"]
    },
    execute: async (input: any) => {
      setIsSimulating(true);
      const parsed = parsePrismaToSchema(input.prisma_text);
      if (parsed.length === 0) {
        setIsSimulating(false);
        return "❌ No valid Prisma models found. Make sure the text contains 'model ModelName { ... }' blocks.";
      }
      setSchema(prev => {
        const merged = [...prev];
        parsed.forEach(newTable => {
          const idx = merged.findIndex(t => t.tableName === newTable.tableName);
          if (idx >= 0) merged[idx] = newTable;
          else merged.push(newTable);
        });
        return merged;
      });
      setTimeout(() => setIsSimulating(false), 800);
      return `✅ Successfully imported ${parsed.length} Prisma model(s): ${parsed.map(t => `"${t.tableName}" (${t.columns.length} fields)`).join(", ")}. The canvas has been updated.`;
    }
  });

  return null;
}

