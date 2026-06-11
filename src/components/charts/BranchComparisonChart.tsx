import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

const MOCK_BRANCH_DATA = [
  { branch: 'London',     revenue: 0, orders: 0, covers: 0 },
  { branch: 'Manchester', revenue: 0, orders: 0, covers: 0 },
  { branch: 'Leeds',      revenue: 0, orders: 0, covers: 0 },
  { branch: 'Birmingham', revenue: 0, orders: 0, covers: 0 },
  { branch: 'Liverpool',  revenue: 0, orders: 0, covers: 0 },
]

interface BranchComparisonChartProps {
  data?: { branch: string; revenue: number; orders: number; covers: number }[]
  title?: string
}

export function BranchComparisonChart({ data = MOCK_BRANCH_DATA, title = 'Branch Revenue Comparison' }: BranchComparisonChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-serif font-semibold text-maroon mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v, name) => name === 'revenue' ? [formatCurrency(v as number), 'Revenue'] : [v, name]} />
          <Legend formatter={(value: string) => value === 'covers' ? 'Covers (guests served)' : 'Revenue (£)'} />
          <Bar dataKey="revenue" fill="#6D071A" radius={[4, 4, 0, 0]} name="revenue" />
          <Bar dataKey="covers" fill="#D4AF37" radius={[4, 4, 0, 0]} name="covers" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
