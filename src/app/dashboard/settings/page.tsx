
"use client"

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, PlusCircle, ShoppingCart, Mail, BarChart, Twitter, Linkedin, Facebook, Youtube, Instagram, CreditCard, Shirt } from "lucide-react";

const storeFormSchema = z.object({
  name: z.string().min(2, { message: "Store name must be at least 2 characters." }),
  type: z.enum(["Shopify", "WooCommerce", "Amazon", "eBay"], { required_error: "Please select a store platform."}),
  apiKey: z.string().min(10, { message: "API Key seems too short." }),
  apiUrl: z.string().url({ message: "Please enter a valid URL." }),
});

const genericIntegrationSchema = z.object({
    apiKey: z.string().min(10, { message: "API Key is required." }),
});

type IntegrationDialogState = {
    isOpen: boolean;
    type: 'store' | 'sendgrid' | 'clearbit' | 'gmail' | 'smtp' | 'stripe' | 'paypal' | 'printify';
}

export default function SettingsPage() {
  const [integrationDialog, setIntegrationDialog] = useState<IntegrationDialogState>({ isOpen: false, type: 'store' });
  const { user } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();

  const storesCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/stores`);
  }, [firestore, user]);

  const { data: stores, isLoading: isLoadingStores } = useCollection(storesCollectionRef);

  const storeForm = useForm<z.infer<typeof storeFormSchema>>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: { name: "", apiKey: "", apiUrl: "" },
  });

  const genericForm = useForm<z.infer<typeof genericIntegrationSchema>>({
    resolver: zodResolver(genericIntegrationSchema),
    defaultValues: { apiKey: "" },
  });

  useEffect(() => {
    const action = searchParams.get('action');
    const storeType = searchParams.get('storeType');
    if (action === 'addStore') {
      openIntegrationDialog('store');
      if (storeType && ["Shopify", "WooCommerce", "Amazon", "eBay"].includes(storeType)) {
        storeForm.setValue('type', storeType as "Shopify" | "WooCommerce" | "Amazon" | "eBay");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, storeForm]);

  function onStoreSubmit(values: z.infer<typeof storeFormSchema>) {
    if (!storesCollectionRef) return;
    addDocumentNonBlocking(storesCollectionRef, values);
    storeForm.reset();
    setIntegrationDialog({ ...integrationDialog, isOpen: false });
  }
  
  function onGenericSubmit(values: z.infer<typeof genericIntegrationSchema>) {
    console.log(`Connecting ${integrationDialog.type} with key:`, values.apiKey);
    genericForm.reset();
    setIntegrationDialog({ ...integrationDialog, isOpen: false });
  }

  const openIntegrationDialog = (type: IntegrationDialogState['type']) => {
    setIntegrationDialog({ isOpen: true, type });
  }

  const renderDialogContent = () => {
    switch (integrationDialog.type) {
        case 'store':
            return (
                <>
                 <DialogHeader>
                    <DialogTitle>Add New Store</DialogTitle>
                    <DialogDescription>Enter the details for your new e-commerce store integration.</DialogDescription>
                  </DialogHeader>
                  <Form {...storeForm}>
                    <form onSubmit={storeForm.handleSubmit(onStoreSubmit)} className="space-y-4">
                       <FormField control={storeForm.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>Store Name</FormLabel><FormControl><Input placeholder="My Awesome Store" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                      <FormField control={storeForm.control} name="type" render={({ field }) => (
                          <FormItem><FormLabel>Platform</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a platform" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Shopify">Shopify</SelectItem><SelectItem value="WooCommerce">WooCommerce</SelectItem><SelectItem value="Amazon">Amazon</SelectItem><SelectItem value="eBay">eBay</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                       <FormField control={storeForm.control} name="apiUrl" render={({ field }) => (
                          <FormItem><FormLabel>API URL</FormLabel><FormControl><Input placeholder="https://my-store.myshopify.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                       <FormField control={storeForm.control} name="apiKey" render={({ field }) => (
                          <FormItem><FormLabel>API Key</FormLabel><FormControl><Input type="password" placeholder="shpat_xxxxxxxxxxxx" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                      <DialogFooter><Button type="submit">Connect Store</Button></DialogFooter>
                    </form>
                  </Form>
                </>
            );
        case 'sendgrid':
        case 'clearbit':
        case 'gmail':
        case 'stripe':
        case 'paypal':
        case 'printify':
             const details = {
                 sendgrid: { title: 'Connect SendGrid', description: 'Enter your API key to enable sending outreach emails.' },
                 clearbit: { title: 'Connect Clearbit', description: 'Enter your API key to enrich lead data.' },
                 gmail: { title: 'Connect Gmail', description: 'Begin the process to securely connect your Gmail account for sending and receiving emails.'},
                 stripe: { title: 'Connect Stripe', description: 'Enter your Stripe API key to process payments.'},
                 paypal: { title: 'Connect PayPal', description: 'Enter your PayPal API credentials to process payments.'},
                 printify: { title: 'Connect Printify', description: 'Enter your Printify API key to enable autonomous print-on-demand product creation.'},
             }[integrationDialog.type];
            return (
                <>
                <DialogHeader><DialogTitle>{details.title}</DialogTitle><DialogDescription>{details.description}</DialogDescription></DialogHeader>
                { integrationDialog.type === 'gmail' ? (
                     <DialogFooter><Button onClick={() => setIntegrationDialog({...integrationDialog, isOpen: false})}>Connect with Google</Button></DialogFooter>
                ) : (
                <Form {...genericForm}>
                    <form onSubmit={genericForm.handleSubmit(onGenericSubmit)} className="space-y-4">
                        <FormField control={genericForm.control} name="apiKey" render={({ field }) => (
                            <FormItem><FormLabel>API Key</FormLabel><FormControl><Input type="password" placeholder="Enter your API key" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <DialogFooter><Button type="submit">Connect</Button></DialogFooter>
                    </form>
                </Form>
                )}
                </>
            );
        default:
            return null;
    }
  }

  const IntegrationCard = ({ title, description, children } : {title:string, description:string, children: React.ReactNode}) => (
      <Card>
          <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
              {children}
          </CardContent>
      </Card>
  );

  const IntegrationRow = ({ icon: Icon, name, description, action, isConnected=false }: { icon: React.ElementType, name: string, description: string, action: () => void, isConnected?: boolean }) => (
      <div className="flex items-center justify-between rounded-md border p-4">
          <div className="flex items-center gap-4">
              <Icon className="h-6 w-6" />
              <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
              </div>
          </div>
          {isConnected ? (
              <div className="flex items-center gap-2">
                <p className="text-sm text-green-500">Connected</p>
                <Button variant="outline" size="sm">Disconnect</Button>
              </div>
          ) : (
            <Button variant="secondary" onClick={action}>Connect</Button>
          )}
      </div>
  );

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-headline font-semibold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and integrations.
        </p>
      </div>

      <Tabs defaultValue={searchParams.get('tab') || "profile"} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Make changes to your public information here.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" defaultValue="John Doe" /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" defaultValue="john.doe@example.com" disabled/></div>
            </CardContent>
            <CardFooter><Button>Save changes</Button></CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader><CardTitle>Billing</CardTitle><CardDescription>Manage your billing information and view your invoices.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <p className="font-medium">Current Plan: <span className="text-primary">E-commerce</span></p>
                <p className="text-sm text-muted-foreground">Your next billing date is on the 1st of next month.</p>
                <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="flex items-center justify-between rounded-md border p-4"><p>Visa ending in 1234</p><Button variant="outline">Update</Button></div>
                </div>
            </CardContent>
            <CardFooter><Button variant="secondary">View Invoices</Button></CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
            <div className="space-y-6">
                <Dialog open={integrationDialog.isOpen} onOpenChange={(isOpen) => setIntegrationDialog({ ...integrationDialog, isOpen })}>
                    <DialogContent className="sm:max-w-[425px]">{renderDialogContent()}</DialogContent>
                </Dialog>
                
                <IntegrationCard title="Email & Outreach" description="Connect your email providers to send outreach and analyze replies.">
                     <IntegrationRow icon={Mail} name="Gmail" description="Connect your Google account" action={() => openIntegrationDialog('gmail')} />
                    <IntegrationRow icon={Mail} name="SendGrid" description="Use SendGrid for high-volume email sending" action={() => openIntegrationDialog('sendgrid')} />
                </IntegrationCard>

                <IntegrationCard title="Payment Gateways" description="Connect payment providers to process transactions for products and services.">
                    <IntegrationRow icon={CreditCard} name="Stripe" description="Process credit card payments" action={() => openIntegrationDialog('stripe')} />
                    <IntegrationRow icon={CreditCard} name="PayPal" description="Accept PayPal and alternative payments" action={() => openIntegrationDialog('paypal')} />
                </IntegrationCard>

                <IntegrationCard title="Social Media Publishing" description="Connect your social accounts to publish content autonomously.">
                    <IntegrationRow icon={Twitter} name="X (Twitter)" description="Publish threads and posts" action={() => {}} />
                    <IntegrationRow icon={Linkedin} name="LinkedIn" description="Publish articles and posts" action={() => {}} />
                    <IntegrationRow icon={Facebook} name="Facebook" description="Publish to your pages and groups" action={() => {}} />
                    <IntegrationRow icon={Instagram} name="Instagram" description="Publish reels and stories" action={() => {}} />
                    <IntegrationRow icon={Youtube} name="YouTube" description="Publish shorts and videos" action={() => {}} />
                </IntegrationCard>

                <IntegrationCard title="E-commerce & Fulfillment" description="Sync products from your online stores and manage fulfillment.">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Connect and manage your stores.</p>
                        <Button onClick={() => openIntegrationDialog('store')}><PlusCircle className="mr-2 h-4 w-4" /> Add Store</Button>
                    </div>
                     {isLoadingStores && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {!isLoadingStores && stores && stores.map((store) => (
                       <div key={store.id} className="flex items-center justify-between rounded-md border bg-card/50 p-4">
                          <div><p className="font-medium">{store.name}</p><p className="text-sm text-muted-foreground">{store.type}</p></div>
                          <div className="flex items-center gap-2"><p className="text-sm text-green-500">Connected</p><Button variant="outline" size="sm">Disconnect</Button></div>
                      </div>
                    ))}
                    {!isLoadingStores && (!stores || stores.length === 0) && (<p className="text-center text-sm text-muted-foreground py-4">No stores connected yet.</p>)}
                    <IntegrationRow icon={Shirt} name="Printify" description="Print-on-demand product fulfillment" action={() => openIntegrationDialog('printify')} />
                </IntegrationCard>

                <IntegrationCard title="Data & Enrichment" description="Enhance your lead and customer data.">
                    <IntegrationRow icon={BarChart} name="Clearbit" description="Enrich leads with company and contact data" action={() => openIntegrationDialog('clearbit')} />
                </IntegrationCard>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

    