'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const COLORS = {
    amber: '#F59E0B',
    orange: '#F97316',
};

interface TicketPriorityChartProps {
    data: any[]
}

export default function TicketPriorityChart({ data }: TicketPriorityChartProps) {
    if (!data || data.length === 0) return <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">No data</div>;

    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={100}>
            <BarChart data={data}>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.amber} stopOpacity={1} />
                        <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0.7} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    fontWeight={500}
                />
                <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    fontWeight={500}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }}
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                />
                <Bar
                    dataKey="value"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    barSize={35}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
