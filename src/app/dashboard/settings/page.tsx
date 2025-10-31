
"use client"

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, useDoc } from "@/firebase";
import { collection, doc, query, where } from 'firebase/firestore';
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
import { Loader2, PlusCircle, Mail, BarChart, Twitter, Linkedin, Facebook, Youtube, Instagram, CreditCard, Shirt, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";

const integrationFormSchema = z.object({
    apiKey: z.string().min(10, { message: "API Key must be at least 10 characters." }),
});

const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email(),
});

type IntegrationProvider = 'sendgrid' | 'clearbit' | 'stripe' | 'paypal' | 'printify' | 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'youtube';

type IntegrationDialogState = {
    isOpen: boolean;
    provider: IntegrationProvider | null;
}

const integrationDetails: Record<IntegrationProvider, { title: string, description: string, icon: React.ElementType }> = {
    sendgrid: { title: 'Connect SendGrid', description: 'Enter your API key to enable sending outreach emails.', icon: Mail },
    clearbit: { title: 'Connect Clearbit', description: 'Enter your API key to enrich lead data.', icon: BarChart },
    stripe: { title: 'Connect Stripe', description: 'Enter your Stripe API key to process payments.', icon: CreditCard },
    paypal: { title: 'Connect PayPal', description: 'Enter your PayPal API credentials to process payments.', icon: CreditCard },
    printify: { title: 'Connect Printify', description: 'Enter your Printify API key to enable autonomous print-on-demand product creation.', icon: Shirt },
    twitter: { title: 'Connect X (Twitter)', description: 'Publish threads and posts.', icon: Twitter },
    linkedin: { title: 'Connect LinkedIn', description: 'Publish articles and posts.', icon: Linkedin },
    facebook: { title: 'Connect Facebook', description: 'Publish to your pages and groups.', icon: Facebook },
    instagram: { title: 'Connect Instagram', description: 'Publish reels and stories.', icon: Instagram },
    youtube: { title: 'Connect YouTube', description: 'Publish shorts and videos.', icon: Youtube },
};


