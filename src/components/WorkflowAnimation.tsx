import { useState, useEffect } from 'react'

const nodes = [
  { id: 'query',     label: 'USER QUERY',       sub: '',                     icon: '💬' },
  { id: 'manager',   label: 'ORCHESTRATOR',      sub: 'Task routing',         icon: '🧠' },
  { id: 'knowledge', label: 'KNOWLEDGE AGENT',   sub: 'RAG retrieval',        icon: '🔒' },
  { id: 'web',       label: 'WEB AGENT',         sub: 'Bing Search',          icon: '🌐' },
  { id: 'response',  label: 'RESPONSE DELIVERY', sub: '',                     icon: '✨' },
]

export function WorkflowAnimation() {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % nodes.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full relative px-8">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/30">
          🔍
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
          Research Assistant
        </h1>
        <p className="text-xs text-gray-400 tracking-widest mt-1 uppercase">
          Enterprise Multi-Agent Workflow
        </p>
      </div>

      {/* Pipeline nodes */}
      <div className="relative flex flex-col gap-1 w-full max-w-xs">
        {nodes.map((node, i) => {
          const isActive  = i === activeIdx
          const isDone    = i < activeIdx

          return (
            <div key={node.id}>
              {/* Connector line above (skip first) */}
              {i > 0 && (
                <div className="flex justify-center py-0.5">
                  <div
                    className={`w-0.5 h-5 rounded-full transition-colors duration-500 ${
                      isDone || isActive ? 'bg-gradient-to-b from-purple-500 to-pink-500' : 'bg-white/10'
                    }`}
                  />
                </div>
              )}

              {/* Branch split for knowledge + web */}
              {i === 2 ? (
                <div className="flex gap-3">
                  {/* Knowledge agent card */}
                  <NodeCard
                    node={nodes[2]}
                    isActive={activeIdx === 2}
                    isDone={activeIdx > 2}
                  />
                  {/* Web agent card */}
                  <NodeCard
                    node={nodes[3]}
                    isActive={activeIdx === 3}
                    isDone={activeIdx > 3}
                  />
                </div>
              ) : i === 3 ? null : (
                <NodeCard node={node} isActive={isActive} isDone={isDone} />
              )}
            </div>
          )
        })}
      </div>

      {/* Status bar */}
      <div className="mt-8 flex items-center gap-2 text-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple-500" />
        </span>
        <span className="text-gray-400">
          {nodes[activeIdx].label}
          {nodes[activeIdx].sub ? ` — ${nodes[activeIdx].sub}` : ''}
          <span className="animate-pulse"> in progress...</span>
        </span>
      </div>
    </div>
  )
}

function NodeCard({ node, isActive, isDone }: {
  node: typeof nodes[0]
  isActive: boolean
  isDone: boolean
}) {
  return (
    <div
      className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
        isActive
          ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10 scale-105'
          : isDone
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 transition-all duration-500 ${
          isActive
            ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-md shadow-purple-500/30'
            : isDone
              ? 'bg-green-500/20'
              : 'bg-white/5'
        }`}
      >
        {isDone ? '✓' : node.icon}
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-semibold tracking-wide ${
          isActive ? 'text-purple-300' : isDone ? 'text-green-400' : 'text-gray-500'
        }`}>
          {node.label}
        </p>
        {node.sub && (
          <p className="text-[10px] text-gray-600 truncate">{node.sub}</p>
        )}
      </div>
    </div>
  )
}
