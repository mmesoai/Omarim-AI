"use client";

import { useState } from "react";
import { useForm, useForm as useSocialForm } from "react-hook-form";
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
import { Loader2, Sparkles, Send } from "lucide-react";
import { generateOutreachEmail, type GenerateOutreachEmailOutput } from "@/ai/flows/generate-outreach-email";
import { generateSocialMediaPost, type GenerateSocialMediaPostOutput } from "@/ai/flows/generate-social-post";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const outreachFormSchema = z.object({
  linkedInUrl: z.string().url({ message: "Please enter a valid LinkedIn URL." }),
});

const socialFormSchema = z.object({
  topic: z.string().min(10, { message: "Please enter a topic of at least 10 characters." }),
});

export default function AgentPage() {
  const [isOutreachLoading, setIsOutreachLoading] = useState(false);
  const [outreachResult, setOutreachResult] = useState<GenerateOutreachEmailOutput | null>(null);

  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [socialResult, setSocialResult] = useState<GenerateSocialMediaPostOutput | null>(null);

  const { toast } = useToast();

  const outreachForm = useForm<z.infer<typeof outreachFormSchema>>({
    resolver: zodResolver(outreachFormSchema),
    defaultValues: {
      linkedInUrl: "",
    },
  });

  const socialForm = useSocialForm<z.infer<typeof socialFormSchema>>({
    resolver: zodResolver(socialFormSchema),
    defaultValues: {
      topic: "",
    },
  });

  async function onOutreachSubmit(values: z.infer<typeof outreachFormSchema>) {
    setIsOutreachLoading(true);
    setOutreachResult(null);
    try {
      const output = await generateOutreachEmail(values);
      setOutreachResult(output);
    } catch (error) {
      console.error("Error generating outreach:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the outreach email.",
      });
    } finally {
      setIsOutreachLoading(false);
    }
  }

  async function onSocialSubmit(values: z.infer<typeof socialFormSchema>) {
    setIsSocialLoading(true);
    setSocialResult(null);
    try {
      const output = await generateSocialMediaPost(values);
      setSocialResult(output);
    } catch (error) {
      console.error("Error generating social post:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the social media post.",
      });
    } finally {
      setIsSocialLoading(false);
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Outreach Card */}
        <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Outreach</CardTitle>
                <CardDescription>
                  Enter a LinkedIn profile URL to generate a personalized outreach email.
                </CardDescription>
              </CardHeader>
              <Form {...outreachForm}>
                <form onSubmit={outreachForm.handleSubmit(onOutreachSubmit)}>
                  <CardContent>
                    <FormField
                      control={outreachForm.control}
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
                    <Button type="submit" disabled={isOutreachLoading}>
                      {isOutreachLoading ? (
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

            {isOutreachLoading && (
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

            {outreachResult && (
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
                    <Input id="subject" readOnly value={outreachResult.subject} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body">Body</Label>
                    <Textarea
                      id="body"
                      readOnly
                      value={outreachResult.body}
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

        {/* Social Media Card */}
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Social Media Post Generator</CardTitle>
                    <CardDescription>
                    Generate engaging social media posts to build brand awareness.
                    </CardDescription>
                </CardHeader>
                <Form {...socialForm}>
                    <form onSubmit={socialForm.handleSubmit(onSocialSubmit)}>
                    <CardContent>
                        <FormField
                        control={socialForm.control}
                        name="topic"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Topic or Product</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Our new line of smart watches" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSocialLoading}>
                        {isSocialLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate Post
                        </Button>
                    </CardFooter>
                    </form>
                </Form>
            </Card>

            {isSocialLoading && (
            <Card>
                <CardHeader>
                <CardTitle>Generating...</CardTitle>
                <CardDescription>The AI is creating a social media masterpiece.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Post Content</Label>
                        <div className="w-full h-24 bg-muted animate-pulse rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <Label>Hashtags</Label>
                        <div className="w-full h-10 bg-muted animate-pulse rounded-md" />
                    </div>
                </CardContent>
            </Card>
            )}

            {socialResult && (
            <Card>
                <CardHeader>
                <CardTitle>Generated Social Media Post</CardTitle>
                <CardDescription>
                    Review and share the generated content.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="post-content">Post Content</Label>
                      <Textarea
                      id="post-content"
                      readOnly
                      value={socialResult.postContent}
                      className="h-40"
                      />
                  </div>
                  <div className="space-y-2">
                    <Label>Hashtags</Label>
                    <div className="flex flex-wrap gap-2">
                      {socialResult.hashtags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button><Send className="mr-2 h-4 w-4" /> Post Now</Button>
                </CardFooter>
            </Card>
            )}
        </div>
      </div>
    </div>
  );
}
