'use client';

import { useState } from 'react';
import {
  Bot,
  Loader2,
  Sparkles,
  ShoppingBag,
  LifeBuoy,
  ChevronRight,
  FileText,
  Send,
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
    generateFeatureMarketingAssets,
    type GenerateFeatureMarketingAssetsOutput
} from '@/ai/flows/generate-feature-marketing-assets';

type FeatureProduct = {
  id: 'autonomousAgent' | 'digitalProductFunnel' | 'aiCallsAgent';
  name: string;
  description: string;
  icon: React.ElementType;
  price: string;
};

const featureProducts: FeatureProduct[] = [
  {
    id: 'autonomousAgent',
    name: 'Autonomous Sales Agent',
    description:
      'An AI agent that finds, qualifies, and engages new business leads 24/7.',
    icon: Bot,
    price: '$499/mo',
  },
  {
    id: 'digitalProductFunnel',
    name: 'Automated Digital Products',
    description:
      'An autonomous funnel to find, create, and market new digital products weekly.',
    icon: ShoppingBag,
    price: '$799/mo',
  },
  {
    id: 'aiCallsAgent',
    name: 'AI-Powered Call Center',
    description:
      'An AI agent that can understand your business and answer customer phone calls.',
    icon: LifeBuoy,
    price: '$999/mo',
  },
];

export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [
    marketingAssets,
    setMarketingAssets,
  ] = useState<GenerateFeatureMarketingAssetsOutput | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerateAssets = async (feature: FeatureProduct) => {
    setIsLoading(true);
    setMarketingAssets(null);
    toast({
      title: `Generating assets for ${feature.name}...`,
      description: 'The AI is creating a landing page and social campaign.',
    });
    try {
      const response = await generateFeatureMarketingAssets({
        featureName: feature.name,
        featureDescription: feature.description,
        price: feature.price,
      });
      setMarketingAssets(response);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Failed to generate marketing assets:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI encountered an error while creating assets.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto max-w-7xl space-y-8 py-8">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold md:text-4xl">
            Omarim AI Product Suite
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Each feature of your platform is a sellable, autonomous business.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featureProducts.map((feature) => (
            <Card key={feature.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                  <CardTitle>{feature.name}</CardTitle>
                </div>
                <CardDescription className="pt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold text-primary">{feature.price}</p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleGenerateAssets(feature)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Marketing Assets
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generated Marketing Assets</DialogTitle>
            <DialogDescription>
              The AI has created the following assets. You can now use these to
              market this feature as a standalone product.
            </DialogDescription>
          </DialogHeader>
          {marketingAssets && (
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Landing Page Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-bold text-lg">{marketingAssets.landingPage.headline}</h3>
                        <p className="text-muted-foreground">{marketingAssets.landingPage.body}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Social Media Posts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {marketingAssets.socialPosts.map((post, i) => (
                            <div key={i} className="p-2 border-b">
                                <h4 className="font-semibold">{post.platform} Post:</h4>
                                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">{post.hashtags.join(' ')}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
