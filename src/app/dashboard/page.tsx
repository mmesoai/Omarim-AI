
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ShoppingBag, Send, PlusCircle, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

const leadStatusColors: { [key: string]: string } = {
  New: '#3b82f6', // blue-500
  Contacted: '#f97316', // orange-500
  Interested: '#22c55e', // green-500
  Replied: '#eab308', // yellow-500
  'Not Interested': '#ef4444', // red-500
  default: '#6b7280', // gray-500
};

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const leadsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/leads`);
  }, [firestore, user]);

  const productsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/products`);
  }, [firestore, user]);

  const sequencesCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/outreachSequences`);
  }, [firestore, user]);

  const { data: leads, isLoading: isLoadingLeads } = useCollection(leadsCollectionRef);
  const { data: products, isLoading: isLoadingProducts } = useCollection(productsCollectionRef);
  const { data: sequences, isLoading: isLoadingSequences } = useCollection(sequencesCollectionRef);

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
  
  const isLoading = isLoadingLeads || isLoadingProducts || isLoadingSequences;

  const kpiData = [
    { title: 'Total Leads', value: leads?.length ?? 0, icon: Users, path: '/dashboard/leads' },
    { title: 'Synced Products', value: products?.length ?? 0, icon: ShoppingBag, path: '/dashboard/stores' },
    { title: 'Outreach Sequences', value: sequences?.length ?? 0, icon: Send, path: '/dashboard/outreach' },
  ];

  const recentActivities = [
    { icon: Activity, text: "AI agent identified 5 new leads.", time: "10m ago" },
    { icon: Send, text: "Outreach email sent to 'Innovate Inc.'", time: "1h ago" },
    { icon: PlusCircle, text: "You added a new product 'Smart Watch'.", time: "3h ago" },
    { icon: Users, text: "Lead 'Alex Morgan' status changed to 'Contacted'.", time: "yesterday" },
  ];


  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1" onClick={() => router.push(kpi.path)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                Click to view details
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
         <Button variant="outline" className="h-20 w-full justify-start p-4 text-left" onClick={() => router.push('/dashboard/leads')}>
            <PlusCircle className="mr-4 h-6 w-6 text-primary" />
            <div>
                <p className="font-semibold">Add New Lead</p>
                <p className="text-sm font-normal text-muted-foreground">Manually add a lead to your pipeline.</p>
            </div>
         </Button>
         <Button variant="outline" className="h-20 w-full justify-start p-4 text-left" onClick={() => router.push('/dashboard/outreach')}>
            <Send className="mr-4 h-6 w-6 text-primary" />
             <div>
                <p className="font-semibold">Create Sequence</p>
                <p className="text-sm font-normal text-muted-foreground">Start a new email outreach campaign.</p>
            </div>
         </Button>
         <Button variant="outline" className="h-20 w-full justify-start p-4 text-left" onClick={() => router.push('/dashboard/settings?tab=integrations')}>
            <ShoppingBag className="mr-4 h-6 w-6 text-primary" />
             <div>
                <p className="font-semibold">Connect a Store</p>
                <p className="text-sm font-normal text-muted-foreground">Sync products from Shopify, etc.</p>
            </div>
         </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Lead Status Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Lead Status Overview</CardTitle>
            <CardDescription>A breakdown of your current lead pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
             {leads && leads.length > 0 ? (
                <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={leadStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {leadStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))'
                    }}/>
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex h-80 w-full flex-col items-center justify-center text-center">
                  <Users className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-semibold">No Lead Data</p>
                  <p className="text-muted-foreground">Add leads to see your pipeline overview.</p>
                  <Button variant="secondary" className="mt-4" onClick={() => router.push('/dashboard/leads')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add a Lead
                  </Button>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A log of recent system and AI actions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                <activity.icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">{activity.text}</p>
                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
