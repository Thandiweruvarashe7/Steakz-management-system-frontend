import { useState } from 'react'
import { TABLE_STATUS_COLORS, TABLE_STATUS_LABELS } from '@/constants/colors'
import type { Table, TableStatus } from '@/types'

interface FloorPlanCanvasProps {
  tables: Table[]
  mode?: 'view' | 'edit'
  onTableClick?: (table: Table) => void
  onTableStatusChange?: (tableId: string, status: TableStatus) => void
}

const LEGEND = [
  { status: 'AVAILABLE' as TableStatus, label: 'Available' },
  { status: 'RESERVED' as TableStatus, label: 'Reserved' },
  { status: 'OCCUPIED' as TableStatus, label: 'Occupied' },
  { status: 'PAYMENT_PENDING' as TableStatus, label: 'Payment Pending' },
]

export function FloorPlanCanvas({ tables, mode = 'view', onTableClick }: FloorPlanCanvasProps) {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  const svgWidth = 640
  const svgHeight = 480

  function handleTableClick(table: Table) {
    setSelectedTable(table.id === selectedTable ? null : table.id)
    onTableClick?.(table)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex flex-wrap gap-3 mb-4">
        {LEGEND.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm border border-black/10"
              style={{ backgroundColor: TABLE_STATUS_COLORS[item.status] }}
            />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl bg-gray-50 overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full"
          style={{ minWidth: '400px' }}
        >
          {/* Floor grid lines */}
          {Array.from({ length: 7 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1="0" y1={i * 70 + 20} x2={svgWidth} y2={i * 70 + 20}
              stroke="#e5e7eb" strokeWidth="1"
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * 70 + 20} y1="0" x2={i * 70 + 20} y2={svgHeight}
              stroke="#e5e7eb" strokeWidth="1"
            />
          ))}

          {tables.map((table) => {
            const color = TABLE_STATUS_COLORS[table.status]
            const isHovered = hoveredTable === table.id
            const isSelected = selectedTable === table.id
            const w = table.shape === 'round' ? 70 : 90
            const h = table.shape === 'round' ? 70 : 60

            return (
              <g
                key={table.id}
                transform={`translate(${table.x}, ${table.y})`}
                onClick={() => handleTableClick(table)}
                onMouseEnter={() => setHoveredTable(table.id)}
                onMouseLeave={() => setHoveredTable(null)}
                className={mode !== 'view' ? 'cursor-pointer' : 'cursor-pointer'}
                style={{ userSelect: 'none' }}
              >
                {table.shape === 'round' ? (
                  <circle
                    cx={w / 2} cy={h / 2} r={w / 2 - 2}
                    fill={color}
                    fillOpacity={0.85}
                    stroke={isSelected ? '#D4AF37' : isHovered ? '#1F4E79' : '#fff'}
                    strokeWidth={isSelected || isHovered ? 3 : 2}
                  />
                ) : (
                  <rect
                    x={1} y={1} width={w - 2} height={h - 2}
                    rx={8}
                    fill={color}
                    fillOpacity={0.85}
                    stroke={isSelected ? '#D4AF37' : isHovered ? '#1F4E79' : '#fff'}
                    strokeWidth={isSelected || isHovered ? 3 : 2}
                  />
                )}

                {/* Chair indicators (small dots around table) */}
                {Array.from({ length: Math.min(table.capacity, 6) }).map((_, i) => {
                  const angle = (i / Math.min(table.capacity, 6)) * 2 * Math.PI - Math.PI / 2
                  const radius = (w < h ? w : h) / 2 + 10
                  const cx2 = w / 2 + Math.cos(angle) * radius
                  const cy2 = h / 2 + Math.sin(angle) * radius
                  return (
                    <circle key={i} cx={cx2} cy={cy2} r={5} fill="#9ca3af" />
                  )
                })}

                <text
                  x={w / 2} y={h / 2 - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  T{table.number}
                </text>
                <text
                  x={w / 2} y={h / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="9"
                  opacity="0.9"
                >
                  {table.capacity}p
                </text>

                {/* Tooltip on hover */}
                {isHovered && (
                  <g transform={`translate(${w + 4}, -10)`}>
                    <rect x={0} y={0} width={130} height={56} rx={6} fill="white" stroke="#e5e7eb" strokeWidth={1} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                    <text x={8} y={16} fontSize="11" fontWeight="600" fill="#6D071A">Table {table.number}</text>
                    <text x={8} y={30} fontSize="10" fill="#6b7280">{TABLE_STATUS_LABELS[table.status]}</text>
                    <text x={8} y={44} fontSize="10" fill="#6b7280">Capacity: {table.capacity}</text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {mode === 'edit' && (
        <p className="text-xs text-gray-500 mt-2 text-center">Click a table to edit its properties</p>
      )}
    </div>
  )
}
