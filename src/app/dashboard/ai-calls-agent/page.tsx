
'use client';

import { useState } from 'react';
import {
  Bot,
  Loader2,
  Sparkles,
  Phone,
  User,
  BrainCircuit,
  FileText,
  Send,
  Twitter,
  Linkedin,
  Facebook,
  CheckCircle,
} from 'lucide-react';
import {
  automatedAiCallingServiceFunnel,
  type AutomatedAiCallingServiceFunnelOutput,
} from '@/ai/flows/automated-ai-calling-service-funnel';
import { getCall } from '@/ai/tools/get-call';
import {
  answerCustomerQuery,
  type AnswerCustomerQueryOutput,
} from '@/ai/flows/answer-customer-query';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toLowerCase()) {
    case 'twitter':
      return <Twitter className="h-5 w-5 text-sky-500" />;
    case 'linkedin':
      return <Linkedin className="h-5 w-5 text-blue-700" />;
    case 'facebook':
      return <Facebook className="h-5 w-5 text-blue-800" />;
    default:
      return <Bot className="h-5 w-5" />;
  }
};

type Simulation = {
    query: string;
    response: AnswerCustomerQueryOutput;
}

export default function AiCallsAgentPage() {
  const [isFunnelLoading, setIsFunnelLoading] = useState(false);
  const [isSimulationLoading, setIsSimulationLoading] = useState(false);
  const [
    funnelResponse,
    setFunnelResponse,
  ] = useState<AutomatedAiCallingServiceFunnelOutput | null>(null);
  const [
    simulation,
    setSimulation,
  ] = useState<Simulation | null>(null);
  const { toast } = useToast();

  async function handleRunFunnel() {
    setIsFunnelLoading(true);
    setFunnelResponse(null);
    toast({
      title: 'Autonomous Funnel Activated',
      description:
        'The AI is generating a landing page and social campaign to sell this service...',
    });
    try {
      const response = await automatedAiCallingServiceFunnel();
      setFunnelResponse(response);
      toast({
        title: 'Marketing Assets Generated!',
        description: response.summary,
      });
    } catch (error) {
      console.error('Automated funnel failed:', error);
      toast({
        variant: 'destructive',
        title: 'Funnel Failed',
        description: 'The autonomous marketing funnel encountered an error.',
      });
    } finally {
      setIsFunnelLoading(false);
    }
  }

  async function handleSimulateCall() {
    setIsSimulationLoading(true);
    setSimulation(null);
    try {
      // Step 1: Simulate receiving a call
      const inboundCall = await getCall();

      // Step 2: Use a default blueprint for demonstration
      const demoBlueprint = {
        siteName: 'QuantumLeap AI',
        tagline: 'Integrate Tomorrow`s AI Today',
        pages: [{ name: 'Pricing', slug: '/pricing', description: 'Our pricing starts at $499/mo for the basic plan.' }],
        coreFeatures: [{name: 'Password Reset', description: 'Users can reset their password via the login page.'}]
      };

      // Step 3: Let the AI answer the query based on the blueprint
      const response = await answerCustomerQuery({
        blueprint: demoBlueprint,
        customerQuery: inboundCall.customerQuery,
      });
      setSimulation({ query: inboundCall.customerQuery, response });
      toast({
        title: 'Simulation Complete',
        description: `AI Agent handled query: "${inboundCall.customerQuery}"`,
      });
    } catch (error) {
      console.error('AI Call Simulation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Simulation Failed',
        description: 'The AI call agent encountered an error.',
      });
    } finally {
      setIsSimulationLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold md:text-4xl">
          AI Calls Agent
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          An autonomous AI agent that can understand your business and handle
          customer calls.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Autonomous Marketing Funnel</CardTitle>
            <CardDescription>
              Generate a complete marketing campaign to sell your AI Calls Agent
              service to other businesses.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={handleRunFunnel}
              disabled={isFunnelLoading}
              size="lg"
            >
              {isFunnelLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              {isFunnelLoading
                ? 'Generating Assets...'
                : 'Activate Marketing Funnel'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Live Call Simulation</CardTitle>
            <CardDescription>
              Simulate an inbound customer call to see how the AI agent
              responds using a sample business blueprint.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={handleSimulateCall}
              disabled={isSimulationLoading}
              size="lg"
              variant="outline"
            >
              {isSimulationLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Phone className="mr-2 h-5 w-5" />
              )}
              {isSimulationLoading ? 'Simulating...' : 'Simulate Inbound Call'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {isFunnelLoading && !funnelResponse && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {funnelResponse && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle>Marketing Assets Generated</CardTitle>
            </div>
            <CardDescription>{funnelResponse.summary}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText /> Landing Page Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Headline:</h3>
                  <p className="text-muted-foreground">
                    {funnelResponse.marketingAssets.landingPage.headline}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold">Body Copy:</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {funnelResponse.marketingAssets.landingPage.body}
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <h3 className="font-headline text-xl font-bold">Social Posts</h3>
              {funnelResponse.marketingAssets.socialPosts.map((post, i) => (
                <Card key={i} className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <PlatformIcon platform={post.platform} />
                        {post.platform}
                      </span>
                      <Button size="sm" variant="secondary">
                        <Send className="mr-2 h-4 w-4" /> Publish
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">
                      {post.content}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {post.hashtags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isSimulationLoading && !simulation && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {simulation && (
        <Card>
          <CardHeader>
            <CardTitle>Call Simulation Result</CardTitle>
            <CardDescription>
              The AI agent processed a simulated inbound call.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted p-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Query
              </h3>
              <p className="text-sm italic text-muted-foreground mt-1">
                &quot;{simulation.query}&quot;
              </p>
            </div>
             <div className="rounded-md border bg-muted/50 p-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                AI Agent Response
              </h3>
              <p className="text-sm mt-1">{simulation.response.answer}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <h4 className="font-semibold">Confidence</h4>
                    <p className="text-primary font-bold">{simulation.response.confidence.toFixed(2)} / 1.00</p>
                </div>
                 <div>
                    <h4 className="font-semibold">Reasoning</h4>
                    <p className="text-xs text-muted-foreground italic">{simulation.response.reasoning}</p>
                </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
