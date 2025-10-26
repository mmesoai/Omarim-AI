'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Sparkles,
  Twitter,
  Linkedin,
  Facebook,
  Bot,
} from 'lucide-react';
import {
  generateMultipleSocialPosts,
  type GenerateMultipleSocialPostsOutput,
} from '@/ai/flows/generate-multiple-social-posts';

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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const publisherFormSchema = z.object({
  topic: z
    .string()
    .min(10, { message: 'Please provide a topic or content of at least 10 characters.' }),
});

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toLowerCase()) {
    case 'twitter':
      return <Twitter className="h-6 w-6 text-sky-500" />;
    case 'linkedin':
      return <Linkedin className="h-6 w-6 text-blue-700" />;
    case 'facebook':
      return <Facebook className="h-6 w-6 text-blue-800" />;
    default:
      return <Bot className="h-6 w-6" />;
  }
};

export default function PublisherPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPosts, setGeneratedPosts] =
    useState<GenerateMultipleSocialPostsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof publisherFormSchema>>({
    resolver: zodResolver(publisherFormSchema),
    defaultValues: {
      topic: '',
    },
  });

  async function onSubmit(values: z.infer<typeof publisherFormSchema>) {
    setIsLoading(true);
    setGeneratedPosts(null);
    try {
      const response = await generateMultipleSocialPosts({
        topicOrContent: values.topic,
      });
      setGeneratedPosts(response);
    } catch (error) {
      console.error('AI Publisher failed:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI publisher encountered an error.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold md:text-4xl">
          AI Social Publisher
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Generate and repurpose content for all your social media channels from a single input.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle>Content Generator</CardTitle>
          </div>
          <CardDescription>
            Enter a topic, a block of text, or a link, and the AI will create tailored posts for each platform.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic or Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'The future of AI in e-commerce' or paste an article excerpt..."
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
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                Generate Posts
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

      {generatedPosts && (
        <div className="space-y-6">
           <h2 className="text-center font-headline text-2xl font-bold">Generated Posts</h2>
           <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {generatedPosts.posts.map((post, index) => (
                <Card key={index} className="flex flex-col">
                   <CardHeader>
                      <div className="flex items-center justify-between">
                         <CardTitle className="capitalize">{post.platform}</CardTitle>
                         <PlatformIcon platform={post.platform} />
                      </div>
                   </CardHeader>
                   <CardContent className="flex-grow space-y-4">
                      <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                       <div className="flex flex-wrap gap-2">
                        {post.hashtags.map((tag) => (
                          <Badge key={tag} variant="secondary">#{tag}</Badge>
                        ))}
                      </div>
                   </CardContent>
                   <CardFooter>
                      <Button className="w-full" variant="outline">Schedule Post</Button>
                   </CardFooter>
                </Card>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
