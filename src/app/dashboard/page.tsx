
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ShoppingBag, Send, Activity, ShieldCheck, Cpu, Bot, ChevronRight, FolderKanban, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Progress } from "@/components/ui/progress";


const leadStatusColors: { [key: string]: string } = {
  New: 'var(--chart-1)',
  Contacted: 'var(--chart-2)',
  Interested: 'var(--chart-3)',
  Replied: 'var(--chart-4)',
  'Not Interested': 'var(--chart-5)',
  default: 'hsl(var(--muted-foreground))',
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
    { title: 'Total Leads', value: leads?.length ?? 0, icon: Users, change: "+45 today" },
    { title: 'Synced Products', value: products?.length ?? 0, icon: ShoppingBag, change: "+12 this week" },
    { title: 'Outreach Sequences', value: sequences?.length ?? 0, icon: Send, change: "+3" },
    { title: 'Active Campaigns', value: sequences?.filter(s => s.status === 'Active').length ?? 0, icon: Activity, change: "+1" },
  ];

  const controlCenterStatus = [
      { name: "AI Agent", status: "Operational", icon: Bot, progress: 100 },
      { name: "Data Sync", status: "Operational", icon: Cpu, progress: 100 },
      { name: "Voice Interface", status: "Operational", icon: Mic, progress: 100 },
      { name: "Security", status: "Enabled", icon: ShieldCheck, progress: 100 },
  ];

  const engineCards = [
    { title: "Lead Intelligence Engine", description: "B2B lead enrichment, automated outreach, and pipeline management.", icon: FolderKanban, value: leads?.length ?? 0, unit: "Active Leads", path: "/dashboard/leads" },
    { title: "E-Commerce Engine", description: "Multi-store arbitrage, product sourcing, and inventory automation.", icon: Building2, value: products?.length ?? 0, unit: "Synced Products", path: "/dashboard/stores" },
    { title: "Content & Outreach Engine", description: "AI-powered content generation and automated email campaigns.", icon: Send, value: sequences?.length ?? 0, unit: "Sequences", path: "/dashboard/outreach" },
  ];


  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Omarim AI Intelligent Warehouse</h1>
        <p className="text-muted-foreground">Unified multi-business automation platform - Website Factory, E-Commerce Engine & Lead Intelligence in one place.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Feature Engines */}
        {engineCards.map((engine, index) => (
            <Card key={index} className="flex flex-col transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <engine.icon className="h-8 w-8 text-primary" />
                        <CardTitle className="text-lg">{engine.title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{engine.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-end">
                    <div>
                        <p className="text-2xl font-bold">{engine.value}</p>
                        <p className="text-xs text-muted-foreground">{engine.unit}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => router.push(engine.path)}>
                        Manage <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Lead Status Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Lead Status Overview</CardTitle>
            <CardDescription>A real-time breakdown of your current lead pipeline.</CardDescription>
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
                          outerRadius={110}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                      }}/>
                      <Legend iconSize={10} />
                    </PieChart>
                </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex h-80 w-full flex-col items-center justify-center text-center">
                  <Users className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-semibold">No Lead Data</p>
                  <p className="text-muted-foreground">Add leads to see your pipeline overview.</p>
                  <Button variant="secondary" className="mt-4" onClick={() => router.push('/dashboard/leads')}>
                    Add a Lead
                  </Button>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Control Center */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Control Center</CardTitle>
                <CardDescription>Real-time system monitoring.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">All Systems Operational</span>
                </div>
                {controlCenterStatus.map((system, index) => (
                    <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-muted-foreground">{system.name}</span>
                            <span className="text-sm font-bold">{system.progress}%</span>
                        </div>
                        <Progress value={system.progress} indicatorClassName="bg-primary" />
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                 <Button variant="outline" className="w-full">
                    <Cpu className="mr-2 h-4 w-4"/>
                    Run System Check
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
