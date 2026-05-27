import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Handle,
  Position,
  getBezierPath
} from '@xyflow/react';

// Custom Node Component
const CustomNode = ({ data }) => {
  const { label, isStart, isAccept, isActive } = data;

  return (
    <div
      className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 font-semibold text-sm cursor-pointer
        ${isActive
          ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400 glow-amber font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] pulse-active'
          : isAccept
            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 hover:border-emerald-400'
            : 'bg-slate-800 border-indigo-500 text-slate-200 hover:border-indigo-400'
        }`}
    >
      {/* Target and Source Handles for React Flow Edge Routing */}
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} id="target-l" />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} id="source-r" />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} id="target-t" />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} id="source-b" />

      {/* Start State Indicator Arrow */}
      {isStart && (
        <div className="absolute -left-7 top-1/2 -translate-y-1/2 text-indigo-400 font-bold text-xl animate-pulse">
          ➔
        </div>
      )}

      {/* Accept State concentric rings or normal center label */}
      {isAccept ? (
        <div className="double-circle border-0 w-12 h-12 text-inherit">
          <span className="z-10">{label}</span>
        </div>
      ) : (
        <span>{label}</span>
      )}
    </div>
  );
};

// Custom Self Connecting Edge for loops
function SelfConnectingEdge({
  id,
  sourceX,
  sourceY,
  style,
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  className
}) {
  const radius = 24; // node is 48px wide, radius is 24
  const x = sourceX;
  const y = sourceY - radius;

  // Render a clean bezier loop extending upwards
  const path = `M ${x - 5} ${y} C ${x - 30} ${y - 45}, ${x + 30} ${y - 45}, ${x + 5} ${y}`;
  const [labelX, labelY] = [x, y - 30];

  return (
    <>
      <path
        id={id}
        style={style}
        className={`react-flow__edge-path ${className || ''}`}
        d={path}
        markerEnd={markerEnd}
      />
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-15}
            y={-8}
            width={30}
            height={16}
            style={labelBgStyle}
          />
          <text
            style={labelStyle}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {label}
          </text>
        </g>
      )}
    </>
  );
}

// React Flow wrapper Component
export default function AutomataGraph({ nodes = [], edges = [], onNodeClick = null }) {
  
  const nodeTypes = useMemo(() => ({
    normalNode: CustomNode,
    startNode: CustomNode,
    acceptNode: CustomNode,
    startAcceptNode: CustomNode
  }), []);

  const edgeTypes = useMemo(() => ({
    selfconnecting: SelfConnectingEdge
  }), []);

  // Standard marker end for arrow directions
  const defaultEdgeOptions = {
    style: { strokeWidth: 2, stroke: '#6366f1' },
    markerEnd: {
      type: 'arrow',
      width: 16,
      height: 16,
      color: '#6366f1',
    },
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-slate-900/50"
      >
        <Controls showInteractive={false} className="bg-slate-800 border border-slate-700 text-slate-200 fill-slate-200" />
        <Background color="#334155" gap={16} size={1} />
      </ReactFlow>
      <div className="absolute bottom-3 right-3 text-xs bg-slate-950/80 border border-slate-800 text-slate-400 py-1 px-2 rounded backdrop-blur">
        💡 Seret untuk geser, Scroll untuk zoom
      </div>
    </div>
  );
}
