
"use client";

import { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

const leadStatusColors: { [key: string]: string } = {
  New: 'hsl(var(--chart-1))',
  Contacted: 'hsl(var(--chart-2))',
  Interested: 'hsl(var(--chart-3))',
  Replied: 'hsl(var(--chart-4))',
  'Not Interested': 'hsl(var(--chart-5))',
  default: 'hsl(var(--muted-foreground))',
};

export function LeadIntelligenceChart({ leads }: { leads: any[] | null }) {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const leadStatusData = useMemo(() => {
        if (!leads) return [];
        const statusCounts = leads.reduce((acc, lead) => {
          const status = lead.status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });
    
        return Object.entries(statusCounts).map(([name, value]) => ({ 
            name, 
            value,
            fill: leadStatusColors[name as keyof typeof leadStatusColors] || leadStatusColors.default
        }));
    }, [leads]);
    
    // First, gate the rendering to only happen on the client
    if (!isClient) {
        return <div className="h-[150px] w-full flex items-center justify-center"><Users className="h-8 w-8 text-muted-foreground" /></div>;
    }

    // After confirming we are on the client, check for data
    if (!leads || leads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center bg-muted/50 rounded-lg p-4 h-full">
                <Users className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold">No Lead Data</p>
                <p className="text-xs text-muted-foreground">Your pipeline will appear here.</p>
            </div>
        )
    }

    // Only render the chart if we are on the client AND have data
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie
                data={leadStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={60}
                innerRadius={30}
                fill="#8884d8"
                dataKey="value"
            >
                {leadStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                ))}
            </Pie>
            <Tooltip 
                cursor={{fill: 'hsla(var(--muted), 0.5)'}}
                contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontSize: '0.8rem',
            }}/>
             <Legend 
                iconSize={8}
                wrapperStyle={{fontSize: '0.7rem', marginLeft: '10px'}}
                payload={leadStatusData.map(item => ({ value: item.name, type: 'square', color: item.fill }))}
             />
            </PieChart>
        </ResponsiveContainer>
    );
}
