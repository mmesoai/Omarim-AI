
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Send, Bot } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateOutreachEmail, type GenerateOutreachEmailOutput } from "@/ai/flows/generate-outreach-email";
import { generateSocialMediaPost, type GenerateSocialMediaPostOutput } from "@/ai/flows/generate-social-post";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const agentFormSchema = z.object({
  agentType: z.enum(["outreach", "social"]),
  prompt: z.string().min(10, { message: "Please enter a prompt of at least 10 characters." }),
});

type AgentResult = 
  | { type: 'outreach'; data: GenerateOutreachEmailOutput }
  | { type: 'social'; data: GenerateSocialMediaPostOutput };

export default function AgentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const searchParams = useSearchParams();

  const { toast } = useToast();

  const agentForm = useForm<z.infer<typeof agentFormSchema>>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      agentType: "outreach",
      prompt: "",
    },
  });
  
  useEffect(() => {
    const agentTypeParam = searchParams.get('agentType');
    const promptParam = searchParams.get('prompt');

    if ((agentTypeParam === 'outreach' || agentTypeParam === 'social') && promptParam) {
      const type = agentTypeParam as 'outreach' | 'social';
      agentForm.setValue('agentType', type);
      agentForm.setValue('prompt', promptParam);
      // Automatically submit the form if parameters are present
      onSubmit({ agentType: type, prompt: promptParam });
    }
  }, [searchParams, agentForm]);

  const agentType = agentForm.watch("agentType");

  async function onSubmit(values: z.infer<typeof agentFormSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      if (values.agentType === "outreach") {
        if (!z.string().url().safeParse(values.prompt).success) {
          toast({
            variant: "destructive",
            title: "Invalid Input",
            description: "Please enter a valid LinkedIn URL for the outreach agent.",
          });
          setIsLoading(false);
          return;
        }
        const output = await generateOutreachEmail({ linkedInUrl: values.prompt });
        setResult({ type: 'outreach', data: output });
      } else if (values.agentType === "social") {
        const output = await generateSocialMediaPost({ topic: values.prompt });
        setResult({ type: 'social', data: output });
      }
    } catch (error) {
      console.error("Error running agent:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem communicating with the AI agent.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-headline font-semibold">Agent Hub</h2>
        <p className="text-muted-foreground">
          Your command center for AI-powered agents.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Agent</CardTitle>
          <CardDescription>
            Generate personalized outreach emails or engaging social media posts.
          </CardDescription>
        </CardHeader>
        <Form {...agentForm}>
          <form onSubmit={agentForm.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={agentForm.control}
                name="agentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="outreach">Personalized Outreach Email</SelectItem>
                        <SelectItem value="social">Social Media Post</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={agentForm.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {agentType === "outreach" ? "LinkedIn Profile URL" : "Topic or Product"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={agentType === "outreach" ? "https://www.linkedin.com/in/username" : "e.g., Our new line of smart watches"} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Run Agent
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {isLoading && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
              <Bot className="h-8 w-8" />
              <div>
                <CardTitle>Agent is thinking...</CardTitle>
                <CardDescription>The AI is crafting the perfect response.</CardDescription>
              </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="w-full h-40 bg-muted animate-pulse rounded-md" />
          </CardContent>
        </Card>
      )}

      {result && (
         <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Bot className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle>Agent Response</CardTitle>
                    <CardDescription>Review the generated content below.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
            {result.type === 'outreach' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" readOnly value={result.data.subject} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="body">Body</Label>
                        <Textarea
                        id="body"
                        readOnly
                        value={result.data.body}
                        className="h-60"
                        />
                    </div>
                    <Button><Send className="mr-2 h-4 w-4" /> Send Email</Button>
                </div>
            )}
            {result.type === 'social' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="post-content">Post Content</Label>
                        <Textarea
                            id="post-content"
                            readOnly
                            value={result.data.postContent}
                            className="h-40"
                        />
                    </div>
                     <Separator />
                    <div className="space-y-2">
                        <Label>Hashtags</Label>
                        <div className="flex flex-wrap gap-2">
                        {result.data.hashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                        </div>
                    </div>
                    <Button><Send className="mr-2 h-4 w-4" /> Post Now</Button>
                </div>
            )}
            </CardContent>
         </Card>
      )}
    </div>
  );
}

    