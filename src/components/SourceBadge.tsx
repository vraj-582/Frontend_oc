type Agent = 'knowledge' | 'web' | 'both' | 'none'

const config: Record<Agent, { label: string; color: string }> = {
  knowledge: { label: 'Internal',  color: '#38BDF8' },
  web:       { label: 'Web',       color: '#F59E0B' },
  both:      { label: 'Combined',  color: '#A78BFA' },
  none:      { label: 'System',    color: '#6B7280' },
}

export function SourceBadge({ agent }: { agent: Agent }) {
  const { label, color } = config[agent]
  return (
    <span
      style={{
        color,
        border: `1px solid ${color}25`,
        background: `${color}08`,
      }}
      className="text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex gap-1 items-center"
    >
      {label}
    </span>
  )
}