export default function SettingsPage() {
  const [integrationDialog, setIntegrationDialog] = useState<IntegrationDialogState>({ isOpen: false, provider: null });
  const { user } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, "users", user.uid) : null, [user, firestore]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  const integrationsCollectionRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/integrations`) : null, [user, firestore]);
  const { data: integrations, isLoading: isLoadingIntegrations } = useCollection(integrationsCollectionRef);

  const integrationForm = useForm<z.infer<typeof integrationFormSchema>>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: { apiKey: "" },
  });

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
      resolver: zodResolver(profileFormSchema),
      defaultValues: { firstName: "", lastName: "", email: "" }
  });

  useEffect(() => {
      if(userData) {
          profileForm.reset({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
          });
      }
  }, [userData, profileForm]);


  function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
      if (!userDocRef) return;
      setDocumentNonBlocking(userDocRef, {
          firstName: values.firstName,
          lastName: values.lastName,
      }, { merge: true });
      toast({
          title: "Profile Updated",
          description: "Your profile information has been saved.",
      });
  }
  
  async function onIntegrationSubmit(values: z.infer<typeof integrationFormSchema>) {
      const provider = integrationDialog.provider;
      if (!integrationsCollectionRef || !provider) return;

      const newIntegration = {
        provider: provider,
        apiKey: values.apiKey,
        createdAt: new Date(),
      };
      
      const integrationDocRef = doc(integrationsCollectionRef, provider);
      setDocumentNonBlocking(integrationDocRef, newIntegration, { merge: true });

      toast({
          title: "Integration Connected!",
          description: `Successfully connected to ${integrationDetails[provider].title.replace('Connect ', '')}.`
      });
      
      integrationForm.reset();
      setIntegrationDialog({ isOpen: false, provider: null });
  }

  const openIntegrationDialog = (provider: IntegrationProvider) => {
    setIntegrationDialog({ isOpen: true, provider });
  }

  const handleOAuthConnect = (provider: string) => {
      toast({
          title: `${provider} Connection`,
          description: "The full OAuth connection flow requires developer implementation.",
      });
  };

  const isConnected = (provider: IntegrationProvider | 'gmail') => {
      return !!integrations?.find(int => int.id === provider);
  }

  const IntegrationCard = ({ title, description, children } : {title:string, description:string, children: React.ReactNode}) => (
      <Card>
          <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
          <CardContent className="grid gap-4">{children}</CardContent>
      </Card>
  );

  const IntegrationRow = ({ provider, isOAuth }: { provider: IntegrationProvider | 'gmail', isOAuth?: boolean }) => {
    const details = integrationDetails[provider as IntegrationProvider];
    const connected = isConnected(provider);
    const title = details ? details.title.replace('Connect ', '') : 'Gmail';
    const description = details ? details.description : 'Allow Omarim to read and send emails on your behalf.';
    const Icon = details ? details.icon : Icons.google;

    return (
        <div className="flex items-center justify-between rounded-md border p-4">
            <div className="flex items-center gap-4">
                <Icon className="h-6 w-6" />
                <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            {connected ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-green-500">
                  <CheckCircle className="h-5 w-5" />
                  Connected
                </div>
            ) : isOAuth ? (
                <Button variant="secondary" onClick={() => handleOAuthConnect(title)}>
                  <Icons.google className="mr-2 h-4 w-4" /> Connect with Google
                </Button>
            ) : (
              <Button variant="secondary" onClick={() => openIntegrationDialog(provider as IntegrationProvider)}>Connect</Button>
            )}
        </div>
    );
};


  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-headline font-semibold">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and integrations.</p>
      </div>

      <Dialog open={integrationDialog.isOpen} onOpenChange={(isOpen) => setIntegrationDialog({ ...integrationDialog, isOpen })}>
        <DialogContent className="sm:max-w-[425px]">
            {integrationDialog.provider && (
                <>
                <DialogHeader>
                    <DialogTitle>{integrationDetails[integrationDialog.provider].title}</DialogTitle>
                    <DialogDescription>{integrationDetails[integrationDialog.provider].description}</DialogDescription>
                </DialogHeader>
                 <Form {...integrationForm}>
                    <form onSubmit={integrationForm.handleSubmit(onIntegrationSubmit)} className="space-y-4">
                        <FormField control={integrationForm.control} name="apiKey" render={({ field }) => (
                            <FormItem><FormLabel>API Key</FormLabel><FormControl><Input type="password" placeholder="Enter your secret API key" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <DialogFooter><Button type="submit" disabled={integrationForm.formState.isSubmitting}>Connect</Button></DialogFooter>
                    </form>
                </Form>
                </>
            )}
        </DialogContent>
      </Dialog>

      <Tabs defaultValue={searchParams.get('tab') || "profile"} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                    <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Make changes to your public information here.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        {isUserDataLoading ? <Loader2 className="animate-spin" /> :
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={profileForm.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={profileForm.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            </div>
                            <FormField control={profileForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl><FormMessage /></FormItem>)}/>
                        </>
                        }
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                            {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                        </Button>
                    </CardFooter>
                </form>
            </Form>
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
            {isLoadingIntegrations ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
                <div className="space-y-6">
                    <IntegrationCard title="Email & Outreach" description="Connect your email providers to send outreach and analyze replies.">
                        <IntegrationRow provider="gmail" isOAuth />
                        <IntegrationRow provider="sendgrid" />
                    </IntegrationCard>

                    <IntegrationCard title="Payment Gateways" description="Connect payment providers to process transactions.">
                        <IntegrationRow provider="stripe" />
                        <IntegrationRow provider="paypal" />
                    </IntegrationCard>

                    <IntegrationCard title="Social Media Publishing" description="Connect your social accounts to publish content autonomously.">
                        <IntegrationRow provider="twitter" />
                        <IntegrationRow provider="linkedin" />
                        <IntegrationRow provider="facebook" />
                        <IntegrationRow provider="instagram" />
                        <IntegrationRow provider="youtube" />
                    </IntegrationCard>

                    <IntegrationCard title="E-commerce & Fulfillment" description="Sync products from your online stores and manage fulfillment.">
                         <IntegrationRow provider="printify" />
                    </IntegrationCard>

                    <IntegrationCard title="Data & Enrichment" description="Enhance your lead and customer data.">
                        <IntegrationRow provider="clearbit" />
                    </IntegrationCard>
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
