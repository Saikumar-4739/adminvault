'use client';

import React from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import { Clock } from 'lucide-react';

interface Activity {
    id: number;
    user: string;
    action: string;
    time: string;
    type: 'success' | 'warning' | 'info';
}

const activities: Activity[] = [
    { id: 1, user: 'John Doe', action: 'Created new employee record', time: '2 min ago', type: 'success' },
    { id: 2, user: 'Jane Smith', action: 'Updated asset information', time: '15 min ago', type: 'info' },
    { id: 3, user: 'Mike Johnson', action: 'Resolved ticket #1234', time: '1 hour ago', type: 'success' },
    { id: 4, user: 'Sarah Williams', action: 'Assigned new device', time: '2 hours ago', type: 'warning' },
    { id: 5, user: 'Tom Brown', action: 'Added IT admin user', time: '3 hours ago', type: 'info' },
];

const RecentActivity: React.FC = () => {
    return (
        <Card variant="glass">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity, index) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex-shrink-0 mt-1">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                                    {activity.user.split(' ').map(n => n[0]).join('')}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-200">{activity.user}</p>
                                <p className="text-sm text-slate-400 truncate">{activity.action}</p>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                <Badge variant={activity.type} size="sm">{activity.type}</Badge>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Clock className="h-3 w-3" />
                                    <span>{activity.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default RecentActivity;
