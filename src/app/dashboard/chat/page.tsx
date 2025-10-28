
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";
import { Bot, User } from "lucide-react";
import { interpretCommand } from "@/ai/flows/interpret-command";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

import { generateSocialMediaPost, type GenerateSocialMediaPostOutput } from "@/ai/flows/generate-social-post";
import { executeCampaignAction, type ExecuteCampaignActionOutput } from "@/ai/flows/execute-campaign-action";
import { answerSelfKnowledgeQuestion, type AnswerSelfKnowledgeOutput } from "@/ai/flows/answer-self-knowledge-question";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";


const chatFormSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty." }),
});

type AgentResult = 
  | { type: 'social'; data: GenerateSocialMediaPostOutput }
  | { type: 'campaign'; data: ExecuteCampaignActionOutput };

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  result?: AgentResult;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc(userDocRef);
  const userName = userData ? userData.firstName : "User";

  const form = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { message: "" },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        id: "init",
        role: "assistant",
        content: `Hello ${userName}. I am Omarim, your autonomous business partner. How can I help you grow your business today?`,
      },
    ]);
  }, [userName]);

  const handleAiResponse = async (action: string, prompt: string, command: string) => {
     let responseText = "";
     let agentResult: AgentResult | undefined = undefined;

     try {
        switch (action) {
            case "generate_social_post":
                responseText = `Understood. Here is a draft for a social media post about "${prompt}".`;
                const socialOutput = await generateSocialMediaPost({ topic: prompt });
                agentResult = { type: 'social', data: socialOutput };
                break;
            case "run_autonomous_agent":
                responseText = `Got it. I'll get to work on that objective. I'm navigating you to the Autonomous Agent page where you can see the results.`;
                setTimeout(() => router.push(`/dashboard/agent?objective=${encodeURIComponent(prompt)}`), 1500);
                break;
            case "add_store":
                responseText = `Perfect. Let's connect your ${prompt || 'new'} store. I'll take you to the right place.`;
                 setTimeout(() => router.push(`/dashboard/settings?tab=integrations&action=addStore&storeType=${prompt || ''}`), 1500);
                 break;
            case "manage_campaign":
                if (!user) {
                  responseText = "I'm sorry, I can't manage campaigns without knowing who you are. Please ensure you are logged in.";
                  break;
                }
                responseText = `Right away. I will execute the command: "${command}".`;
                const campaignOutput = await executeCampaignAction({ command, userId: user.uid });
                agentResult = { type: 'campaign', data: campaignOutput };
                // Overwrite the initial response with the actual result from the tool
                responseText = campaignOutput.result; 
                break;
            case "answer_self_knowledge_question":
                const selfKnowledgeOutput = await answerSelfKnowledgeQuestion({ question: prompt });
                responseText = selfKnowledgeOutput.answer;
                break;
            default:
                responseText = "I'm sorry, I'm not sure how to help with that. I can help generate social media posts, run the autonomous agent to find leads, or connect new stores.";
                break;
        }
     } catch (error) {
        console.error("AI action failed:", error);
        responseText = "I'm sorry, I encountered an error while trying to complete that task. Please try again.";
        toast({
            variant: "destructive",
            title: "AI Action Failed",
            description: "There was a problem executing the AI-powered action.",
        });
     }

     setMessages((prev) => [
        ...prev,
        { id: String(Date.now()), role: "assistant", content: responseText, result: agentResult },
     ]);
  }

  async function onSubmit(values: z.infer<typeof chatFormSchema>) {
    const userMessage: Message = {
      id: String(Date.now()),
      role: "user",
      content: values.message,
    };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();
    setIsThinking(true);

    try {
      const result = await interpretCommand({ command: values.message });
      await handleAiResponse(result.action, result.prompt, values.message);
    } catch (error) {
      console.error("AI interpretation failed:", error);
      const errorMessage: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: "Sorry, I had trouble understanding that. Please try rephrasing your command.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b">
          <CardTitle>Chat with Omarim AI</CardTitle>
          <CardDescription>Your personal AI assistant for managing your business.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="p-6 space-y-6">
                {messages.map((message) => (
                    <div key={message.id}>
                        <div
                        className={`flex items-start gap-4 ${
                            message.role === "user" ? "justify-end" : ""
                        }`}
                        >
                        {message.role === "assistant" && (
                            <Avatar className="h-9 w-9 border">
                            <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                <Icons.logo className="h-5 w-5 text-primary" />
                            </div>
                            </Avatar>
                        )}
                        <div
                            className={`max-w-xl rounded-lg px-4 py-3 text-sm ${
                            message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === "user" && (
                            <Avatar className="h-9 w-9 border">
                            <AvatarFallback>
                                <User className="h-5 w-5" />
                            </AvatarFallback>
                            </Avatar>
                        )}
                        </div>
                        {message.result && ! (message.result.type === 'campaign') && (
                             <div className="mt-4 pl-12">
                                <Card className="max-w-xl">
                                    <CardContent className="p-4 space-y-4">
                                        {message.result.type === 'social' && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`post-content-${message.id}`}>Post Content</Label>
                                                    <Textarea
                                                        id={`post-content-${message.id}`}
                                                        readOnly
                                                        value={message.result.data.postContent}
                                                        className="h-32"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Hashtags</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                    {message.result.data.hashtags.map((tag, index) => (
                                                        <Badge key={index} variant="secondary">{tag}</Badge>
                                                    ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                ))}
                 {isThinking && (
                    <div className="flex items-start gap-4">
                        <Avatar className="h-9 w-9 border">
                            <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                <Icons.logo className="h-5 w-5 text-primary" />
                            </div>
                        </Avatar>
                        <div className="max-w-md rounded-lg px-4 py-3 bg-muted flex items-center gap-2">
                           <span className="h-2 w-2 bg-primary rounded-full animate-pulse delay-0" />
                           <span className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150" />
                           <span className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300" />
                        </div>
                    </div>
                 )}
                </div>
            </ScrollArea>
        </CardContent>
        <div className="border-t p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-center gap-2"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="e.g., 'What can you do?'"
                        autoComplete="off"
                        {...field}
                        disabled={isThinking}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isThinking}>
                <Icons.logo className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
