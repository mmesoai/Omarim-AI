
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
  DialogTrigger,
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
import { Loader2, PlusCircle } from "lucide-react";


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
    type: 'store' | 'sendgrid' | 'clearbit';
}

export default function SettingsPage() {
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
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
    defaultValues: {
      name: "",
      apiKey: "",
      apiUrl: "",
    },
  });

  const genericForm = useForm<z.infer<typeof genericIntegrationSchema>>({
    resolver: zodResolver(genericIntegrationSchema),
    defaultValues: { apiKey: "" },
  });

  useEffect(() => {
    const action = searchParams.get('action');
    const storeType = searchParams.get('storeType');

    if (action === 'addStore') {
      setIntegrationDialog({ isOpen: true, type: 'store' });
      if (storeType && ["Shopify", "WooCommerce", "Amazon", "eBay"].includes(storeType)) {
        const capitalizedStoreType = storeType.charAt(0).toUpperCase() + storeType.slice(1);
        storeForm.setValue('type', capitalizedStoreType as "Shopify" | "WooCommerce" | "Amazon" | "eBay");
      }
    }
  }, [searchParams, storeForm]);


  function onStoreSubmit(values: z.infer<typeof storeFormSchema>) {
    if (!storesCollectionRef) return;
    addDocumentNonBlocking(storesCollectionRef, values);
    storeForm.reset();
    setIntegrationDialog({ isOpen: false, type: 'store' });
  }
  
  function onGenericSubmit(values: z.infer<typeof genericIntegrationSchema>) {
    // In a real app, you would save this API key to a secure place.
    console.log(`Connecting ${integrationDialog.type} with key:`, values.apiKey);
    genericForm.reset();
    setIntegrationDialog({ isOpen: false, type: integrationDialog.type });
  }

  const openIntegrationDialog = (type: 'store' | 'sendgrid' | 'clearbit') => {
    setIntegrationDialog({ isOpen: true, type });
  }

  const renderDialogContent = () => {
    switch (integrationDialog.type) {
        case 'store':
            return (
                <>
                 <DialogHeader>
                    <DialogTitle>Add New Store</DialogTitle>
                    <DialogDescription>
                      Enter the details for your new store integration.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...storeForm}>
                    <form onSubmit={storeForm.handleSubmit(onStoreSubmit)} className="space-y-4">
                       <FormField
                        control={storeForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store Name</FormLabel>
                            <FormControl>
                              <Input placeholder="My Awesome Store" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={storeForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a platform" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Shopify">Shopify</SelectItem>
                                <SelectItem value="WooCommerce">WooCommerce</SelectItem>
                                <SelectItem value="Amazon">Amazon</SelectItem>
                                <SelectItem value="eBay">eBay</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={storeForm.control}
                        name="apiUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://my-store.myshopify.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={storeForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="shpat_xxxxxxxxxxxx" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">Connect Store</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </>
            );
        case 'sendgrid':
        case 'clearbit':
             const title = integrationDialog.type === 'sendgrid' ? 'Connect SendGrid' : 'Connect Clearbit';
             const description = `Enter your API key to connect your ${integrationDialog.type} account.`;
            return (
                <>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Form {...genericForm}>
                    <form onSubmit={genericForm.handleSubmit(onGenericSubmit)} className="space-y-4">
                        <FormField
                            control={genericForm.control}
                            name="apiKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>API Key</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter your API key" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Connect</Button>
                        </DialogFooter>
                    </form>
                </Form>
                </>
            );
    }
  }


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
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Make changes to your public information here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" disabled/>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>
                Manage your billing information and view your invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="font-medium">Current Plan: <span className="text-primary">E-commerce</span></p>
                <p className="text-sm text-muted-foreground">Your next billing date is on the 1st of next month.</p>
                <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="flex items-center justify-between rounded-md border p-4">
                        <p>Visa ending in 1234</p>
                        <Button variant="outline">Update</Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary">View Invoices</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Connect your accounts from other services.
                </CardDescription>
              </div>
               <Dialog open={integrationDialog.isOpen} onOpenChange={(isOpen) => setIntegrationDialog({ ...integrationDialog, isOpen })}>
                <DialogContent className="sm:max-w-[425px]">
                    {renderDialogContent()}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                        <p className="font-medium">E-commerce Stores</p>
                        <p className="text-sm text-muted-foreground">Shopify, WooCommerce, etc.</p>
                    </div>
                    <Button onClick={() => openIntegrationDialog('store')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Store
                    </Button>
                </div>

                {isLoadingStores && <Loader2 className="mx-auto h-8 w-8 animate-spin" />}
                
                {!isLoadingStores && stores && stores.map((store) => (
                   <div key={store.id} className="flex items-center justify-between rounded-md border p-4 ml-8">
                      <div>
                        <p className="font-medium">{store.name}</p>
                        <p className="text-sm text-muted-foreground">{store.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-green-500">Connected</p>
                        <Button variant="outline">Disconnect</Button>
                      </div>
                  </div>
                ))}
                
                {!isLoadingStores && (!stores || stores.length === 0) && (
                  <p className="text-center text-sm text-muted-foreground py-4">No stores connected yet.</p>
                )}

                 <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                        <p className="font-medium">SendGrid</p>
                        <p className="text-sm text-muted-foreground">Email delivery service</p>
                    </div>
                    <Button variant="secondary" onClick={() => openIntegrationDialog('sendgrid')}>Connect</Button>
                </div>
                 <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                        <p className="font-medium">Clearbit</p>
                        <p className="text-sm text-muted-foreground">Data enrichment platform</p>
                    </div>
                    <Button variant="secondary" onClick={() => openIntegrationDialog('clearbit')}>Connect</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

    