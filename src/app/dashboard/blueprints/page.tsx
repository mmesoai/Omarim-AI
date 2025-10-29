
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Bot,
  Loader2,
  Sparkles,
  Package,
  Globe,
  List,
  Database,
  Users,
  Layers,
  FileText,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import {
  generateAppBlueprint,
  type GenerateAppBlueprintOutput,
} from '@/ai/flows/generate-app-blueprint';
import {
  generateSiteBlueprint,
  type GenerateSiteBlueprintOutput,
} from '@/ai/flows/generate-site-blueprint';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const blueprintFormSchema = z.object({
  description: z.string().min(20, {
    message: 'Please describe your idea in at least 20 characters.',
  }),
});

type BlueprintType = 'app' | 'website';

export default function BlueprintsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<BlueprintType>('app');
  const [appBlueprint, setAppBlueprint] =
    useState<GenerateAppBlueprintOutput | null>(null);
  const [siteBlueprint, setSiteBlueprint] =
    useState<GenerateSiteBlueprintOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof blueprintFormSchema>>({
    resolver: zodResolver(blueprintFormSchema),
    defaultValues: {
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof blueprintFormSchema>) {
    setIsLoading(true);
    setAppBlueprint(null);
    setSiteBlueprint(null);

    try {
      if (activeTab === 'app') {
        const response = await generateAppBlueprint({
          appDescription: values.description,
        });
        setAppBlueprint(response);
      } else {
        const response = await generateSiteBlueprint({
          description: values.description,
        });
        setSiteBlueprint(response);
      }
      toast({
        title: 'Blueprint Generated!',
        description: `The AI has created a new ${activeTab} blueprint for you.`,
      });
    } catch (error) {
      console.error('Blueprint generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI architect encountered an error.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const AppSection = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="space-y-4 rounded-lg border bg-card/50 p-6">
        <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold font-headline">{title}</h3>
        </div>
        <div className="pl-9">{children}</div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold md:text-4xl">
          AI Website/App Builder
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Transform your idea into a professional technical or website specification.
        </p>
      </div>

      <Tabs
        defaultValue="app"
        onValueChange={(value) => setActiveTab(value as BlueprintType)}
        className="w-full"
      >
        <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="app" className="gap-2">
                    <Package className="h-4 w-4"/> App Blueprint
                </TabsTrigger>
                <TabsTrigger value="website" className="gap-2">
                    <Globe className="h-4 w-4"/> Website Blueprint
                </TabsTrigger>
            </TabsList>
        </div>

        <Card className="mt-6 shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Describe Your Vision</CardTitle>
                <CardDescription>
                  Provide a clear description of your project. The AI will use
                  this to generate a tailored blueprint.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={
                            activeTab === 'app'
                              ? "e.g., 'An app that lets users track their reading habits and get recommendations.'"
                              : "e.g., 'A local bakery in San Francisco specializing in custom cakes.'"
                          }
                          {...field}
                          disabled={isLoading}
                          className="min-h-[150px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-5 w-5" />
                  )}
                  Generate Blueprint
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
            <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        )}
        
        {appBlueprint && (
            <Card className="border-none bg-transparent shadow-none mt-8">
            <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-4">
                <Bot className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle className="text-3xl">{appBlueprint.appName}</CardTitle>
                    <CardDescription className="text-lg">
                    {appBlueprint.tagline}
                    </CardDescription>
                </div>
                </div>
            </CardHeader>
            <CardContent className="mt-6 space-y-6">
                <AppSection icon={List} title="Core Features (MVP)">
                    <ul className="space-y-3 list-disc list-inside">
                        {appBlueprint.coreFeatures.map((feature, i) => (
                            <li key={i}>
                                <span className="font-semibold">{feature.name}:</span> <span className="text-muted-foreground">{feature.description}</span>
                            </li>
                        ))}
                    </ul>
                </AppSection>
                
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <AppSection icon={Database} title="Data Models">
                        <div className="space-y-3">
                            {appBlueprint.dataModels.map((model, i) => (
                                <div key={i}>
                                    <h4 className="font-semibold">{model.name}</h4>
                                    <p className="text-sm text-muted-foreground">{model.properties.join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    </AppSection>
                    <AppSection icon={Users} title="User Personas">
                        <div className="space-y-3">
                            {appBlueprint.userPersonas.map((persona, i) => (
                                <div key={i}>
                                    <h4 className="font-semibold">{persona.name}</h4>
                                    <p className="text-sm text-muted-foreground">{persona.description}</p>
                                </div>
                            ))}
                        </div>
                    </AppSection>
                </div>

                <AppSection icon={Layers} title="Technology Stack">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="text-center"><p className="font-semibold">Frontend</p><p className="text-sm text-muted-foreground">{appBlueprint.techStack.frontend}</p></div>
                        <div className="text-center"><p className="font-semibold">Backend</p><p className="text-sm text-muted-foreground">{appBlueprint.techStack.backend}</p></div>
                        <div className="text-center"><p className="font-semibold">Database</p><p className="text-sm text-muted-foreground">{appBlueprint.techStack.database}</p></div>
                        <div className="text-center"><p className="font-semibold">AI/ML</p><p className="text-sm text-muted-foreground">{appBlueprint.techStack.ai}</p></div>
                    </div>
                </AppSection>
            </CardContent>
            </Card>
        )}

        {siteBlueprint && (
             <Card className="mt-8 border-primary/20 bg-card/70">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Blueprint Generated
                </CardTitle>
                <CardDescription>
                    The AI has created the following plan. The next step would be
                    to autonomously register the domain and deploy the site.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold text-lg">
                    {siteBlueprint.siteName}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                    {siteBlueprint.tagline}
                    </p>
                </div>
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <Globe className="h-4 w-4" /> Suggested Domain
                    </h4>
                    <Badge variant="outline">{siteBlueprint.domainSuggestion}</Badge>
                </div>
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4" /> Site Pages
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                    {siteBlueprint.pages.map((page) => (
                        <Badge key={page.slug} variant="secondary">
                        {page.name}
                        </Badge>
                    ))}
                    </div>
                </div>
                </CardContent>
                <CardFooter>
                <Button className="w-full">
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Proceed to Autonomous Deployment
                </Button>
                </CardFooter>
            </Card>
        )}

      </Tabs>
    </div>
  );
}
