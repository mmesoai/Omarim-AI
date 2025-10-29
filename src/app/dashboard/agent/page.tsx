
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Bot,
  Loader2,
  User,
  Sparkles,
  Building,
  Mail,
  ChevronRight,
  CheckCircle2,
  XCircle,
  FileCheck2,
} from 'lucide-react';
import {
  autonomousLeadGen,
  type AutonomousLeadGenOutput,
} from '@/ai/flows/autonomous-lead-gen-flow';
import { useUser } from '@/firebase';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const agentFormSchema = z.object({
  objective: z
    .string()
    .min(10, { message: 'Objective must be at least 10 characters.' }),
});

export default function AgentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [agentResponse, setAgentResponse] =
    useState<AutonomousLeadGenOutput | null>(null);

  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof agentFormSchema>>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      objective:
        'Find me 5 local businesses that need a new AI-powered website.',
    },
  });

  async function onSubmit(values: z.infer<typeof agentFormSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to run the agent.',
      });
      return;
    }

    setIsLoading(true);
    setAgentResponse(null);
    toast({
        title: 'Autonomous Agent Activated',
        description: 'The AI is now executing your objective...',
    });

    try {
      const response = await autonomousLeadGen({
        objective: values.objective,
        userId: user.uid,
      });
      setAgentResponse(response);
      toast({
        title: 'Agent has completed its task!',
        description: response.summary,
      });
    } catch (error) {
      console.error('Autonomous Agent failed:', error);
      toast({
        variant: 'destructive',
        title: 'Agent Failed',
        description: 'The autonomous agent encountered an error.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold md:text-4xl">
          Autonomous Business Agent
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Delegate high-level objectives and watch your AI agent execute them.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <User className="h-6 w-6" />
            <CardTitle>Your Objective</CardTitle>
          </div>
          <CardDescription>
            Provide a clear, high-level goal for the AI agent to accomplish.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="e.g., 'Find 10 tech startups in San Francisco that recently received funding.'"
                        {...field}
                        disabled={isLoading}
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
                  <ChevronRight className="mr-2 h-5 w-5" />
                )}
                Execute
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-4">Agent is actively working on your objective...</p>
        </div>
      )}

      {agentResponse && (
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Bot className="h-6 w-6 text-primary" />
              <CardTitle>Agent Execution Report</CardTitle>
            </div>
            <CardDescription className="pt-2">
              {agentResponse.summary}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agentResponse.results.map((result) => (
                <Card
                  key={result.leadId}
                  className="bg-card/50"
                >
                  <CardHeader>
                    <CardTitle className="text-base">{result.message.split(' ')[2]} {result.message.split(' ')[3]}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                     <div className="flex items-center text-sm">
                      <FileCheck2 className="mr-2 h-4 w-4 text-primary" />
                      <p>Lead saved to database.</p>
                    </div>
                     <div className="flex items-center text-sm">
                      {result.emailSent ? (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            <p>Outreach email sent.</p>
                        </>
                      ) : (
                        <>
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            <p>Email sending failed.</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
