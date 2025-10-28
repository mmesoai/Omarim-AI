
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Bot,
  Loader2,
  Sparkles,
  Globe,
  FileText,
  LayoutTemplate,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import {
  generateSiteBlueprint,
  type GenerateSiteBlueprintOutput,
} from '@/ai/flows/generate-site-blueprint';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const blueprintFormSchema = z.object({
  businessDescription: z
    .string()
    .min(20, {
      message: 'Please describe your business in at least 20 characters.',
    }),
});

export default function NewSitePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [blueprint, setBlueprint] =
    useState<GenerateSiteBlueprintOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof blueprintFormSchema>>({
    resolver: zodResolver(blueprintFormSchema),
    defaultValues: {
      businessDescription: '',
    },
  });

  async function onSubmit(values: z.infer<typeof blueprintFormSchema>) {
    setIsLoading(true);
    setBlueprint(null);
    try {
      const response = await generateSiteBlueprint({
        description: values.businessDescription,
      });
      setBlueprint(response);
      toast({
        title: 'Blueprint Generated',
        description: 'The AI has created a plan for your new website.',
      });
    } catch (error) {
      console.error('Site Blueprint generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI architect encountered an error.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold md:text-4xl">
          Autonomous Website Scaffolding
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Describe your business, and let the AI generate a professional website
          blueprint.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle>Describe Your Business</CardTitle>
            </div>
            <CardDescription>
              Provide a clear description of your business. The AI will use this
              to generate a site name, tagline, and page structure.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                <FormField
                  control={form.control}
                  name="businessDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'A local bakery in San Francisco specializing in custom cakes and artisanal bread.'"
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
                    <Bot className="mr-2 h-5 w-5" />
                  )}
                  Generate Blueprint
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="space-y-8">
            {isLoading && (
            <Card className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </Card>
            )}

            {blueprint && (
            <Card className="bg-card/70">
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
                    {blueprint.siteName}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                    {blueprint.tagline}
                    </p>
                </div>
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <Globe className="h-4 w-4" /> Suggested Domain
                    </h4>
                    <Badge variant="outline">{blueprint.domainSuggestion}</Badge>
                </div>
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4" /> Site Pages
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                    {blueprint.pages.map((page) => (
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
        </div>
      </div>
    </div>
  );
}
