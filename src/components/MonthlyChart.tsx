import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Ledger } from '../types'

interface MonthlyChartProps {
  ledger: Ledger
}

interface MonthData {
  month: string
  income: number
  expenses: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function MonthlyChart({ ledger }: MonthlyChartProps) {
  const data = useMemo(() => {
    // Group transactions by month
    const monthlyData: Record<string, MonthData> = {}

    // Get last 6 months
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = MONTHS[date.getMonth()]
      monthlyData[monthKey] = {
        month: monthName,
        income: 0,
        expenses: 0,
      }
    }

    // Aggregate transactions
    ledger.forEach((transaction) => {
      const monthKey = transaction.date.substring(0, 7) // YYYY-MM
      if (monthlyData[monthKey]) {
        if (transaction.amount > 0) {
          monthlyData[monthKey].income += transaction.amount
        } else {
          monthlyData[monthKey].expenses += Math.abs(transaction.amount)
        }
      }
    })

    return Object.values(monthlyData)
  }, [ledger])

  return (
    <div className="card-main flex flex-col h-full min-h-[300px]">
      <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-4 shrink-0">Monthly Overview</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="month" 
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`]}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="income" 
              name="Income" 
              stroke="#4ade80" 
              fillOpacity={1} 
              fill="url(#incomeGradient)" 
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              name="Expenses" 
              stroke="#f87171" 
              fillOpacity={1} 
              fill="url(#expensesGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
