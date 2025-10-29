
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Bot,
  Loader2,
  Sparkles,
  Phone,
  User,
  BrainCircuit,
} from 'lucide-react';
import {
  answerCustomerQuery,
  type AnswerCustomerQueryOutput,
} from '@/ai/flows/answer-customer-query';

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
import { Input } from '@/components/ui/input';

const supportFormSchema = z.object({
  blueprint: z.string().min(50, {
    message: 'Please paste a valid JSON blueprint (at least 50 characters).',
  }),
  customerQuery: z
    .string()
    .min(10, { message: 'Customer query must be at least 10 characters.' }),
});

export default function AiCallsAgentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AnswerCustomerQueryOutput | null>(
    null
  );
  const { toast } = useToast();

  const form = useForm<z.infer<typeof supportFormSchema>>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      blueprint: '',
      customerQuery: '',
    },
  });

  async function onSubmit(values: z.infer<typeof supportFormSchema>) {
    setIsLoading(true);
    setAiResponse(null);
    try {
      // Validate that the blueprint is valid JSON
      let parsedBlueprint;
      try {
        parsedBlueprint = JSON.parse(values.blueprint);
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Invalid Blueprint',
          description: 'The provided blueprint is not valid JSON.',
        });
        setIsLoading(false);
        return;
      }

      const response = await answerCustomerQuery({
        blueprint: parsedBlueprint,
        customerQuery: values.customerQuery,
      });
      setAiResponse(response);
    } catch (error) {
      console.error('AI Calls Agent failed:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI agent encountered an error.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold md:text-4xl">
          AI Calls Agent
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          An AI agent that understands the systems you build and can answer
          customer questions.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <CardTitle>Support Agent Simulator</CardTitle>
          </div>
          <CardDescription>
            Paste a generated App or Website Blueprint and ask a customer's
            question. The AI will use the blueprint as its knowledge source.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="blueprint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App/Site Blueprint (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the JSON output from the Website/App Builder here..."
                        {...field}
                        disabled={isLoading}
                        className="min-h-[200px] font-mono text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerQuery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer&apos;s Question
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 'What technology is this app built on?' or 'What are your services?'"
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
                  <Phone className="mr-2 h-5 w-5" />
                )}
                Simulate Call
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

      {aiResponse && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6" />
              <CardTitle>AI Agent Response</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm">Generated Answer:</h3>
              <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                {aiResponse.answer}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Confidence Score:</h3>
              <p className="text-primary">{aiResponse.confidence.toFixed(2)} / 1.00</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Reasoning:</h3>
              <p className="text-xs text-muted-foreground italic">
                {aiResponse.reasoning}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
