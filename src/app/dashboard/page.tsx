
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
import { Loader2, Users, ShoppingBag, Send, Activity, ShieldCheck, Cpu, Bot, ChevronRight, FolderKanban, Building2, Mic, PlusCircle, DollarSign, List, CheckCircle, TrendingUp, UserCheck, Sparkles, Mail, Twitter, Linkedin, Facebook, Video, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { findTrendingProducts, generateProductCampaign } from '@/app/actions';
import type { GenerateProductCampaignInput, GenerateProductCampaignOutput } from "@/app/schemas";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import Image from 'next/image';


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
  const { toast } = useToast();

  const [trendingProduct, setTrendingProduct] = useState<GenerateProductCampaignInput | null>(null);
  const [campaignAssets, setCampaignAssets] = useState<GenerateProductCampaignOutput | null>(null);
  const [isCampaignLoading, setIsCampaignLoading] = useState(false);
  const [isFindingProduct, setIsFindingProduct] = useState(true);

  useEffect(() => {
    async function getTrendingProduct() {
      setIsFindingProduct(true);
      try {
        const result = await findTrendingProducts("home office tech");
        setTrendingProduct(result);
      } catch (error) {
        console.error("Failed to find trending products:", error);
      } finally {
        setIsFindingProduct(false);
      }
    }
    getTrendingProduct();
  }, []);

  const productsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/products`);
  }, [firestore, user]);

  async function handleApproveAndLaunch() {
    if (!trendingProduct || !productsCollectionRef) return;

    setIsCampaignLoading(true);
    setCampaignAssets(null);
    setTrendingProduct(null); // This will hide the proposal box
    toast({ title: "Approval Received", description: "AI is now generating campaign assets. This may take a moment..." });
    
    try {
      const campaignResult = await generateProductCampaign(trendingProduct);
      setCampaignAssets(campaignResult);

      const newProduct = {
        name: trendingProduct.productName,
        description: trendingProduct.description,
        price: trendingProduct.estimatedSalePrice,
        quantity: 100, 
        imageId: "product" + (Math.floor(Math.random() * 8) + 1),
        source: "AI Sourced",
      };
      addDocumentNonBlocking(productsCollectionRef, newProduct);
      
      toast({
        title: "Campaign Launched!",
        description: `${trendingProduct.productName} has been added to your products and marketing assets have been generated.`,
      });

    } catch (error) {
       console.error("Failed to launch campaign:", error);
       toast({
        variant: "destructive",
        title: "Campaign Launch Failed",
        description: "There was an error generating the marketing assets.",
      });
    } finally {
        setIsCampaignLoading(false);
    }
  }

  function handleReject() {
    setTrendingProduct(null);
    toast({
        title: "Proposal Rejected",
        description: "The AI will look for another product opportunity.",
    });
  }

  const leadsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/leads`);
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
    { title: "E-Commerce Engine", description: "Multi-store arbitrage, product sourcing, and inventory automation.", icon: Building2, value: products?.length ?? 0, unit: "Synced Products", path: "/dashboard/stores", action: () => router.push('/dashboard/settings?tab=integrations&action=addStore') },
    { title: "Content & Outreach Engine", description: "AI-powered content generation and automated email campaigns.", icon: Send, value: sequences?.length ?? 0, unit: "Sequences", path: "/dashboard/outreach" },
  ];

  const PlatformIcon = ({ platform }: { platform: string }) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return <Twitter className="h-5 w-5 text-sky-500" />;
      case 'linkedin': return <Linkedin className="h-5 w-5 text-blue-700" />;
      case 'facebook': return <Facebook className="h-5 w-5 text-blue-800" />;
      default: return <Bot className="h-5 w-5" />;
    }
  };


  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
       {trendingProduct && (
        <audio src="/audio/blip.mp3" autoPlay onLoadedData={() => {}} onError={() => {}} />
       )}
       <div>
        <h1 className="font-headline tracking-tight">
            <span className="text-3xl font-bold">Omarim AI</span>
            <span className="text-xl font-semibold text-muted-foreground"> Intelligent Warehouse</span>
        </h1>
        <p className="text-sm text-muted-foreground">Unified multi-business automation platform - Website Factory, E-Commerce Engine & Lead Intelligence in one place.</p>
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
         <Card className="flex flex-col transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 lg:col-span-2">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <FolderKanban className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-lg">Lead Intelligence Engine</CardTitle>
                        <CardDescription>B2B lead enrichment, automated outreach, and pipeline management.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                 {leads && leads.length > 0 ? (
                    <div className="h-[150px] w-full">
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
                         <Legend iconSize={8} wrapperStyle={{fontSize: '0.7rem', marginLeft: '10px'}} />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center bg-muted/50 rounded-lg p-4 h-full">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm font-semibold">No Lead Data</p>
                        <p className="text-xs text-muted-foreground">Your pipeline will appear here.</p>
                    </div>
                )}
                 <div>
                     <p className="text-2xl font-bold">{leads?.length ?? 0}</p>
                     <p className="text-xs text-muted-foreground">Active Leads</p>
                     <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/dashboard/leads")}>
                        Manage <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>

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
         {/* Recent Sales */}
        <Card className="lg:col-span-5">
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

      {(isFindingProduct || trendingProduct) && (
        <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Bot className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>AI Product Proposal</CardTitle>
                        <CardDescription>The autonomous agent has identified a new trending product opportunity.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            {isFindingProduct && (
                <CardContent className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="ml-4 text-muted-foreground">Searching for opportunities...</p>
                </CardContent>
            )}
            {trendingProduct && (
                <>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-4">
                                <h3 className="font-headline text-2xl font-bold text-foreground">{trendingProduct.productName}</h3>
                                <p className="text-sm text-muted-foreground">{trendingProduct.description}</p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        <span className="font-medium">Price Point:</span>
                                        <span className="text-foreground">${trendingProduct.estimatedSalePrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-primary" />
                                        <span className="font-medium">Target Audience:</span>
                                        <span className="text-foreground">{trendingProduct.targetAudience}</span>
                                    </div>
                                </div>
                            </div>
                            <Card className="bg-card/80">
                                <CardHeader>
                                    <CardTitle className="text-base">Supplier Intel</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="font-semibold">{trendingProduct.supplier.name}</p>
                                    <p className="text-sm text-muted-foreground">{trendingProduct.supplier.contactEmail}</p>
                                    <Button className="w-full mt-2" variant="outline">
                                        <Mail className="mr-2 h-4 w-4"/>
                                        Contact Supplier
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold text-foreground flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary"/> AI-Generated Marketing Angle</h4>
                            <p className="mt-2 text-sm text-muted-foreground">{trendingProduct.marketingAngle}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button onClick={handleApproveAndLaunch} disabled={isCampaignLoading || !!campaignAssets}>
                            {isCampaignLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4" />}
                            {!!campaignAssets ? "Campaign Launched" : "Approve & Launch Campaign"}
                        </Button>
                        <Button variant="ghost" onClick={handleReject} disabled={isCampaignLoading || !!campaignAssets}>Reject</Button>
                    </CardFooter>
                </>
            )}
        </Card>
      )}

      {isCampaignLoading && (
        <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
       )}

      {campaignAssets && (
        <Card>
            <CardHeader>
                <CardTitle>Generated Campaign Assets</CardTitle>
                <CardDescription>The AI has generated the following assets to market your new product.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg">Social Media Posts</h3>
                    {campaignAssets.socialPosts.map(post => (
                        <Card key={post.platform} className="bg-card/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                 <CardTitle className="text-base flex items-center gap-2">
                                    <PlatformIcon platform={post.platform} />
                                    {post.platform}
                                 </CardTitle>
                                <Button variant="secondary" size="sm">Schedule</Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {post.hashtags.map(tag => <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Marketing Image</h3>
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
                           <Image src={campaignAssets.marketingImage.imageUrl} alt={campaignAssets.marketingImage.prompt} fill className="object-cover" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 italic">Prompt: {campaignAssets.marketingImage.prompt}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Video className="h-5 w-5 text-primary" /> Video Concept</h3>
                        <Card className="bg-card/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{campaignAssets.videoConcept.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{campaignAssets.videoConcept.sceneDescription}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

    </div>
  );
}

    