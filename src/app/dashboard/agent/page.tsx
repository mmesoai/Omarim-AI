"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Loader2, Sparkles } from "lucide-react";
import { generateOutreachEmail, type GenerateOutreachEmailOutput } from "@/ai/flows/generate-outreach-email";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  linkedInUrl: z.string().url({ message: "Please enter a valid LinkedIn URL." }),
});

export default function AgentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateOutreachEmailOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      linkedInUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await generateOutreachEmail(values);
      setResult(output);
    } catch (error) {
      console.error("Error generating outreach:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the outreach email.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-headline font-semibold">AI Agent</h2>
        <p className="text-muted-foreground">
          Your intelligent assistant for automating tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personalized Outreach</CardTitle>
            <CardDescription>
              Enter a LinkedIn profile URL to generate a personalized outreach email.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                <FormField
                  control={form.control}
                  name="linkedInUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.linkedin.com/in/username" {...field} />
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
                  Generate Outreach
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Generating...</CardTitle>
              <CardDescription>The AI is crafting the perfect email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <div className="w-full h-10 bg-muted animate-pulse rounded-md" />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <div className="w-full h-40 bg-muted animate-pulse rounded-md" />
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Email</CardTitle>
              <CardDescription>
                Review the generated email below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" readOnly value={result.subject} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  readOnly
                  value={result.body}
                  className="h-60"
                />
              </div>
            </CardContent>
             <CardFooter>
              <Button>Send Email</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
