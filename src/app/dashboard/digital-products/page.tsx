
'use client';

import { useState } from 'react';
import {
  Bot,
  Loader2,
  CheckCircle,
  FileText,
  Video,
  Lightbulb,
  Sparkles,
  BookOpen,
  Send,
  Twitter,
  Linkedin,
  Facebook,
} from 'lucide-react';
import {
  automatedDigitalProductFunnel,
  type AutomatedDigitalProductFunnelOutput,
} from '@/ai/flows/automated-digital-product-funnel';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const ProductTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'eBook':
      return <BookOpen className="h-5 w-5" />;
    case 'Notion Template':
      return <FileText className="h-5 w-5" />;
    case 'Video Course':
      return <Video className="h-5 w-5" />;
    default:
      return <Lightbulb className="h-5 w-5" />;
  }
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toLowerCase()) {
    case 'twitter': return <Twitter className="h-5 w-5 text-sky-500" />;
    case 'linkedin': return <Linkedin className="h-5 w-5 text-blue-700" />;
    case 'facebook': return <Facebook className="h-5 w-5 text-blue-800" />;
    default: return <Bot className="h-5 w-5" />;
  }
};

export default function DigitalProductsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [funnelResponse, setFunnelResponse] =
    useState<AutomatedDigitalProductFunnelOutput | null>(null);
  const { toast } = useToast();

  async function handleRunFunnel() {
    setIsLoading(true);
    setFunnelResponse(null);
    toast({
      title: 'Autonomous Funnel Activated',
      description: 'The AI is analyzing trends, generating a product, and creating a marketing campaign...',
    });
    try {
      const response = await automatedDigitalProductFunnel();
      setFunnelResponse(response);
      toast({
        title: 'Funnel Complete!',
        description: response.summary,
      });
    } catch (error) {
      console.error('Automated funnel failed:', error);
      toast({
        variant: 'destructive',
        title: 'Funnel Failed',
        description: 'The autonomous funnel encountered an error.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold md:text-4xl">
          Automated Digital Product Funnel
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A fully autonomous channel to find, create, and market digital products.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Bot className="h-6 w-6" />
            <CardTitle>Launch New Funnel</CardTitle>
          </div>
          <CardDescription>
            Click the button to activate the AI. It will run a fully automated workflow: find a trending digital product idea, generate the product content, and create a multi-channel marketing campaign.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleRunFunnel} disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'AI is Working...' : 'Activate Autonomous Funnel'}
          </Button>
        </CardFooter>
      </Card>

      {isLoading && !funnelResponse && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Analyzing trends, generating product, creating campaign...</p>
        </div>
      )}

      {funnelResponse && (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <CardTitle>Funnel Complete: Product Generated</CardTitle>
                    </div>
                     <CardDescription>{funnelResponse.summary}</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Product Details */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                           <ProductTypeIcon type={funnelResponse.productIdea.productType} />
                           <CardTitle>{funnelResponse.productIdea.productName}</CardTitle>
                        </div>
                        <CardDescription>Target Audience: {funnelResponse.productIdea.targetAudience}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                       <div>
                           <h4 className="font-semibold text-sm">Marketing Angle</h4>
                           <p className="text-sm text-muted-foreground">{funnelResponse.productIdea.marketingAngle}</p>
                       </div>
                       <Separator />
                       <div>
                           <h4 className="font-semibold text-sm">Generated Content</h4>
                            <p className="text-sm text-muted-foreground line-clamp-4 mt-1">{funnelResponse.generatedContent.content}</p>
                       </div>
                    </CardContent>
                    <CardFooter>
                         <Button variant="outline" className="w-full"><FileText className="mr-2 h-4 w-4"/> View Full Content</Button>
                    </CardFooter>
                </Card>

                {/* Marketing Campaign */}
                <div className="space-y-4">
                    <h3 className="font-headline text-xl font-bold">Marketing Campaign</h3>
                     {funnelResponse.marketingCampaign.posts.map((post, index) => (
                        <Card key={index} className="bg-card/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                 <CardTitle className="text-base flex items-center gap-2">
                                    <PlatformIcon platform={post.platform} />
                                    {post.platform}
                                 </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {post.hashtags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>)}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full"><Send className="mr-2 h-4 w-4"/> Publish Post</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
