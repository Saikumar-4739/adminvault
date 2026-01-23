'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const COLORS = {
    violet: '#8B5CF6',
    purple: '#A855F7',
};

interface EmployeeDeptChartProps {
     data: any[] 
}

export const EmployeeDeptChart: React.FC<EmployeeDeptChartProps> = ({ data  }) => {
    if (!data || data.length === 0) return <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">No data</div>;

    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={100}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.violet} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    fontWeight={500}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                />
                <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    fontWeight={500}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS.violet}
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
