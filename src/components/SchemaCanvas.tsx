import { useCallback, useEffect } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Node for Database Tables
const TableNode = ({ data }: { data: any }) => {
    return (
        <div className="react-flow__node-tableNode">
            <Handle type="target" position={Position.Top} style={{ background: 'var(--accent-color)' }} />
            <div style={{ background: 'var(--node-header)', padding: '12px', fontWeight: 'bold', fontSize: '14px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', cursor: 'grab' }}>
                <span>{data.label}</span>
            </div>
            <div style={{ padding: '8px' }}>
                {data.columns && data.columns.map((col: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 4px', fontSize: '13px', borderBottom: i < data.columns.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {col.isPrimary && <span title="Primary Key">🔑</span>}
                            {col.name}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{col.type}</span>
                    </div>
                ))}
            </div>
            <Handle type="source" position={Position.Bottom} style={{ background: 'var(--accent-color)' }} />
        </div>
    );
};

const nodeTypes = {
    tableNode: TableNode,
};

const FlowLayout = ({ schema }: { schema: any[] }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
    const { fitView } = useReactFlow();

    useEffect(() => {
        if (!schema) return;

        const cols = Math.ceil(Math.sqrt(Math.max(schema.length, 1)));
        const spacingX = 350;
        const spacingY = 300;

        setNodes((currentNodes) => {
            const newNodes = schema.map((table, index) => {
                const existingNode = currentNodes.find((n: any) => n.id === table.tableName);
                
                const x = existingNode ? existingNode.position.x : ((index % cols) * spacingX + 50);
                const y = existingNode ? existingNode.position.y : (Math.floor(index / cols) * spacingY + 50);

                return {
                    id: table.tableName,
                    type: 'tableNode',
                    position: { x, y },
                    data: {
                        label: table.tableName,
                        columns: table.columns
                    }
                };
            });
            return newNodes;
        });

        setEdges(() => {
            const newEdges: any[] = [];
            schema.forEach(table => {
                if (table.relations) {
                    table.relations.forEach((rel: any) => {
                        newEdges.push({
                            id: `e-${table.tableName}-${rel.targetTable}`,
                            source: table.tableName,
                            target: rel.targetTable,
                            animated: true,
                            style: { stroke: 'var(--accent-color)', strokeWidth: 2 },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: 'var(--accent-color)',
                            },
                        });
                    });
                }
            });
            return newEdges;
        });
        
        // Auto fit view after a small delay to let nodes render
        setTimeout(() => {
            fitView({ padding: 0.2, duration: 800 });
        }, 100);
    }, [schema, setNodes, setEdges, fitView]);

    const onConnect = useCallback((params: any) => setEdges((eds: any) => addEdge(params, eds)), [setEdges]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            colorMode="dark"
        >
            <MiniMap 
                nodeColor="var(--node-bg)"
                maskColor="rgba(0,0,0,0.5)"
            />
            <Controls />
            <Background color="var(--border-color)" gap={16} />
        </ReactFlow>
    );
};

export const SchemaCanvas = ({ schema }: { schema: any[] }) => {
    return (
        <div style={{ width: '100vw', height: '100vh', background: 'var(--bg-color)' }}>
            <ReactFlowProvider>
                <FlowLayout schema={schema} />
            </ReactFlowProvider>
        </div>
    );
};
};
