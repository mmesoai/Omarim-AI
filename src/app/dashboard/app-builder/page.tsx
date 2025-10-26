
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
  User,
  List,
  Database,
  Users,
  Layers,
} from 'lucide-react';
import {
  generateAppBlueprint,
  type GenerateAppBlueprintOutput,
} from '@/ai/flows/generate-app-blueprint';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const builderFormSchema = z.object({
  appDescription: z.string().min(20, {
    message: 'Please describe your app idea in at least 20 characters.',
  }),
});

export default function AppBuilderPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [blueprint, setBlueprint] =
    useState<GenerateAppBlueprintOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof builderFormSchema>>({
    resolver: zodResolver(builderFormSchema),
    defaultValues: {
      appDescription: '',
    },
  });

  async function onSubmit(values: z.infer<typeof builderFormSchema>) {
    setIsLoading(true);
    setBlueprint(null);
    try {
      const response = await generateAppBlueprint({
        appDescription: values.appDescription,
      });
      setBlueprint(response);
    } catch (error) {
      console.error('App Blueprint generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI architect encountered an error.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const Section = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
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
          AI App Blueprint Generator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Transform your idea into a professional technical specification in
          seconds.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <User className="h-6 w-6" />
            <CardTitle>Your App Idea</CardTitle>
          </div>
          <CardDescription>
            Describe your application. What does it do? Who is it for? What is
            the main goal?
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="appDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'An app that lets users track their reading habits, create book lists, and get recommendations from friends.'"
                        {...field}
                        disabled={isLoading}
                        className="min-h-[120px]"
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
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {blueprint && (
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">{blueprint.appName}</CardTitle>
                <CardDescription className="text-lg">
                  {blueprint.tagline}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-6 space-y-6">
            <Section icon={List} title="Core Features (MVP)">
                <ul className="space-y-3 list-disc list-inside">
                    {blueprint.coreFeatures.map((feature, i) => (
                        <li key={i}>
                            <span className="font-semibold">{feature.name}:</span> <span className="text-muted-foreground">{feature.description}</span>
                        </li>
                    ))}
                </ul>
            </Section>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section icon={Database} title="Data Models">
                     <div className="space-y-3">
                        {blueprint.dataModels.map((model, i) => (
                            <div key={i}>
                                <h4 className="font-semibold">{model.name}</h4>
                                <p className="text-sm text-muted-foreground">{model.properties.join(', ')}</p>
                            </div>
                        ))}
                    </div>
                </Section>
                <Section icon={Users} title="User Personas">
                     <div className="space-y-3">
                        {blueprint.userPersonas.map((persona, i) => (
                            <div key={i}>
                                <h4 className="font-semibold">{persona.name}</h4>
                                <p className="text-sm text-muted-foreground">{persona.description}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            </div>

            <Section icon={Layers} title="Technology Stack">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="text-center">
                        <p className="font-semibold">Frontend</p>
                        <p className="text-sm text-muted-foreground">{blueprint.techStack.frontend}</p>
                    </div>
                    <div className="text-center">
                        <p className="font-semibold">Backend</p>
                        <p className="text-sm text-muted-foreground">{blueprint.techStack.backend}</p>
                    </div>
                     <div className="text-center">
                        <p className="font-semibold">Database</p>
                        <p className="text-sm text-muted-foreground">{blueprint.techStack.database}</p>
                    </div>
                     <div className="text-center">
                        <p className="font-semibold">AI/ML</p>
                        <p className="text-sm text-muted-foreground">{blueprint.techStack.ai}</p>
                    </div>
                </div>
            </Section>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
