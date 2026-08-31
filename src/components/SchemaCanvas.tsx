import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

function getColumnColor(col: any): string {
  if (col.isPrimary) return "#f0c040";
  const name = col.name?.toLowerCase() ?? "";
  const type = col.type?.toLowerCase() ?? "";
  if (name.endsWith("_id") || name === "fk") return "#58a6ff";
  if (type.includes("bool")) return "#bc8cff";
  if (type.includes("int") || type.includes("decimal") || type.includes("float") || type.includes("number")) return "#3fb950";
  if (type.includes("date") || type.includes("time") || type.includes("timestamp")) return "#ff7b72";
  return "#8b949e";
}

function getTypeBadge(col: any): string {
  if (col.isPrimary) return "PK";
  const name = col.name?.toLowerCase() ?? "";
  if (name.endsWith("_id")) return "FK";
  return col.type?.toUpperCase().slice(0, 7) ?? "?";
}

const TableNode = ({ data }: { data: any }) => (
  <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", minWidth: "240px", fontFamily: "Inter, sans-serif" }}>
    <Handle type="target" position={Position.Top} style={{ background: "#58a6ff", width: 10, height: 10 }} />
    <div style={{ background: "#0d1117", padding: "10px 14px", fontWeight: "700", fontSize: "13px", borderRadius: "7px 7px 0 0", borderBottom: "1px solid #30363d", color: "#58a6ff", letterSpacing: "0.5px", userSelect: "none" }}>
      {data.label}
    </div>
    <div>
      {(data.columns ?? []).map((col: any, i: number) => {
        const color = getColumnColor(col);
        const badge = getTypeBadge(col);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 14px", fontSize: "12px", borderBottom: i < data.columns.length - 1 ? "1px solid #1e2533" : "none", gap: "8px" }}>
            <span style={{ color: "#e6edf3", flex: 1 }}>{col.name}</span>
            <span style={{ background: `${color}22`, color, border: `1px solid ${color}55`, borderRadius: "4px", padding: "1px 5px", fontSize: "10px", fontWeight: "600", whiteSpace: "nowrap" }}>
              {badge}
            </span>
          </div>
        );
      })}
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: "#58a6ff", width: 10, height: 10 }} />
  </div>
);

const nodeTypes = { tableNode: TableNode };

function getGridPosition(index: number) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return { x: col * 300 + 60, y: row * 280 + 80 };
}

interface FlowCanvasProps {
  schema: any[];
  onFitViewRef: React.MutableRefObject<(() => void) | null>;
}

const FlowCanvas = ({ schema, onFitViewRef }: FlowCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const { fitView } = useReactFlow();

  // Expose fitView to parent via ref
  useEffect(() => {
    onFitViewRef.current = () => fitView({ padding: 0.25, duration: 600 });
  }, [fitView, onFitViewRef]);

  useEffect(() => {
    if (!schema || schema.length === 0) { setNodes([]); setEdges([]); return; }
    setNodes(current => schema.map((table, index) => {
      const existing = current.find((n: any) => n.id === table.tableName);
      const pos = existing ? existing.position : getGridPosition(index);
      return { id: table.tableName, type: "tableNode", position: pos, data: { label: table.tableName, columns: table.columns ?? [] } };
    }));
    const newEdges: any[] = [];
    schema.forEach(table => {
      (table.relations ?? []).forEach((rel: any) => {
        newEdges.push({
          id: `${table.tableName}__${rel.targetTable}`,
          source: table.tableName,
          target: rel.targetTable,
          animated: true,
          label: rel.label ?? "",
          style: { stroke: "#58a6ff", strokeWidth: 2 },
          labelStyle: { fill: "#8b949e", fontSize: 11 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#58a6ff" },
        });
      });
    });
    setEdges(newEdges);
    setTimeout(() => fitView({ padding: 0.25, duration: 600 }), 150);
  }, [schema, setNodes, setEdges, fitView]);

  const onConnect = useCallback((params: any) => setEdges(eds => addEdge(params, eds)), [setEdges]);

  return (
    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView colorMode="dark" nodesDraggable={true} nodesConnectable={true} elementsSelectable={true}>
      <MiniMap nodeColor="#161b22" maskColor="rgba(0,0,0,0.6)" />
      <Controls />
      <Background color="#1e2533" gap={20} />
    </ReactFlow>
  );
};

interface SchemaCanvasProps {
  schema: any[];
  onFitViewRef: React.MutableRefObject<(() => void) | null>;
}

export const SchemaCanvas = ({ schema, onFitViewRef }: SchemaCanvasProps) => (
  <div style={{ width: "100vw", height: "100vh" }}>
    <ReactFlowProvider>
      <FlowCanvas schema={schema} onFitViewRef={onFitViewRef} />
    </ReactFlowProvider>
  </div>
);
