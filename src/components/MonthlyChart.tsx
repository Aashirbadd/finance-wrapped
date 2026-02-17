import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Ledger } from '../types'

interface MonthlyChartProps {
  ledger: Ledger
  onDateSelect: (date: string) => void
}

interface DataPoint {
  index: number
  date: string
  label: string
  monthName: string
  monthIndex: number
  isMonthTotal: boolean
  income: number
  expenses: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Use a fixed range per month to ensure equal spacing
const MONTH_RANGE = 100

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function MonthlyChart({ ledger, onDateSelect }: MonthlyChartProps) {
  const { data, xAxisTicks, numMonths } = useMemo(() => {
    const result: DataPoint[] = []
    const ticks: { value: number; label: string }[] = []
    
    // Get all months that have at least one transaction
    const monthKeys = new Set<string>()
    ledger.forEach((transaction) => {
      const monthKey = transaction.date.substring(0, 7) // YYYY-MM
      monthKeys.add(monthKey)
    })
    
    // Sort the month keys
    const sortedKeys = Array.from(monthKeys).sort()
    
    const months: { key: string; name: string; year: number; month: number }[] = []
    sortedKeys.forEach((key) => {
      const [year, month] = key.split('-').map(Number)
      months.push({
        key,
        name: MONTHS[month - 1],
        year,
        month: month - 1
      })
    })
    
    const numMonths = months.length
    
    // Handle empty data case
    if (numMonths === 0) {
      return { data: [], xAxisTicks: [], numMonths: 0 }
    }
    
    const today = new Date()

    // Create a map of all transactions by date
    const transactionMap: Record<string, { income: number; expenses: number }> = {}
    ledger.forEach((transaction) => {
      const dateKey = transaction.date
      if (!transactionMap[dateKey]) {
        transactionMap[dateKey] = { income: 0, expenses: 0 }
      }
      if (transaction.amount > 0) {
        transactionMap[dateKey].income += transaction.amount
      } else {
        transactionMap[dateKey].expenses += Math.abs(transaction.amount)
      }
    })

    // Calculate cumulative running totals across all months
    let runningIncome = 0
    let runningExpenses = 0

    // Build data points for each month with running cumulative sums
    months.forEach((monthInfo, monthIdx) => {
      const daysInMonth = getDaysInMonth(monthInfo.year, monthInfo.month)
      const monthStartIndex = monthIdx * MONTH_RANGE
      
      // Add tick for month start
      ticks.push({ value: monthStartIndex, label: monthInfo.name })

      // Calculate position within the month (days are proportionally spaced)
      let monthEndIncome = 0
      let monthEndExpenses = 0

      // Add daily data points with running cumulative totals
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(monthInfo.year, monthInfo.month, day)
        const dateKey = formatDate(date)
        
        // Skip future dates
        if (date > today) continue

        // Calculate index within month (proportional to day)
        const dayIndex = monthStartIndex + Math.floor(((day - 1) / daysInMonth) * (MONTH_RANGE - 10))

        const dayData = transactionMap[dateKey]
        if (dayData && (dayData.income > 0 || dayData.expenses > 0)) {
          runningIncome += dayData.income
          runningExpenses += dayData.expenses
          monthEndIncome = runningIncome
          monthEndExpenses = runningExpenses
          
          result.push({
            index: dayIndex,
            date: dateKey,
            label: `${monthInfo.name} ${day}`,
            monthName: monthInfo.name,
            monthIndex: monthIdx,
            isMonthTotal: false,
            income: runningIncome,
            expenses: runningExpenses
          })
        }
      }

      // Add monthly total at the end of each month
      const lastDayOfMonth = new Date(monthInfo.year, monthInfo.month + 1, 0)
      const monthTotalIndex = monthStartIndex + MONTH_RANGE - 1
      if (lastDayOfMonth <= today && (monthEndIncome > 0 || monthEndExpenses > 0)) {
        const monthTotalDateKey = formatDate(lastDayOfMonth)
        result.push({
          index: monthTotalIndex,
          date: monthTotalDateKey,
          label: `${monthInfo.name} Total`,
          monthName: monthInfo.name,
          monthIndex: monthIdx,
          isMonthTotal: true,
          income: runningIncome,
          expenses: runningExpenses
        })
      }
    })

    return { data: result, xAxisTicks: ticks, numMonths }
  }, [ledger])

  // Handle empty data case
  if (!data || data.length === 0 || numMonths === 0) {
    return (
      <div className="card-main flex flex-col h-full min-h-[300px]">
        <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-4 shrink-0">Monthly Overview</h3>
        <div className="flex-1 flex items-center justify-center text-slate-400">
          No data available
        </div>
      </div>
    )
  }

  return (
    <div className="card-main flex flex-col h-full min-h-[300px]">
      <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-4 shrink-0">Monthly Overview</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={(event: any) => {
              // Use activeIndex to look up the date from our data array
              if (event && event.activeIndex !== undefined && data[event.activeIndex]) {
                const clickedDataPoint = data[event.activeIndex]
                onDateSelect(clickedDataPoint.date)
              }
            }}
          >
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
              dataKey="index" 
              type="number"
              stroke="#94a3b8"
              fontSize={12}
              domain={[0, (numMonths - 1) * MONTH_RANGE + MONTH_RANGE]}
              ticks={xAxisTicks.map(t => t.value)}
              tickFormatter={(value) => {
                const tick = xAxisTicks.find(t => t.value === value)
                return tick?.label || ''
              }}
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
              formatter={(value, name) => {
                const label = name === 'Income' ? 'Income' : 'Expenses'
                return [`$${Number(value).toFixed(2)}`, label]
              }}
              labelFormatter={(_, payload) => {
                if (payload && payload[0] && payload[0].payload) {
                  const p = payload[0].payload as DataPoint
                  return p.label
                }
                return ''
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="income" 
              name="Income" 
              stroke="#4ade80" 
              fillOpacity={1} 
              fill="url(#incomeGradient)" 
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props
                if (payload.isMonthTotal) {
                  return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill="#4ade80" stroke="#22c55e" strokeWidth={2} />
                }
                return null
              }}
              activeDot={{ r: 6 }}
            />
            <Area 
              type="linear" 
              dataKey="expenses" 
              name="Expenses" 
              stroke="#f87171" 
              fillOpacity={1} 
              fill="url(#expensesGradient)" 
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props
                if (payload.isMonthTotal) {
                  return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill="#f87171" stroke="#ef4444" strokeWidth={2} />
                }
                return null
              }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
