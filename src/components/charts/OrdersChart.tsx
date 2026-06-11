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

const MOCK_ORDERS_DATA = [
  { category: 'Starters', count: 48 },
  { category: 'Steaks', count: 35 },
  { category: 'Mains', count: 29 },
  { category: 'Desserts', count: 22 },
  { category: 'Drinks', count: 67 },
]

interface OrdersChartProps {
  data?: { category: string; count: number }[]
  title?: string
}

export function OrdersChart({ data = MOCK_ORDERS_DATA, title = "Today's Orders by Category" }: OrdersChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-serif font-semibold text-maroon mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Orders" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
