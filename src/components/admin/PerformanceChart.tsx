import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface PerformanceChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="neu-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Performance</h3>
          <p className="text-sm text-muted-foreground">Agendamentos por mês</p>
        </div>
        <select className="input-neu text-sm px-3 py-2 rounded-xl">
          <option>Últimos 6 meses</option>
          <option>Último ano</option>
        </select>
      </div>
      
      <div className="h-64 chart-glow">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(252, 72%, 62%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(252, 72%, 62%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(252, 20%, 45%)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(252, 20%, 45%)', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(108, 76, 241, 0.15)',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(252, 72%, 62%)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
