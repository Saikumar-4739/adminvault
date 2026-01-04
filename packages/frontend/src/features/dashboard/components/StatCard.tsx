// 'use client';

// import React from 'react';
// import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
// import { TrendingUp, TrendingDown } from 'lucide-react';
// // import { motion } from 'framer-motion';

// interface StatCardProps {
//     title: string;
//     value: number;
//     change: number;
//     icon: React.ReactNode;
//     color: 'blue' | 'violet' | 'emerald' | 'amber';
// }

// const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
//     const isPositive = change >= 0;

//     const colorClasses = {
//         blue: 'from-blue-600 to-blue-700',
//         violet: 'from-violet-600 to-violet-700',
//         emerald: 'from-emerald-600 to-emerald-700',
//         amber: 'from-amber-600 to-amber-700',
//     };

//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//         >
//             <Card variant="glass" hover className="relative overflow-hidden">
//                 <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-16 -mt-16`} />

//                 <CardHeader>
//                     <div className="flex items-center justify-between">
//                         <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
//                         <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-20`}>
//                             {icon}
//                         </div>
//                     </div>
//                 </CardHeader>

//                 <CardContent>
//                     <div className="flex items-end justify-between">
//                         <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
//                             className="text-3xl font-bold text-white"
//                         >
//                             {value.toLocaleString()}
//                         </motion.div>

//                         <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
//                             {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
//                             <span>{Math.abs(change)}%</span>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </motion.div>
//     );
// };

// export default StatCard;
