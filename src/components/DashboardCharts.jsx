import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const axisStyle = { fontSize: 12, fill: '#64957e' }
const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #dfeae3',
  boxShadow: '0 12px 32px -16px rgb(16 24 40 / 0.25)',
  fontSize: 12,
  fontWeight: 600,
  padding: '8px 12px',
}

export function ChartCard({ title, description, action, children, className, height = 300 }) {
  return (
    <section className={`card p-5 ${className ?? ''}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description ? <p className="mt-0.5 text-xs text-forest-500">{description}</p> : null}
        </div>
        {action}
      </div>
      <div style={{ height }}>{children}</div>
    </section>
  )
}

export function MonthlyBars({ data, dataKey = 'meals', name = 'Meals', color = '#12894c' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4ede7" vertical={false} />
        <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(18,137,76,0.06)' }} />
        <Bar dataKey={dataKey} name={name} fill={color} radius={[8, 8, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TrendArea({ data, dataKey = 'meals', name = 'Meals', color = '#12894c' }) {
  const id = `grad-${dataKey}`
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4ede7" vertical={false} />
        <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2.5} fill={`url(#${id})`} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function DualLine({ data, series = [] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4ede7" vertical={false} />
        <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
        {series.map((item) => (
          <Line
            key={item.dataKey}
            type="monotone"
            dataKey={item.dataKey}
            name={item.name}
            stroke={item.color}
            strokeWidth={2.5}
            dot={{ r: 2.5, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({ data, nameKey = 'name', valueKey = 'value', legend = true }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          innerRadius="55%"
          outerRadius="82%"
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry[nameKey]} fill={entry.color ?? '#12894c'} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        {legend ? (
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
          />
        ) : null}
      </PieChart>
    </ResponsiveContainer>
  )
}

export function HorizontalBars({ data, dataKey = 'value', nameKey = 'name', color = '#12894c', unit = '' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4ede7" horizontal={false} />
        <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey={nameKey} tick={axisStyle} tickLine={false} axisLine={false} width={92} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(18,137,76,0.06)' }} />
        <Bar dataKey={dataKey} fill={color} radius={[0, 8, 8, 0]} maxBarSize={26} unit={unit} />
      </BarChart>
    </ResponsiveContainer>
  )
}
