import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-gray-400">{label}</p>
        <p className="text-green-400 font-bold">{payload[0].value} XP total</p>
        {payload[1] && <p className="text-yellow-400">+{payload[1].value} XP this solve</p>}
      </div>
    );
  }
  return null;
};

export default function ProgressChart({ solves = [] }) {
  const chartData = useMemo(() => {
    const correct = solves.filter(s => s.is_correct).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    if (correct.length < 2) return [];
    let cumXP = 0;
    return correct.map(s => {
      cumXP += s.xp_earned || 0;
      return {
        date: new Date(s.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        xp: cumXP,
        earned: s.xp_earned || 0,
      };
    });
  }, [solves]);

  if (chartData.length < 2) return null;

  return (
    <Card className="bg-[#111] border border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-green-400" />
          XP Progress
          <span className="ml-auto text-xs text-gray-500 font-normal">{chartData.length} solves</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="xp" stroke="#22c55e" strokeWidth={2} fill="url(#xpFill)" dot={false} activeDot={{ r: 4, fill: '#22c55e' }} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}