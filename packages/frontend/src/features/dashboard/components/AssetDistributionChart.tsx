'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
    emerald: '#10B981',
    teal: '#14B8A6',
    cyan: '#06B6D4',
    sky: '#0EA5E9',
    blue: '#3B82F6',
    violet: '#8B5CF6',
    amber: '#F59E0B',
    rose: '#F43F5E',
    fuchsia: '#D946EF',
    orange: '#F97316',
};

const CHART_COLORS = [
    COLORS.emerald, COLORS.violet, COLORS.amber, COLORS.rose,
    COLORS.cyan, COLORS.fuchsia, COLORS.orange, COLORS.blue
];

interface AssetDistributionChartProps {
     data: any[] 
}

export const AssetDistributionChart: React.FC<AssetDistributionChartProps> = ({ data  }) => {
    // If data is empty or invalid, show empty state or return null
    if (!data || data.length === 0) return <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">No data</div>;

    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={100}>
            <PieChart>
                <defs>
                    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={1} />
                        <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.8} />
                    </linearGradient>
                </defs>
                <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    ))}
                </Pie>
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
                <Legend
                    verticalAlign="bottom"
                    height={24}
                    iconSize={10}
                    wrapperStyle={{ fontSize: '11px', fontWeight: '500' }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
