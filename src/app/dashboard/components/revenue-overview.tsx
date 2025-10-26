
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function RevenueOverview() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const revenueData = [
        { name: 'Jan', "Website Sales": 4000, "E-Commerce": 2400, "Lead Gen": 1200 },
        { name: 'Feb', "Website Sales": 3000, "E-Commerce": 1398, "Lead Gen": 1100 },
        { name: 'Mar', "Website Sales": 5000, "E-Commerce": 6800, "Lead Gen": 1500 },
        { name: 'Apr', "Website Sales": 4780, "E-Commerce": 3908, "Lead Gen": 1800 },
        { name: 'May', "Website Sales": 6900, "E-Commerce": 4800, "Lead Gen": 2100 },
        { name: 'Jun', "Website Sales": 7390, "E-Commerce": 3800, "Lead Gen": 2500 },
    ];

    if (!isClient) {
        return (
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Monthly performance across all business units.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly performance across all business units.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'hsl(var(--border))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'hsla(var(--muted))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Legend iconSize={10} wrapperStyle={{fontSize: '0.8rem'}}/>
                  <Bar dataKey="Website Sales" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="E-Commerce" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Lead Gen" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
    )
}

    