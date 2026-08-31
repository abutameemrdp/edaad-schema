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

const TableNode = ({ data }: { data: any }) => (
  <div style={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: "8px", minWidth: "220px", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
    <Handle type="target" position={Position.Top} style={{ background: "#58a6ff" }} />
    <div style={{ background: "#0d1117", padding: "10px 14px", fontWeight: "bold", fontSize: "14px", borderRadius: "7px 7px 0 0", borderBottom: "1px solid #2d3748", color: "#58a6ff", userSelect: "none" }}>
      {data.label}
    </div>
    <div style={{ padding: "6px 0" }}>
      {data.columns && data.columns.map((col: any, i: number) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 14px", fontSize: "12px", borderBottom: i < data.columns.length - 1 ? "1px solid #1e2533" : "none" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#e6edf3" }}>
            {col.isPrimary && <span>PK</span>}
            {col.name}
          </span>
          <span style={{ color: "#7d8590", marginLeft: "20px" }}>{col.type}</span>
        </div>
      ))}
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: "#58a6ff" }} />
  </div>
);

const nodeTypes = { tableNode: TableNode };

function getGridPosition(index: number) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return { x: col * 300 + 60, y: row * 280 + 80 };
}

const FlowCanvas = ({ schema }: { schema: any[] }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const { fitView } = useReactFlow();

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
        newEdges.push({ id: `${table.tableName}__${rel.targetTable}`, source: table.tableName, target: rel.targetTable, animated: true, style: { stroke: "#58a6ff", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#58a6ff" } });
      });
    });
    setEdges(newEdges);
    setTimeout(() => fitView({ padding: 0.25, duration: 600 }), 150);
  }, [schema, setNodes, setEdges, fitView]);

  const onConnect = useCallback((params: any) => setEdges(eds => addEdge(params, eds)), [setEdges]);

  return (
    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView colorMode="dark" nodesDraggable={true} nodesConnectable={true} elementsSelectable={true}>
      <MiniMap nodeColor="#1a1f2e" maskColor="rgba(0,0,0,0.6)" />
      <Controls />
      <Background color="#1e2533" gap={20} />
    </ReactFlow>
  );
};

export const SchemaCanvas = ({ schema }: { schema: any[] }) => (
  <div style={{ width: "100vw", height: "100vh" }}>
    <ReactFlowProvider>
      <FlowCanvas schema={schema} />
    </ReactFlowProvider>
  </div>
);
