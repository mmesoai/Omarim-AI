
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ShoppingBag, Send, Activity, ShieldCheck, Cpu, Bot, ChevronRight, FolderKanban, Building2, Mic, PlusCircle, DollarSign, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';


const leadStatusColors: { [key: string]: string } = {
  New: 'hsl(var(--chart-1))',
  Contacted: 'hsl(var(--chart-2))',
  Interested: 'hsl(var(--chart-3))',
  Replied: 'hsl(var(--chart-4))',
  'Not Interested': 'hsl(var(--chart-5))',
  default: 'hsl(var(--muted-foreground))',
};

const revenueData = [
  { name: 'Jan', "Website Sales": 4000, "E-Commerce": 2400, "Lead Gen": 1200 },
  { name: 'Feb', "Website Sales": 3000, "E-Commerce": 1398, "Lead Gen": 1100 },
  { name: 'Mar', "Website Sales": 5000, "E-Commerce": 6800, "Lead Gen": 1500 },
  { name: 'Apr', "Website Sales": 4780, "E-Commerce": 3908, "Lead Gen": 1800 },
  { name: 'May', "Website Sales": 6900, "E-Commerce": 4800, "Lead Gen": 2100 },
  { name: 'Jun', "Website Sales": 7390, "E-Commerce": 3800, "Lead Gen": 2500 },
];

const recentSales = [
    { id: 1, customer: "Olivia Martin", email: "olivia.martin@email.com", amount: "$42.50", product: "Smart Watch", source: "Shopify" },
    { id: 2, customer: "Jackson Lee", email: "jackson.lee@email.com", amount: "$199.99", product: "Wireless Headphones", source: "WooCommerce" },
    { id: 3, customer: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "$275.00", product: "VR Headset", source: "Shopify" },
    { id: 4, customer: "Liam Smith", email: "liam.smith@email.com", amount: "$89.90", product: "Ergonomic Chair", source: "Amazon" },
    { id: 5, customer: "Sophia Johnson", email: "sophia.johnson@email.com", amount: "$999.00", product: "Laptop", source: "WooCommerce" },
];

const sourceColors: { [key: string]: string } = {
  Shopify: "border-transparent bg-green-500/20 text-green-700",
  WooCommerce: "border-transparent bg-purple-500/20 text-purple-700",
  Amazon: "border-transparent bg-orange-500/20 text-orange-700",
};


const recentActivities = [
    { id: 1, icon: List, description: "AI Agent added 5 new leads from 'Local Businesses' campaign.", time: "2m ago", color: "text-blue-400" },
    { id: 2, icon: Send, description: "Outreach email sent to 'alex.morgan@innovate.com'.", time: "15m ago", color: "text-yellow-400" },
    { id: 3, icon: DollarSign, description: "New sale of $199.99 from WooCommerce store.", time: "1h ago", color: "text-green-400" },
    { id: 4, icon: Users, description: "Lead 'John Doe' status changed to 'Interested'.", time: "3h ago", color: "text-teal-400" },
    { id: 5, icon: Building2, description: "Successfully connected new Shopify store 'My Awesome Store'.", time: "1d ago", color: "text-pink-400" },
];

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
    { title: "E-Commerce Engine", description: "Multi-store arbitrage, product sourcing, and inventory automation.", icon: Building2, value: products?.length ?? 0, unit: "Synced Products", path: "/dashboard/stores", action: () => router.push('/dashboard/settings?tab=integrations&action=addStore') },
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
        <h1 className="font-headline tracking-tight">
            <span className="text-3xl font-bold">Omarim AI</span>
            <span className="text-2xl font-semibold text-muted-foreground"> Intelligent Warehouse</span>
        </h1>
        <p className="text-sm text-muted-foreground">Unified multi-business automation platform - Website Factory, E-Commerce Engine & Lead Intelligence in one place.</p>
      </div>
      
       <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Lead Status Overview</CardTitle>
                <CardDescription>A real-time breakdown of your current lead pipeline.</CardDescription>
            </CardHeader>
            <CardContent>
                {leads && leads.length > 0 ? (
                    <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={leadStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            innerRadius={70}
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
                        <Legend iconSize={10} wrapperStyle={{fontSize: '0.8rem'}} />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex h-[350px] w-full flex-col items-center justify-center text-center">
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
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <engine.icon className="h-8 w-8 text-primary" />
                            <CardTitle className="text-lg">{engine.title}</CardTitle>
                        </div>
                        {engine.action && (
                            <Button size="sm" variant="outline" onClick={engine.action} className="whitespace-nowrap">
                                <PlusCircle className="mr-2 h-4 w-4" /> Connect Store
                            </Button>
                        )}
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
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly performance across all business units.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
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
                  <Bar dataKey="Website Sales" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="E-Commerce" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Lead Gen" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
         {/* Recent Sales */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Recent E-commerce Activity</CardTitle>
                <CardDescription>An overview of your latest sales and AI-driven actions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="sales">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="sales">Recent Sales</TabsTrigger>
                        <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sales" className="pt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentSales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>
                                            <div className="font-medium">{sale.customer}</div>
                                            <div className="text-sm text-muted-foreground">{sale.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn("text-xs", sourceColors[sale.source] || "")}>
                                                {sale.source}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{sale.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                     <TabsContent value="activity">
                        <div className="space-y-4 pt-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-4">
                                    <Avatar className="h-9 w-9">
                                        <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", activity.color)}>
                                            <activity.icon className="h-5 w-5 text-background" />
                                        </div>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

    