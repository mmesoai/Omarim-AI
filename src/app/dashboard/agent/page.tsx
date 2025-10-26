'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Loader2, User, Sparkles, Building, Briefcase, ChevronRight, XCircle, CheckCircle2 } from 'lucide-react';
import {
  autonomousLeadGen,
  type AutonomousLeadGenOutput,
} from '@/ai/flows/autonomous-lead-gen-flow';
import type { QualifiedLead } from '@/ai/tools/find-and-qualify-leads';

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
import { ScrollArea } from '@/components/ui/scroll-area';
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

  const form = useForm<z.infer<typeof agentFormSchema>>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      objective: 'Find me 5 local businesses that need a new AI-powered website.',
    },
  });

  async function onSubmit(values: z.infer<typeof agentFormSchema>) {
    setIsLoading(true);
    setAgentResponse(null);
    try {
      const response = await autonomousLeadGen({ objective: values.objective });
      setAgentResponse(response);
    } catch (error) {
      console.error('Autonomous Agent failed:', error);
      // You can add a toast notification here
    } finally {
      setIsLoading(false);
    }
  }

  const LeadCard = ({ lead }: { lead: QualifiedLead }) => (
    <Card className="bg-card/50 transition-all hover:bg-card/80 hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{lead.name}</CardTitle>
            <CardDescription>{lead.company}</CardDescription>
          </div>
          <Badge variant="secondary">{lead.title}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Building className="mr-2 h-4 w-4" />
          <span>{lead.industry}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          {lead.hasWebsite ? (
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="mr-2 h-4 w-4 text-red-500" />
          )}
          <span>{lead.hasWebsite ? 'Has Website' : 'No Website'}</span>
        </div>
        <div className="flex items-start text-sm">
          <Sparkles className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-primary" />
          <p>{lead.qualificationReason}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <Briefcase className="mr-2 h-4 w-4" />
          Initiate Outreach
        </Button>
      </CardFooter>
    </Card>
  );

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
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {agentResponse && (
        <Card className="bg-transparent shadow-none border-none">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Bot className="h-6 w-6 text-primary" />
              <CardTitle>Agent Response</CardTitle>
            </div>
            <CardDescription className="pt-2">
              {agentResponse.summary}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agentResponse.qualifiedLeads.map((lead, index) => (
                <LeadCard key={index} lead={lead as QualifiedLead} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
